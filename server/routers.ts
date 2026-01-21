import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import { isStripeConfigured, createCrowdfundingCheckout, createFranchiseCheckout } from "./stripe";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
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
        const result = await createPreorder(input);
        
        // Send order confirmation email
        try {
          const { sendOrderConfirmation } = await import("./emailNotifications");
          await sendOrderConfirmation({
            customerName: input.name,
            customerEmail: input.email,
            orderId: result?.id || Date.now(),
            orderType: "preorder",
            quantity: input.quantity,
            shippingAddress: `${input.address}, ${input.city}, ${input.state} ${input.postalCode}, ${input.country}`,
          });
        } catch (emailError) {
          console.warn("[Preorder] Failed to send confirmation email:", emailError);
        }
        
        return { success: true };
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
                orderId: preorder.id,
                orderType: "preorder",
                shippingAddress: `${preorder.address}, ${preorder.city}, ${preorder.state} ${preorder.postalCode}`,
                trackingNumber: preorder.trackingNumber || undefined,
                carrier: preorder.carrier || undefined,
              });
            } else if (input.status === "delivered") {
              await sendDeliveryNotification({
                customerName: preorder.name,
                customerEmail: preorder.email,
                orderId: preorder.id,
                orderType: "preorder",
              });
            }
          }
        } catch (emailError) {
          console.warn("[Preorder] Failed to send status update email:", emailError);
        }
        
        return { success: true };
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
        
        return subscription;
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
          sponsorCode: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { enrollDistributor } = await import("./db");
        const distributor = await enrollDistributor({
          userId: ctx.user.id,
          sponsorCode: input.sponsorCode,
        });
        return distributor;
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
          submittedAt: new Date(),
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
        orderId: z.number().int().optional(),
        preorderId: z.number().int().optional(),
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
        await updateSMSOptIn(input.phone, { optedIn: 0, optOutDate: new Date() });
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
          orderId: z.number().int(),
          customerEmail: z.string().email(),
          customerName: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const { convertReferralToCustomer, incrementReferrerStats } = await import("./db");
        
        await convertReferralToCustomer(
          input.referralCode,
          input.orderId,
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
          context: z.enum(["sales", "support", "general"]).default("sales"),
        })
      )
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        
        // System prompt for sales-focused chatbot
        const systemPrompts: Record<string, string> = {
          en: `You are NEON Assistant, a friendly and enthusiastic sales representative for NEON Energy Drink. Your goal is to help visitors:
1. Pre-order NEON Energy drinks (link: /shop)
2. Learn about franchise opportunities (link: /franchise, deposit: $2,500)
3. Explore investment options (link: /investors)
4. Discover exclusive NFTs (link: /nft-gallery)
5. Join the crowdfunding campaign (link: /crowdfund)

Key selling points:
- NEON is a legendary energy drink making a comeback
- 100% natural ingredients, no artificial additives
- Exclusive NFTs with every purchase
- Franchise territories available starting at $2,500 deposit
- Early backers get exclusive rewards and discounts

Promo codes available:
- NEON10: 10% off orders over $50
- FIRSTORDER: 15% off first order
- FRANCHISE25: $25 off franchise deposit

Always be helpful, enthusiastic, and guide users toward making a purchase or investment. Keep responses concise (under 150 words). Include relevant links when appropriate.`,
          es: `Eres NEON Assistant, un representante de ventas amigable y entusiasta de NEON Energy Drink. Tu objetivo es ayudar a los visitantes a realizar pedidos anticipados, conocer franquicias, explorar inversiones y descubrir NFTs. Responde en español. Mantén las respuestas concisas (menos de 150 palabras).`,
          fr: `Vous êtes NEON Assistant, un représentant commercial sympathique et enthousiaste de NEON Energy Drink. Votre objectif est d'aider les visiteurs à passer des précommandes, découvrir les franchises, explorer les investissements et découvrir les NFTs. Répondez en français. Gardez les réponses concises (moins de 150 mots).`,
          de: `Sie sind NEON Assistant, ein freundlicher und begeisterter Vertriebsmitarbeiter von NEON Energy Drink. Ihr Ziel ist es, Besuchern bei Vorbestellungen, Franchise-Möglichkeiten, Investitionen und NFTs zu helfen. Antworten Sie auf Deutsch. Halten Sie die Antworten kurz (unter 150 Wörter).`,
          it: `Sei NEON Assistant, un rappresentante di vendita amichevole ed entusiasta di NEON Energy Drink. Il tuo obiettivo è aiutare i visitatori con preordini, franchising, investimenti e NFT. Rispondi in italiano. Mantieni le risposte concise (meno di 150 parole).`,
          zh: `你是NEON助手，NEON能量饮料的友好热情销售代表。你的目标是帮助访客预订、了解加盟机会、探索投资选项和发现NFT。用中文回复。保持回复简洁（150字以内）。`,
          ja: `あなたはNEONアシスタント、NEON Energy Drinkのフレンドリーで熱心な営業担当者です。訪問者の予約注文、フランチャイズ、投資、NFTについてサポートします。日本語で回答してください。回答は簡潔に（150語以内）。`,
        };
        
        const systemPrompt = systemPrompts[input.language] || systemPrompts.en;
        
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
        const { generateCustomerReferralCode } = await import("./db");
        const code = await generateCustomerReferralCode(ctx.user.id);
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
        const codeResult = await db.select()
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
        orderId: z.number(),
        purchaseAmount: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { completeCustomerReferral } = await import("./db");
        await completeCustomerReferral(ctx.user.id, input.orderId, input.purchaseAmount);
        return { success: true };
      }),

    // Redeem a reward
    redeemReward: protectedProcedure
      .input(z.object({
        rewardId: z.number(),
        orderId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { redeemCustomerReward } = await import("./db");
        const success = await redeemCustomerReward(input.rewardId, input.orderId);
        return { success };
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
