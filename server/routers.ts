import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";

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

  crowdfunding: router({
    // Submit a crowdfunding contribution
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
});

export type AppRouter = typeof appRouter;
