import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
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
        await createPreorder(input);
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
        const { updatePreorderStatus } = await import("./db");
        await updatePreorderStatus(input.id, input.status);
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
        
        // Notify admin of new newsletter subscription
        await notifyOwner({
          title: "New Newsletter Subscription",
          content: `New subscriber: ${input.name} (${input.email}) has joined the NEON newsletter. Total subscribers growing!`,
        });
        
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
        
        // Get subscriber info for notification
        const subscription = await getNewsletterSubscription(input.subscriptionId);
        const subscriberName = subscription?.name || "A subscriber";
        const subscriberEmail = subscription?.email || "unknown";
        
        // Notify admin of referrals
        await notifyOwner({
          title: "New Referrals Submitted",
          content: `${subscriberName} (${subscriberEmail}) has referred ${input.friendEmails.length} friend(s) to NEON: ${input.friendEmails.join(", ")}. Viral growth in action!`,
        });
        
        return { success: true };
      }),

    // Get subscription stats
    stats: publicProcedure.query(async () => {
      const { getNewsletterStats } = await import("./db");
      return await getNewsletterStats();
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
        
        // If approved, create claimed territory
        if (input.status === "approved") {
          const application = await getTerritoryApplication(input.applicationId);
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
});

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
