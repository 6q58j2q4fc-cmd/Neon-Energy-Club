import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { users, distributors, notifications } from "../drizzle/schema";
import { eq, desc, like, or, and, sql, count } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Admin-only procedure middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // Get dashboard stats
  getDashboardStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [totalDistributors] = await db.select({ count: count() }).from(distributors);
    
    // Get users by type
    const usersByType = await db
      .select({
        userType: users.userType,
        count: count(),
      })
      .from(users)
      .groupBy(users.userType);
    
    // Get recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const [recentSignups] = await db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.createdAt} >= ${sevenDaysAgo}`);
    
    return {
      totalUsers: totalUsers?.count || 0,
      totalDistributors: totalDistributors?.count || 0,
      recentSignups: recentSignups?.count || 0,
      usersByType: usersByType.reduce((acc, item) => {
        acc[item.userType] = item.count;
        return acc;
      }, {} as Record<string, number>),
    };
  }),

  // List all users with pagination and search
  listUsers: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      search: z.string().optional(),
      userType: z.enum(["all", "customer", "distributor", "franchisee", "admin"]).default("all"),
      role: z.enum(["all", "user", "admin"]).default("all"),
      sortBy: z.enum(["createdAt", "name", "email", "lastSignedIn"]).default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const offset = (input.page - 1) * input.limit;
      
      // Build where conditions
      const conditions = [];
      
      if (input.search) {
        conditions.push(
          or(
            like(users.name, `%${input.search}%`),
            like(users.email, `%${input.search}%`),
            like(users.username, `%${input.search}%`)
          )
        );
      }
      
      if (input.userType !== "all") {
        conditions.push(eq(users.userType, input.userType));
      }
      
      if (input.role !== "all") {
        conditions.push(eq(users.role, input.role));
      }
      
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      // Get total count
      const [totalResult] = await db
        .select({ count: count() })
        .from(users)
        .where(whereClause);
      
      // Get users
      const userList = await db
        .select({
          id: users.id,
          openId: users.openId,
          username: users.username,
          name: users.name,
          email: users.email,
          phone: users.phone,
          userType: users.userType,
          role: users.role,
          emailVerified: users.emailVerified,
          createdAt: users.createdAt,
          lastSignedIn: users.lastSignedIn,
        })
        .from(users)
        .where(whereClause)
        .orderBy(input.sortOrder === "desc" ? desc(users[input.sortBy]) : users[input.sortBy])
        .limit(input.limit)
        .offset(offset);
      
      return {
        users: userList,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: totalResult?.count || 0,
          totalPages: Math.ceil((totalResult?.count || 0) / input.limit),
        },
      };
    }),

  // Get single user details
  getUser: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId));
      
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      
      // Get distributor info if applicable
      let distributorInfo = null;
      if (user.userType === "distributor") {
        const [dist] = await db
          .select()
          .from(distributors)
          .where(eq(distributors.userId, user.id));
        distributorInfo = dist;
      }
      
      return {
        ...user,
        passwordHash: undefined, // Don't expose password hash
        distributorInfo,
      };
    }),

  // Update user role
  updateUserRole: adminProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(["user", "admin"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      // Prevent self-demotion
      if (input.userId === ctx.user.id && input.role !== "admin") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot demote yourself" });
      }
      
      await db
        .update(users)
        .set({ role: input.role, updatedAt: new Date() })
        .where(eq(users.id, input.userId));
      
      return { success: true, message: `User role updated to ${input.role}` };
    }),

  // Update user type
  updateUserType: adminProcedure
    .input(z.object({
      userId: z.number(),
      userType: z.enum(["customer", "distributor", "franchisee", "admin"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      await db
        .update(users)
        .set({ userType: input.userType, updatedAt: new Date() })
        .where(eq(users.id, input.userId));
      
      return { success: true, message: `User type updated to ${input.userType}` };
    }),

  // Admin reset user password
  resetUserPassword: adminProcedure
    .input(z.object({
      userId: z.number(),
      newPassword: z.string().min(8),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      const passwordHash = await bcrypt.hash(input.newPassword, 12);
      
      await db
        .update(users)
        .set({ 
          passwordHash,
          passwordResetToken: null,
          passwordResetExpiry: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, input.userId));
      
      return { success: true, message: "Password has been reset" };
    }),

  // Toggle user email verification
  toggleEmailVerification: adminProcedure
    .input(z.object({
      userId: z.number(),
      verified: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      await db
        .update(users)
        .set({ 
          emailVerified: input.verified,
          emailVerificationToken: null,
          emailVerificationExpiry: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, input.userId));
      
      return { success: true, message: `Email verification ${input.verified ? "enabled" : "disabled"}` };
    }),

  // Delete user (soft delete or hard delete)
  deleteUser: adminProcedure
    .input(z.object({
      userId: z.number(),
      hardDelete: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      // Prevent self-deletion
      if (input.userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot delete yourself" });
      }
      
      if (input.hardDelete) {
        await db.delete(users).where(eq(users.id, input.userId));
        return { success: true, message: "User permanently deleted" };
      } else {
        // Soft delete by anonymizing
        await db
          .update(users)
          .set({
            name: "[Deleted User]",
            email: `deleted_${input.userId}@deleted.local`,
            username: null,
            passwordHash: null,
            phone: null,
            updatedAt: new Date(),
          })
          .where(eq(users.id, input.userId));
        return { success: true, message: "User account deactivated" };
      }
    }),

  // Get activity logs (recent user actions)
  getActivityLogs: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const offset = (input.page - 1) * input.limit;
      
      // Get recent logins
      const recentLogins = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          lastSignedIn: users.lastSignedIn,
          userType: users.userType,
        })
        .from(users)
        .orderBy(desc(users.lastSignedIn))
        .limit(input.limit)
        .offset(offset);
      
      return {
        activities: recentLogins.map(user => ({
          type: "login",
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          userType: user.userType,
          timestamp: user.lastSignedIn,
        })),
      };
    }),

  // Send notification to user
  sendNotification: adminProcedure
    .input(z.object({
      userId: z.number(),
      title: z.string().min(1),
      message: z.string().min(1),
      type: z.enum(["info", "success", "warning", "error"]).default("info"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      await db.insert(notifications).values({
        userId: input.userId,
        title: input.title,
        message: input.message,
        type: input.type,
        isRead: false,
        createdAt: new Date(),
      });
      
      return { success: true, message: "Notification sent" };
    }),

  // Broadcast notification to all users or specific type
  broadcastNotification: adminProcedure
    .input(z.object({
      title: z.string().min(1),
      message: z.string().min(1),
      type: z.enum(["info", "success", "warning", "error"]).default("info"),
      targetUserType: z.enum(["all", "customer", "distributor", "franchisee"]).default("all"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      // Get target users
      const whereClause = input.targetUserType !== "all" 
        ? eq(users.userType, input.targetUserType)
        : undefined;
      
      const targetUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(whereClause);
      
      // Insert notifications for all target users
      if (targetUsers.length > 0) {
        const notificationValues = targetUsers.map(user => ({
          userId: user.id,
          title: input.title,
          message: input.message,
          type: input.type,
          isRead: false,
          createdAt: new Date(),
        }));
        
        await db.insert(notifications).values(notificationValues);
      }
      
      return { success: true, message: `Notification sent to ${targetUsers.length} users` };
    }),

  // List distributors with pagination and search
  distributors: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const offset = (input.page - 1) * input.limit;
      
      let query = db
        .select({
          id: distributors.id,
          userId: distributors.userId,
          distributorCode: distributors.distributorCode,
          rank: distributors.rank,
          isActive: distributors.isActive,
          personalSales: distributors.personalSales,
          teamSales: distributors.teamSales,
          leftLegVolume: distributors.leftLegVolume,
          rightLegVolume: distributors.rightLegVolume,
          sponsorId: distributors.sponsorId,
          createdAt: distributors.createdAt,
        })
        .from(distributors);
      
      if (input.search) {
        query = query.where(like(distributors.distributorCode, `%${input.search}%`)) as any;
      }
      
      const allDistributors = await query
        .orderBy(desc(distributors.createdAt))
        .limit(input.limit)
        .offset(offset);
      
      const [totalCount] = await db.select({ count: count() }).from(distributors);
      
      // Get user info for each distributor
      const distributorsWithUserInfo = await Promise.all(
        allDistributors.map(async (dist) => {
          const [user] = await db
            .select({ name: users.name, email: users.email })
            .from(users)
            .where(eq(users.id, dist.userId));
          return {
            ...dist,
            userName: user?.name || "Unknown",
            userEmail: user?.email || "Unknown",
          };
        })
      );
      
      return {
        distributors: distributorsWithUserInfo,
        total: totalCount?.count || 0,
        totalPages: Math.ceil((totalCount?.count || 0) / input.limit),
      };
    }),

  // Reject commission (placeholder - implement based on your commission table)
  rejectCommission: adminProcedure
    .input(z.object({
      commissionId: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Placeholder - implement based on your commission table structure
      return { success: true, message: "Commission rejected" };
    }),

  // Export all distributors for CSV download
  exportAllDistributors: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    
    const allDistributors = await db
      .select({
        id: distributors.id,
        userId: distributors.userId,
        distributorCode: distributors.distributorCode,
        rank: distributors.rank,
        isActive: distributors.isActive,
        personalSales: distributors.personalSales,
        teamSales: distributors.teamSales,
        leftLegVolume: distributors.leftLegVolume,
        rightLegVolume: distributors.rightLegVolume,
        sponsorId: distributors.sponsorId,
        createdAt: distributors.createdAt,
      })
      .from(distributors)
      .orderBy(desc(distributors.createdAt));
    
    // Get user info for each distributor
    const distributorsWithUserInfo = await Promise.all(
      allDistributors.map(async (dist) => {
        const [user] = await db
          .select({ name: users.name, email: users.email })
          .from(users)
          .where(eq(users.id, dist.userId));
        return {
          ...dist,
          userName: user?.name || "Unknown",
          userEmail: user?.email || "Unknown",
        };
      })
    );
    
    return { distributors: distributorsWithUserInfo };
  }),

  // Delete all test distributors
  deleteAllTestDistributors: adminProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    
    // Delete distributors with test codes (starting with TEST or DIST followed by numbers)
    const result = await db
      .delete(distributors)
      .where(
        or(
          like(distributors.distributorCode, "TEST%"),
          like(distributors.distributorCode, "DEMO%")
        )
      );
    
    return { success: true, message: "Test distributors deleted" };
  }),
});

export type AdminRouter = typeof adminRouter;
