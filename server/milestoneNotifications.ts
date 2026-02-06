/**
 * Milestone Notification System
 * 
 * Sends notifications when distributors achieve milestones
 * Includes push notifications, email digests, and celebration animations
 */

import { getDb } from "./db";
import { eq, and } from "drizzle-orm";
import { distributors } from "../drizzle/schema";
import { notifyOwner } from "./_core/notification";
import type { Achievement, Milestone } from "./impactMilestones";

export interface NotificationPreferences {
  milestoneAchievements: boolean;
  teamMilestones: boolean;
  rankAdvancement: boolean;
  emailDigest: 'none' | 'daily' | 'weekly';
  pushNotifications: boolean;
}

export interface MilestoneNotification {
  id: string;
  distributorId: number;
  milestoneId: string;
  milestoneName: string;
  badgeImageUrl?: string;
  achievedAt: string;
  read: boolean;
  celebrated: boolean; // Whether user has seen celebration animation
}

/**
 * Send notification when a milestone is achieved
 * 
 * @param distributorId - The distributor who achieved the milestone
 * @param achievement - The milestone achievement details
 */
export async function notifyMilestoneAchievement(
  distributorId: number,
  achievement: Achievement
): Promise<void> {
  const db = await getDb();
  
  // Get distributor info
  const [distributor] = await db
    .select()
    .from(distributors)
    .where(eq(distributors.id, distributorId))
    .limit(1);
  
  if (!distributor) {
    console.error(`[Milestone Notification] Distributor ${distributorId} not found`);
    return;
  }
  
  // Check notification preferences (default to enabled if not set)
  const preferences = getNotificationPreferences(distributor);
  
  if (!preferences.milestoneAchievements) {
    console.log(`[Milestone Notification] Distributor ${distributorId} has milestone notifications disabled`);
    return;
  }
  
  // Create notification record
  const notification: MilestoneNotification = {
    id: `milestone_${distributorId}_${achievement.milestone.id}_${Date.now()}`,
    distributorId,
    milestoneId: achievement.milestone.id,
    milestoneName: achievement.milestone.name,
    badgeImageUrl: achievement.milestone.badgeImageUrl,
    achievedAt: achievement.achievedAt,
    read: false,
    celebrated: false
  };
  
  // Store notification (in a real system, this would go to a notifications table)
  // For now, we'll use the built-in notification system
  
  if (preferences.pushNotifications) {
    // Send push notification (would integrate with browser Push API or mobile push service)
    await sendPushNotification(distributor, achievement);
  }
  
  // Notify owner about significant achievements
  if (achievement.milestone.threshold >= 1000) {
    await notifyOwner({
      title: `🎉 Major Milestone Achieved!`,
      content: `${distributor.displayName || distributor.username} just achieved ${achievement.milestone.name}! (${achievement.currentValue} ${achievement.milestone.category})`
    });
  }
  
  console.log(`[Milestone Notification] Sent notification to distributor ${distributorId} for ${achievement.milestone.name}`);
}

/**
 * Send push notification for milestone achievement
 */
async function sendPushNotification(
  distributor: any,
  achievement: Achievement
): Promise<void> {
  // In a production system, this would use Web Push API or mobile push service
  // For now, we'll log the notification
  console.log(`[Push Notification] Sending to ${distributor.username}:`, {
    title: `🎉 Achievement Unlocked: ${achievement.milestone.name}!`,
    body: achievement.milestone.description,
    icon: achievement.milestone.badgeImageUrl || achievement.milestone.icon,
    badge: achievement.milestone.badgeImageUrl,
    data: {
      milestoneId: achievement.milestone.id,
      shareUrl: achievement.shareUrl
    }
  });
  
  // TODO: Implement actual push notification sending
  // Example using Web Push API:
  // await webpush.sendNotification(subscription, JSON.stringify({
  //   title: `🎉 Achievement Unlocked: ${achievement.milestone.name}!`,
  //   body: achievement.milestone.description,
  //   icon: achievement.milestone.badgeImageUrl
  // }));
}

/**
 * Get notification preferences for a distributor
 */
function getNotificationPreferences(distributor: any): NotificationPreferences {
  // In a production system, this would read from a preferences table
  // For now, return default preferences
  return {
    milestoneAchievements: true,
    teamMilestones: true,
    rankAdvancement: true,
    emailDigest: 'weekly',
    pushNotifications: true
  };
}

/**
 * Update notification preferences for a distributor
 */
export async function updateNotificationPreferences(
  distributorId: number,
  preferences: Partial<NotificationPreferences>
): Promise<void> {
  // In a production system, this would update a preferences table
  console.log(`[Notification Preferences] Updated for distributor ${distributorId}:`, preferences);
  
  // TODO: Store preferences in database
  // await db.insert(notificationPreferences).values({
  //   distributorId,
  //   ...preferences,
  //   updatedAt: new Date().toISOString()
  // }).onDuplicateKeyUpdate({
  //   ...preferences,
  //   updatedAt: new Date().toISOString()
  // });
}

/**
 * Get unread milestone notifications for a distributor
 */
export async function getUnreadNotifications(distributorId: number): Promise<MilestoneNotification[]> {
  // In a production system, this would query a notifications table
  // For now, return empty array
  return [];
  
  // TODO: Query notifications from database
  // const db = await getDb();
  // return await db
  //   .select()
  //   .from(milestoneNotifications)
  //   .where(and(
  //     eq(milestoneNotifications.distributorId, distributorId),
  //     eq(milestoneNotifications.read, false)
  //   ))
  //   .orderBy(desc(milestoneNotifications.achievedAt));
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
  console.log(`[Notification] Marked as read: ${notificationId}`);
  
  // TODO: Update notification in database
  // const db = await getDb();
  // await db
  //   .update(milestoneNotifications)
  //   .set({ read: true })
  //   .where(eq(milestoneNotifications.id, notificationId));
}

/**
 * Mark notification as celebrated (user has seen animation)
 */
export async function markNotificationCelebrated(notificationId: string): Promise<void> {
  console.log(`[Notification] Marked as celebrated: ${notificationId}`);
  
  // TODO: Update notification in database
  // const db = await getDb();
  // await db
  //   .update(milestoneNotifications)
  //   .set({ celebrated: true })
  //   .where(eq(milestoneNotifications.id, notificationId));
}

/**
 * Generate daily email digest for a distributor
 */
export async function generateDailyDigest(distributorId: number): Promise<string> {
  // Get achievements from the last 24 hours
  // In production, query notifications table
  
  return `
    <h2>🎉 Your Daily Impact Report</h2>
    <p>Here's what you achieved in the last 24 hours:</p>
    <ul>
      <li>No new milestones achieved today</li>
    </ul>
    <p>Keep up the great work!</p>
  `;
}

/**
 * Generate weekly email digest for a distributor
 */
export async function generateWeeklyDigest(distributorId: number): Promise<string> {
  // Get achievements from the last 7 days
  // In production, query notifications table and aggregate stats
  
  return `
    <h2>🌟 Your Weekly Impact Report</h2>
    <p>Here's your environmental impact this week:</p>
    <ul>
      <li>Total trees protected: 0</li>
      <li>Total animals saved: 0</li>
      <li>Milestones achieved: 0</li>
    </ul>
    <p>Keep making a difference!</p>
  `;
}
