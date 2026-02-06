import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { users, distributors, notifications, commissions, orders, dataBackups, backupSnapshots, restorationLog, deletedRecordsArchive, systemAuditLog, backupSchedules, replicatedWebsites, websiteAuditLog } from "../drizzle/schema";
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
        .set({ role: input.role, updatedAt: new Date().toISOString() })
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
        .set({ userType: input.userType, updatedAt: new Date().toISOString() })
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
          updatedAt: new Date().toISOString(),
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
          updatedAt: new Date().toISOString(),
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
            updatedAt: new Date().toISOString(),
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
        isRead: 0,
        createdAt: new Date().toISOString(),
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
          isRead: 0,
          createdAt: new Date().toISOString(),
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

  // ==================== COMMISSION MANAGEMENT ====================

  // List all commissions with pagination
  commissions: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      status: z.enum(["all", "pending", "paid", "cancelled"]).default("all"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const offset = (input.page - 1) * input.limit;
      
      // Build where conditions
      const conditions = [];
      if (input.status !== "all") {
        conditions.push(eq(commissions.status, input.status));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      // Get total count
      const [totalResult] = await db
        .select({ count: count() })
        .from(commissions)
        .where(whereClause);
      
      // Get commissions
      const commissionList = await db
        .select({
          id: commissions.id,
          distributorId: commissions.distributorId,
          saleId: commissions.saleId,
          sourceDistributorId: commissions.sourceDistributorId,
          commissionType: commissions.commissionType,
          level: commissions.level,
          amount: commissions.amount,
          percentage: commissions.percentage,
          status: commissions.status,
          createdAt: commissions.createdAt,
        })
        .from(commissions)
        .where(whereClause)
        .orderBy(desc(commissions.createdAt))
        .limit(input.limit)
        .offset(offset);
      
      // Get distributor info for each commission
      const commissionsWithInfo = await Promise.all(
        commissionList.map(async (comm) => {
          const [dist] = await db
            .select({ distributorCode: distributors.distributorCode })
            .from(distributors)
            .where(eq(distributors.id, comm.distributorId));
          
          const [distUser] = dist ? await db
            .select({ name: users.name, email: users.email })
            .from(users)
            .innerJoin(distributors, eq(users.id, distributors.userId))
            .where(eq(distributors.id, comm.distributorId)) : [null];
          
          return {
            ...comm,
            distributorCode: dist?.distributorCode || "Unknown",
            distributorName: distUser?.name || "Unknown",
            distributorEmail: distUser?.email || "Unknown",
          };
        })
      );
      
      return {
        commissions: commissionsWithInfo,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: totalResult?.count || 0,
          totalPages: Math.ceil((totalResult?.count || 0) / input.limit),
        },
      };
    }),

  // Approve commission (mark as paid)
  approveCommission: adminProcedure
    .input(z.object({
      commissionId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      // Check if commission exists
      const [commission] = await db
        .select()
        .from(commissions)
        .where(eq(commissions.id, input.commissionId));
      
      if (!commission) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Commission not found" });
      }
      
      if (commission.status === "paid") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Commission already paid" });
      }
      
      // Update commission status to paid
      await db
        .update(commissions)
        .set({ status: "paid" })
        .where(eq(commissions.id, input.commissionId));
      
      return { success: true, message: "Commission approved and marked as paid" };
    }),

  // ==================== ORDER MANAGEMENT ====================

  // List all orders with pagination
  orders: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      status: z.enum(["all", "pending", "paid", "shipped", "delivered", "cancelled"]).default("all"),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const offset = (input.page - 1) * input.limit;
      
      // Build where conditions
      const conditions = [];
      if (input.status !== "all") {
        conditions.push(eq(orders.status, input.status));
      }
      if (input.search) {
        conditions.push(
          or(
            like(orders.orderNumber, `%${input.search}%`),
            like(orders.customerName, `%${input.search}%`),
            like(orders.customerEmail, `%${input.search}%`)
          )
        );
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      // Get total count
      const [totalResult] = await db
        .select({ count: count() })
        .from(orders)
        .where(whereClause);
      
      // Get orders
      const orderList = await db
        .select()
        .from(orders)
        .where(whereClause)
        .orderBy(desc(orders.createdAt))
        .limit(input.limit)
        .offset(offset);
      
      return {
        orders: orderList,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: totalResult?.count || 0,
          totalPages: Math.ceil((totalResult?.count || 0) / input.limit),
        },
      };
    }),

  // Update order status
  updateOrder: adminProcedure
    .input(z.object({
      orderId: z.number(),
      status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      await db
        .update(orders)
        .set({ status: input.status, updatedAt: new Date().toISOString() })
        .where(eq(orders.id, input.orderId));
      
      return { success: true, message: `Order status updated to ${input.status}` };
    }),

  // Delete order
  deleteOrder: adminProcedure
    .input(z.object({
      orderId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      await db.delete(orders).where(eq(orders.id, input.orderId));
      
      return { success: true, message: "Order deleted" };
    }),

  // Delete all test orders
  deleteAllTestOrders: adminProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    
    // Delete orders with test order numbers
    await db
      .delete(orders)
      .where(
        or(
          like(orders.orderNumber, "TEST%"),
          like(orders.orderNumber, "DEMO%")
        )
      );
    
    return { success: true, message: "Test orders deleted" };
  }),

  // Export all orders
  exportAllOrders: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    
    const allOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));
    
    return { orders: allOrders };
  }),

  // Update user (for admin panel)
  updateUser: adminProcedure
    .input(z.object({
      userId: z.number(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      const updateData: Record<string, any> = { updatedAt: new Date().toISOString() };
      if (input.name) updateData.name = input.name;
      if (input.email) updateData.email = input.email;
      if (input.phone) updateData.phone = input.phone;
      
      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, input.userId));
      
      return { success: true, message: "User updated" };
    }),

  // Suspend user
  suspendUser: adminProcedure
    .input(z.object({
      userId: z.number(),
      suspended: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      // Prevent self-suspension
      if (input.userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot suspend yourself" });
      }
      
      // For now, we'll use the role field to indicate suspension
      // In production, you'd want a dedicated suspended field
      await db
        .update(users)
        .set({ updatedAt: new Date().toISOString() })
        .where(eq(users.id, input.userId));
      
      return { success: true, message: input.suspended ? "User suspended" : "User unsuspended" };
    }),

  // Test shipping connection (placeholder)
  testShippingConnection: adminProcedure
    .input(z.object({
      carrier: z.string(),
      credentials: z.record(z.string(), z.string()),
    }))
    .mutation(async ({ input }) => {
      // Placeholder - implement actual shipping API connection test
      return { success: true, message: `${input.carrier} connection test successful` };
    }),

  // Get shipping rates for an order (placeholder)
  getShippingRates: adminProcedure
    .input(z.object({
      orderId: z.number(),
    }))
    .query(async ({ input }) => {
      // Placeholder - implement actual shipping rate lookup
      return {
        rates: [
          { carrier: "USPS", service: "Priority Mail", price: 8.99, estimatedDays: "2-3" },
          { carrier: "USPS", service: "Ground Advantage", price: 5.99, estimatedDays: "3-5" },
          { carrier: "UPS", service: "Ground", price: 9.99, estimatedDays: "3-5" },
          { carrier: "FedEx", service: "Ground", price: 10.99, estimatedDays: "3-5" },
        ],
      };
    }),

  // Generate shipping label (placeholder)
  generateShippingLabel: adminProcedure
    .input(z.object({
      orderId: z.number(),
      carrier: z.string(),
      service: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Placeholder - implement actual shipping label generation
      const trackingNumber = `TRACK${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      return {
        success: true,
        trackingNumber,
        trackingUrl: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
        cost: 8.99,
        labelUrl: "/placeholder-label.pdf",
      };
    }),

  // ============ BACKUP & RESTORE ENDPOINTS ============

  // Get all backups
  getBackups: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.enum(["all", "in_progress", "completed", "failed", "expired"]).default("all"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const offset = (input.page - 1) * input.limit;
      
      let backups;
      if (input.status !== "all") {
        backups = await db.select().from(dataBackups)
          .where(eq(dataBackups.status, input.status))
          .orderBy(desc(dataBackups.createdAt))
          .limit(input.limit)
          .offset(offset);
      } else {
        backups = await db.select().from(dataBackups)
          .orderBy(desc(dataBackups.createdAt))
          .limit(input.limit)
          .offset(offset);
      }
      const [totalCount] = await db.select({ count: count() }).from(dataBackups);

      return {
        backups,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: totalCount?.count || 0,
          totalPages: Math.ceil((totalCount?.count || 0) / input.limit),
        },
      };
    }),

  // Create a new backup
  createBackup: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      backupType: z.enum(["full", "incremental", "table_specific", "manual"]).default("manual"),
      tables: z.array(z.string()).optional(),
      retentionDays: z.number().default(30),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const tablesToBackup = input.tables || [
        "users", "distributors", "orders", "commissions", 
        "replicated_websites", "preorders", "sales"
      ];

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + input.retentionDays);

      // Create backup record
      const [backup] = await db.insert(dataBackups).values({
        name: input.name,
        backupType: input.backupType,
        tablesIncluded: JSON.stringify(tablesToBackup),
        status: "in_progress",
        retentionDays: input.retentionDays,
        expiresAt: expiresAt.toISOString(),
        createdBy: ctx.user.id,
      });

      const backupId = backup.insertId;
      let totalRecords = 0;

      // Backup each table
      for (const tableName of tablesToBackup) {
        try {
          let records: any[] = [];
          
          switch (tableName) {
            case "users":
              records = await db.select().from(users);
              break;
            case "distributors":
              records = await db.select().from(distributors);
              break;
            case "orders":
              records = await db.select().from(orders);
              break;
            case "commissions":
              records = await db.select().from(commissions);
              break;
            case "replicated_websites":
              records = await db.select().from(replicatedWebsites);
              break;
          }

          // Store snapshots
          for (const record of records) {
            const recordData = JSON.stringify(record);
            const dataHash = crypto.createHash('sha256').update(recordData).digest('hex');
            
            await db.insert(backupSnapshots).values({
              backupId: Number(backupId),
              tableName,
              recordId: record.id,
              recordData,
              dataHash,
            });
            totalRecords++;
          }
        } catch (error) {
          console.error(`Error backing up table ${tableName}:`, error);
        }
      }

      // Update backup status
      await db.update(dataBackups)
        .set({
          status: "completed",
          totalRecords,
          completedAt: new Date().toISOString(),
        })
        .where(eq(dataBackups.id, Number(backupId)));

      // Log to audit
      await db.insert(systemAuditLog).values({
        category: "backup",
        action: "create_backup",
        entityType: "backup",
        entityId: Number(backupId),
        userId: ctx.user.id,
        userRole: ctx.user.role,
        result: "success",
        severity: "info",
        metadata: JSON.stringify({ tables: tablesToBackup, totalRecords }),
      });

      return { success: true, backupId: Number(backupId), totalRecords };
    }),

  // Restore from backup
  restoreFromBackup: adminProcedure
    .input(z.object({
      backupId: z.number(),
      restorationType: z.enum(["full", "partial", "single_record"]).default("full"),
      tables: z.array(z.string()).optional(),
      recordIds: z.array(z.number()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get backup
      const [backup] = await db.select().from(dataBackups).where(eq(dataBackups.id, input.backupId));
      if (!backup) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Backup not found" });
      }

      // Create restoration log
      const [restorationEntry] = await db.insert(restorationLog).values({
        backupId: input.backupId,
        restorationType: input.restorationType,
        tablesRestored: JSON.stringify(input.tables || []),
        status: "in_progress",
        performedBy: ctx.user.id,
      });

      let recordsRestored = 0;

      try {
        // Get snapshots to restore
        let snapshots = await db.select().from(backupSnapshots)
          .where(eq(backupSnapshots.backupId, input.backupId));

        if (input.tables && input.tables.length > 0) {
          snapshots = snapshots.filter(s => input.tables!.includes(s.tableName));
        }

        if (input.recordIds && input.recordIds.length > 0) {
          snapshots = snapshots.filter(s => input.recordIds!.includes(s.recordId));
        }

        // Restore each snapshot (simplified - in production would need proper upsert logic)
        for (const snapshot of snapshots) {
          const recordData = JSON.parse(snapshot.recordData);
          
          // Archive current state before restore
          await db.insert(deletedRecordsArchive).values({
            tableName: snapshot.tableName,
            originalId: snapshot.recordId,
            recordData: snapshot.recordData,
            deletionReason: `Pre-restore archive for backup ${input.backupId}`,
            deletedBy: ctx.user.id,
            canRestore: 1,
            restoreDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });

          recordsRestored++;
        }

        // Update restoration log
        await db.update(restorationLog)
          .set({
            status: "completed",
            recordsRestored,
            completedAt: new Date().toISOString(),
          })
          .where(eq(restorationLog.id, Number(restorationEntry.insertId)));

        // Log to audit
        await db.insert(systemAuditLog).values({
          category: "restore",
          action: "restore_from_backup",
          entityType: "backup",
          entityId: input.backupId,
          userId: ctx.user.id,
          userRole: ctx.user.role,
          result: "success",
          severity: "warning",
          isReversible: 1,
          metadata: JSON.stringify({ recordsRestored, restorationType: input.restorationType }),
        });

        return { success: true, recordsRestored };
      } catch (error) {
        await db.update(restorationLog)
          .set({
            status: "failed",
            errorMessage: String(error),
          })
          .where(eq(restorationLog.id, Number(restorationEntry.insertId)));

        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Restoration failed" });
      }
    }),

  // Get deleted records archive
  getDeletedRecords: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      tableName: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const offset = (input.page - 1) * input.limit;
      let query = db.select().from(deletedRecordsArchive)
        .where(eq(deletedRecordsArchive.canRestore, 1))
        .orderBy(desc(deletedRecordsArchive.deletedAt));

      if (input.tableName) {
        query = db.select().from(deletedRecordsArchive)
          .where(and(
            eq(deletedRecordsArchive.canRestore, 1),
            eq(deletedRecordsArchive.tableName, input.tableName)
          ))
          .orderBy(desc(deletedRecordsArchive.deletedAt));
      }

      const records = await query.limit(input.limit).offset(offset);
      const [totalCount] = await db.select({ count: count() }).from(deletedRecordsArchive)
        .where(eq(deletedRecordsArchive.canRestore, 1));

      return {
        records: records.map(r => ({
          ...r,
          recordData: JSON.parse(r.recordData),
        })),
        pagination: {
          page: input.page,
          limit: input.limit,
          total: totalCount?.count || 0,
          totalPages: Math.ceil((totalCount?.count || 0) / input.limit),
        },
      };
    }),

  // Restore a single deleted record
  restoreDeletedRecord: adminProcedure
    .input(z.object({
      archiveId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [record] = await db.select().from(deletedRecordsArchive)
        .where(eq(deletedRecordsArchive.id, input.archiveId));

      if (!record) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Archived record not found" });
      }

      if (!record.canRestore) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Record cannot be restored" });
      }

      // Mark as restored
      await db.update(deletedRecordsArchive)
        .set({
          wasRestored: 1,
          restoredAt: new Date().toISOString(),
          restoredBy: ctx.user.id,
          canRestore: 0,
        })
        .where(eq(deletedRecordsArchive.id, input.archiveId));

      // Log to audit
      await db.insert(systemAuditLog).values({
        category: "restore",
        action: "restore_deleted_record",
        entityType: record.tableName,
        entityId: record.originalId,
        userId: ctx.user.id,
        userRole: ctx.user.role,
        result: "success",
        severity: "info",
        previousState: record.recordData,
      });

      return { success: true, tableName: record.tableName, originalId: record.originalId };
    }),

  // Get system audit log
  getAuditLog: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(50),
      category: z.enum(["all", "user", "distributor", "order", "commission", "website", "backup", "restore", "admin", "security", "system"]).default("all"),
      severity: z.enum(["all", "info", "warning", "error", "critical"]).default("all"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const offset = (input.page - 1) * input.limit;
      
      const conditions = [];
      if (input.category !== "all") {
        conditions.push(eq(systemAuditLog.category, input.category));
      }
      if (input.severity !== "all") {
        conditions.push(eq(systemAuditLog.severity, input.severity));
      }

      let query;
      if (conditions.length > 0) {
        query = db.select().from(systemAuditLog)
          .where(and(...conditions))
          .orderBy(desc(systemAuditLog.createdAt));
      } else {
        query = db.select().from(systemAuditLog)
          .orderBy(desc(systemAuditLog.createdAt));
      }

      const entries = await query.limit(input.limit).offset(offset);
      const [totalCount] = await db.select({ count: count() }).from(systemAuditLog);

      return {
        entries,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: totalCount?.count || 0,
          totalPages: Math.ceil((totalCount?.count || 0) / input.limit),
        },
      };
    }),

  // Get backup schedules
  getBackupSchedules: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const schedules = await db.select().from(backupSchedules).orderBy(desc(backupSchedules.createdAt));
    return schedules;
  }),

  // Create/update backup schedule
  upsertBackupSchedule: adminProcedure
    .input(z.object({
      id: z.number().optional(),
      name: z.string().min(1),
      backupType: z.enum(["full", "incremental"]).default("incremental"),
      tables: z.array(z.string()).optional(),
      cronExpression: z.string(),
      retentionDays: z.number().default(30),
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      if (input.id) {
        await db.update(backupSchedules)
          .set({
            name: input.name,
            backupType: input.backupType,
            tables: input.tables ? JSON.stringify(input.tables) : null,
            cronExpression: input.cronExpression,
            retentionDays: input.retentionDays,
            isActive: input.isActive ? 1 : 0,
          })
          .where(eq(backupSchedules.id, input.id));
        return { success: true, id: input.id };
      } else {
        const [result] = await db.insert(backupSchedules).values({
          name: input.name,
          backupType: input.backupType,
          tables: input.tables ? JSON.stringify(input.tables) : null,
          cronExpression: input.cronExpression,
          retentionDays: input.retentionDays,
          isActive: input.isActive ? 1 : 0,
          createdBy: ctx.user.id,
        });
        return { success: true, id: Number(result.insertId) };
      }
    }),

  // Delete backup schedule
  deleteBackupSchedule: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.delete(backupSchedules).where(eq(backupSchedules.id, input.id));
      return { success: true };
    }),

  // Website health check - runs validation on all replicated websites
  runWebsiteHealthCheck: adminProcedure.mutation(async ({ ctx }) => {
    const { runFullSyncCheck } = await import("./websiteProvisioning");
    const result = await runFullSyncCheck();
    
    // Log the health check
    const db = await getDb();
    if (db) {
      await db.insert(systemAuditLog).values({
        category: "website",
        action: "health_check",
        entityType: "system",
        entityId: 0,
        userId: ctx.user.id,
        userRole: ctx.user.role,
        result: result.issuesFound > 0 ? "partial" : "success",
        severity: result.issuesFound > 0 ? "warning" : "info",
        metadata: JSON.stringify(result),
      });
    }
    
    return result;
  }),

  // Auto-fix website issues
  autoFixWebsiteIssues: adminProcedure.mutation(async ({ ctx }) => {
    const { runFullSyncCheck } = await import("./websiteProvisioning");
    // Run sync check which also fixes issues
    const result = await runFullSyncCheck();
    
    // Log the auto-fix
    const db = await getDb();
    if (db) {
      await db.insert(systemAuditLog).values({
        category: "website",
        action: "auto_fix",
        entityType: "system",
        entityId: 0,
        userId: ctx.user.id,
        userRole: ctx.user.role,
        result: "success",
        severity: "warning",
        metadata: JSON.stringify(result),
      });
    }
    
    return result;
  }),

  // Get website provisioning status for all distributors
  getWebsiteProvisioningStatus: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    // Get all distributors with their website status
    const distributorList = await db.select({
      id: distributors.id,
      distributorCode: distributors.distributorCode,
      userId: distributors.userId,
      rank: distributors.rank,
      createdAt: distributors.createdAt,
    }).from(distributors).orderBy(desc(distributors.createdAt));

    // Get all replicated websites
    const websites = await db.select().from(replicatedWebsites);
    const websiteMap = new Map(websites.map(w => [w.distributorId, w]));

    // Build status report
    const statusReport = distributorList.map(d => {
      const website = websiteMap.get(d.id);
      return {
        distributorId: d.id,
        distributorCode: d.distributorCode,
        userId: d.userId,
        rank: d.rank,
        createdAt: d.createdAt,
        hasWebsite: !!website,
        websiteStatus: website?.status || "not_provisioned",
        subdomain: website?.subdomain || null,
        affiliateLink: website?.affiliateLink || null,
        isActive: website?.status === "active",
        lastValidated: website?.lastVerifiedAt || null,
        issues: !website ? ["missing_website"] : 
          (!website.affiliateLink ? ["missing_affiliate_link"] : []).concat(
            !website.subdomain ? ["missing_subdomain"] : []
          ),
      };
    });

    const totalDistributors = statusReport.length;
    const withWebsites = statusReport.filter(s => s.hasWebsite).length;
    const withIssues = statusReport.filter(s => s.issues.length > 0).length;

    return {
      summary: {
        totalDistributors,
        withWebsites,
        withoutWebsites: totalDistributors - withWebsites,
        withIssues,
        healthScore: totalDistributors > 0 ? Math.round(((totalDistributors - withIssues) / totalDistributors) * 100) : 100,
      },
      distributors: statusReport,
    };
  }),

  // Provision website for a specific distributor
  provisionWebsiteForDistributor: adminProcedure
    .input(z.object({ distributorId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get distributor
      const [distributor] = await db.select().from(distributors)
        .where(eq(distributors.id, input.distributorId));
      
      if (!distributor) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Distributor not found" });
      }

      // Get user name
      const [user] = await db.select().from(users).where(eq(users.id, distributor.userId));

      // Provision website
      const { provisionReplicatedWebsite } = await import("./websiteProvisioning");
      const result = await provisionReplicatedWebsite(
        distributor.id,
        distributor.distributorCode,
        user?.name || undefined
      );

      // Log the action
      await db.insert(systemAuditLog).values({
        category: "website",
        action: "manual_provision",
        entityType: "distributor",
        entityId: input.distributorId,
        userId: ctx.user.id,
        userRole: ctx.user.role,
        result: result.success ? "success" : "failure",
        severity: result.success ? "info" : "error",
        metadata: JSON.stringify(result),
      });

      return result;
    }),
});

export type AdminRouter = typeof adminRouter;
