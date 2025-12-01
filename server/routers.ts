import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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
    // Public procedure to submit a pre-order
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

    // Protected procedure for admin to view all pre-orders
    list: protectedProcedure.query(async ({ ctx }) => {
      // Only allow admin users to view all pre-orders
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      const { getAllPreorders } = await import("./db");
      return await getAllPreorders();
    }),

    // Protected procedure for admin to update order status
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number().int(),
          status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Only allow admin users to update status
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { updatePreorderStatus } = await import("./db");
        await updatePreorderStatus(input.id, input.status);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
