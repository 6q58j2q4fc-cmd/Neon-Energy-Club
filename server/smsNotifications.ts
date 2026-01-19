/**
 * SMS Notification Service
 * 
 * Provides SMS notifications using the built-in notification API
 * with support for referral tracking and pre-written share messages
 */

import { notifyOwner } from "./_core/notification";

// SMS Message Templates
const SMS_TEMPLATES = {
  // Order notifications
  orderConfirmation: (data: { name: string; orderId: string; quantity: number }) => 
    `🎉 Hey ${data.name}! Your NEON Energy pre-order #${data.orderId} for ${data.quantity} case(s) is confirmed! You're among the first to fuel the future. Track at neondrink.com/orders`,
  
  shippingUpdate: (data: { name: string; trackingNumber: string; carrier: string }) =>
    `📦 ${data.name}, your NEON Energy order is on the way! Track with ${data.carrier}: ${data.trackingNumber}. Get ready to glow! 💚`,
  
  delivered: (data: { name: string }) =>
    `✅ ${data.name}, your NEON Energy has arrived! Enjoy the clean energy revolution. Share your experience and earn rewards! 🚀`,
  
  // Territory notifications
  territorySubmitted: (data: { name: string; territory: string }) =>
    `📍 ${data.name}, your territory application for ${data.territory} has been received! We'll review within 48 hours. Get ready to own your zone! 🗺️`,
  
  territoryApproved: (data: { name: string; territory: string }) =>
    `🎊 Congrats ${data.name}! Your ${data.territory} territory is APPROVED! Welcome to the NEON Vending family. Login to get started: neondrink.com/distributor`,
  
  territoryRejected: (data: { name: string; territory: string; reason?: string }) =>
    `${data.name}, we couldn't approve your ${data.territory} territory application${data.reason ? `: ${data.reason}` : ''}. Contact support for alternatives.`,
  
  // Referral messages (pre-written for sharing)
  referralInvite: (data: { referrerName: string; referralCode: string }) =>
    `🔋 ${data.referrerName} wants you to try NEON Energy - the clean organic energy drink! Use code ${data.referralCode} for 15% off your first order: neondrink.com/shop?ref=${data.referralCode}`,
  
  referralReminder: (data: { name: string; referralCode: string; referralCount: number }) =>
    `Hey ${data.name}! You've referred ${data.referralCount} friends to NEON. Keep sharing code ${data.referralCode} to earn more rewards! 🎁`,
  
  // NFT notifications
  nftMinted: (data: { name: string; nftName: string; tokenId: string }) =>
    `🎨 ${data.name}, your NEON Genesis NFT "${data.nftName}" has been minted! Token #${data.tokenId} is now yours. View at neondrink.com/nft-gallery`,
  
  // Crowdfunding notifications
  crowdfundContribution: (data: { name: string; amount: number; tier: string }) =>
    `💰 Thanks ${data.name}! Your $${data.amount} contribution to NEON's ${data.tier} tier is confirmed. You're powering the energy revolution! 🚀`,
  
  // Promotional
  welcomeSubscriber: (data: { name: string; referralCode: string }) =>
    `Welcome to NEON Energy, ${data.name}! 🎉 Your unique code is ${data.referralCode}. Share with 3 friends for exclusive rewards! neondrink.com/refer`,
  
  promoAlert: (data: { name: string; promoCode: string; discount: string }) =>
    `⚡ ${data.name}, exclusive NEON deal! Use code ${data.promoCode} for ${data.discount} off. Limited time only! Shop now: neondrink.com/shop`,
};

// Types
export interface SMSRecipient {
  phone: string;
  name: string;
  email?: string;
  subscriberId?: string;
}

export interface ReferralData {
  referrerId: string;
  referrerName: string;
  referralCode: string;
  referredPhone?: string;
  referredEmail?: string;
  source: "sms" | "email" | "social" | "direct";
  convertedToCustomer?: boolean;
  convertedToDistributor?: boolean;
}

// SMS Opt-in status tracking (would be stored in database)
export interface SMSOptIn {
  phone: string;
  email?: string;
  subscriberId: string;
  optedIn: boolean;
  optInDate?: Date;
  optOutDate?: Date;
  referralCode: string;
  referredBy?: string;
  preferences: {
    orderUpdates: boolean;
    promotions: boolean;
    referralAlerts: boolean;
    territoryUpdates: boolean;
  };
}

/**
 * Generate a unique referral code for a subscriber
 */
export function generateReferralCode(subscriberId: string): string {
  const prefix = "NEON";
  const suffix = subscriberId.slice(-6).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${random}${suffix}`;
}

/**
 * Generate pre-written referral messages for sharing
 */
export function generateReferralMessages(referrerName: string, referralCode: string): {
  sms: string;
  twitter: string;
  facebook: string;
  whatsapp: string;
  email: { subject: string; body: string };
} {
  const baseUrl = "neondrink.com/shop";
  const referralUrl = `${baseUrl}?ref=${referralCode}`;
  
  return {
    sms: SMS_TEMPLATES.referralInvite({ referrerName, referralCode }),
    
    twitter: `🔋 Just discovered @NEONEnergyDrink - clean organic energy that actually works! Use my code ${referralCode} for 15% off: ${referralUrl} #NEONEnergy #CleanEnergy`,
    
    facebook: `I've been loving NEON Energy Drink - it's organic, clean, and gives amazing energy without the crash! 🔋\n\nUse my personal code ${referralCode} for 15% off your first order: ${referralUrl}\n\nTrust me, you won't go back to the other stuff! 💚`,
    
    whatsapp: `Hey! 👋 You gotta try this new energy drink I found - NEON Energy. It's organic and actually tastes amazing!\n\n🎁 Use my code ${referralCode} for 15% off: ${referralUrl}\n\nLet me know what you think! 💚`,
    
    email: {
      subject: `${referrerName} wants you to try NEON Energy - 15% off inside!`,
      body: `Hey there!\n\nI've been drinking NEON Energy and had to share it with you. It's an organic energy drink that gives clean, sustained energy without the jitters or crash.\n\nI have a special code for you: ${referralCode}\n\nUse it at ${referralUrl} for 15% off your first order!\n\nTrust me, once you try it, you won't go back to the other stuff.\n\nCheers,\n${referrerName}`,
    },
  };
}

/**
 * Send SMS notification (simulated - logs to owner notification)
 * In production, this would integrate with Twilio or similar
 */
export async function sendSMS(
  recipient: SMSRecipient,
  message: string,
  type: "transactional" | "promotional" = "transactional"
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Log the SMS attempt for tracking
    console.log(`[SMS] Sending ${type} message to ${recipient.phone}: ${message.substring(0, 50)}...`);
    
    // In production, this would call Twilio API
    // For now, we notify the owner about the SMS that would be sent
    const notified = await notifyOwner({
      title: `SMS ${type === "promotional" ? "Promo" : "Alert"}: ${recipient.name}`,
      content: `To: ${recipient.phone}\nType: ${type}\n\nMessage:\n${message}`,
    });
    
    if (notified) {
      return {
        success: true,
        messageId: `sms_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      };
    }
    
    return {
      success: false,
      error: "Notification service unavailable",
    };
  } catch (error) {
    console.error("[SMS] Error sending message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send order confirmation SMS
 */
export async function sendOrderConfirmationSMS(
  recipient: SMSRecipient,
  orderId: string,
  quantity: number
): Promise<boolean> {
  const message = SMS_TEMPLATES.orderConfirmation({
    name: recipient.name,
    orderId,
    quantity,
  });
  
  const result = await sendSMS(recipient, message, "transactional");
  return result.success;
}

/**
 * Send shipping update SMS
 */
export async function sendShippingUpdateSMS(
  recipient: SMSRecipient,
  trackingNumber: string,
  carrier: string
): Promise<boolean> {
  const message = SMS_TEMPLATES.shippingUpdate({
    name: recipient.name,
    trackingNumber,
    carrier,
  });
  
  const result = await sendSMS(recipient, message, "transactional");
  return result.success;
}

/**
 * Send territory notification SMS
 */
export async function sendTerritoryNotificationSMS(
  recipient: SMSRecipient,
  territory: string,
  status: "submitted" | "approved" | "rejected",
  reason?: string
): Promise<boolean> {
  let message: string;
  
  switch (status) {
    case "submitted":
      message = SMS_TEMPLATES.territorySubmitted({ name: recipient.name, territory });
      break;
    case "approved":
      message = SMS_TEMPLATES.territoryApproved({ name: recipient.name, territory });
      break;
    case "rejected":
      message = SMS_TEMPLATES.territoryRejected({ name: recipient.name, territory, reason });
      break;
  }
  
  const result = await sendSMS(recipient, message, "transactional");
  return result.success;
}

/**
 * Send referral invite SMS (for sharing with friends)
 */
export async function sendReferralInviteSMS(
  referrerName: string,
  referralCode: string,
  recipientPhone: string
): Promise<boolean> {
  const message = SMS_TEMPLATES.referralInvite({ referrerName, referralCode });
  
  const result = await sendSMS(
    { phone: recipientPhone, name: "Friend" },
    message,
    "promotional"
  );
  
  return result.success;
}

/**
 * Send welcome SMS to new subscriber with their referral code
 */
export async function sendWelcomeSubscriberSMS(
  recipient: SMSRecipient,
  referralCode: string
): Promise<boolean> {
  const message = SMS_TEMPLATES.welcomeSubscriber({
    name: recipient.name,
    referralCode,
  });
  
  const result = await sendSMS(recipient, message, "transactional");
  return result.success;
}

/**
 * Send NFT minted notification SMS
 */
export async function sendNFTMintedSMS(
  recipient: SMSRecipient,
  nftName: string,
  tokenId: string
): Promise<boolean> {
  const message = SMS_TEMPLATES.nftMinted({
    name: recipient.name,
    nftName,
    tokenId,
  });
  
  const result = await sendSMS(recipient, message, "transactional");
  return result.success;
}

/**
 * Send crowdfunding contribution confirmation SMS
 */
export async function sendCrowdfundContributionSMS(
  recipient: SMSRecipient,
  amount: number,
  tier: string
): Promise<boolean> {
  const message = SMS_TEMPLATES.crowdfundContribution({
    name: recipient.name,
    amount,
    tier,
  });
  
  const result = await sendSMS(recipient, message, "transactional");
  return result.success;
}

/**
 * Bulk send promotional SMS (with rate limiting)
 */
export async function sendBulkPromoSMS(
  recipients: SMSRecipient[],
  promoCode: string,
  discount: string,
  batchSize = 10,
  delayMs = 1000
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    const results = await Promise.all(
      batch.map((recipient) =>
        sendSMS(
          recipient,
          SMS_TEMPLATES.promoAlert({
            name: recipient.name,
            promoCode,
            discount,
          }),
          "promotional"
        )
      )
    );
    
    results.forEach((result) => {
      if (result.success) sent++;
      else failed++;
    });
    
    // Rate limiting delay between batches
    if (i + batchSize < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  
  return { sent, failed };
}

// Export templates for use in frontend
export { SMS_TEMPLATES };
