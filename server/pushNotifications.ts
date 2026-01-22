/**
 * Push Notification Service for NEON Energy
 * Handles browser push notifications for distributors
 */

import webpush from 'web-push';
import { getDistributorPushSubscriptions, deactivatePushSubscription } from './db';

// VAPID keys should be generated once and stored as environment variables
// For now, we'll generate them if not present
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'UUxI4O8-FbRouAf7-fGe052sP6-u9gXL8Xq5Jz5S_Uc';

// Configure web-push
webpush.setVapidDetails(
  'mailto:support@neonenergy.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

/**
 * Send a push notification to a specific subscription
 */
export async function sendPushNotification(
  subscription: {
    endpoint: string;
    p256dh: string;
    auth: string;
  },
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload),
      {
        TTL: 60 * 60 * 24, // 24 hours
        urgency: 'normal',
      }
    );

    return true;
  } catch (error: unknown) {
    const err = error as { statusCode?: number };
    console.error('[Push] Failed to send notification:', error);
    
    // If subscription is no longer valid, deactivate it
    if (err.statusCode === 410 || err.statusCode === 404) {
      await deactivatePushSubscription(subscription.endpoint);
    }
    
    return false;
  }
}

/**
 * Send push notification to all distributors
 */
export async function notifyAllDistributors(payload: PushNotificationPayload): Promise<number> {
  const subscriptions = await getDistributorPushSubscriptions();
  let successCount = 0;

  for (const sub of subscriptions) {
    const success = await sendPushNotification(
      {
        endpoint: sub.endpoint,
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
      payload
    );
    if (success) successCount++;
  }

  return successCount;
}

/**
 * Send notification for new team signup
 */
export async function notifyNewTeamSignup(
  sponsorSubscriptions: Array<{ endpoint: string; p256dh: string; auth: string }>,
  newMemberName: string,
  newMemberCode: string
): Promise<void> {
  const payload: PushNotificationPayload = {
    title: '🎉 New Team Member!',
    body: `${newMemberName} just joined your team! Distributor code: ${newMemberCode}`,
    icon: '/neon-icon-192.png',
    badge: '/neon-badge-72.png',
    tag: 'new-team-member',
    data: {
      type: 'new_team_member',
      memberCode: newMemberCode,
      url: '/portal',
    },
    actions: [
      { action: 'view', title: 'View Team' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  for (const sub of sponsorSubscriptions) {
    await sendPushNotification(sub, payload);
  }
}

/**
 * Send notification for commission payout
 */
export async function notifyCommissionPayout(
  subscription: { endpoint: string; p256dh: string; auth: string },
  amount: number,
  payoutMethod: string
): Promise<void> {
  const payload: PushNotificationPayload = {
    title: '💰 Commission Payout!',
    body: `Your $${amount.toFixed(2)} commission has been sent via ${payoutMethod}!`,
    icon: '/neon-icon-192.png',
    badge: '/neon-badge-72.png',
    tag: 'commission-payout',
    data: {
      type: 'commission_payout',
      amount,
      url: '/portal',
    },
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  await sendPushNotification(subscription, payload);
}

/**
 * Send notification for rank advancement
 */
export async function notifyRankAdvancement(
  subscription: { endpoint: string; p256dh: string; auth: string },
  previousRank: string,
  newRank: string
): Promise<void> {
  const rankEmojis: Record<string, string> = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
    diamond: '💠',
    crown: '👑',
    ambassador: '🌟',
  };

  const emoji = rankEmojis[newRank.toLowerCase()] || '🎯';

  const payload: PushNotificationPayload = {
    title: `${emoji} Rank Advancement!`,
    body: `Congratulations! You've advanced from ${previousRank} to ${newRank}!`,
    icon: '/neon-icon-192.png',
    badge: '/neon-badge-72.png',
    tag: 'rank-advancement',
    data: {
      type: 'rank_advancement',
      previousRank,
      newRank,
      url: '/portal',
    },
    actions: [
      { action: 'view', title: 'View Progress' },
      { action: 'share', title: 'Share' },
    ],
  };

  await sendPushNotification(subscription, payload);
}

/**
 * Send notification for new order from downline
 */
export async function notifyDownlineOrder(
  subscription: { endpoint: string; p256dh: string; auth: string },
  orderAmount: number,
  commissionEarned: number,
  customerName: string
): Promise<void> {
  const payload: PushNotificationPayload = {
    title: '📦 New Team Order!',
    body: `${customerName} placed a $${orderAmount.toFixed(2)} order. You earned $${commissionEarned.toFixed(2)} commission!`,
    icon: '/neon-icon-192.png',
    badge: '/neon-badge-72.png',
    tag: 'downline-order',
    data: {
      type: 'downline_order',
      orderAmount,
      commissionEarned,
      url: '/portal',
    },
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  await sendPushNotification(subscription, payload);
}

/**
 * Get VAPID public key for client-side subscription
 */
export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}
