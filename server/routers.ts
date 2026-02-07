
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminRouter } from "./adminRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import { isStripeConfigured, createCrowdfundingCheckout, createFranchiseCheckout } from "./stripe";
import { getDb } from "./db";
import { users, preorders, commissions, distributors, referralTracking } from "../drizzle/schema";
import { 
  registerNativeUser, 
  authenticateNativeUser, 
  requestPasswordReset, 
  resetPassword, 
  verifyEmail,
  changePassword,
  isUsernameAvailable,
  isEmailAvailable 
} from "./nativeAuth";
import { sdk } from "./_core/sdk";
import { ONE_YEAR_MS, COOKIE_NAME } from "@shared/const";
import { sql, eq, gte, desc, asc, like, or, and, isNotNull } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  admin: adminRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    
    // Native authentication - Register
    register: publicProcedure
      .input(z.object({
        username: z.string().min(3, "Username must be at least 3 characters").max(50).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
        email: z.string().email("Valid email is required"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
        name: z.string().min(1, "Name is required"),
        userType: z.enum(["customer", "distributor", "franchisee"]),
        phone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        if (input.password !== input.confirmPassword) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Passwords do not match" });
        }
        
        const result = await registerNativeUser({
          username: input.username,
          email: input.email,
          password: input.password,
          name: input.name,
          userType: input.userType,
          phone: input.phone,
        });
        
        if (!result.success) {
          throw new TRPCError({ code: "BAD_REQUEST", message: result.error || "Registration failed" });
        }
        
        return { success: true, message: "Registration successful! Please check your email to verify your account." };
      }),
    
    // Native authentication - Login
    login: publicProcedure
      .input(z.object({
        usernameOrEmail: z.string().min(1, "Username or email is required"),
        password: z.string().min(1, "Password is required"),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await authenticateNativeUser(input.usernameOrEmail, input.password);
        
        if (!result.success || !result.user) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: result.error || "Invalid credentials" });
        }
        
        // Create session token
        const token = await sdk.createSessionToken(result.user.openId, {
          name: result.user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });
        
        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);
        
        return { 
          success: true, 
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            userType: result.user.userType,
            role: result.user.role,
          }
        };
      }),
    
    // Check username availability
    checkUsername: publicProcedure
      .input(z.object({ username: z.string() }))
      .query(async ({ input }) => {
        const available = await isUsernameAvailable(input.username);
        return { available };
      }),
    
    // Check email availability
    checkEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        const available = await isEmailAvailable(input.email);
        return { available };
      }),
    
    // Request password reset
    requestPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        await requestPasswordReset(input.email);
        // Always return success to prevent email enumeration
        return { success: true, message: "If an account exists with this email, you will receive a password reset link." };
      }),
    
    // Reset password with token
    resetPassword: publicProcedure
      .input(z.object({
        token: z.string(),
        newPassword: z.string().min(8),
        confirmPassword: z.string(),
      }))
      .mutation(async ({ input }) => {
        if (input.newPassword !== input.confirmPassword) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Passwords do not match" });
        }
        
        const result = await resetPassword(input.token, input.newPassword);
        if (!result.success) {
          throw new TRPCError({ code: "BAD_REQUEST", message: result.error || "Password reset failed" });
        }
        
        return { success: true, message: "Password has been reset successfully." };
      }),
    
    // Verify email
    verifyEmail: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        const result = await verifyEmail(input.token);
        if (!result.success) {
          throw new TRPCError({ code: "BAD_REQUEST", message: result.error || "Email verification failed" });
        }
        
        return { success: true, message: "Email verified successfully!" };
      }),
    
    // Change password (authenticated)
    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8),
        confirmPassword: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (input.newPassword !== input.confirmPassword) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Passwords do not match" });
        }
        
        const result = await changePassword(ctx.user.id, input.currentPassword, input.newPassword);
        if (!result.success) {
          throw new TRPCError({ code: "BAD_REQUEST", message: result.error || "Password change failed" });
        }
        
        return { success: true, message: "Password changed successfully." };
      }),
    // Check if user needs MFA verification (for distributors/vending owners)
    checkMfaRequired: protectedProcedure
      .query(async ({ ctx }) => {
        const { getMfaSettings, getDistributorByUserId, getUserVendingMachines } = await import("./db");
        
        // Check if user is a distributor or vending machine owner
        const distributor = await getDistributorByUserId(ctx.user.id);
        const vendingMachines = await getUserVendingMachines(ctx.user.id);
        
        const isDistributor = !!distributor;
        const isVendingOwner = vendingMachines && vendingMachines.length > 0;
        const requiresMfa = isDistributor || isVendingOwner;
        
        if (!requiresMfa) {
          return { requiresMfa: false, mfaEnabled: false, needsSetup: false };
        }
        
        // Check MFA status
        const mfaSettings = await getMfaSettings(ctx.user.id);
        const mfaEnabled = mfaSettings?.isEnabled || false;
        
        return {
          requiresMfa: true,
          mfaEnabled,
          needsSetup: !mfaEnabled,
          role: isDistributor ? 'distributor' : 'vending_owner',
        };
      }),
  }),

  preorder: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1, "Name is required"),
          email: z.string().email("Valid email is required"),
          phone: z.string().optional(),
          quantity: z.number().int().min(1, "Quantity must be at least 1"),
          address: z.string().min(1, "Address is required"),
          city: z.string().min(1, "City is required"),
          state: z.string().min(1, "State is required"),
          postalCode: z.string().min(1, "Postal code is required"),
          country: z.string().min(1, "Country is required"),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { createPreorder } = await import("./db");
        const { formatOrderNumber } = await import("./nftGeneration");
        const result = await createPreorder(input);
        const orderId = result?.id || Date.now();
        
        // Send order confirmation email with NFT preview
        try {
          const { sendOrderConfirmationWithNft } = await import("./emailNotifications");
          await sendOrderConfirmationWithNft({
            customerName: input.name,
            customerEmail: input.email,
            orderId,
            orderNumber: formatOrderNumber(orderId),
            items: [{
              name: 'NEON Energy Drink',
              quantity: input.quantity,
              price: 3.99,
            }],
            subtotal: input.quantity * 3.99,
            total: input.quantity * 3.99,
            // NFT image will be generated asynchronously
            nftImageUrl: undefined,
            nftRarity: 'Common',
            shippingAddress: `${input.address}\n${input.city}, ${input.state} ${input.postalCode}\n${input.country}`,
          });
        } catch (emailError) {
          console.warn("[Preorder] Failed to send confirmation email:", emailError);
        }
        
        // Return order info with NFT details
        return { 
          success: true,
          orderId,
          nftId: `NEON-NFT-${formatOrderNumber(orderId)}`,
          message: "Your unique NFT artwork is being generated! It will be available shortly.",
        };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      const { getAllPreorders } = await import("./db");
      return await getAllPreorders();
    }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number().int(),
          status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { updatePreorderStatus, getPreorderById } = await import("./db");
        await updatePreorderStatus(input.id, input.status);
        
        // Send status update email
        try {
          const preorder = await getPreorderById(input.id);
          if (preorder) {
            const { sendShippingNotification, sendDeliveryNotification } = await import("./emailNotifications");
            
            if (input.status === "shipped") {
              await sendShippingNotification({
                customerName: preorder.name,
                customerEmail: preorder.email,
                id: preorder.id,
                orderType: "preorder",
                shippingAddress: `${preorder.address}, ${preorder.city}, ${preorder.state} ${preorder.postalCode}`,
                trackingNumber: preorder.trackingNumber || undefined,
                carrier: preorder.carrier || undefined,
              });
            } else if (input.status === "delivered") {
              await sendDeliveryNotification({
                customerName: preorder.name,
                customerEmail: preorder.email,
                id: preorder.id,
                orderType: "preorder",
              });
            }
          }
        } catch (emailError) {
          console.warn("[Preorder] Failed to send status update email:", emailError);
        }
        
        return { success: true };
      }),

    // Get NFT details for a specific order
    getNft: publicProcedure
      .input(z.object({
        id: z.number().int(),
      }))
      .query(async ({ input }) => {
        const { getPreorderNft } = await import("./db");
        const nft = await getPreorderNft(input.id);
        
        if (!nft) {
          return { found: false, nft: null };
        }
        
        // Calculate pre-launch end date (90 days from now for demo)
        const prelaunchEndDate = new Date();
        prelaunchEndDate.setDate(prelaunchEndDate.getDate() + 90);
        
        return {
          found: true,
          nft: {
            ...nft,
            mintingNotice: "NFT minting will begin once the 90-day pre-launch period ends and crowdfunding goals have been reached.",
            prelaunchDaysRemaining: 90,
          },
        };
      }),

    // Track order by order number (public endpoint for customers)
    track: publicProcedure
      .input(z.object({
        orderNumber: z.string().min(1, "Order number is required"),
      }))
      .query(async ({ input }) => {
        const { getPreorderByOrderNumber } = await import("./db");
        const order = await getPreorderByOrderNumber(input.orderNumber);
        
        if (!order) {
          return { found: false, order: null };
        }
        
        // Calculate status timeline based on available statuses
        const currentStatus = order.status || 'pending';
        const statusTimeline = [
          { status: 'confirmed', label: 'Order Confirmed', completed: currentStatus !== 'pending', date: order.createdAt },
          { status: 'confirmed', label: 'Processing', completed: ['confirmed', 'shipped', 'delivered'].includes(currentStatus), date: currentStatus === 'confirmed' ? order.updatedAt : null },
          { status: 'shipped', label: 'Shipped', completed: ['shipped', 'delivered'].includes(currentStatus), date: currentStatus === 'shipped' ? order.updatedAt : null },
          { status: 'delivered', label: 'Delivered', completed: currentStatus === 'delivered', date: currentStatus === 'delivered' ? order.updatedAt : null },
        ];
        
        // Pre-launch notice
        const prelaunchEndDate = new Date();
        prelaunchEndDate.setDate(prelaunchEndDate.getDate() + 90);
        
        return {
          found: true,
          order: {
            orderNumber: order.nftOrderNumber || `NEON-${String(order.id).padStart(5, '0')}`,
            status: order.status || 'pending',
            statusTimeline,
            customerName: order.name,
            email: order.email,
            quantity: order.quantity,
            total: (order.quantity || 1) * 3.99,
            shippingAddress: {
              address: order.address,
              city: order.city,
              state: order.state,
              postalCode: order.postalCode,
              country: order.country,
            },
            trackingNumber: order.trackingNumber || null,
            trackingUrl: order.trackingNumber ? `https://track.neonenergy.com/${order.trackingNumber}` : null,
            nft: order.nftImageUrl ? {
              imageUrl: order.nftImageUrl,
              orderNumber: order.nftOrderNumber,
              rarity: order.nftRarity || 'Common',
              mintingStatus: 'pending',
              mintingNotice: "NFT minting will begin once the 90-day pre-launch period ends and crowdfunding goals have been reached.",
            } : null,
            createdAt: order.createdAt,
            estimatedDelivery: "Ships after 90-day pre-launch period and crowdfunding goals are met",
          },
        };
      }),

    // Get orders for current logged-in user with real-time tracking
    getMyOrders: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user.email) {
          return { orders: [], summary: { total: 0, pending: 0, shipped: 0, delivered: 0 } };
        }
        const db = await getDb();
        if (!db) {
          return { orders: [], summary: { total: 0, pending: 0, shipped: 0, delivered: 0 } };
        }
        const userEmail = ctx.user.email;
        const userOrders = await db
          .select()
          .from(preorders)
          .where(eq(preorders.email, userEmail))
          .orderBy(desc(preorders.createdAt));
        
        // Calculate summary stats
        const summary = {
          total: userOrders.length,
          pending: userOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length,
          shipped: userOrders.filter(o => o.status === 'shipped').length,
          delivered: userOrders.filter(o => o.status === 'delivered').length,
        };
        
        // Get tracking URLs for shipped orders
        const { getTrackingUrl } = await import("./shipping");
        
        return {
          orders: userOrders.map(order => {
            // Generate tracking URL if available
            let trackingUrl = null;
            if (order.trackingNumber && order.carrier) {
              try {
                trackingUrl = getTrackingUrl(order.carrier.toLowerCase() as 'ups' | 'fedex' | 'usps', order.trackingNumber);
              } catch (e) {
                // Carrier not supported
              }
            }
            
            // Calculate real-time tracking status
            const getTrackingStatus = (status: string) => {
              const statusMap: Record<string, { step: number; label: string; description: string }> = {
                'pending': { step: 1, label: 'Order Placed', description: 'Your order has been received and is being processed' },
                'confirmed': { step: 2, label: 'Order Confirmed', description: 'Payment confirmed, preparing for shipment' },
                'processing': { step: 3, label: 'Processing', description: 'Your order is being prepared for shipping' },
                'shipped': { step: 4, label: 'Shipped', description: 'Your order is on its way' },
                'out_for_delivery': { step: 5, label: 'Out for Delivery', description: 'Your package will arrive today' },
                'delivered': { step: 6, label: 'Delivered', description: 'Your order has been delivered' },
                'cancelled': { step: 0, label: 'Cancelled', description: 'This order has been cancelled' },
              };
              return statusMap[status] || statusMap['pending'];
            };
            
            const trackingStatus = getTrackingStatus(order.status || 'pending');
            
            return {
              orderNumber: order.nftId || `NEON-${String(order.id).padStart(5, '0')}`,
              status: order.status || 'pending',
              quantity: order.quantity,
              name: order.name,
              email: order.email,
              address: order.address,
              city: order.city,
              state: order.state,
              postalCode: order.postalCode,
              country: order.country,
              trackingNumber: order.trackingNumber,
              carrier: order.carrier,
              trackingUrl,
              estimatedDelivery: order.estimatedDelivery,
              nftImageUrl: order.nftImageUrl,
              nftId: order.nftId,
              nftRarity: order.nftRarity,
              createdAt: order.createdAt,
              updatedAt: order.updatedAt,
              // Real-time tracking info
              tracking: {
                currentStep: trackingStatus.step,
                totalSteps: 6,
                statusLabel: trackingStatus.label,
                statusDescription: trackingStatus.description,
                lastUpdated: order.updatedAt || order.createdAt,
                isLive: true,
              },
            };
          }),
          summary,
        };
      }),

    // Public NFT Gallery - shows all NFTs for community viewing
    getGalleryNfts: publicProcedure
      .input(z.object({
        page: z.number().default(1),
        pageSize: z.number().default(12),
        rarity: z.string().optional(),
        search: z.string().optional(),
        sortBy: z.enum(['newest', 'oldest', 'rarity']).default('newest'),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        
        const offset = (input.page - 1) * input.pageSize;
        
        // Build conditions - only show orders with NFT images
        const conditions: any[] = [isNotNull(preorders.nftImageUrl)];
        
        if (input.search) {
          const searchCondition = or(
            like(preorders.nftId, `%${input.search}%`),
            like(preorders.nftRarity, `%${input.search}%`)
          );
          if (searchCondition) {
            conditions.push(searchCondition);
          }
        }
        
        if (input.rarity) {
          conditions.push(eq(preorders.nftRarity, input.rarity));
        }
        
        const whereClause = and(...conditions);
        
        // Determine sort order
        let orderByClause;
        switch (input.sortBy) {
          case 'oldest':
            orderByClause = asc(preorders.createdAt);
            break;
          case 'rarity':
            orderByClause = sql`CASE 
              WHEN ${preorders.nftRarity} = 'Mythic' THEN 1
              WHEN ${preorders.nftRarity} = 'Legendary' THEN 2
              WHEN ${preorders.nftRarity} = 'Epic' THEN 3
              WHEN ${preorders.nftRarity} = 'Rare' THEN 4
              WHEN ${preorders.nftRarity} = 'Uncommon' THEN 5
              ELSE 6
            END`;
            break;
          default:
            orderByClause = desc(preorders.createdAt);
        }
        
        // Get NFTs
        const nfts = await db!.select({
          id: preorders.id,
          orderNumber: preorders.nftId,
          imageUrl: preorders.nftImageUrl,
          rarity: preorders.nftRarity,
          theme: preorders.nftTheme,
          createdAt: preorders.createdAt,
        })
          .from(preorders)
          .where(whereClause)
          .orderBy(orderByClause)
          .limit(input.pageSize)
          .offset(offset);
        
        // Get total count
        const countResult = await db!.select({ count: sql<number>`count(*)` })
          .from(preorders)
          .where(whereClause);
        const total = countResult[0]?.count || 0;
        
        // Get stats by rarity
        const rarityStats = await db!.select({
          rarity: preorders.nftRarity,
          count: sql<number>`count(*)`,
        })
          .from(preorders)
          .where(isNotNull(preorders.nftImageUrl))
          .groupBy(preorders.nftRarity);
        
        const byRarity: Record<string, number> = {};
        let totalNfts = 0;
        for (const stat of rarityStats) {
          if (stat.rarity) {
            byRarity[stat.rarity] = stat.count;
            totalNfts += stat.count;
          }
        }
        
        // Format NFTs for frontend
        const formattedNfts = nfts.map(nft => ({
          id: nft.id,
          orderNumber: nft.orderNumber?.replace('NEON-NFT-', '') || String(nft.id).padStart(5, '0'),
          imageUrl: nft.imageUrl,
          rarity: nft.rarity || 'Common',
          theme: nft.theme,
          createdAt: nft.createdAt || new Date().toISOString(),
        }));
        
        return {
          nfts: formattedNfts,
          total,
          stats: {
            total: totalNfts,
            byRarity,
          },
        };
      }),
  }),

  user: router({
    // Get current user's orders (preorders and crowdfunding)
    orders: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user.email) {
        return { preorders: [], crowdfunding: [] };
      }
      const { getOrdersByUserEmail } = await import("./db");
      return await getOrdersByUserEmail(ctx.user.email);
    }),

    // Get current user's NFTs
    nfts: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user.email) {
        return [];
      }
      const { getNftsByEmail } = await import("./db");
      return await getNftsByEmail(ctx.user.email);
    }),

    // Update user profile
    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1, "Name is required").optional(),
          phone: z.string().optional(),
          addressLine1: z.string().optional(),
          addressLine2: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          postalCode: z.string().optional(),
          country: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { updateUserProfile } = await import("./db");
        await updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),

    // Get full profile with shipping address
    profile: protectedProcedure.query(async ({ ctx }) => {
      const { getUserProfile } = await import("./db");
      return await getUserProfile(ctx.user.id);
    }),
  }),

  franchise: router({
    // Submit a territory license application
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1, "Name is required"),
          email: z.string().email("Valid email is required"),
          phone: z.string().optional(),
          territory: z.string().min(1, "Territory is required"),
          squareMiles: z.number().int().min(10, "Minimum 10 square miles"),
          termMonths: z.number().int().min(6, "Minimum 6 month term"),
          pricePerSqMile: z.number().int().min(1),
          totalCost: z.number().int().min(1),
          depositAmount: z.number().int().optional(),
          financing: z.enum(["full", "deposit", "monthly"]),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { createTerritoryLicense } = await import("./db");
        await createTerritoryLicense(input);
        
        // Notify admin of new franchise application
        await notifyOwner({
          title: "New Franchise Application",
          content: `New territory license application received from ${input.name} for ${input.territory}. Territory size: ${input.squareMiles} sq mi. Total cost: $${input.totalCost.toLocaleString()}. Financing: ${input.financing}.`,
        });
        
        return { success: true };
      }),

    // Admin: List all franchise applications
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      const { getAllTerritoryLicenses } = await import("./db");
      return await getAllTerritoryLicenses();
    }),

    // Admin: Update application status
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number().int(),
          status: z.enum(["pending", "approved", "rejected", "active"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { updateTerritoryLicenseStatus } = await import("./db");
        await updateTerritoryLicenseStatus(input.id, input.status);
        return { success: true };
      }),
  }),

  payment: router({
    // Check if Stripe is configured
    isConfigured: publicProcedure.query(() => {
      return { configured: isStripeConfigured() };
    }),

    // Create Stripe checkout for crowdfunding
    createCrowdfundingCheckout: publicProcedure
      .input(
        z.object({
          amount: z.number().int().min(100, "Minimum $1"),
          tierName: z.string(),
          name: z.string().min(1),
          email: z.string().email(),
          message: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!isStripeConfigured()) {
          throw new Error("Stripe is not configured. Please contact support.");
        }

        const origin = `${ctx.req.protocol}://${ctx.req.headers.host}`;
        const result = await createCrowdfundingCheckout({
          amount: input.amount,
          tierName: input.tierName,
          customerEmail: input.email,
          customerName: input.name,
          userId: ctx.user?.id,
          message: input.message,
          origin,
        });

        return result;
      }),

    // Create Stripe checkout for franchise deposit
    createFranchiseCheckout: publicProcedure
      .input(
        z.object({
          depositAmount: z.number().int().min(1),
          totalCost: z.number().int().min(1),
          territory: z.string().min(1),
          squareMiles: z.number().int().min(10),
          termMonths: z.number().int().min(6),
          name: z.string().min(1),
          email: z.string().email(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!isStripeConfigured()) {
          throw new Error("Stripe is not configured. Please contact support.");
        }

        const origin = `${ctx.req.protocol}://${ctx.req.headers.host}`;
        const result = await createFranchiseCheckout({
          depositAmount: input.depositAmount,
          totalCost: input.totalCost,
          territory: input.territory,
          squareMiles: input.squareMiles,
          termMonths: input.termMonths,
          customerEmail: input.email,
          customerName: input.name,
          userId: ctx.user?.id,
          origin,
        });

        return result;
      }),

    // Create Stripe checkout for pre-orders from shopping cart
    createPreorderCheckout: publicProcedure
      .input(
        z.object({
          items: z.array(z.object({
            name: z.string(),
            price: z.number(),
            quantity: z.number().int().min(1),
            type: z.string(),
            flavor: z.string().optional(),
          })).min(1, "Cart cannot be empty"),
          name: z.string().min(1),
          email: z.string().email(),
          distributorCode: z.string().optional(), // For commission attribution
          shippingAddress: z.object({
            addressLine1: z.string().min(1),
            addressLine2: z.string().optional(),
            city: z.string().min(1),
            state: z.string().min(1),
            postalCode: z.string().min(1),
            country: z.string().default("USA"),
          }).optional(),
          shippingMethod: z.string().optional(),
          shippingCost: z.number().optional(),
          couponCode: z.string().optional(),
          discountPercent: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!isStripeConfigured()) {
          throw new Error("Stripe is not configured. Please contact support.");
        }

        const { createPreorderCheckout } = await import("./stripe");
        const origin = `${ctx.req.protocol}://${ctx.req.headers.host}`;
        const result = await createPreorderCheckout({
          items: input.items,
          customerEmail: input.email,
          customerName: input.name,
          userId: ctx.user?.id,
          origin,
          distributorCode: input.distributorCode,
          shippingAddress: input.shippingAddress,
          shippingMethod: input.shippingMethod,
          shippingCost: input.shippingCost,
          couponCode: input.couponCode,
          discountPercent: input.discountPercent,
        });

        return result;
      }),
  }),

  crowdfunding: router({
    // Submit a crowdfunding contribution (for non-Stripe flow)
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1, "Name is required"),
          email: z.string().email("Valid email is required"),
          amount: z.number().int().min(1, "Amount must be at least $1"),
          rewardTier: z.string().optional(),
          message: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { createCrowdfundingContribution } = await import("./db");
        await createCrowdfundingContribution(input);
        
        // Notify admin of significant contributions
        if (input.amount >= 100) {
          await notifyOwner({
            title: "New Crowdfunding Contribution",
            content: `${input.name} contributed $${input.amount} to the NEON relaunch campaign. Reward tier: ${input.rewardTier || "None"}.`,
          });
        }
        
        return { success: true };
      }),

    // Get campaign stats (public)
    stats: publicProcedure.query(async () => {
      const { getCrowdfundingStats } = await import("./db");
      const stats = await getCrowdfundingStats();
      return {
        totalRaised: stats.totalAmount,
        totalBackers: stats.totalBackers,
        goal: 1000000, // $1M goal
        daysLeft: 90, // Dynamic in real app
      };
    }),

    // Get recent contributions for social proof (public, anonymized)
    recentContributions: publicProcedure.query(async () => {
      const { getRecentCrowdfundingContributions } = await import("./db");
      return await getRecentCrowdfundingContributions(10); // Last 10 contributions
    }),

    // Record simulated contribution for momentum tracking
    recordSimulated: publicProcedure
      .input(
        z.object({
          amount: z.number().int().min(1),
          type: z.enum(["preorder", "crowdfunding", "distributor"]),
        })
      )
      .mutation(async ({ input }) => {
        const { createCrowdfundingContribution } = await import("./db");
        // Record simulated contribution with special marker
        await createCrowdfundingContribution({
          name: "Simulated Activity",
          email: "simulated@neonenergy.com",
          amount: input.amount,
          rewardTier: `Simulated ${input.type}`,
          message: `Auto-generated ${input.type} activity for momentum tracking`,
        });
        return { success: true };
      }),

    // Admin: List all contributions
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      const { getAllCrowdfundingContributions } = await import("./db");
      return await getAllCrowdfundingContributions();
    }),

    // Admin: Update contribution status
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number().int(),
          status: z.enum(["pending", "completed", "refunded"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { updateCrowdfundingStatus } = await import("./db");
        await updateCrowdfundingStatus(input.id, input.status);
        return { success: true };
      }),
  }),

  newsletter: router({
    // Subscribe to newsletter with email
    subscribe: publicProcedure
      .input(
        z.object({
          email: z.string().email("Valid email is required"),
          name: z.string().min(1, "Name is required"),
        })
      )
      .mutation(async ({ input }) => {
        const { subscribeNewsletter } = await import("./db");
        const subscription = await subscribeNewsletter(input);
        
        // Note: Newsletter subscription notifications disabled to reduce noise
        // Admin can view subscriber counts in the dashboard instead
        // Only real orders and applications trigger email notifications
        
        return {
          id: subscription.id,
          email: subscription.email,
          discountTier: subscription.discountTier,
          discountCode: subscription.couponCode,
        };
      }),

    // Add friend referrals
    addReferrals: publicProcedure
      .input(
        z.object({
          subscriptionId: z.number().int(),
          friendEmails: z.array(z.string().email()),
        })
      )
      .mutation(async ({ input }) => {
        const { addNewsletterReferrals, getNewsletterSubscription } = await import("./db");
        await addNewsletterReferrals(input.subscriptionId, input.friendEmails);
        
        // Note: Referral notifications disabled to reduce noise
        // Admin can view referral counts in the dashboard instead
        // Only real orders and applications trigger email notifications
        
        return { success: true };
      }),

    // Get subscription stats
    stats: publicProcedure.query(async () => {
      const { getNewsletterStats } = await import("./db");
      return await getNewsletterStats();
    }),

    // List all subscriptions (admin only)
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const { listNewsletterSubscriptions } = await import("./db");
      return await listNewsletterSubscriptions();
    }),

    // Validate a coupon code
    validateCoupon: publicProcedure
      .input(z.object({ couponCode: z.string().min(1) }))
      .query(async ({ input }) => {
        const { validateCouponCode } = await import("./db");
        return await validateCouponCode(input.couponCode);
      }),

    // Redeem a coupon code (mark as used)
    redeemCoupon: protectedProcedure
      .input(z.object({
        couponCode: z.string().min(1),
        id: z.number().int(),
      }))
      .mutation(async ({ input }) => {
        const { redeemCouponCode } = await import("./db");
        return await redeemCouponCode(input.couponCode, input.id);
      }),
  }),

  // Territory expiration management
  territoryExpiration: router({
    // Check for expiring territories and send reminders (admin only)
    checkAndNotify: protectedProcedure
      .input(z.object({ daysAhead: z.number().default(30) }).optional())
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { checkExpiringTerritories } = await import("./territoryExpirationJob");
        return await checkExpiringTerritories(input?.daysAhead || 30);
      }),

    // Get expiration summary for dashboard
    summary: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const { getTerritoryExpirationSummary } = await import("./territoryExpirationJob");
      return await getTerritoryExpirationSummary();
    }),
  }),

  distributor: router({
    // Enroll as distributor
    enroll: protectedProcedure
      .input(
        z.object({
          // Personal Information
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          dateOfBirth: z.string().optional(),
          // Address
          address: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          zipCode: z.string().optional(),
          country: z.string().length(2).optional(), // ISO 3166-1 alpha-2 country code
          // Business Entity
          entityType: z.enum(["individual", "llc", "corporation", "partnership"]).optional(),
          businessName: z.string().optional(),
          businessEin: z.string().optional(),
          businessAddress: z.string().optional(),
          businessCity: z.string().optional(),
          businessState: z.string().optional(),
          businessZipCode: z.string().optional(),
          // Emergency Contact
          emergencyContactName: z.string().optional(),
          emergencyContactPhone: z.string().optional(),
          emergencyContactRelationship: z.string().optional(),
          // Sponsor
          sponsorCode: z.string().optional(),
          // Tax
          taxIdLast4: z.string().max(4).optional(),
          // Agreements
          agreedToPolicies: z.boolean().optional(),
          agreedToTerms: z.boolean().optional(),
          agreeToAutoship: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { enrollDistributor, createDistributorProfile, createEmailVerification, updateDistributorCountry, updateDistributorApplicationInfo } = await import("./db");
        const { provisionReplicatedWebsite } = await import("./websiteProvisioning");
        const { sendEmailVerification } = await import("./emailNotifications");
        
        // Validate required agreements
        if (!input.agreedToPolicies || !input.agreedToTerms) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'You must agree to the Policies and Procedures and Terms and Conditions to enroll.',
          });
        }
        
        const distributor = await enrollDistributor({
          userId: ctx.user.id,
          sponsorCode: input.sponsorCode,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          dateOfBirth: input.dateOfBirth,
          address: input.address,
          city: input.city,
          state: input.state,
          zipCode: input.zipCode,
          country: input.country,
          entityType: input.entityType,
          businessName: input.businessName,
          businessEin: input.businessEin,
          businessAddress: input.businessAddress,
          businessCity: input.businessCity,
          businessState: input.businessState,
          businessZipCode: input.businessZipCode,
          emergencyContactName: input.emergencyContactName,
          emergencyContactPhone: input.emergencyContactPhone,
          emergencyContactRelationship: input.emergencyContactRelationship,
          taxIdLast4: input.taxIdLast4,
        });
        
        // Update distributor country if provided
        if (distributor && input.country) {
          await updateDistributorCountry(distributor.id, input.country);
        }
        
        // Update additional application info (keeping for backward compatibility)
        if (distributor) {
          await updateDistributorApplicationInfo(distributor.id, {
            phone: input.phone,
            address: input.address,
            city: input.city,
            state: input.state,
            zipCode: input.zipCode,
            dateOfBirth: input.dateOfBirth,
            taxIdLast4: input.taxIdLast4,
            agreedToPolicies: input.agreedToPolicies,
            agreedToTerms: input.agreedToTerms,
            agreedAt: new Date().toISOString(),
          });
        }
        
        // Automatically create personalized profile for new distributor
        if (distributor) {
          await createDistributorProfile(ctx.user.id, ctx.user.name || "NEON Distributor");
          
          // Automatically provision replicated website with affiliate tracking
          try {
            const websiteResult = await provisionReplicatedWebsite(
              distributor.id,
              distributor.distributorCode,
              ctx.user.name || undefined
            );
            if (!websiteResult.success) {
              console.warn("[Distributor] Failed to provision website:", websiteResult.errors);
            }
          } catch (websiteError) {
            console.warn("[Distributor] Website provisioning error:", websiteError);
            // Don't fail enrollment if website provisioning fails
          }
          
          // Create email verification token and send verification email
          if (ctx.user.email) {
            try {
              const verification = await createEmailVerification(ctx.user.id);
              if (verification) {
                const baseUrl = ctx.req.headers.origin || 'https://neonenergyclub.com';
                const verificationUrl = `${baseUrl}/verify-email?token=${verification.token}`;
                
                await sendEmailVerification({
                  name: ctx.user.name || 'NEON Distributor',
                  email: ctx.user.email,
                  verificationUrl,
                  expiresIn: '24 hours',
                });
              }
            } catch (emailError) {
              console.warn("[Distributor] Failed to send verification email:", emailError);
              // Don't fail enrollment if email fails
            }
          }
        }
        
        return { ...distributor, emailVerificationSent: !!ctx.user.email };
      }),

    // Get current distributor info
    me: protectedProcedure.query(async ({ ctx }) => {
      const { getDistributorByUserId } = await import("./db");
      return await getDistributorByUserId(ctx.user.id);
    }),

    // Get distributor dashboard stats
    stats: protectedProcedure.query(async ({ ctx }) => {
      const { getDistributorStats } = await import("./db");
      return await getDistributorStats(ctx.user.id);
    }),

    // Get team members (downline)
    team: protectedProcedure.query(async ({ ctx }) => {
      const { getDistributorTeam } = await import("./db");
      return await getDistributorTeam(ctx.user.id);
    }),

    // Generate affiliate link
    createAffiliateLink: protectedProcedure
      .input(
        z.object({
          campaignName: z.string().optional(),
          targetPath: z.string().default("/"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { createAffiliateLink } = await import("./db");
        return await createAffiliateLink(ctx.user.id, input);
      }),

    // Get all affiliate links
    affiliateLinks: protectedProcedure.query(async ({ ctx }) => {
      const { getAffiliateLinks } = await import("./db");
      return await getAffiliateLinks(ctx.user.id);
    }),

    // Get recent enrollments for social proof (public, anonymized)
    recentEnrollments: publicProcedure.query(async () => {
      const { getRecentDistributorEnrollments } = await import("./db");
      return await getRecentDistributorEnrollments(10); // Last 10 enrollments
    }),

    // Set custom username
    setUsername: protectedProcedure
      .input(z.object({ username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/) }))
      .mutation(async ({ input, ctx }) => {
        const { setDistributorUsername } = await import("./db");
        return await setDistributorUsername(ctx.user.id, input.username);
      }),

    // Set custom subdomain
    setSubdomain: protectedProcedure
      .input(z.object({ subdomain: z.string().min(3).max(30).regex(/^[a-z0-9-]+$/) }))
      .mutation(async ({ input, ctx }) => {
        const { setDistributorSubdomain } = await import("./db");
        return await setDistributorSubdomain(ctx.user.id, input.subdomain);
      }),

    // Check username availability
    checkUsername: publicProcedure
      .input(z.object({ username: z.string() }))
      .query(async ({ input }) => {
        const { checkUsernameAvailable } = await import("./db");
        return await checkUsernameAvailable(input.username);
      }),

    // Check subdomain availability
    checkSubdomain: publicProcedure
      .input(z.object({ subdomain: z.string() }))
      .query(async ({ input }) => {
        const { checkSubdomainAvailable } = await import("./db");
        return await checkSubdomainAvailable(input.subdomain);
      }),

    // Submit tax information (SSN/EIN) for IRS 1099 reporting
    submitTaxInformation: protectedProcedure
      .input(
        z.object({
          taxIdType: z.enum(["ssn", "ein"]),
          taxId: z.string().length(9), // 9 digits without formatting
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { getDistributorByUserId } = await import("./db");
        const { encrypt, formatSSN, formatEIN } = await import("./encryption");
        const { getDb } = await import("./db");
        const { distributors } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        // Get distributor record
        const distributor = await getDistributorByUserId(ctx.user.id);
        if (!distributor) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Distributor record not found",
          });
        }

        // Check if tax info already submitted
        if (distributor.taxInfoCompleted) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Tax information has already been submitted. Contact support to update.",
          });
        }

        // Encrypt the full tax ID
        const encryptedTaxId = encrypt(input.taxId);

        // Store last 4 digits for display
        const taxIdLast4 = input.taxId.slice(-4);

        // Update distributor record
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        await db
          .update(distributors)
          .set({
            taxId: encryptedTaxId,
            taxIdType: input.taxIdType,
            ssnLast4: taxIdLast4,
            taxInfoCompleted: 1,
            taxInfoCompletedAt: new Date().toISOString(),
            w9Submitted: 1,
            w9SubmittedAt: new Date().toISOString(),
          })
          .where(eq(distributors.id, distributor.id));

        return {
          success: true,
          message: "Tax information submitted successfully",
        };
      }),

    // Get public distributor profile by code (for cloned pages)
    getPublicProfile: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        const { getDistributorPublicProfile } = await import("./db");
        return await getDistributorPublicProfile(input.code);
      }),

    // Get public leaderboard for cloned websites
    getLeaderboard: publicProcedure
      .input(z.object({ limit: z.number().int().min(1).max(20).default(10) }).optional())
      .query(async ({ input }) => {
        const { getPublicLeaderboard } = await import("./db");
        return await getPublicLeaderboard(input?.limit || 10);
      }),

    // Track referral click (for attribution)
    trackReferralClick: publicProcedure
      .input(z.object({ distributorCode: z.string() }))
      .mutation(async ({ input }) => {
        const { trackReferralClick } = await import("./mlmDataMonitor");
        return await trackReferralClick(input.distributorCode, {});
      }),

    // Get enrollment packages
    getEnrollmentPackages: publicProcedure
      .query(async () => {
        const { getDb } = await import("./db");
        const { enrollmentPackages } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        return await db
          .select()
          .from(enrollmentPackages)
          .where(eq(enrollmentPackages.isActive, 1));
      }),

    // Select enrollment package
    selectEnrollmentPackage: protectedProcedure
      .input(
        z.object({
          packageId: z.number(),
          autoshipEnabled: z.boolean(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { getDistributorByUserId } = await import("./db");
        const { getDb } = await import("./db");
        const { distributors } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        // Get distributor record
        const distributor = await getDistributorByUserId(ctx.user.id);
        if (!distributor) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Distributor record not found",
          });
        }

        // Update distributor with package selection
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        await db
          .update(distributors)
          .set({
            enrollmentPackageId: input.packageId,
            autoshipEnabled: input.autoshipEnabled,
          })
          .where(eq(distributors.id, distributor.id));

        return {
          success: true,
          message: "Package selected successfully",
        };
      }),

    // Get genealogy tree
    genealogy: protectedProcedure
      .input(z.object({ depth: z.number().int().min(1).max(10).default(5) }).optional())
      .query(async ({ ctx, input }) => {
        const { getDistributorGenealogy } = await import("./db");
        return await getDistributorGenealogy(ctx.user.id, input?.depth || 5);
      }),

    // Get rank progress
    rankProgress: protectedProcedure.query(async ({ ctx }) => {
        const { getDistributorRankProgress } = await import("./db");
        return await getDistributorRankProgress(ctx.user.id);
      }),

    // Get activity status
    activityStatus: protectedProcedure.query(async ({ ctx }) => {
        const { getDistributorActivityStatus } = await import("./db");
        return await getDistributorActivityStatus(ctx.user.id);
      }),

    // Get LLM-powered analytics insights
    analyticsInsights: protectedProcedure.query(async ({ ctx }) => {
        const { getDistributorByUserId, getDistributorStats, getDistributorTeam } = await import("./db");
        const { generateDistributorInsights } = await import("./analyticsLLM");
        
        const distributor = await getDistributorByUserId(ctx.user.id);
        if (!distributor) throw new TRPCError({ code: "NOT_FOUND", message: "Distributor not found" });
        
        const stats = await getDistributorStats(ctx.user.id);
        const team = await getDistributorTeam(distributor.id);
        const { getDistributorCommissions } = await import("./db");
        const commissionsData = await getDistributorCommissions(ctx.user.id);
        const totalCommissions = commissionsData.totals.total;
        const activeDownline = team.filter((m: any) => m.isActive).length;
        
        const analytics = {
          distributorId: distributor.id,
          distributorCode: distributor.distributorCode,
          rank: distributor.rank,
          personalSales: distributor.personalSales,
          teamSales: distributor.teamSales,
          leftLegVolume: distributor.leftLegVolume,
          rightLegVolume: distributor.rightLegVolume,
          monthlyPv: distributor.monthlyPv,
          totalDownline: stats.teamSize,
          activeDownline: activeDownline,
          commissionTotal: totalCommissions,
          joinDate: distributor.createdAt,
        };
        
        const teamMembers = team.map((member: any) => ({
          id: member.id,
          name: member.username || member.distributorCode,
          rank: member.rank,
          personalSales: member.personalSales,
          teamSales: member.teamSales,
          monthlyPv: member.monthlyPv,
          isActive: member.isActive,
          joinDate: member.createdAt,
        }));
        
        return await generateDistributorInsights(analytics, teamMembers);
      }),

    // Get team performance analysis
    teamAnalysis: protectedProcedure
      .input(z.object({ timeframe: z.enum(["week", "month", "quarter"]).default("month") }).optional())
      .query(async ({ ctx, input }) => {
        const { getDistributorByUserId, getDistributorTeam } = await import("./db");
        const { analyzeTeamTrends } = await import("./analyticsLLM");
        
        const distributor = await getDistributorByUserId(ctx.user.id);
        if (!distributor) throw new TRPCError({ code: "NOT_FOUND", message: "Distributor not found" });
        
        const team = await getDistributorTeam(distributor.id);
        const teamMembers = team.map((member: any) => ({
          id: member.id,
          name: member.username || member.distributorCode,
          rank: member.rank,
          personalSales: member.personalSales,
          teamSales: member.teamSales,
          monthlyPv: member.monthlyPv,
          isActive: member.isActive,
          joinDate: member.createdAt,
        }));
        
        return await analyzeTeamTrends(teamMembers, input?.timeframe || "month");
      }),

    // Get commission optimization recommendations
    commissionOptimization: protectedProcedure.query(async ({ ctx }) => {
        const { getDistributorByUserId, getDistributorStats } = await import("./db");
        const { generateCommissionOptimization } = await import("./analyticsLLM");
        
        const distributor = await getDistributorByUserId(ctx.user.id);
        if (!distributor) throw new TRPCError({ code: "NOT_FOUND", message: "Distributor not found" });
        
        const stats = await getDistributorStats(ctx.user.id);
        const { getDistributorTeam, getDistributorCommissions } = await import("./db");
        const team = await getDistributorTeam(distributor.id);
        const commissionsData = await getDistributorCommissions(ctx.user.id);
        const totalCommissions = commissionsData.totals.total;
        const activeDownline = team.filter((m: any) => m.isActive).length;
        
        const analytics = {
          distributorId: distributor.id,
          distributorCode: distributor.distributorCode,
          rank: distributor.rank,
          personalSales: distributor.personalSales,
          teamSales: distributor.teamSales,
          leftLegVolume: distributor.leftLegVolume,
          rightLegVolume: distributor.rightLegVolume,
          monthlyPv: distributor.monthlyPv,
          totalDownline: stats.teamSize,
          activeDownline: activeDownline,
          commissionTotal: totalCommissions,
          joinDate: distributor.createdAt,
        };
        
        return await generateCommissionOptimization(analytics);
      }),

    // Get commission history
    commissions: protectedProcedure
      .input(z.object({ limit: z.number().int().min(1).max(100).default(50) }).optional())
      .query(async ({ ctx, input }) => {
        const { getDistributorCommissions } = await import("./db");
        return await getDistributorCommissions(ctx.user.id, input?.limit || 50);
      }),

    // Get by subdomain (public - for affiliate sites)
    getBySubdomain: publicProcedure
      .input(z.object({ subdomain: z.string() }))
      .query(async ({ input }) => {
        const { getDistributorBySubdomain } = await import("./db");
        return await getDistributorBySubdomain(input.subdomain);
      }),

    // Admin: List all distributors
    listAll: protectedProcedure
      .input(z.object({
        status: z.enum(["active", "inactive", "suspended"]).optional(),
        rank: z.string().optional(),
        limit: z.number().int().min(1).max(500).default(100),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { listAllDistributors } = await import("./db");
        return await listAllDistributors(input);
      }),

    // Admin: Update distributor status
    updateStatus: protectedProcedure
      .input(z.object({
        distributorId: z.number(),
        status: z.enum(["active", "inactive", "suspended"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { updateDistributorStatus } = await import("./db");
        return await updateDistributorStatus(input.distributorId, input.status);
      }),

    // ============================================
    // AUTOSHIP ENDPOINTS
    // ============================================

    // Get distributor's autoships
    getAutoships: protectedProcedure.query(async ({ ctx }) => {
      const { getDistributorByUserId, getDistributorAutoships } = await import("./db");
      const distributor = await getDistributorByUserId(ctx.user.id);
      if (!distributor) throw new TRPCError({ code: "NOT_FOUND", message: "Distributor not found" });
      return await getDistributorAutoships(distributor.id);
    }),

    // Create new autoship
    createAutoship: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        processDay: z.number().int().min(1).max(28),
        shippingAddress1: z.string().min(1),
        shippingAddress2: z.string().optional(),
        shippingCity: z.string().min(1),
        shippingState: z.string().min(1),
        shippingPostalCode: z.string().min(1),
        shippingCountry: z.string().default("USA"),
        paymentMethodId: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getDistributorByUserId, createAutoship } = await import("./db");
        const distributor = await getDistributorByUserId(ctx.user.id);
        if (!distributor) throw new TRPCError({ code: "NOT_FOUND", message: "Distributor not found" });

        // Calculate next process date
        const now = new Date();
        let nextProcessDate = new Date(now.getFullYear(), now.getMonth(), input.processDay);
        if (nextProcessDate <= now) {
          nextProcessDate = new Date(now.getFullYear(), now.getMonth() + 1, input.processDay);
        }

        return await createAutoship({
          distributorId: distributor.id,
          userId: ctx.user.id,
          name: input.name || "Monthly Autoship",
          processDay: input.processDay,
          shippingAddress1: input.shippingAddress1,
          shippingAddress2: input.shippingAddress2 || null,
          shippingCity: input.shippingCity,
          shippingState: input.shippingState,
          shippingPostalCode: input.shippingPostalCode,
          shippingCountry: input.shippingCountry,
          paymentMethodId: input.paymentMethodId || null,
          nextProcessDate,
        });
      }),

    // Update autoship
    updateAutoship: protectedProcedure
      .input(z.object({
        autoshipId: z.number(),
        name: z.string().optional(),
        processDay: z.number().int().min(1).max(28).optional(),
        status: z.enum(["active", "paused", "cancelled"]).optional(),
        shippingAddress1: z.string().optional(),
        shippingAddress2: z.string().optional(),
        shippingCity: z.string().optional(),
        shippingState: z.string().optional(),
        shippingPostalCode: z.string().optional(),
        shippingCountry: z.string().optional(),
        paymentMethodId: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getDistributorByUserId, getAutoshipById, updateAutoship } = await import("./db");
        const distributor = await getDistributorByUserId(ctx.user.id);
        if (!distributor) throw new TRPCError({ code: "NOT_FOUND", message: "Distributor not found" });

        const autoship = await getAutoshipById(input.autoshipId);
        if (!autoship || autoship.distributorId !== distributor.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Autoship not found" });
        }

        const { autoshipId, ...updateData } = input;
        return await updateAutoship(autoshipId, updateData);
      }),

    // Add item to autoship
    addAutoshipItem: protectedProcedure
      .input(z.object({
        autoshipId: z.number(),
        productSku: z.string(),
        productName: z.string(),
        quantity: z.number().int().min(1),
        pvPerUnit: z.number().int(),
        pricePerUnit: z.number().int(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getDistributorByUserId, getAutoshipById, addAutoshipItem } = await import("./db");
        const distributor = await getDistributorByUserId(ctx.user.id);
        if (!distributor) throw new TRPCError({ code: "NOT_FOUND", message: "Distributor not found" });

        const autoship = await getAutoshipById(input.autoshipId);
        if (!autoship || autoship.distributorId !== distributor.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Autoship not found" });
        }

        return await addAutoshipItem(input);
      }),

    // Remove item from autoship
    removeAutoshipItem: protectedProcedure
      .input(z.object({ itemId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { removeAutoshipItem } = await import("./db");
        return await removeAutoshipItem(input.itemId);
      }),

    // Update autoship item quantity
    updateAutoshipItemQuantity: protectedProcedure
      .input(z.object({
        itemId: z.number(),
        quantity: z.number().int().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const { updateAutoshipItemQuantity } = await import("./db");
        return await updateAutoshipItemQuantity(input.itemId, input.quantity);
      }),

    // Get autoship order history
    getAutoshipOrders: protectedProcedure
      .input(z.object({ autoshipId: z.number(), limit: z.number().default(12) }))
      .query(async ({ ctx, input }) => {
        const { getDistributorByUserId, getAutoshipById, getAutoshipOrderHistory } = await import("./db");
        const distributor = await getDistributorByUserId(ctx.user.id);
        if (!distributor) throw new TRPCError({ code: "NOT_FOUND", message: "Distributor not found" });

        const autoship = await getAutoshipById(input.autoshipId);
        if (!autoship || autoship.distributorId !== distributor.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Autoship not found" });
        }

        return await getAutoshipOrderHistory(input.autoshipId, input.limit);
      }),

    // ============================================
    // PAYOUT ENDPOINTS
    // ============================================

    // Get payout settings
    getPayoutSettings: protectedProcedure.query(async ({ ctx }) => {
      const { getDistributorByUserId, getPayoutSettings } = await import("./db");
      const distributor = await getDistributorByUserId(ctx.user.id);
      if (!distributor) throw new TRPCError({ code: "NOT_FOUND", message: "Distributor not found" });
      return await getPayoutSettings(distributor.id);
    }),

    // Update payout settings
    updatePayoutSettings: protectedProcedure
      .input(z.object({
        payoutMethod: z.enum(["stripe_connect", "paypal", "bank_transfer", "check"]).optional(),
        paypalEmail: z.string().email().optional(),
        minimumPayout: z.number().int().min(1000).optional(), // Min $10
        payoutFrequency: z.enum(["weekly", "biweekly", "monthly"]).optional(),
        checkMailingAddress: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getDistributorByUserId, updatePayoutSettings } = await import("./db");
        const distributor = await getDistributorByUserId(ctx.user.id);
        if (!distributor) throw new TRPCError({ code: "NOT_FOUND", message: "Distributor not found" });
        return await updatePayoutSettings(distributor.id, input);
      }),

    // Request payout
    requestPayout: protectedProcedure
      .input(z.object({
        amount: z.number().int().min(1000), // Min $10
      }))
      .mutation(async ({ ctx, input }) => {
        const { getDistributorByUserId, getPayoutSettings, createPayoutRequest } = await import("./db");
        const distributor = await getDistributorByUserId(ctx.user.id);
        if (!distributor) throw new TRPCError({ code: "NOT_FOUND", message: "Distributor not found" });

        // Check available balance
        if (distributor.availableBalance < input.amount) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance" });
        }

        // Get payout settings
        const settings = await getPayoutSettings(distributor.id);
        if (!settings) throw new TRPCError({ code: "NOT_FOUND", message: "Payout settings not found" });

        // Check minimum payout
        if (input.amount < settings.minimumPayout) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `Minimum payout is $${(settings.minimumPayout / 100).toFixed(2)}` });
        }

        // Calculate processing fee (2.5% for Stripe/PayPal, 0 for check)
        const feeRate = settings.payoutMethod === "check" ? 0 : 0.025;
        const processingFee = Math.round(input.amount * feeRate);
        const netAmount = input.amount - processingFee;

        return await createPayoutRequest({
          distributorId: distributor.id,
          amount: input.amount,
          processingFee,
          netAmount,
          payoutMethod: settings.payoutMethod,
        });
      }),

    // Get payout requests
    getPayoutRequests: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }).optional())
      .query(async ({ ctx, input }) => {
        const { getDistributorByUserId, getDistributorPayoutRequests } = await import("./db");
        const distributor = await getDistributorByUserId(ctx.user.id);
        if (!distributor) throw new TRPCError({ code: "NOT_FOUND", message: "Distributor not found" });
        return await getDistributorPayoutRequests(distributor.id, input?.limit || 50);
      }),

    // Get payout history
    getPayoutHistory: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }).optional())
      .query(async ({ ctx, input }) => {
        const { getDistributorByUserId, getDistributorPayoutHistory } = await import("./db");
        const distributor = await getDistributorByUserId(ctx.user.id);
        if (!distributor) throw new TRPCError({ code: "NOT_FOUND", message: "Distributor not found" });
        return await getDistributorPayoutHistory(distributor.id, input?.limit || 50);
      }),

    // Admin: Get all payout requests
    adminGetPayoutRequests: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        limit: z.number().default(100),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { getAllPayoutRequests } = await import("./db");
        return await getAllPayoutRequests(input);
      }),

    // Admin: Get payout statistics
    adminGetPayoutStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const { getPayoutStatistics } = await import("./db");
      return await getPayoutStatistics();
    }),

    // Admin: Approve payout request
    adminApprovePayout: protectedProcedure
      .input(z.object({
        requestId: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { updatePayoutRequestStatus } = await import("./db");
        return await updatePayoutRequestStatus(input.requestId, "approved", {
          approvedBy: ctx.user.id,
          notes: input.notes || null,
        });
      }),

    // Admin: Process payout (mark as processing)
    adminProcessPayout: protectedProcedure
      .input(z.object({
        requestId: z.number(),
        stripeTransferId: z.string().optional(),
        paypalPayoutId: z.string().optional(),
        checkNumber: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { updatePayoutRequestStatus, getPayoutRequestById, deductDistributorBalance } = await import("./db");
        
        const request = await getPayoutRequestById(input.requestId);
        if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Payout request not found" });
        
        // Deduct from distributor balance
        await deductDistributorBalance(request.distributorId, request.amount);
        
        return await updatePayoutRequestStatus(input.requestId, "processing", {
          stripeTransferId: input.stripeTransferId || null,
          paypalPayoutId: input.paypalPayoutId || null,
          checkNumber: input.checkNumber || null,
        });
      }),

    // Admin: Complete payout
    adminCompletePayout: protectedProcedure
      .input(z.object({
        requestId: z.number(),
        transactionRef: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { updatePayoutRequestStatus, getPayoutRequestById, createPayoutHistoryRecord } = await import("./db");
        
        const request = await getPayoutRequestById(input.requestId);
        if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Payout request not found" });
        
        // Create history record
        await createPayoutHistoryRecord({
          payoutRequestId: request.id,
          distributorId: request.distributorId,
          amount: request.netAmount,
          payoutMethod: request.payoutMethod,
          transactionRef: input.transactionRef || null,
        });
        
        return await updatePayoutRequestStatus(input.requestId, "completed");
      }),

    // Admin: Reject/Cancel payout
    adminRejectPayout: protectedProcedure
      .input(z.object({
        requestId: z.number(),
        reason: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { updatePayoutRequestStatus } = await import("./db");
        return await updatePayoutRequestStatus(input.requestId, "cancelled", {
          failureReason: input.reason,
        });
      }),

    // ============================================
    // LEADERBOARD ENDPOINTS
    // ============================================

    // Get leaderboard by rank
    leaderboardByRank: publicProcedure
      .input(z.object({ limit: z.number().default(50) }).optional())
      .query(async ({ input }) => {
        const { getLeaderboardByRank } = await import("./db");
        return await getLeaderboardByRank(input?.limit || 50);
      }),

    // Get leaderboard by team volume
    leaderboardByVolume: publicProcedure
      .input(z.object({ limit: z.number().default(50) }).optional())
      .query(async ({ input }) => {
        const { getLeaderboardByTeamVolume } = await import("./db");
        return await getLeaderboardByTeamVolume(input?.limit || 50);
      }),

    // Get leaderboard by monthly PV
    leaderboardByMonthlyPV: publicProcedure
      .input(z.object({ limit: z.number().default(50) }).optional())
      .query(async ({ input }) => {
        const { getLeaderboardByMonthlyPV } = await import("./db");
        return await getLeaderboardByMonthlyPV(input?.limit || 50);
      }),

    // Get current user's rank position
    myRankPosition: protectedProcedure.query(async ({ ctx }) => {
      const { getDistributorByUserId, getDistributorRankPosition } = await import("./db");
      const distributor = await getDistributorByUserId(ctx.user.id);
      if (!distributor) return null;
      return await getDistributorRankPosition(distributor.id);
    }),

    // ============================================
    // RANK HISTORY ENDPOINTS
    // ============================================

    // Get rank history for current distributor
    rankHistory: protectedProcedure.query(async ({ ctx }) => {
      const { getDistributorByUserId, getDistributorRankHistory } = await import("./db");
      const distributor = await getDistributorByUserId(ctx.user.id);
      if (!distributor) return [];
      return await getDistributorRankHistory(distributor.id);
    }),

    // ============================================
    // NOTIFICATION ENDPOINTS
    // ============================================

    // Get user notifications
    notifications: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }).optional())
      .query(async ({ ctx, input }) => {
        const { getUserNotifications } = await import("./db");
        return await getUserNotifications(ctx.user.id, input?.limit || 50);
      }),

    // Get unread notification count
    unreadNotificationCount: protectedProcedure.query(async ({ ctx }) => {
      const { getUnreadNotificationCount } = await import("./db");
      return await getUnreadNotificationCount(ctx.user.id);
    }),

    // Mark notification as read
    markNotificationRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        const { markNotificationRead } = await import("./db");
        await markNotificationRead(input.notificationId);
        return { success: true };
      }),

    // Mark all notifications as read
    markAllNotificationsRead: protectedProcedure.mutation(async ({ ctx }) => {
      const { markAllNotificationsRead } = await import("./db");
      await markAllNotificationsRead(ctx.user.id);
      return { success: true };
    }),

    // Get monthly reward points
    getMonthlyRewardPoints: protectedProcedure
      .input(z.object({ distributorId: z.number() }))
      .query(async ({ input }) => {
        const { getDistributorMonthlyPoints } = await import("./db");
        const total = await getDistributorMonthlyPoints(input.distributorId);
        return { total };
      }),

    // Get reward points history
    getRewardPointsHistory: protectedProcedure
      .input(z.object({ distributorId: z.number() }))
      .query(async ({ input }) => {
        const { getDistributorRewardPointsHistory } = await import("./db");
        return getDistributorRewardPointsHistory(input.distributorId);
      }),

    // Get free rewards earned
    getFreeRewards: protectedProcedure
      .input(z.object({ distributorId: z.number() }))
      .query(async ({ input }) => {
        const { getDistributorFreeRewards } = await import("./db");
        return getDistributorFreeRewards(input.distributorId);
      }),

    // Award reward point (called when autoship is enrolled)
    awardRewardPoint: protectedProcedure
      .input(z.object({
        distributorId: z.number(),
        source: z.enum(["customer_autoship", "distributor_autoship"]),
        description: z.string(),
        relatedId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { awardDistributorRewardPoints, checkAndAwardDistributorFreeCase } = await import("./db");
        await awardDistributorRewardPoints(
          input.distributorId,
          1, // 1 point per autoship
          input.source,
          input.description,
          input.relatedId
        );
        // Check if they qualify for a free case
        const earnedFreeCase = await checkAndAwardDistributorFreeCase(input.distributorId);
        return { success: true, earnedFreeCase };
      }),

    // Redeem a free reward with shipping info
    redeemFreeRewardWithShipping: protectedProcedure
      .input(z.object({
        rewardId: z.number(),
        shippingInfo: z.object({
          name: z.string().min(1),
          email: z.string().email(),
          phone: z.string().optional(),
          addressLine1: z.string().min(1),
          addressLine2: z.string().optional(),
          city: z.string().min(1),
          state: z.string().min(1),
          postalCode: z.string().min(1),
          country: z.string().min(1),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        const { redeemDistributorRewardWithShipping, getDistributorFreeRewardById, getDistributorByUserId } = await import("./db");
        
        // Get the distributor
        const distributor = await getDistributorByUserId(ctx.user.id);
        if (!distributor) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Distributor not found' });
        }
        
        // Get the reward to verify ownership and status
        const reward = await getDistributorFreeRewardById(input.rewardId);
        if (!reward) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Reward not found' });
        }
        if (reward.distributorId !== distributor.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'This reward belongs to another distributor' });
        }
        if (reward.status !== 'pending') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'This reward has already been redeemed' });
        }
        
        // Process the redemption
        const success = await redeemDistributorRewardWithShipping(input.rewardId, input.shippingInfo);
        
        if (success) {
          // Send confirmation email
          try {
            const { sendRewardRedemptionConfirmation } = await import("./emailNotifications");
            await sendRewardRedemptionConfirmation({
              customerName: input.shippingInfo.name,
              customerEmail: input.shippingInfo.email,
              rewardDescription: `3-for-Free Distributor Reward (${reward.earnedMonth})`,
              rewardValue: '42.00',
              shippingAddress: `${input.shippingInfo.addressLine1}${input.shippingInfo.addressLine2 ? ', ' + input.shippingInfo.addressLine2 : ''}, ${input.shippingInfo.city}, ${input.shippingInfo.state} ${input.shippingInfo.postalCode}, ${input.shippingInfo.country}`,
            });
          } catch (emailError) {
            console.warn("[DistributorRewardRedemption] Failed to send confirmation email:", emailError);
          }
        }
        
        return { success };
      }),
  }),

  blog: router({
    // List published blog posts
    list: publicProcedure
      .input(
        z.object({
          category: z.string().optional(),
          limit: z.number().int().min(1).max(50).default(10),
        }).optional()
      )
      .query(async ({ input }) => {
        const { getBlogPosts } = await import("./db");
        return await getBlogPosts(input?.category, input?.limit || 10);
      }),

    // Get single blog post by slug
    get: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const { getBlogPostBySlug } = await import("./db");
        return await getBlogPostBySlug(input.slug);
      }),

    // Admin: Create blog post
    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          slug: z.string().min(1),
          excerpt: z.string().optional(),
          content: z.string().min(1),
          category: z.enum(["product", "health", "business", "franchise", "distributor", "news", "lifestyle"]),
          metaTitle: z.string().optional(),
          metaDescription: z.string().optional(),
          keywords: z.string().optional(),
          featuredImage: z.string().optional(),
          status: z.enum(["draft", "published"]).default("draft"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { createBlogPost } = await import("./db");
        return await createBlogPost(input);
      }),

    // Admin: Update blog post
    update: protectedProcedure
      .input(
        z.object({
          id: z.number().int(),
          title: z.string().optional(),
          excerpt: z.string().optional(),
          content: z.string().optional(),
          category: z.enum(["product", "health", "business", "franchise", "distributor", "news", "lifestyle"]).optional(),
          metaTitle: z.string().optional(),
          metaDescription: z.string().optional(),
          keywords: z.string().optional(),
          featuredImage: z.string().optional(),
          status: z.enum(["draft", "published", "archived"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { updateBlogPost } = await import("./db");
        return await updateBlogPost(input.id, input);
      }),

    // Admin: Generate blog post using AI
    generate: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      const { generateBlogPost } = await import("./blogGenerator");
      return await generateBlogPost();
    }),

    // Get category counts (public)
    categories: publicProcedure.query(async () => {
      const { getBlogPostCountByCategory } = await import("./db");
      return await getBlogPostCountByCategory();
    }),

    // Get recent posts for sidebar/footer (public)
    recent: publicProcedure
      .input(z.object({ limit: z.number().int().min(1).max(10).default(5) }).optional())
      .query(async ({ input }) => {
        const { getRecentBlogPosts } = await import("./db");
        return await getRecentBlogPosts(input?.limit || 5);
      }),

    // Admin: Delete post
    delete: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { deleteBlogPost } = await import("./db");
        await deleteBlogPost(input.id);
        return { success: true };
      }),
  }),

  territory: router({
    // Check territory availability at a given location
    checkAvailability: publicProcedure
      .input(
        z.object({
          lat: z.number(),
          lng: z.number(),
          radiusMiles: z.number().min(1).max(50),
        })
      )
      .query(async ({ input }) => {
        const { getClaimedTerritoriesNear } = await import("./db");
        const claimed = await getClaimedTerritoriesNear(input.lat, input.lng, input.radiusMiles * 2);
        
        // Check if any claimed territory overlaps with the requested area
        const overlapping = claimed.filter(territory => {
          const distance = calculateDistance(
            input.lat, input.lng,
            Number(territory.centerLat), Number(territory.centerLng)
          );
          // Check if circles overlap (distance < sum of radii)
          return distance < (input.radiusMiles + territory.radiusMiles);
        });
        
        return {
          available: overlapping.length === 0,
          overlappingTerritories: overlapping.map(t => ({
            id: t.id,
            name: t.territoryName,
            radiusMiles: t.radiusMiles,
          })),
          nearbyClaimedCount: claimed.length,
        };
      }),

    // Get all claimed territories for map display
    getClaimedTerritories: publicProcedure.query(async () => {
      const { getAllClaimedTerritories } = await import("./db");
      return await getAllClaimedTerritories();
    }),

    // Analyze territory with LLM to get cross streets and adjusted area
    analyzeTerritory: publicProcedure
      .input(
        z.object({
          centerLat: z.number(),
          centerLng: z.number(),
          squareMiles: z.number(),
          address: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are a geographic analysis assistant. Given a location and area, provide:
1. Major cross streets or landmarks that define the territory boundaries
2. An adjusted square mile estimate based on typical urban/suburban density
3. Key neighborhoods or districts within the area

Respond in JSON format with:
- crossStreets: array of 4-6 major street names or landmarks
- adjustedSquareMiles: number (your estimate of the actual usable area)
- neighborhoods: array of neighborhood names
- notes: brief description of the territory`
              },
              {
                role: "user",
                content: `Analyze this territory:
Location: ${input.address}
Coordinates: ${input.centerLat}, ${input.centerLng}
Selected Area: ${input.squareMiles} square miles

Provide cross streets, adjusted area estimate, and key neighborhoods.`
              }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "territory_analysis",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    crossStreets: {
                      type: "array",
                      items: { type: "string" },
                      description: "Major cross streets or landmarks defining the territory"
                    },
                    adjustedSquareMiles: {
                      type: "number",
                      description: "Adjusted square mile estimate"
                    },
                    neighborhoods: {
                      type: "array",
                      items: { type: "string" },
                      description: "Key neighborhoods within the territory"
                    },
                    notes: {
                      type: "string",
                      description: "Brief description of the territory"
                    }
                  },
                  required: ["crossStreets", "adjustedSquareMiles", "neighborhoods", "notes"],
                  additionalProperties: false
                }
              }
            }
          });
          
          const content = response.choices[0]?.message?.content;
          if (typeof content === "string") {
            const parsed = JSON.parse(content);
            return {
              crossStreets: parsed.crossStreets || [],
              adjustedSquareMiles: parsed.adjustedSquareMiles || input.squareMiles,
              neighborhoods: parsed.neighborhoods || [],
              notes: parsed.notes || ""
            };
          }
          
          return {
            crossStreets: [],
            adjustedSquareMiles: input.squareMiles,
            neighborhoods: [],
            notes: ""
          };
        } catch (error) {
          console.error("Territory analysis failed:", error);
          // Return defaults on error
          return {
            crossStreets: [],
            adjustedSquareMiles: input.squareMiles,
            neighborhoods: [],
            notes: ""
          };
        }
      }),

    // Start a new territory application
    startApplication: publicProcedure
      .input(
        z.object({
          centerLat: z.number(),
          centerLng: z.number(),
          radiusMiles: z.number().min(1).max(50),
          territoryName: z.string().min(1),
          estimatedPopulation: z.number().optional(),
          termMonths: z.number().int().min(6),
          totalCost: z.number().int().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { createTerritoryApplication } = await import("./db");
        const application = await createTerritoryApplication({
          userId: ctx.user?.id,
          currentStep: 1,
          centerLat: String(input.centerLat),
          centerLng: String(input.centerLng),
          radiusMiles: input.radiusMiles,
          territoryName: input.territoryName,
          estimatedPopulation: input.estimatedPopulation,
          termMonths: input.termMonths,
          totalCost: input.totalCost,
        });
        return { applicationId: application.id };
      }),

    // Update application with personal details (Step 2)
    updatePersonalDetails: publicProcedure
      .input(
        z.object({
          applicationId: z.number().int(),
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().email(),
          phone: z.string().min(10),
          dateOfBirth: z.string().optional(),
          streetAddress: z.string().min(1),
          city: z.string().min(1),
          state: z.string().min(1),
          zipCode: z.string().min(5),
        })
      )
      .mutation(async ({ input }) => {
        const { updateTerritoryApplication } = await import("./db");
        await updateTerritoryApplication(input.applicationId, {
          currentStep: 2,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          dateOfBirth: input.dateOfBirth,
          streetAddress: input.streetAddress,
          city: input.city,
          state: input.state,
          zipCode: input.zipCode,
        });
        return { success: true };
      }),

    // Update application with business info (Step 3)
    updateBusinessInfo: publicProcedure
      .input(
        z.object({
          applicationId: z.number().int(),
          businessName: z.string().optional(),
          businessType: z.enum(["individual", "llc", "corporation", "partnership"]),
          taxId: z.string().optional(),
          yearsInBusiness: z.number().int().optional(),
          investmentCapital: z.number().int().optional(),
          franchiseExperience: z.string().optional(),
          whyInterested: z.string().min(10),
        })
      )
      .mutation(async ({ input }) => {
        const { updateTerritoryApplication } = await import("./db");
        await updateTerritoryApplication(input.applicationId, {
          currentStep: 3,
          businessName: input.businessName,
          businessType: input.businessType,
          taxId: input.taxId,
          yearsInBusiness: input.yearsInBusiness,
          investmentCapital: input.investmentCapital,
          franchiseExperience: input.franchiseExperience,
          whyInterested: input.whyInterested,
        });
        return { success: true };
      }),

    // Submit application (Step 4)
    submitApplication: publicProcedure
      .input(
        z.object({
          applicationId: z.number().int(),
          agreedToTerms: z.boolean(),
          signature: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        if (!input.agreedToTerms) {
          throw new Error("You must agree to the terms and conditions");
        }
        
        const { updateTerritoryApplication, getTerritoryApplication } = await import("./db");
        
        await updateTerritoryApplication(input.applicationId, {
          currentStep: 4,
          agreedToTerms: 1,
          signature: input.signature,
          status: "submitted",
          submittedAt: new Date().toISOString(),
        });
        
        // Get application details for notification
        const application = await getTerritoryApplication(input.applicationId);
        
        // Notify admin of new application
        await notifyOwner({
          title: "New Territory Application Submitted",
          content: `New territory application from ${application?.firstName} ${application?.lastName} (${application?.email}) for ${application?.territoryName}. Radius: ${application?.radiusMiles} miles. Total cost: $${application?.totalCost?.toLocaleString()}. Review in admin dashboard.`,
        });
        
        // Send confirmation email to applicant
        try {
          if (application?.email && application?.firstName) {
            const { sendTerritorySubmittedNotification } = await import("./emailNotifications");
            await sendTerritorySubmittedNotification({
              applicantName: `${application.firstName} ${application.lastName || ""}`.trim(),
              applicantEmail: application.email,
              applicationId: input.applicationId,
              territoryName: application.territoryName || "Your Territory",
              squareMiles: Math.PI * Math.pow(application.radiusMiles || 5, 2),
              status: "submitted",
              monthlyFee: application.totalCost ? Math.round(application.totalCost / (application.termMonths || 12)) : undefined,
            });
          }
        } catch (emailError) {
          console.warn("[Territory] Failed to send submission email:", emailError);
        }
        
        return { success: true };
      }),

    // Get application by ID
    getApplication: publicProcedure
      .input(z.object({ applicationId: z.number().int() }))
      .query(async ({ input }) => {
        const { getTerritoryApplication } = await import("./db");
        return await getTerritoryApplication(input.applicationId);
      }),

    // Admin: List all applications
    listApplications: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      const { getAllTerritoryApplications } = await import("./db");
      return await getAllTerritoryApplications();
    }),

    // Get territory tracking summary (admin)
    trackingSummary: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      const { getTerritoryTrackingSummary } = await import("./db");
      return await getTerritoryTrackingSummary();
    }),

    // Get territories expiring soon (admin)
    expiringSoon: protectedProcedure
      .input(z.object({ daysAhead: z.number().int().min(1).max(365).optional() }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { getTerritoriesExpiringSoon } = await import("./db");
        return await getTerritoriesExpiringSoon(input?.daysAhead || 30);
      }),

    // Get territories due for renewal (admin)
    dueForRenewal: protectedProcedure
      .input(z.object({ daysAhead: z.number().int().min(1).max(365).optional() }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { getTerritoriesDueForRenewal } = await import("./db");
        return await getTerritoriesDueForRenewal(input?.daysAhead || 30);
      }),

    // Update expired territories (admin - can be called manually or via cron)
    processExpirations: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      const { updateExpiredTerritories } = await import("./db");
      return await updateExpiredTerritories();
    }),

    // Update territory status (admin)
    updateStatus: protectedProcedure
      .input(
        z.object({
          territoryId: z.number().int(),
          status: z.enum(["pending", "active", "expired"]),
          renewalDate: z.date().optional(),
          expirationDate: z.date().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { updateTerritoryStatus } = await import("./db");
        return await updateTerritoryStatus(
          input.territoryId,
          input.status,
          input.renewalDate,
          input.expirationDate
        );
      }),

    // Activate territory from approved application (admin)
    activateFromApplication: protectedProcedure
      .input(
        z.object({
          applicationId: z.number().int(),
          termMonths: z.number().int().min(1).max(60).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { activateTerritoryFromApplication } = await import("./db");
        return await activateTerritoryFromApplication(
          input.applicationId,
          input.termMonths || 12
        );
      }),

    // Admin: Approve/reject application
    updateApplicationStatus: protectedProcedure
      .input(
        z.object({
          applicationId: z.number().int(),
          status: z.enum(["under_review", "approved", "rejected"]),
          adminNotes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        
        const { updateTerritoryApplication, getTerritoryApplication, createClaimedTerritory } = await import("./db");
        
        await updateTerritoryApplication(input.applicationId, {
          status: input.status,
          adminNotes: input.adminNotes,
        });
        
        // Get application details for email notification
        const application = await getTerritoryApplication(input.applicationId);
        
        // If approved, create claimed territory
        if (input.status === "approved") {
          if (application && application.centerLat && application.centerLng && application.radiusMiles) {
            await createClaimedTerritory({
              territoryLicenseId: input.applicationId,
              centerLat: String(application.centerLat),
              centerLng: String(application.centerLng),
              radiusMiles: application.radiusMiles,
              territoryName: application.territoryName || "Unnamed Territory",
              city: application.city,
              state: application.state,
              zipCode: application.zipCode,
              status: "active",
            });
          }
        }
        
        // Send email notification for approval/rejection
        if (application?.email && application?.firstName && (input.status === "approved" || input.status === "rejected")) {
          try {
            const { sendTerritoryApprovalNotification } = await import("./emailNotifications");
            const squareMiles = application.radiusMiles ? Math.PI * Math.pow(application.radiusMiles, 2) : 0;
            const monthlyFee = application.totalCost ? Math.round(application.totalCost / (application.termMonths || 12)) : undefined;
            
            await sendTerritoryApprovalNotification({
              applicantName: `${application.firstName} ${application.lastName || ""}`.trim(),
              applicantEmail: application.email,
              applicationId: input.applicationId,
              territoryName: application.territoryName || "Your Territory",
              squareMiles,
              status: input.status as "approved" | "rejected",
              rejectionReason: input.status === "rejected" ? input.adminNotes : undefined,
              monthlyFee,
            });
          } catch (emailError) {
            console.warn("[Territory] Failed to send status notification email:", emailError);
          }
        }
        
        return { success: true };
      }),

    // Submit vending machine application
    submitVendingApplication: publicProcedure
      .input(
        z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().email(),
          phone: z.string().min(10),
          businessName: z.string().optional(),
          businessType: z.string(),
          yearsInBusiness: z.string().optional(),
          city: z.string().min(1),
          state: z.string().min(1),
          zipCode: z.string().min(5),
          proposedLocations: z.string().optional(),
          numberOfMachines: z.string(),
          investmentBudget: z.string().optional(),
          timeline: z.string().optional(),
          experience: z.string().optional(),
          questions: z.string().optional(),
          applicationType: z.literal("vending"),
        })
      )
      .mutation(async ({ input }) => {
        const { createVendingApplication } = await import("./db");
        
        const application = await createVendingApplication({
          ...input,
          status: "pending",
          submittedAt: new Date().toISOString(),
        });
        
        // Notify admin of new vending application
        await notifyOwner({
          title: "New Vending Machine Application",
          content: `New vending application from ${input.firstName} ${input.lastName} (${input.email}, ${input.phone}).\n\nLocation: ${input.city}, ${input.state} ${input.zipCode}\nBusiness: ${input.businessName || "Individual"}\nMachines: ${input.numberOfMachines}\nBudget: ${input.investmentBudget || "Not specified"}\nTimeline: ${input.timeline || "Not specified"}\n\nProposed Locations: ${input.proposedLocations || "Not specified"}\n\nExperience: ${input.experience || "None provided"}\n\nQuestions: ${input.questions || "None"}`,
        });
        
        return { success: true, applicationId: application.id };
      }),

    // Submit franchise territory application
    submitFranchiseApplication: publicProcedure
      .input(
        z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().email(),
          phone: z.string().min(10),
          territoryCity: z.string().min(1),
          territoryState: z.string().min(1),
          territorySize: z.string(),
          exclusivityType: z.string(),
          investmentCapital: z.string(),
          financingNeeded: z.string().optional(),
          netWorth: z.string().optional(),
          businessExperience: z.string(),
          distributionExperience: z.string().optional(),
          teamSize: z.string().optional(),
          motivation: z.string().min(10),
          timeline: z.string(),
          questions: z.string().optional(),
          applicationType: z.literal("franchise"),
        })
      )
      .mutation(async ({ input }) => {
        const { createFranchiseApplication } = await import("./db");
        
        const application = await createFranchiseApplication({
          ...input,
          status: "pending",
          submittedAt: new Date().toISOString(),
        });
        
        // Notify admin of new franchise application
        await notifyOwner({
          title: "New Franchise Territory Application",
          content: `New franchise application from ${input.firstName} ${input.lastName} (${input.email}, ${input.phone}).\n\nDesired Territory: ${input.territoryCity}, ${input.territoryState}\nTerritory Size: ${input.territorySize}\nExclusivity: ${input.exclusivityType}\n\nInvestment Capital: ${input.investmentCapital}\nFinancing Needed: ${input.financingNeeded || "Not specified"}\nNet Worth: ${input.netWorth || "Not disclosed"}\n\nBusiness Experience: ${input.businessExperience}\nDistribution Experience: ${input.distributionExperience || "None provided"}\nTeam Size: ${input.teamSize || "Not specified"}\n\nMotivation: ${input.motivation}\nTimeline: ${input.timeline}\n\nQuestions: ${input.questions || "None"}`,
        });
        
        return { success: true, applicationId: application.id };
      }),

    // Create a 48-hour territory reservation
    createReservation: protectedProcedure
      .input(
        z.object({
          territoryName: z.string().min(1),
          state: z.string().min(1),
          centerLat: z.string(),
          centerLng: z.string(),
          radiusMiles: z.string(),
          areaSqMiles: z.string(),
          population: z.number().int(),
          licenseFee: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { createTerritoryReservation } = await import("./db");
        
        // Create the reservation (validation happens in createTerritoryReservation)
        try {
          const reservation = await createTerritoryReservation({
            userId: ctx.user.id,
            territoryName: input.territoryName,
            state: input.state,
            centerLat: input.centerLat,
            centerLng: input.centerLng,
            radiusMiles: input.radiusMiles,
            areaSqMiles: input.areaSqMiles,
            population: input.population,
            licenseFee: input.licenseFee,
          });
          return reservation;
        } catch (error: any) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message || "Failed to create reservation",
          });
        }
      }),

    // Get user's active reservation
    getMyReservation: protectedProcedure.query(async ({ ctx }) => {
      const { getUserActiveReservation } = await import("./db");
      return await getUserActiveReservation(ctx.user.id);
    }),

    // Cancel a reservation
    cancelReservation: protectedProcedure
      .input(z.object({ reservationId: z.number().int() }))
      .mutation(async ({ input, ctx }) => {
        const { cancelTerritoryReservation } = await import("./db");
        
        try {
          return await cancelTerritoryReservation(ctx.user.id, input.reservationId);
        } catch (error: any) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: error.message || "Reservation not found or you don't have permission to cancel it.",
          });
        }
      }),

    // Admin: Get all active reservations
    listReservations: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const { getActiveReservations } = await import("./db");
      return await getActiveReservations();
    }),
  }),

  // NFT Gallery and Management
  nft: router({
    // Get all NFTs for gallery
    gallery: publicProcedure
      .input(z.object({ limit: z.number().int().min(1).max(500).optional() }).optional())
      .query(async ({ input }) => {
        const { getAllNfts } = await import("./db");
        return await getAllNfts(input?.limit || 100);
      }),

    // Get NFT statistics
    stats: publicProcedure.query(async () => {
      const { getNftStats } = await import("./db");
      return await getNftStats();
    }),

    // Get single NFT by token ID
    getByTokenId: publicProcedure
      .input(z.object({ tokenId: z.number().int() }))
      .query(async ({ input }) => {
        const { getNftByTokenId } = await import("./db");
        return await getNftByTokenId(input.tokenId);
      }),

    // Get user's NFTs
    myNfts: protectedProcedure.query(async ({ ctx }) => {
      const { getNftsByUser } = await import("./db");
      return await getNftsByUser(ctx.user.id);
    }),

    // Mint NFT for a new order (called internally when order is placed)
    mint: publicProcedure
      .input(z.object({
        id: z.number().int().optional(),
        preid: z.number().int().optional(),
        crowdfundingId: z.number().int().optional(),
        ownerEmail: z.string().email(),
        ownerName: z.string(),
        packageType: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { createNeonNft } = await import("./db");
        const nft = await createNeonNft(input);
        
        // Notify admin of new NFT minted
        await notifyOwner({
          title: `New NFT Minted: ${nft.name}`,
          content: `A new ${nft.rarity.toUpperCase()} NFT has been minted for ${input.ownerName} (${input.ownerEmail}). Token ID: #${nft.tokenId}. Estimated value: $${nft.estimatedValue.toLocaleString()}.${nft.imageUrl ? ` Artwork: ${nft.imageUrl}` : ''}`,
        });
        
        return nft;
      }),

    // Regenerate artwork for an existing NFT (admin only)
    regenerateArtwork: protectedProcedure
      .input(z.object({ tokenId: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { regenerateNftArtwork } = await import("./db");
        return await regenerateNftArtwork(input.tokenId);
      }),

    // Get blockchain network info
    networkInfo: publicProcedure.query(async () => {
      const { getNetworkInfo } = await import("./blockchain");
      return getNetworkInfo();
    }),

    // Get NFT metadata (OpenSea compatible)
    metadata: publicProcedure
      .input(z.object({ tokenId: z.number().int() }))
      .query(async ({ input }) => {
        const { getNftByTokenId } = await import("./db");
        const { generateNftMetadata } = await import("./blockchain");
        const nft = await getNftByTokenId(input.tokenId);
        if (!nft) {
          throw new Error("NFT not found");
        }
        return generateNftMetadata(nft);
      }),

    // Get OpenSea URL for an NFT
    openSeaUrl: publicProcedure
      .input(z.object({ tokenId: z.number().int() }))
      .query(async ({ input }) => {
        const { getOpenSeaUrl, getExplorerUrl } = await import("./blockchain");
        const { getNftByTokenId } = await import("./db");
        const nft = await getNftByTokenId(input.tokenId);
        return {
          openSeaUrl: getOpenSeaUrl(input.tokenId),
          explorerUrl: nft?.txHash ? getExplorerUrl(nft.txHash) : null,
          txHash: nft?.txHash || null,
          blockchainStatus: nft?.blockchainStatus || "pending",
        };
      }),

    // Mint NFT on blockchain (admin only)
    mintOnChain: protectedProcedure
      .input(z.object({
        tokenId: z.number().int(),
        recipientAddress: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { mintNftOnChain, isValidAddress } = await import("./blockchain");
        
        if (!isValidAddress(input.recipientAddress)) {
          throw new Error("Invalid Ethereum address");
        }
        
        return await mintNftOnChain(input.tokenId, input.recipientAddress);
      }),

    // Batch mint NFTs on blockchain (admin only)
    batchMintOnChain: protectedProcedure
      .input(z.object({
        tokenIds: z.array(z.number().int()),
        recipientAddress: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { batchMintNfts, isValidAddress } = await import("./blockchain");
        
        if (!isValidAddress(input.recipientAddress)) {
          throw new Error("Invalid Ethereum address");
        }
        
        return await batchMintNfts(input.tokenIds, input.recipientAddress);
      }),

    // Check blockchain status
    checkOnChain: publicProcedure
      .input(z.object({ tokenId: z.number().int() }))
      .query(async ({ input }) => {
        const { checkNftOnChain } = await import("./blockchain");
        return await checkNftOnChain(input.tokenId);
      }),

    // Get wallet balance (admin only)
    walletBalance: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      const { getWalletBalance } = await import("./blockchain");
      return { balance: await getWalletBalance() };
    }),
  }),

  // SMS Notifications and Referral Tracking
  sms: router({
    // Opt-in to SMS notifications
    optIn: publicProcedure
      .input(
        z.object({
          phone: z.string().min(10, "Valid phone number required"),
          email: z.string().email().optional(),
          name: z.string().min(1, "Name is required"),
          referredBy: z.string().optional(),
          preferences: z.object({
            orderUpdates: z.boolean().default(true),
            promotions: z.boolean().default(true),
            referralAlerts: z.boolean().default(true),
            territoryUpdates: z.boolean().default(true),
          }).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { generateReferralCode, sendWelcomeSubscriberSMS } = await import("./smsNotifications");
        const { createSMSOptIn, trackReferralClick } = await import("./db");
        
        // Generate unique subscriber ID and referral code
        const subscriberId = `SUB${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        const referralCode = generateReferralCode(subscriberId);
        
        // Create SMS opt-in record
        const optIn = await createSMSOptIn({
          phone: input.phone,
          email: input.email,
          name: input.name,
          subscriberId,
          referralCode,
          referredBy: input.referredBy,
          optedIn: 1,
          prefOrderUpdates: input.preferences?.orderUpdates ? 1 : 0,
          prefPromotions: input.preferences?.promotions ? 1 : 0,
          prefReferralAlerts: input.preferences?.referralAlerts ? 1 : 0,
          prefTerritoryUpdates: input.preferences?.territoryUpdates ? 1 : 0,
        });
        
        // Track referral if applicable
        if (input.referredBy) {
          await trackReferralClick(input.referredBy, input.phone, input.email, input.name);
        }
        
        // Send welcome SMS
        await sendWelcomeSubscriberSMS(
          { phone: input.phone, name: input.name },
          referralCode
        );
        
        return {
          success: true,
          subscriberId,
          referralCode,
        };
      }),

    // Opt-out of SMS notifications
    optOut: publicProcedure
      .input(z.object({ phone: z.string().min(10) }))
      .mutation(async ({ input }) => {
        const { updateSMSOptIn } = await import("./db");
        await updateSMSOptIn(input.phone, { optedIn: 0, optOutDate: new Date().toISOString() });
        return { success: true };
      }),

    // Update SMS preferences
    updatePreferences: publicProcedure
      .input(
        z.object({
          phone: z.string().min(10),
          preferences: z.object({
            orderUpdates: z.boolean(),
            promotions: z.boolean(),
            referralAlerts: z.boolean(),
            territoryUpdates: z.boolean(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        const { updateSMSOptIn } = await import("./db");
        await updateSMSOptIn(input.phone, {
          prefOrderUpdates: input.preferences.orderUpdates ? 1 : 0,
          prefPromotions: input.preferences.promotions ? 1 : 0,
          prefReferralAlerts: input.preferences.referralAlerts ? 1 : 0,
          prefTerritoryUpdates: input.preferences.territoryUpdates ? 1 : 0,
        });
        return { success: true };
      }),

    // Get referral messages for sharing
    getReferralMessages: publicProcedure
      .input(z.object({ referrerName: z.string(), referralCode: z.string() }))
      .query(async ({ input }) => {
        const { generateReferralMessages } = await import("./smsNotifications");
        return generateReferralMessages(input.referrerName, input.referralCode);
      }),

    // Send referral invite via SMS
    sendReferralInvite: publicProcedure
      .input(
        z.object({
          referrerName: z.string(),
          referralCode: z.string(),
          recipientPhone: z.string().min(10),
        })
      )
      .mutation(async ({ input }) => {
        const { sendReferralInviteSMS } = await import("./smsNotifications");
        const { createReferralTracking } = await import("./db");
        
        // Track the referral
        await createReferralTracking({
          referrerId: input.referralCode.replace("NEON", "").substring(0, 6),
          referrerName: input.referrerName,
          referralCode: input.referralCode,
          referredPhone: input.recipientPhone,
          source: "sms",
          status: "pending",
        });
        
        // Send the SMS
        const success = await sendReferralInviteSMS(
          input.referrerName,
          input.referralCode,
          input.recipientPhone
        );
        
        return { success };
      }),

    // Get subscriber's referral stats
    getReferralStats: publicProcedure
      .input(z.object({ subscriberId: z.string() }))
      .query(async ({ input }) => {
        const { getSMSOptInBySubscriberId, getReferralsByReferrer } = await import("./db");
        
        const subscriber = await getSMSOptInBySubscriberId(input.subscriberId);
        if (!subscriber) {
          throw new Error("Subscriber not found");
        }
        
        const referrals = await getReferralsByReferrer(subscriber.referralCode);
        
        return {
          totalReferrals: subscriber.totalReferrals,
          customersReferred: subscriber.customersReferred,
          distributorsReferred: subscriber.distributorsReferred,
          referralCode: subscriber.referralCode,
          referrals: referrals.map((r: any) => ({
            name: r.referredName,
            status: r.status,
            source: r.source,
            convertedToCustomer: r.convertedToCustomer === 1,
            convertedToDistributor: r.convertedToDistributor === 1,
            createdAt: r.createdAt,
          })),
        };
      }),

    // Track referral click (when someone uses a referral link)
    trackClick: publicProcedure
      .input(
        z.object({
          referralCode: z.string(),
          source: z.enum(["sms", "email", "social", "direct", "whatsapp", "twitter", "facebook"]).default("direct"),
        })
      )
      .mutation(async ({ input }) => {
        const { updateReferralStatus } = await import("./db");
        await updateReferralStatus(input.referralCode, "clicked");
        return { success: true };
      }),

    // Convert referral to customer
    convertToCustomer: publicProcedure
      .input(
        z.object({
          referralCode: z.string(),
          id: z.number().int(),
          customerEmail: z.string().email(),
          customerName: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const { convertReferralToCustomer, incrementReferrerStats } = await import("./db");
        
        await convertReferralToCustomer(
          input.referralCode,
          input.id,
          input.customerEmail,
          input.customerName
        );
        
        // Increment referrer's customer count
        await incrementReferrerStats(input.referralCode, "customer");
        
        return { success: true };
      }),

    // Convert referral to distributor
    convertToDistributor: publicProcedure
      .input(
        z.object({
          referralCode: z.string(),
          distributorId: z.number().int(),
          distributorEmail: z.string().email(),
          distributorName: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const { convertReferralToDistributor, incrementReferrerStats } = await import("./db");
        
        await convertReferralToDistributor(
          input.referralCode,
          input.distributorId,
          input.distributorEmail,
          input.distributorName
        );
        
        // Increment referrer's distributor count
        await incrementReferrerStats(input.referralCode, "distributor");
        
        return { success: true };
      }),

    // Admin: Get all SMS opt-ins
    listOptIns: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      const { getAllSMSOptIns } = await import("./db");
      return await getAllSMSOptIns();
    }),

    // Admin: Get all referral tracking data
    listReferrals: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      const { getAllReferralTracking } = await import("./db");
      return await getAllReferralTracking();
    }),

    // Public leaderboard - top referrers
    leaderboard: publicProcedure
      .input(
        z.object({
          limit: z.number().int().min(1).max(100).default(50),
          timeframe: z.enum(["all", "monthly", "weekly"]).default("all"),
        }).optional()
      )
      .query(async ({ input }) => {
        const { getLeaderboard } = await import("./db");
        const leaders = await getLeaderboard(input || {});
        
        // Add rank and anonymize names for privacy
        return leaders.map((leader: any, index: number) => ({
          rank: index + 1,
          name: leader.name ? anonymizeName(leader.name) : "Anonymous",
          totalReferrals: leader.totalReferrals,
          customersReferred: leader.customersReferred,
          distributorsReferred: leader.distributorsReferred,
          subscriberId: leader.subscriberId,
          // Calculate tier based on referrals
          tier: getTierFromReferrals(leader.totalReferrals),
          // Calculate points (referrals * 10 + customers * 50 + distributors * 100)
          points: (leader.totalReferrals * 10) + (leader.customersReferred * 50) + (leader.distributorsReferred * 100),
        }));
      }),

    // Leaderboard stats summary
    leaderboardStats: publicProcedure.query(async () => {
      const { getLeaderboardStats } = await import("./db");
      return await getLeaderboardStats();
    }),

    // Get user's position on leaderboard
    myPosition: protectedProcedure.query(async ({ ctx }) => {
      const { getUserReferralStatsByEmail } = await import("./db");
      
      if (!ctx.user.email) {
        return null;
      }
      
      const stats = await getUserReferralStatsByEmail(ctx.user.email);
      if (!stats) return null;
      
      return {
        position: stats.position,
        totalReferrals: stats.totalReferrals,
        customersReferred: stats.customersReferred,
        distributorsReferred: stats.distributorsReferred,
        referralCode: stats.referralCode,
        tier: getTierFromReferrals(stats.totalReferrals),
        points: (stats.totalReferrals * 10) + (stats.customersReferred * 50) + (stats.distributorsReferred * 100),
      };
    }),
  }),

  // Investor inquiries router
  investor: router({
    // Submit investor inquiry (public)
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1, "Name is required"),
          email: z.string().email("Valid email is required"),
          phone: z.string().optional(),
          company: z.string().optional(),
          investmentRange: z.enum(["under_10k", "10k_50k", "50k_100k", "100k_500k", "500k_1m", "over_1m"]),
          accreditedStatus: z.enum(["yes", "no", "unsure"]),
          investmentType: z.enum(["equity", "convertible_note", "revenue_share", "franchise", "other"]),
          referralSource: z.string().optional(),
          message: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { createInvestorInquiry } = await import("./db");
        const id = await createInvestorInquiry(input);
        
        // Notify owner of new investor inquiry
        try {
          await notifyOwner({
            title: "🎯 New Investor Inquiry",
            content: `New investor inquiry from ${input.name} (${input.email})\n\nInvestment Range: ${input.investmentRange.replace(/_/g, " ")}\nAccredited: ${input.accreditedStatus}\nType: ${input.investmentType.replace(/_/g, " ")}\n\nMessage: ${input.message || "No message provided"}`,
          });
        } catch (err) {
          console.warn("[Investor] Failed to notify owner:", err);
        }
        
        return { success: true, id };
      }),

    // List all inquiries (admin only)
    list: protectedProcedure
      .input(
        z.object({
          limit: z.number().int().min(1).max(500).default(100),
          status: z.string().optional(),
        }).optional()
      )
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { getInvestorInquiries } = await import("./db");
        return await getInvestorInquiries(input || {});
      }),

    // Update inquiry status (admin only)
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number().int(),
          status: z.enum(["new", "contacted", "in_discussion", "committed", "declined"]),
          adminNotes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { updateInvestorInquiryStatus } = await import("./db");
        await updateInvestorInquiryStatus(input.id, input.status, input.adminNotes);
        return { success: true };
      }),
  }),

  // AI Chat for sales and support
  chat: router({
    send: publicProcedure
      .input(
        z.object({
          message: z.string().min(1),
          language: z.string().default("en"),
          context: z.enum(["sales", "support", "general", "training", "tutorial"]).default("general"),
          systemPrompt: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        
        // Default system prompts by context
        const defaultPrompts: Record<string, string> = {
          general: `You are NEON Assistant, a friendly and helpful AI for NEON Energy Drink. Help users with any questions about the product, company, or website. Keep responses concise and helpful.`,
          sales: `You are a SALES TRAINING coach for NEON Energy distributors. Teach them:
- How to approach prospects and overcome objections
- The NEON product benefits and unique selling points
- Closing techniques and follow-up strategies
- Building rapport and trust with customers
- Handling price objections
- Creating urgency without being pushy
Provide specific scripts and examples. Keep responses actionable and under 200 words.`,
          support: `You are a CUSTOMER SUPPORT specialist for NEON Energy. Help users with:
- Order tracking and shipping questions
- Product information and ingredients
- Account and login issues
- Refund and return policies
Be empathetic, professional, and solution-oriented. Keep responses under 150 words.`,
          training: `You are a DISTRIBUTOR TRAINING coach for NEON Energy MLM. Teach them:
- How the compensation plan works (binary, matching bonuses, fast-start)
- Rank advancement strategies (Starter → Bronze → Silver → Gold → Platinum → Diamond → Ambassador)
- Team building and recruitment
- How to maximize commissions
- Using the distributor portal effectively
Provide actionable advice with real examples. Keep responses under 200 words.`,
          tutorial: `You are a WEBSITE TUTORIAL guide for NEON Energy. Help users navigate:
- How to create an account and log in (click Sign In at top right)
- How to place orders (go to /shop, add items to cart, checkout)
- How to become a distributor (go to /join, fill out application)
- How to use the distributor portal (go to /portal after logging in)
- How to track commissions (in portal, click Commissions tab)
- How to manage autoship (in portal, click Auto-Ship tab)
- How to apply for franchise (go to /franchise, fill form)
Provide step-by-step instructions with specific button names and locations. Keep responses under 200 words.`,
        };
        
        // Use custom system prompt if provided, otherwise use default for context
        const systemPrompt = input.systemPrompt || defaultPrompts[input.context] || defaultPrompts.general;
        
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: input.message },
            ],
          });
          
          const rawContent = response.choices[0]?.message?.content;
          const aiMessage = typeof rawContent === 'string' ? rawContent : "I'm sorry, I couldn't process that. Please try again.";
          
          return { message: aiMessage };
        } catch (error) {
          console.error("[Chat] LLM error:", error);
          return { message: "I'm having trouble connecting right now. Please try again or contact us directly at support@neonenergy.com" };
        }
      }),
  }),

  // Customer referral and rewards router
  customer: router({
    // Generate referral code
    generateReferralCode: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { generateCustomerReferralCode, createCustomerProfile, getPersonalizedProfile } = await import("./db");
        const code = await generateCustomerReferralCode(ctx.user.id);
        
        // Automatically create personalized profile for customer if not exists
        const existingProfile = await getPersonalizedProfile(ctx.user.id);
        if (!existingProfile) {
          await createCustomerProfile(ctx.user.id, ctx.user.name || "NEON Customer");
        }
        
        return { code };
      }),

    // Get referral stats
    getReferralStats: protectedProcedure
      .query(async ({ ctx }) => {
        const { getCustomerReferralStats } = await import("./db");
        return getCustomerReferralStats(ctx.user.id);
      }),

    // Get rewards
    getRewards: protectedProcedure
      .query(async ({ ctx }) => {
        const { getCustomerRewards } = await import("./db");
        return getCustomerRewards(ctx.user.id);
      }),

    // Record a referral (when someone uses a referral code)
    recordReferral: publicProcedure
      .input(z.object({
        referralCode: z.string(),
        referredUserId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { recordCustomerReferral, getCustomerReferralCode } = await import("./db");
        const db = await import("./db").then(m => m.getDb());
        if (!db) return { success: false };
        
        // Find the referrer by code
        const { customerReferralCodes } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const codeResult = await db!.select()
          .from(customerReferralCodes)
          .where(eq(customerReferralCodes.code, input.referralCode))
          .limit(1);
        
        if (!codeResult[0]) return { success: false };
        
        await recordCustomerReferral(
          codeResult[0].userId,
          input.referredUserId,
          input.referralCode
        );
        return { success: true };
      }),

    // Complete a referral (when referred user makes a purchase)
    completeReferral: protectedProcedure
      .input(z.object({
        id: z.number(),
        purchaseAmount: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { completeCustomerReferral } = await import("./db");
        await completeCustomerReferral(ctx.user.id, input.id, input.purchaseAmount);
        return { success: true };
      }),

    // Redeem a reward
    redeemReward: protectedProcedure
      .input(z.object({
        rewardId: z.number(),
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { redeemCustomerReward } = await import("./db");
        const success = await redeemCustomerReward(input.rewardId, input.id);
        return { success };
      }),

    // Redeem a reward with shipping info (for free case claims)
    redeemRewardWithShipping: protectedProcedure
      .input(z.object({
        rewardId: z.number(),
        shippingInfo: z.object({
          name: z.string().min(1),
          email: z.string().email(),
          phone: z.string().optional(),
          addressLine1: z.string().min(1),
          addressLine2: z.string().optional(),
          city: z.string().min(1),
          state: z.string().min(1),
          postalCode: z.string().min(1),
          country: z.string().min(1),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        const { redeemCustomerRewardWithShipping, getCustomerRewardById } = await import("./db");
        
        // Get the reward to verify ownership and status
        const reward = await getCustomerRewardById(input.rewardId);
        if (!reward) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Reward not found' });
        }
        if (reward.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'This reward belongs to another user' });
        }
        if (reward.status !== 'available') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'This reward is not available for redemption' });
        }
        
        // Process the redemption
        const success = await redeemCustomerRewardWithShipping(input.rewardId, input.shippingInfo);
        
        if (success) {
          // Send confirmation email
          try {
            const { sendRewardRedemptionConfirmation } = await import("./emailNotifications");
            await sendRewardRedemptionConfirmation({
              customerName: input.shippingInfo.name,
              customerEmail: input.shippingInfo.email,
              rewardDescription: reward.description,
              rewardValue: reward.value,
              shippingAddress: `${input.shippingInfo.addressLine1}${input.shippingInfo.addressLine2 ? ', ' + input.shippingInfo.addressLine2 : ''}, ${input.shippingInfo.city}, ${input.shippingInfo.state} ${input.shippingInfo.postalCode}, ${input.shippingInfo.country}`,
            });
          } catch (emailError) {
            console.warn("[RewardRedemption] Failed to send confirmation email:", emailError);
          }
        }
        
        return { success };
      }),
  }),

  // Admin reward fulfillment router
  adminRewards: router({
    // Get all reward redemptions for admin
    listRedemptions: protectedProcedure
      .input(z.object({
        status: z.enum(['all', 'pending', 'processing', 'shipped', 'delivered']).optional(),
        type: z.enum(['all', 'customer', 'distributor']).optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        const { getAllRewardRedemptions } = await import('./db');
        const allRedemptions = await getAllRewardRedemptions();
        
        // Filter by status and type if provided
        let filtered = allRedemptions;
        if (input?.status && input.status !== 'all') {
          filtered = filtered.filter((r: any) => r.status === input.status);
        }
        if (input?.type && input.type !== 'all') {
          filtered = filtered.filter((r: any) => r.rewardType === input.type);
        }
        return filtered;
      }),

    // Update redemption status
    updateRedemptionStatus: protectedProcedure
      .input(z.object({
        redemptionId: z.number(),
        status: z.enum(['pending', 'processing', 'shipped', 'delivered']),
        trackingNumber: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        const { updateRewardRedemptionStatus, getRewardRedemptionById } = await import('./db');
        
        const redemption = await getRewardRedemptionById(input.redemptionId);
        if (!redemption) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Redemption not found' });
        }
        
        await updateRewardRedemptionStatus(
          input.redemptionId, 
          input.status, 
          input.trackingNumber
        );
        
        // Send email notification for status updates
        if (input.status === 'shipped' && input.trackingNumber) {
          try {
            const { sendShippingNotification } = await import('./emailNotifications');
            await sendShippingNotification({
              customerName: redemption.name,
              customerEmail: redemption.email,
              id: redemption.id,
              orderType: 'preorder', // Using preorder type for reward shipments
              shippingAddress: `${redemption.addressLine1}, ${redemption.city}, ${redemption.state} ${redemption.postalCode}`,
              trackingNumber: input.trackingNumber,
            });
          } catch (emailError) {
            console.warn('[AdminRewards] Failed to send shipping notification:', emailError);
          }
        } else if (input.status === 'delivered') {
          try {
            const { sendDeliveryNotification } = await import('./emailNotifications');
            await sendDeliveryNotification({
              customerName: redemption.name,
              customerEmail: redemption.email,
              id: redemption.id,
              orderType: 'preorder', // Using preorder type for reward deliveries
            });
          } catch (emailError) {
            console.warn('[AdminRewards] Failed to send delivery notification:', emailError);
          }
        }
        
        return { success: true };
      }),

    // Get redemption stats for dashboard
    getStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      const { getRewardRedemptionStats } = await import('./db');
      return await getRewardRedemptionStats();
    }),
  }),

  // Public distributor leaderboard
  leaderboard: router({
    getTopDistributors: publicProcedure
      .input(z.object({
        period: z.enum(['weekly', 'monthly', 'all-time']).optional(),
        limit: z.number().min(1).max(100).optional(),
      }).optional())
      .query(async ({ input }) => {
        const { getTopDistributorsBySales, getTopDistributorsByTeamSize } = await import('./db');
        const limit = input?.limit || 10;
        const period = input?.period || 'all-time';
        
        const [bySales, byTeamSize] = await Promise.all([
          getTopDistributorsBySales(limit, period),
          getTopDistributorsByTeamSize(limit),
        ]);
        
        // Anonymize names for privacy
        const salesLeaders = bySales.map((d: any, index: number) => ({
          rank: index + 1,
          name: anonymizeName(d.name || 'Anonymous'),
          distributorRank: d.rank || 'Starter',
          totalSales: Number(d.totalSales) || 0,
          teamSize: d.teamSize || 0,
        }));
        
        const teamLeaders = byTeamSize.map((d: any, index: number) => ({
          rank: index + 1,
          name: anonymizeName(d.name || 'Anonymous'),
          distributorRank: d.rank || 'Starter',
          teamSize: d.teamSize || 0,
          totalSales: Number(d.totalSales) || 0,
        }));
        
        return { salesLeaders, teamLeaders, period };
      }),
  }),

  // Push notifications for distributors
  pushNotifications: router({
    // Get VAPID public key for client-side subscription
    getVapidPublicKey: publicProcedure.query(async () => {
      const { getVapidPublicKey } = await import('./pushNotifications');
      return { publicKey: getVapidPublicKey() };
    }),

    // Subscribe to push notifications
    subscribe: protectedProcedure
      .input(z.object({
        endpoint: z.string(),
        p256Dh: z.string(),
        auth: z.string(),
        userAgent: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { savePushSubscription } = await import('./db');
        const subscriptionId = await savePushSubscription({
          userId: ctx.user.id,
          endpoint: input.endpoint,
          p256Dh: input.p256Dh,
          auth: input.auth,
          userAgent: input.userAgent,
        });
        return { success: true, subscriptionId };
      }),

    // Unsubscribe from push notifications
    unsubscribe: protectedProcedure
      .input(z.object({
        endpoint: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { deactivatePushSubscription } = await import('./db');
        await deactivatePushSubscription(input.endpoint);
        return { success: true };
      }),

    // Get user's push subscriptions
    getMySubscriptions: protectedProcedure.query(async ({ ctx }) => {
      const { getUserPushSubscriptions } = await import('./db');
      const subscriptions = await getUserPushSubscriptions(ctx.user.id);
      return subscriptions.map(sub => ({
        id: sub.id,
        endpoint: sub.endpoint.substring(0, 50) + '...', // Truncate for privacy
        isActive: sub.isActive,
        createdAt: sub.createdAt,
      }));
    }),

    // Test push notification (for debugging)
    testNotification: protectedProcedure.mutation(async ({ ctx }) => {
      const { getUserPushSubscriptions } = await import('./db');
      const { sendPushNotification } = await import('./pushNotifications');
      
      const subscriptions = await getUserPushSubscriptions(ctx.user.id);
      if (subscriptions.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No push subscriptions found. Please enable notifications first.',
        });
      }

      let successCount = 0;
      for (const sub of subscriptions) {
        const success = await sendPushNotification(
          { endpoint: sub.endpoint, p256dh: sub.p256Dh, auth: sub.auth },
          {
            title: '🎉 Test Notification',
            body: 'Push notifications are working! You\'ll receive alerts for team signups, commissions, and rank advancements.',
            icon: '/neon-icon-192.png',
            tag: 'test-notification',
          }
        );
        if (success) successCount++;
      }

      return { success: successCount > 0, sentCount: successCount };
    }),
  }),

  // Profile router for personalized landing pages
  profile: router({
    // Check if a custom slug is available
    checkSlugAvailability: protectedProcedure
      .input(z.object({
        slug: z.string().min(3, "Slug must be at least 3 characters").max(50, "Slug must be at most 50 characters")
          .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
      }))
      .query(async ({ input, ctx }) => {
        const { isSlugAvailable } = await import("./db");
        const available = await isSlugAvailable(input.slug, ctx.user?.id);
        return { available, slug: input.slug.toLowerCase() };
      }),

    // Get current user's personalized profile
    getMyProfile: protectedProcedure
      .query(async ({ ctx }) => {
        const { getPersonalizedProfile, getUserProfile } = await import("./db");
        
        // Get personalized profile data
        const personalizedProfile = await getPersonalizedProfile(ctx.user.id);
        
        // Get base user profile
        const userProfile = await getUserProfile(ctx.user.id);
        
        return {
          personalizedProfile,
          userProfile,
          user: ctx.user,
        };
      }),

    // Get profile by slug (public) - also checks distributor codes for neonenergyclub.com/[CODE] URLs
    getBySlug: publicProcedure
      .input(z.object({
        slug: z.string().min(1),
      }))
      .query(async ({ input }) => {
        console.log('[profile.getBySlug] Input:', input);
        const { getUserProfileBySlug, incrementProfilePageViews, getDistributorPublicProfile } = await import("./db");
        
        // First try to find by custom slug in userProfiles
        const profile = await getUserProfileBySlug(input.slug);
        console.log('[profile.getBySlug] Profile from userProfiles:', profile ? 'found' : 'not found');
        
        if (profile) {
          // Increment page views
          await incrementProfilePageViews(input.slug);
          return profile;
        }
        
        // If not found by slug, check if it's a distributor code
        // This enables neonenergyclub.com/DIST123ABC URLs to work
        const distributorProfile = await getDistributorPublicProfile(input.slug);
        
        if (distributorProfile) {
          // Return a profile-like object for the PersonalizedLanding page
          return {
            id: 0, // No userProfile ID
            userId: 0,
            customSlug: input.slug,
            profilePhotoUrl: distributorProfile.profilePhoto,
            displayName: distributorProfile.displayName,
            location: distributorProfile.location,
            bio: distributorProfile.bio,
            userType: 'distributor' as const,
            pageViews: 0,
            createdAt: new Date(distributorProfile.joinDate),
            updatedAt: new Date().toISOString(),
            instagram: distributorProfile.instagram,
            tiktok: distributorProfile.tiktok,
            facebook: distributorProfile.facebook,
            twitter: distributorProfile.twitter,
            youtube: distributorProfile.youtube,
            linkedin: distributorProfile.linkedin,
            country: distributorProfile.country,
            user: null,
            distributor: {
              id: distributorProfile.id,
              rank: distributorProfile.rank,
              distributorCode: distributorProfile.distributorCode,
            },
            // Flag to indicate this is a distributor code lookup
            isDistributorCodeLookup: true,
          };
        }
        
        return null;
      }),

    // Update custom slug
    updateSlug: protectedProcedure
      .input(z.object({
        slug: z.string().min(3, "Slug must be at least 3 characters").max(50, "Slug must be at most 50 characters")
          .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
      }))
      .mutation(async ({ input, ctx }) => {
        const { isSlugAvailable, updateUserSlug, getPersonalizedProfile, upsertUserProfile, getDistributorByUserId } = await import("./db");
        
        // Check availability
        const available = await isSlugAvailable(input.slug, ctx.user.id);
        if (!available) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "This referral link is already taken. Please choose a different one.",
          });
        }
        
        // Check if profile exists, create if not
        const existingProfile = await getPersonalizedProfile(ctx.user.id);
        if (!existingProfile) {
          // Determine user type
          const distributor = await getDistributorByUserId(ctx.user.id);
          const userType = distributor ? "distributor" : "customer";
          
          await upsertUserProfile({
            userId: ctx.user.id,
            customSlug: input.slug,
            displayName: ctx.user.name || undefined,
            userType,
          });
          return { success: true, slug: input.slug.toLowerCase() };
        }
        
        // Update existing profile
        const success = await updateUserSlug(ctx.user.id, input.slug);
        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update referral link. Please try again.",
          });
        }
        
        return { success: true, slug: input.slug.toLowerCase() };
      }),

    // Update profile details (photo, name, location, bio)
    updateProfile: protectedProcedure
      .input(z.object({
        displayName: z.string().max(255).optional(),
        location: z.string().max(255).optional(),
        bio: z.string().max(1000).optional(),
        profilePhotoUrl: z.string().url().optional(),
        // Social media handles
        instagram: z.string().max(100).optional(),
        tiktok: z.string().max(100).optional(),
        facebook: z.string().max(255).optional(),
        twitter: z.string().max(100).optional(),
        youtube: z.string().max(255).optional(),
        linkedin: z.string().max(255).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { getPersonalizedProfile, upsertUserProfile, getDistributorByUserId, generateUniqueSlug } = await import("./db");
        
        // Check if profile exists
        const existingProfile = await getPersonalizedProfile(ctx.user.id);
        
        if (!existingProfile) {
          // Create new profile
          const distributor = await getDistributorByUserId(ctx.user.id);
          const userType = distributor ? "distributor" : "customer";
          const slug = await generateUniqueSlug(input.displayName || ctx.user.name || "neon-member");
          
          await upsertUserProfile({
            userId: ctx.user.id,
            customSlug: slug,
            displayName: input.displayName,
            location: input.location,
            bio: input.bio,
            profilePhotoUrl: input.profilePhotoUrl,
            instagram: input.instagram,
            tiktok: input.tiktok,
            facebook: input.facebook,
            twitter: input.twitter,
            youtube: input.youtube,
            linkedin: input.linkedin,
            userType,
          });
        } else {
          // Update existing profile
          await upsertUserProfile({
            userId: ctx.user.id,
            displayName: input.displayName,
            location: input.location,
            bio: input.bio,
            profilePhotoUrl: input.profilePhotoUrl,
            instagram: input.instagram,
            tiktok: input.tiktok,
            facebook: input.facebook,
            twitter: input.twitter,
            youtube: input.youtube,
            linkedin: input.linkedin,
            userType: existingProfile.userType,
          });
        }
        
        return { success: true };
      }),

    // Upload profile photo
    uploadPhoto: protectedProcedure
      .input(z.object({
        photoBase64: z.string(),
        mimeType: z.string().regex(/^image\/(jpeg|png|gif|webp)$/),
      }))
      .mutation(async ({ input, ctx }) => {
        const { updateProfilePhoto, getPersonalizedProfile, upsertUserProfile, getDistributorByUserId, generateUniqueSlug } = await import("./db");
        const { storagePut } = await import("./storage");
        
        // Decode base64 and upload to S3
        const buffer = Buffer.from(input.photoBase64, "base64");
        const extension = input.mimeType.split("/")[1];
        const fileName = `profile-photos/${ctx.user.id}-${Date.now()}.${extension}`;
        
        const { url } = await storagePut(fileName, buffer, input.mimeType);
        
        // Check if profile exists
        const existingProfile = await getPersonalizedProfile(ctx.user.id);
        
        if (!existingProfile) {
          // Create new profile with photo
          const distributor = await getDistributorByUserId(ctx.user.id);
          const userType = distributor ? "distributor" : "customer";
          const slug = await generateUniqueSlug(ctx.user.name || "neon-member");
          
          await upsertUserProfile({
            userId: ctx.user.id,
            customSlug: slug,
            profilePhotoUrl: url,
            displayName: ctx.user.name || undefined,
            userType,
          });
        } else {
          // Update photo
          await updateProfilePhoto(ctx.user.id, url);
        }
        
        return { success: true, photoUrl: url };
      }),

    // Get profile stats
    getStats: protectedProcedure
      .query(async ({ ctx }) => {
        const { getPersonalizedProfile } = await import("./db");
        
        const profile = await getPersonalizedProfile(ctx.user.id);
        
        return {
          pageViews: profile?.pageViews || 0,
          signupsGenerated: profile?.signupsGenerated || 0,
          customSlug: profile?.customSlug || null,
          isPublished: profile?.isPublished || false,
        };
      }),
  }),

  // Public endpoints for homepage data
  homepage: router({
    // Get recent users who joined with their profile photos
    recentJoinedUsers: publicProcedure
      .input(z.object({ limit: z.number().int().min(1).max(20).default(10) }).optional())
      .query(async ({ input }) => {
        const { getRecentJoinedUsers, getTotalUserCount } = await import("./db");
        const limit = input?.limit || 10;
        const users = await getRecentJoinedUsers(limit);
        const totalCount = await getTotalUserCount();
        return { users, totalCount };
      }),
  }),


  // Scheduling router for meeting bookings
  scheduling: router({
    // Get booked slots for a date range
    getBookedSlots: publicProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        const { getBookedMeetingSlots } = await import("./db");
        return await getBookedMeetingSlots(new Date(input.startDate), new Date(input.endDate));
      }),

    // Schedule a new meeting
    scheduleMeeting: publicProcedure
      .input(z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Valid email is required"),
        phone: z.string().min(1, "Phone is required"),
        meetingType: z.enum(["franchise", "vending", "general"]),
        scheduledAt: z.string(),
        timezone: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { createScheduledMeeting } = await import("./db");
        
        const result = await createScheduledMeeting({
          userId: ctx.user?.id || null,
          name: input.name,
          email: input.email,
          phone: input.phone,
          meetingType: input.meetingType,
          scheduledAt: new Date(input.scheduledAt),
          timezone: input.timezone,
          notes: input.notes || null,
        });

        // Send confirmation email
        try {
          const { sendMeetingConfirmation } = await import("./emailNotifications");
          await sendMeetingConfirmation({
            name: input.name,
            email: input.email,
            meetingType: input.meetingType,
            scheduledAt: new Date(input.scheduledAt),
            timezone: input.timezone,
          });
        } catch (emailError) {
          console.warn("[Scheduling] Failed to send confirmation email:", emailError);
        }

        // Notify owner about new meeting
        try {
          await notifyOwner({
            title: `New ${input.meetingType} consultation scheduled`,
            content: `${input.name} (${input.email}) scheduled a ${input.meetingType} consultation for ${new Date(input.scheduledAt).toLocaleString()} ${input.timezone}. Phone: ${input.phone}. Notes: ${input.notes || "None"}`,
          });
        } catch (notifyError) {
          console.warn("[Scheduling] Failed to notify owner:", notifyError);
        }

        return { success: true, meetingId: result?.id };
      }),

    // Get user's scheduled meetings
    getMyMeetings: protectedProcedure
      .query(async ({ ctx }) => {
        const { getUserMeetings } = await import("./db");
        return await getUserMeetings(ctx.user.id);
      }),

    // Cancel a meeting
    cancelMeeting: protectedProcedure
      .input(z.object({ meetingId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const { cancelMeeting, getMeetingById } = await import("./db");
        const meeting = await getMeetingById(input.meetingId);
        
        if (!meeting) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
        }
        
        // Only allow cancellation by the user who booked or admin
        if (meeting.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to cancel this meeting" });
        }
        
        return await cancelMeeting(input.meetingId);
      }),

    // Admin: Get all meetings
    adminGetAllMeetings: protectedProcedure
      .input(z.object({
        status: z.enum(["scheduled", "confirmed", "completed", "cancelled", "no_show", "all"]).optional(),
        meetingType: z.enum(["franchise", "vending", "general", "all"]).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { getAllMeetings } = await import("./db");
        return await getAllMeetings(input);
      }),

    // Admin: Update meeting status
    adminUpdateMeetingStatus: protectedProcedure
      .input(z.object({
        meetingId: z.number(),
        status: z.enum(["scheduled", "confirmed", "completed", "cancelled", "no_show"]),
        adminNotes: z.string().optional(),
        meetingLink: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { updateMeetingStatus } = await import("./db");
        return await updateMeetingStatus(input.meetingId, {
          status: input.status,
          adminNotes: input.adminNotes,
          meetingLink: input.meetingLink,
        });
      }),
  }),

  // Vending machine orders router
  vending: router({
    // Create a new vending machine order
    createOrder: publicProcedure
      .input(z.object({
        machineModel: z.string(),
        quantity: z.number().int().min(1),
        totalPriceCents: z.number().int(),
        depositAmountCents: z.number().int(),
        paymentType: z.enum(["full", "deposit", "payment_plan"]),
        paymentPlanMonths: z.number().int().optional(),
        monthlyPaymentCents: z.number().int().optional(),
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1),
        deliveryAddress: z.string().optional(),
        deliveryCity: z.string().optional(),
        deliveryState: z.string().optional(),
        deliveryZip: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { createVendingOrder } = await import("./db");
        
        const order = await createVendingOrder({
          userId: ctx.user?.id,
          name: input.name,
          email: input.email,
          phone: input.phone,
          machineModel: input.machineModel,
          quantity: input.quantity,
          totalPriceCents: input.totalPriceCents,
          depositAmountCents: input.depositAmountCents,
          paymentType: input.paymentType,
          paymentPlanMonths: input.paymentPlanMonths,
          monthlyPaymentCents: input.monthlyPaymentCents,
          amountPaidCents: 0,
          remainingBalanceCents: input.totalPriceCents,
          deliveryAddress: input.deliveryAddress,
          deliveryCity: input.deliveryCity,
          deliveryState: input.deliveryState,
          deliveryZip: input.deliveryZip,
        });
        
        // If Stripe is configured, create checkout session
        if (isStripeConfigured()) {
          const { createVendingCheckout } = await import("./stripe");
          const origin = ctx.req.headers.origin || "https://neonenergydrink.manus.space";
          const checkoutResult = await createVendingCheckout({
            orderId: order.id,
            amount: input.paymentType === "full" ? input.totalPriceCents : input.depositAmountCents,
            machineModel: input.machineModel,
            quantity: input.quantity,
            paymentType: input.paymentType,
            customerEmail: input.email,
            customerName: input.name,
            origin,
          });
          return { ...order, checkoutUrl: checkoutResult.url };
        }
        
        // Notify owner of new order
        await notifyOwner({
          title: "New Vending Machine Order",
          content: `${input.name} ordered ${input.quantity}x ${input.machineModel} machine(s). Payment type: ${input.paymentType}. Total: $${(input.totalPriceCents / 100).toLocaleString()}`
        });
        
        return order;
      }),

    // Get user's vending orders
    getMyOrders: protectedProcedure
      .query(async ({ ctx }) => {
        const { getUserVendingOrders } = await import("./db");
        return await getUserVendingOrders(ctx.user.id);
      }),

    // Get order by ID
    getOrder: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getVendingOrderById } = await import("./db");
        const order = await getVendingOrderById(input.id);
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        }
        // Only allow owner or admin to view
        if (order.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }
        return order;
      }),

    // Admin: Get all vending orders
    adminGetAllOrders: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { getAllVendingOrders } = await import("./db");
        return await getAllVendingOrders(input);
      }),

    // Admin: Update order status
    adminUpdateOrderStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "deposit_paid", "in_production", "ready_for_delivery", "delivered", "cancelled", "refunded"]),
        adminNotes: z.string().optional(),
        estimatedDelivery: z.string().optional(),
        installationDate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { updateVendingOrderStatus } = await import("./db");
        return await updateVendingOrderStatus(input.id, {
          status: input.status,
          adminNotes: input.adminNotes,
          estimatedDelivery: input.estimatedDelivery ? new Date(input.estimatedDelivery) : undefined,
          installationDate: input.installationDate ? new Date(input.installationDate) : undefined,
        });
      }),
  }),

  // In-app notifications router for distributors
  notification: router({
    // Get user's notifications
    getNotifications: protectedProcedure
      .input(z.object({
        limit: z.number().int().min(1).max(100).default(20),
        unreadOnly: z.boolean().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { getUserNotifications } = await import("./db");
        return await getUserNotifications(ctx.user.id, input?.limit || 20);
      }),

    // Mark notification as read
    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { markNotificationRead } = await import("./db");
        await markNotificationRead(input.notificationId);
        return { success: true };
      }),

    // Mark all notifications as read
    markAllAsRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { markAllNotificationsRead } = await import("./db");
        await markAllNotificationsRead(ctx.user.id);
        return { success: true };
      }),

    // Get unread count
    getUnreadCount: protectedProcedure
      .query(async ({ ctx }) => {
        const { getUnreadNotificationCount } = await import("./db");
        const count = await getUnreadNotificationCount(ctx.user.id);
        return { count };
      }),

    // Get notification preferences
    getPreferences: protectedProcedure
      .query(async ({ ctx }) => {
        const { getNotificationPreferences } = await import("./db");
        return await getNotificationPreferences(ctx.user.id);
      }),

    // Update notification preferences
    updatePreferences: protectedProcedure
      .input(z.object({
        referrals: z.boolean().optional(),
        commissions: z.boolean().optional(),
        teamUpdates: z.boolean().optional(),
        promotions: z.boolean().optional(),
        orders: z.boolean().optional(),
        announcements: z.boolean().optional(),
        digestFrequency: z.enum(["none", "daily", "weekly"]).optional(),
        digestDay: z.number().int().min(0).max(6).optional(),
        digestHour: z.number().int().min(0).max(23).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { updateNotificationPreferences } = await import("./db");
        return await updateNotificationPreferences(ctx.user.id, input);
      }),
  }),

  // Email verification routes
  emailVerification: router({
    // Verify email with token
    verify: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const { verifyEmailToken, getDistributorByUserId, getUserByVerificationToken } = await import("./db");
        const { sendEmailVerificationSuccess } = await import("./emailNotifications");
        
        // Get user info before verification
        const user = await getUserByVerificationToken(input.token);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invalid verification token",
          });
        }
        
        const result = await verifyEmailToken(input.token);
        
        if (!result.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.error || "Verification failed",
          });
        }
        
        // Get distributor info for success email
        if (result.userId) {
          try {
            const distributor = await getDistributorByUserId(result.userId);
            if (distributor && user.email) {
              const baseUrl = ctx.req.headers.origin || 'https://neonenergyclub.com';
              await sendEmailVerificationSuccess({
                name: user.name || 'NEON Distributor',
                email: user.email,
                distributorCode: distributor.distributorCode,
                portalUrl: `${baseUrl}/portal`,
              });
            }
          } catch (emailError) {
            console.warn("[EmailVerification] Failed to send success email:", emailError);
          }
        }
        
        return { success: true, message: "Email verified successfully!" };
      }),

    // Resend verification email
    resend: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { resendVerificationEmail, isEmailVerified } = await import("./db");
        const { sendEmailVerification } = await import("./emailNotifications");
        
        // Check if already verified
        const verified = await isEmailVerified(ctx.user.id);
        if (verified) {
          return { success: false, message: "Email is already verified" };
        }
        
        if (!ctx.user.email) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No email address on file",
          });
        }
        
        const verification = await resendVerificationEmail(ctx.user.id);
        if (!verification) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate verification token",
          });
        }
        
        const baseUrl = ctx.req.headers.origin || 'https://neonenergyclub.com';
        const verificationUrl = `${baseUrl}/verify-email?token=${verification.token}`;
        
        await sendEmailVerification({
          name: ctx.user.name || 'NEON Distributor',
          email: ctx.user.email,
          verificationUrl,
          expiresIn: '24 hours',
        });
        
        return { success: true, message: "Verification email sent!" };
      }),

    // Check verification status
    status: protectedProcedure
      .query(async ({ ctx }) => {
        const { isEmailVerified } = await import("./db");
        const verified = await isEmailVerified(ctx.user.id);
        return { verified, email: ctx.user.email };
      }),
  }),

  // SMS verification routes
  smsVerification: router({
    // Send SMS verification code
    sendCode: protectedProcedure
      .input(z.object({ 
        phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
      }))
      .mutation(async ({ input, ctx }) => {
        const { createSmsVerification, isPhoneVerified } = await import("./db");
        const { sendSmsVerificationCode, isValidPhoneNumber } = await import("./smsService");
        
        // Validate phone number format
        if (!isValidPhoneNumber(input.phoneNumber)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid phone number format. Please enter a valid US phone number.",
          });
        }
        
        // Check if already verified
        const verified = await isPhoneVerified(ctx.user.id);
        if (verified) {
          return { success: false, message: "Phone number is already verified" };
        }
        
        // Create verification record (with rate limiting)
        const result = await createSmsVerification(ctx.user.id, input.phoneNumber);
        
        if ('error' in result) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: result.error,
          });
        }
        
        // Send SMS with verification code
        const smsResult = await sendSmsVerificationCode({
          phoneNumber: input.phoneNumber,
          code: result.code,
          userName: ctx.user.name || undefined,
        });
        
        if (!smsResult.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: smsResult.error || "Failed to send SMS",
          });
        }
        
        return { 
          success: true, 
          message: "Verification code sent!",
          expiresAt: result.expiresAt,
        };
      }),

    // Verify SMS code
    verifyCode: protectedProcedure
      .input(z.object({ 
        code: z.string().length(6, "Code must be 6 digits"),
      }))
      .mutation(async ({ input, ctx }) => {
        const { verifySmsCode, getDistributorByUserId } = await import("./db");
        const { sendSmsVerificationSuccess } = await import("./smsService");
        
        const result = await verifySmsCode(ctx.user.id, input.code);
        
        if (!result.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.error || "Verification failed",
          });
        }
        
        // Send success SMS
        try {
          if (ctx.user.phone) {
            await sendSmsVerificationSuccess({
              phoneNumber: ctx.user.phone,
              userName: ctx.user.name || undefined,
            });
          }
        } catch (smsError) {
          console.warn("[SMSVerification] Failed to send success SMS:", smsError);
        }
        
        return { success: true, message: "Phone number verified successfully!" };
      }),

    // Resend SMS code
    resendCode: protectedProcedure
      .input(z.object({ 
        phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
      }))
      .mutation(async ({ input, ctx }) => {
        const { createSmsVerification, isPhoneVerified } = await import("./db");
        const { sendSmsVerificationCode, isValidPhoneNumber } = await import("./smsService");
        
        // Validate phone number format
        if (!isValidPhoneNumber(input.phoneNumber)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid phone number format",
          });
        }
        
        // Check if already verified
        const verified = await isPhoneVerified(ctx.user.id);
        if (verified) {
          return { success: false, message: "Phone number is already verified" };
        }
        
        // Create new verification (with rate limiting)
        const result = await createSmsVerification(ctx.user.id, input.phoneNumber);
        
        if ('error' in result) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: result.error,
          });
        }
        
        // Send SMS
        const smsResult = await sendSmsVerificationCode({
          phoneNumber: input.phoneNumber,
          code: result.code,
          userName: ctx.user.name || undefined,
        });
        
        if (!smsResult.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: smsResult.error || "Failed to send SMS",
          });
        }
        
        return { 
          success: true, 
          message: "New verification code sent!",
          expiresAt: result.expiresAt,
        };
      }),

    // Check SMS verification status
    status: protectedProcedure
      .query(async ({ ctx }) => {
        const { getVerificationStatus } = await import("./db");
        const status = await getVerificationStatus(ctx.user.id);
        return {
          phoneVerified: status?.phoneVerified || false,
          phone: status?.phone || null,
          emailVerified: status?.emailVerified || false,
          email: status?.email || null,
        };
      }),
  }),

  // Multi-Factor Authentication (MFA) router
  mfa: router({
    // Get MFA status
    getStatus: protectedProcedure
      .query(async ({ ctx }) => {
        const { getMfaSettings } = await import("./db");
        const settings = await getMfaSettings(ctx.user.id);
        return {
          isEnabled: settings?.isEnabled || false,
          hasSecret: !!settings?.totpSecret,
          backupCodesRemaining: settings?.backupCodesRemaining || 0,
          lastVerifiedAt: settings?.lastVerifiedAt || null,
        };
      }),

    // Initialize MFA setup (generate secret and QR code)
    initSetup: protectedProcedure
      .mutation(async ({ ctx }) => {
        const otplib = await import("otplib");
        const QRCode = await import("qrcode");
        const { createOrUpdateMfaSettings } = await import("./db");
        
        // Generate a new secret
        const secret = otplib.generateSecret();
        
        // Create the otpauth URL for QR code
        const otpauthUrl = otplib.generateURI({
          secret,
          issuer: "NEON Energy",
          label: ctx.user.email || ctx.user.name || `user-${ctx.user.id}`,
        });
        
        // Generate QR code as data URL
        const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
        
        // Store the secret (not enabled yet)
        await createOrUpdateMfaSettings(ctx.user.id, {
          totpSecret: secret,
          isEnabled: false,
        });
        
        return {
          secret,
          qrCodeDataUrl,
          otpauthUrl,
        };
      }),

    // Verify and enable MFA
    verifyAndEnable: protectedProcedure
      .input(z.object({
        code: z.string().length(6, "Code must be 6 digits"),
      }))
      .mutation(async ({ ctx, input }) => {
        const otplib = await import("otplib");
        const { getMfaSettings, enableMfa, generateBackupCodes } = await import("./db");
        
        const settings = await getMfaSettings(ctx.user.id);
        if (!settings?.totpSecret) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "MFA setup not initialized. Please start setup first.",
          });
        }
        
        // Verify the code
        const isValid = otplib.verify({
          token: input.code,
          secret: settings.totpSecret,
        });
        
        if (!isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid verification code. Please try again.",
          });
        }
        
        // Generate backup codes
        const backupCodes = await generateBackupCodes(ctx.user.id);
        
        // Enable MFA
        await enableMfa(ctx.user.id);
        
        // Send email notification
        try {
          const { sendMfaEnabledEmail } = await import("./emailNotifications");
          await sendMfaEnabledEmail({
            userName: ctx.user.name || 'User',
            userEmail: ctx.user.email || '',
            ipAddress: ctx.req.ip || ctx.req.headers['x-forwarded-for']?.toString(),
            userAgent: ctx.req.headers['user-agent'],
          });
        } catch (emailError) {
          console.error('[MFA] Failed to send enabled email:', emailError);
        }
        
        return {
          success: true,
          backupCodes,
          message: "MFA enabled successfully! Save your backup codes in a safe place.",
        };
      }),

    // Verify MFA code (for login)
    verify: protectedProcedure
      .input(z.object({
        code: z.string().min(6).max(10),
      }))
      .mutation(async ({ ctx, input }) => {
        const otplib = await import("otplib");
        const { getMfaSettings, recordMfaVerification, verifyBackupCode } = await import("./db");
        
        const settings = await getMfaSettings(ctx.user.id);
        if (!settings?.isEnabled) {
          return { success: true, message: "MFA not enabled" };
        }
        
        // Check if it's a backup code (8 characters)
        if (input.code.length === 8) {
          const isBackupValid = await verifyBackupCode(ctx.user.id, input.code);
          if (isBackupValid) {
            await recordMfaVerification(ctx.user.id);
            
            // Send backup code used notification
            try {
              const { sendMfaBackupCodeUsedEmail } = await import("./emailNotifications");
              const { getBackupCodesRemaining } = await import("./db");
              const remaining = await getBackupCodesRemaining(ctx.user.id);
              await sendMfaBackupCodeUsedEmail({
                userName: ctx.user.name || 'User',
                userEmail: ctx.user.email || '',
                backupCodesRemaining: remaining,
                ipAddress: ctx.req.ip || ctx.req.headers['x-forwarded-for']?.toString(),
                userAgent: ctx.req.headers['user-agent'],
              });
            } catch (emailError) {
              console.error('[MFA] Failed to send backup code used email:', emailError);
            }
            
            return { success: true, message: "Verified with backup code" };
          }
        }
        
        // Verify TOTP code
        const isValid = otplib.verify({
          token: input.code,
          secret: settings.totpSecret,
        });
        
        if (!isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid verification code",
          });
        }
        
        await recordMfaVerification(ctx.user.id);
        return { success: true, message: "MFA verified successfully" };
      }),

    // Disable MFA
    disable: protectedProcedure
      .input(z.object({
        code: z.string().length(6, "Code must be 6 digits"),
      }))
      .mutation(async ({ ctx, input }) => {
        const otplib = await import("otplib");
        const { getMfaSettings, disableMfa } = await import("./db");
        
        const settings = await getMfaSettings(ctx.user.id);
        if (!settings?.isEnabled) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "MFA is not enabled",
          });
        }
        
        // Verify the code before disabling
        const isValid = otplib.verify({
          token: input.code,
          secret: settings.totpSecret,
        });
        
        if (!isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid verification code",
          });
        }
        
        await disableMfa(ctx.user.id);
        
        // Send email notification
        try {
          const { sendMfaDisabledEmail } = await import("./emailNotifications");
          await sendMfaDisabledEmail({
            userName: ctx.user.name || 'User',
            userEmail: ctx.user.email || '',
            ipAddress: ctx.req.ip || ctx.req.headers['x-forwarded-for']?.toString(),
            userAgent: ctx.req.headers['user-agent'],
          });
        } catch (emailError) {
          console.error('[MFA] Failed to send disabled email:', emailError);
        }
        
        return { success: true, message: "MFA disabled successfully" };
      }),

    // Regenerate backup codes
    regenerateBackupCodes: protectedProcedure
      .input(z.object({
        code: z.string().length(6, "Code must be 6 digits"),
      }))
      .mutation(async ({ ctx, input }) => {
        const otplib = await import("otplib");
        const { getMfaSettings, generateBackupCodes } = await import("./db");
        
        const settings = await getMfaSettings(ctx.user.id);
        if (!settings?.isEnabled) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "MFA is not enabled",
          });
        }
        
        // Verify the code
        const isValid = otplib.verify({
          token: input.code,
          secret: settings.totpSecret,
        });
        
        if (!isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid verification code",
          });
        }
        
        const backupCodes = await generateBackupCodes(ctx.user.id);
        return { success: true, backupCodes };
      }),

    // Request MFA recovery (for users who lost authenticator and backup codes)
    requestRecovery: publicProcedure
      .input(z.object({
        email: z.string().email("Valid email required"),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getUserByEmail, createMfaRecoveryRequest, getMfaSettings } = await import("./db");
        
        // Find user by email
        const user = await getUserByEmail(input.email);
        if (!user) {
          // Don't reveal if email exists
          return { 
            success: true, 
            message: "If an account exists with this email, you will receive recovery instructions." 
          };
        }
        
        // Check if MFA is enabled
        const mfaSettings = await getMfaSettings(user.id);
        if (!mfaSettings?.isEnabled) {
          return { 
            success: true, 
            message: "If an account exists with this email, you will receive recovery instructions." 
          };
        }
        
        // Create recovery request
        const recovery = await createMfaRecoveryRequest({
          userId: user.id,
          email: input.email,
          ipAddress: ctx.req.ip || ctx.req.headers['x-forwarded-for']?.toString(),
          userAgent: ctx.req.headers['user-agent'],
        });
        
        if (recovery) {
          // Send recovery email
          try {
            const { sendMfaRecoveryEmail } = await import("./emailNotifications");
            await sendMfaRecoveryEmail({
              userName: user.name || 'User',
              userEmail: input.email,
              recoveryToken: recovery.recoveryToken,
              ipAddress: ctx.req.ip || ctx.req.headers['x-forwarded-for']?.toString(),
            });
          } catch (emailError) {
            console.error('[MFA Recovery] Failed to send email:', emailError);
          }
        }
        
        return { 
          success: true, 
          message: "If an account exists with this email, you will receive recovery instructions." 
        };
      }),

    // Verify recovery token and submit identity verification
    verifyRecoveryToken: publicProcedure
      .input(z.object({
        token: z.string().min(1, "Recovery token required"),
      }))
      .query(async ({ input }) => {
        const { getMfaRecoveryByToken } = await import("./db");
        
        const recovery = await getMfaRecoveryByToken(input.token);
        if (!recovery) {
          return { valid: false, reason: "Invalid or expired recovery token" };
        }
        
        // Check if token is expired
        if (new Date().toISOString() > recovery.tokenExpiry) {
          return { valid: false, reason: "Recovery token has expired" };
        }
        
        // Check status
        if (recovery.status === 'completed') {
          return { valid: false, reason: "This recovery request has already been completed" };
        }
        
        if (recovery.status === 'rejected') {
          return { valid: false, reason: "This recovery request was rejected" };
        }
        
        return { 
          valid: true, 
          recoveryId: recovery.id,
          email: recovery.email,
          status: recovery.status,
        };
      }),

    // Submit identity verification answers
    submitVerification: publicProcedure
      .input(z.object({
        token: z.string().min(1),
        answers: z.object({
          accountCreationDate: z.string().optional(),
          lastOrderDetails: z.string().optional(),
          securityQuestion: z.string().optional(),
          additionalInfo: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        const { getMfaRecoveryByToken, submitRecoveryVerification } = await import("./db");
        
        const recovery = await getMfaRecoveryByToken(input.token);
        if (!recovery || new Date().toISOString() > recovery.tokenExpiry) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired recovery token",
          });
        }
        
        await submitRecoveryVerification(recovery.id, input.answers);
        
        return { 
          success: true, 
          message: "Your identity verification has been submitted. An administrator will review your request within 24-48 hours." 
        };
      }),

    // Admin: Get pending recovery requests
    getPendingRecoveries: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        
        const { getPendingMfaRecoveryRequests } = await import("./db");
        return await getPendingMfaRecoveryRequests();
      }),

    // Admin: Approve or reject recovery request
    processRecovery: protectedProcedure
      .input(z.object({
        recoveryId: z.number().int(),
        action: z.enum(['approve', 'reject']),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        
        const { getMfaRecoveryByToken, updateMfaRecoveryStatus, completeMfaRecovery, getUserById } = await import("./db");
        const db = await import("./db").then(m => m.getDb());
        
        // Get the recovery request by ID
        const { mfaRecoveryRequests } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const recoveryResult = await db?.select().from(mfaRecoveryRequests).where(eq(mfaRecoveryRequests.id, input.recoveryId)).limit(1);
        const recovery = recoveryResult?.[0];
        
        if (!recovery) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Recovery request not found" });
        }
        
        if (input.action === 'approve') {
          // Complete the recovery - disable MFA for user
          await completeMfaRecovery(input.recoveryId, recovery.userId);
          
          // Send notification email
          try {
            const user = await getUserById(recovery.userId);
            const { sendMfaRecoveryCompletedEmail } = await import("./emailNotifications");
            await sendMfaRecoveryCompletedEmail({
              userName: user?.name || 'User',
              userEmail: recovery.email,
              approved: true,
            });
          } catch (emailError) {
            console.error('[MFA Recovery] Failed to send completion email:', emailError);
          }
          
          return { success: true, message: "Recovery approved. MFA has been disabled for the user." };
        } else {
          // Reject the request
          await updateMfaRecoveryStatus(input.recoveryId, 'rejected', input.notes, ctx.user.id);
          
          // Send rejection email
          try {
            const { sendMfaRecoveryCompletedEmail } = await import("./emailNotifications");
            await sendMfaRecoveryCompletedEmail({
              userName: recovery.email.split('@')[0],
              userEmail: recovery.email,
              approved: false,
              reason: input.notes,
            });
          } catch (emailError) {
            console.error('[MFA Recovery] Failed to send rejection email:', emailError);
          }
          
          return { success: true, message: "Recovery request rejected." };
        }
      }),
  }),

  // Vending Machine IoT Dashboard router
  vendingIot: router({
    // Get all machines for the current user
    getMyMachines: protectedProcedure
      .query(async ({ ctx }) => {
        const { getUserVendingMachines } = await import("./db");
        return await getUserVendingMachines(ctx.user.id);
      }),

    // Get single machine details
    getMachine: protectedProcedure
      .input(z.object({ machineId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getVendingMachineById } = await import("./db");
        const machine = await getVendingMachineById(input.machineId);
        if (!machine) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Machine not found" });
        }
        if (machine.ownerId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }
        return machine;
      }),

    // Get machine inventory
    getMachineInventory: protectedProcedure
      .input(z.object({ machineId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getVendingMachineInventory, getVendingMachineById } = await import("./db");
        const machine = await getVendingMachineById(input.machineId);
        if (!machine || (machine.ownerId !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }
        return await getVendingMachineInventory(input.machineId);
      }),

    // Get machine sales history
    getMachineSales: protectedProcedure
      .input(z.object({
        machineId: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().default(100),
      }))
      .query(async ({ ctx, input }) => {
        const { getVendingMachineSales, getVendingMachineById } = await import("./db");
        const machine = await getVendingMachineById(input.machineId);
        if (!machine || (machine.ownerId !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }
        return await getVendingMachineSales(input.machineId, {
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
          limit: input.limit,
        });
      }),

    // Get machine alerts
    getMachineAlerts: protectedProcedure
      .input(z.object({
        machineId: z.number().optional(),
        unacknowledgedOnly: z.boolean().default(false),
      }))
      .query(async ({ ctx, input }) => {
        const { getVendingAlerts } = await import("./db");
        return await getVendingAlerts(ctx.user.id, input.machineId, input.unacknowledgedOnly);
      }),

    // Acknowledge an alert
    acknowledgeAlert: protectedProcedure
      .input(z.object({ alertId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { acknowledgeVendingAlert } = await import("./db");
        await acknowledgeVendingAlert(input.alertId, ctx.user.id);
        return { success: true };
      }),

    // Create maintenance request
    createMaintenanceRequest: protectedProcedure
      .input(z.object({
        machineId: z.number(),
        requestType: z.enum(["repair", "restock", "cleaning", "inspection", "relocation", "upgrade"]),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        title: z.string().min(1),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createMaintenanceRequest, getVendingMachineById } = await import("./db");
        const machine = await getVendingMachineById(input.machineId);
        if (!machine || (machine.ownerId !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }
        return await createMaintenanceRequest({
          machineId: input.machineId,
          requesterId: ctx.user.id,
          requestType: input.requestType,
          priority: input.priority,
          title: input.title,
          description: input.description,
        });
      }),

    // Get maintenance requests
    getMaintenanceRequests: protectedProcedure
      .input(z.object({
        machineId: z.number().optional(),
        status: z.enum(["pending", "assigned", "in_progress", "completed", "cancelled", "all"]).default("all"),
      }))
      .query(async ({ ctx, input }) => {
        const { getMaintenanceRequests } = await import("./db");
        return await getMaintenanceRequests(ctx.user.id, input.machineId, input.status);
      }),

    // Get dashboard summary
    getDashboardSummary: protectedProcedure
      .query(async ({ ctx }) => {
        const { getVendingDashboardSummary } = await import("./db");
        return await getVendingDashboardSummary(ctx.user.id);
      }),

    // Get analytics data
    getAnalytics: protectedProcedure
      .input(z.object({
        machineId: z.number().optional(),
        period: z.enum(["day", "week", "month", "year"]).default("week"),
      }))
      .query(async ({ ctx, input }) => {
        const { getVendingAnalytics } = await import("./db");
        return await getVendingAnalytics(ctx.user.id, input.machineId, input.period);
      }),
  }),

  // System Data Auditor Router
  dataAuditor: router({
    // Run daily data integrity audit (admin only)
    runAudit: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { runDailyDataAudit } = await import("./replicatedWebsiteSystem");
        return await runDailyDataAudit();
      }),

    // Get replicated site stats
    getSiteStats: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { getReplicatedSiteStats } = await import("./replicatedWebsiteSystem");
        return await getReplicatedSiteStats();
      }),

    // Audit specific distributor site
    auditSite: protectedProcedure
      .input(z.object({ distributorId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { auditReplicatedSite } = await import("./replicatedWebsiteSystem");
        return await auditReplicatedSite(input.distributorId);
      }),

    // Verify buyer flow for distributor
    verifyBuyerFlow: protectedProcedure
      .input(z.object({ distributorCode: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { verifyBuyerFlow } = await import("./replicatedWebsiteSystem");
        return await verifyBuyerFlow(input.distributorCode);
      }),

    // Delete all test/simulated data
    cleanupTestData: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        
        // Delete test distributors
        const testDistributorsDeleted = await db!.delete(distributors)
          .where(
            or(
              like(distributors.username, '%test%'),
              like(distributors.username, '%Test%'),
              like(distributors.username, '%simulated%'),
              like(distributors.distributorCode, '%TEST%')
            )
          );
        
        // Delete test referral tracking
        await db!.delete(referralTracking)
          .where(
            or(
              like(referralTracking.referrerId, '%test%'),
              like(referralTracking.referrerId, '%simulated%')
            )
          );
        
        return { success: true, message: "Test data cleaned up successfully" };
      }),
  }),

  // Charity Impact Tracking
  impact: router({
    // Get impact summary for current month
    getSummary: protectedProcedure
      .input(z.object({
        periodStart: z.string().optional(),
        periodEnd: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { getImpactSummary } = await import('./charityImpact');
        
        // Default to current month if no period specified
        const now = new Date();
        const periodStart = input.periodStart || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const periodEnd = input.periodEnd || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        
        const summary = await getImpactSummary(ctx.user.id, periodStart, periodEnd);
        return summary;
      }),

    // Get lifetime impact totals
    getLifetime: protectedProcedure
      .query(async ({ ctx }) => {
        const { getLifetimeImpact } = await import('./charityImpact');
        const lifetime = await getLifetimeImpact(ctx.user.id);
        return lifetime;
      }),

    // Get impact history
    getHistory: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(24).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { getImpactHistory } = await import('./charityImpact');
        const history = await getImpactHistory(ctx.user.id, input.limit || 12);
        return history;
      }),

    // Get impact leaderboard
    getLeaderboard: protectedProcedure
      .input(z.object({
        type: z.enum(['personal', 'team', 'total']),
        metric: z.enum(['trees', 'habitat', 'species', 'animals']),
        limit: z.number().min(1).max(100).optional(),
      }))
      .query(async ({ input }) => {
        const { getImpactLeaderboard } = await import('./charityImpact');
        const leaderboard = await getImpactLeaderboard(
          input.type,
          input.metric,
          input.limit || 10
        );
        return leaderboard;
      }),

    // Check milestones (legacy - kept for compatibility)
    checkMilestones: protectedProcedure
      .query(async ({ ctx }) => {
        const { checkMilestones } = await import('./charityImpact');
        const milestones = await checkMilestones(ctx.user.id);
        return milestones;
      }),

    // Get achieved milestones with full details
    getAchievements: protectedProcedure
      .query(async ({ ctx }) => {
        const { checkAchievedMilestones } = await import('./impactMilestones');
        const achievements = await checkAchievedMilestones(ctx.user.id);
        return achievements;
      }),

    // Get next milestone to achieve
    getNextMilestone: protectedProcedure
      .input(z.object({
        category: z.enum(['trees', 'habitat', 'species', 'animals', 'total', 'team']).optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { getNextMilestone } = await import('./impactMilestones');
        const next = await getNextMilestone(ctx.user.id, input?.category);
        return next;
      }),

    // Get milestone statistics
    getMilestoneStats: protectedProcedure
      .query(async ({ ctx }) => {
        const { getMilestoneStats } = await import('./impactMilestones');
        const stats = await getMilestoneStats(ctx.user.id);
        return stats;
      }),

    // Get unread milestone notifications
    getNotifications: protectedProcedure
      .query(async ({ ctx }) => {
        const { getUnreadNotifications } = await import('./milestoneNotifications');
        const notifications = await getUnreadNotifications(ctx.user.id);
        return notifications;
      }),

    // Mark notification as read
    markNotificationRead: protectedProcedure
      .input(z.object({
        notificationId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { markNotificationRead } = await import('./milestoneNotifications');
        await markNotificationRead(input.notificationId);
        return { success: true };
      }),

    // Mark notification as celebrated
    markNotificationCelebrated: protectedProcedure
      .input(z.object({
        notificationId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { markNotificationCelebrated } = await import('./milestoneNotifications');
        await markNotificationCelebrated(input.notificationId);
        return { success: true };
      }),

    // Update notification preferences
    updateNotificationPreferences: protectedProcedure
      .input(z.object({
        milestoneAchievements: z.boolean().optional(),
        teamMilestones: z.boolean().optional(),
        rankAdvancement: z.boolean().optional(),
        emailDigest: z.enum(['none', 'daily', 'weekly']).optional(),
        pushNotifications: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { updateNotificationPreferences } = await import('./milestoneNotifications');
        await updateNotificationPreferences(ctx.user.id, input);
        return { success: true };
      }),

    // Team Performance Alerts
    getTeamAlerts: protectedProcedure
      .input(z.object({
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { getDistributorAlerts } = await import('./teamPerformanceAlerts');
        const alerts = await getDistributorAlerts(ctx.user.id, input.limit);
        return alerts;
      }),

    // Mark team alert as read
    markTeamAlertRead: protectedProcedure
      .input(z.object({
        alertId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { markAlertAsRead } = await import('./teamPerformanceAlerts');
        await markAlertAsRead(input.alertId);
        return { success: true };
      }),
  }),

  // Google Places API for vending machine location suggestions
  places: router({
    // Get enriched business locations for vending machine placement
    getVendingLocations: publicProcedure
      .input(z.object({
        zipCode: z.string().length(5, "Zip code must be 5 digits"),
      }))
      .query(async ({ input }) => {
        const { getVendingLocations } = await import('./placesApi');
        const locations = await getVendingLocations(input.zipCode);
        return { locations };
      }),
  }),

});

// Helper function to anonymize names for privacy on public leaderboard
function anonymizeName(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    // Single name: show first 2 chars + ***
    return parts[0].substring(0, 2) + '***';
  }
  // Multiple names: show first name initial + last name initial
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  return firstName.charAt(0).toUpperCase() + '. ' + lastName.charAt(0).toUpperCase() + '.';
}

// Helper function to get tier based on referral count
function getTierFromReferrals(referrals: number): { name: string; color: string; badge: string } {
  if (referrals >= 100) {
    return { name: 'Diamond', color: '#b9f2ff', badge: '💎' };
  } else if (referrals >= 50) {
    return { name: 'Platinum', color: '#e5e4e2', badge: '🏆' };
  } else if (referrals >= 25) {
    return { name: 'Gold', color: '#ffd700', badge: '🥇' };
  } else if (referrals >= 10) {
    return { name: 'Silver', color: '#c0c0c0', badge: '🥈' };
  } else if (referrals >= 5) {
    return { name: 'Bronze', color: '#cd7f32', badge: '🥉' };
  } else {
    return { name: 'Starter', color: '#c8ff00', badge: '⭐' };
  }
}

// Helper function to calculate distance between two coordinates in miles
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export type AppRouter = typeof appRouter;
