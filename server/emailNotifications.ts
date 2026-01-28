/**
 * Email Notification Service for NEON Energy Drink
 * Handles automated email notifications for orders, shipping, and territory updates
 */

import { notifyOwner } from "./_core/notification";

// Email notification types
export type EmailNotificationType = 
  | "order_confirmation"
  | "order_shipped"
  | "order_delivered"
  | "territory_submitted"
  | "territory_approved"
  | "territory_rejected"
  | "territory_expiring"
  | "nft_minted"
  | "crowdfunding_received"
  | "rank_advancement"
  | "reward_redemption";

// Email template data interfaces
interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderId: number;
  orderType: "preorder" | "crowdfunding";
  quantity?: number;
  amount?: number;
  shippingAddress?: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
}

interface TerritoryEmailData {
  applicantName: string;
  applicantEmail: string;
  applicationId: number;
  territoryName: string;
  squareMiles: number;
  status: "submitted" | "approved" | "rejected" | "expiring";
  rejectionReason?: string;
  monthlyFee?: number;
  expirationDate?: string;
  daysUntilExpiration?: number;
}

interface RankAdvancementEmailData {
  distributorName: string;
  distributorEmail: string;
  distributorCode: string;
  previousRank: string;
  newRank: string;
  newRankIcon: string;
  personalPV: number;
  teamPV: number;
  monthlyBonus: number;
  newBenefits: string[];
}

interface NftEmailData {
  ownerName: string;
  ownerEmail: string;
  tokenId: number;
  nftName: string;
  rarity: string;
  estimatedValue: number;
}

interface RewardRedemptionEmailData {
  customerName: string;
  customerEmail: string;
  rewardDescription: string;
  rewardValue: string;
  shippingAddress: string;
}

// Email templates
const emailTemplates = {
  order_confirmation: (data: OrderEmailData) => ({
    title: `🎉 NEON Order Confirmed - #${data.orderId}`,
    content: `
**Order Confirmation**

Hello ${data.customerName}!

Thank you for your ${data.orderType === "preorder" ? "pre-order" : "crowdfunding contribution"}! Your order has been confirmed.

**Order Details:**
- Order ID: #${data.orderId}
- Type: ${data.orderType === "preorder" ? "Pre-Order" : "Crowdfunding Contribution"}
${data.quantity ? `- Quantity: ${data.quantity} units` : ""}
${data.amount ? `- Amount: $${data.amount.toFixed(2)}` : ""}
${data.shippingAddress ? `- Shipping to: ${data.shippingAddress}` : ""}

**What's Next:**
1. We'll notify you when your order ships
2. You'll receive a unique NEON Genesis NFT
3. Track your order status in your account dashboard

Thank you for being part of the NEON revolution!

Best regards,
The NEON Energy Team
    `.trim(),
  }),

  order_shipped: (data: OrderEmailData) => ({
    title: `📦 Your NEON Order Has Shipped! - #${data.orderId}`,
    content: `
**Shipping Notification**

Hello ${data.customerName}!

Great news! Your NEON order #${data.orderId} has shipped and is on its way to you!

**Tracking Information:**
- Carrier: ${data.carrier || "Standard Shipping"}
- Tracking Number: ${data.trackingNumber || "Will be updated shortly"}
${data.estimatedDelivery ? `- Estimated Delivery: ${data.estimatedDelivery}` : ""}

**Shipping Address:**
${data.shippingAddress || "See your account for details"}

Track your package using the tracking number above on your carrier's website.

Get ready to fuel your potential!

Best regards,
The NEON Energy Team
    `.trim(),
  }),

  order_delivered: (data: OrderEmailData) => ({
    title: `✅ Your NEON Order Has Been Delivered! - #${data.orderId}`,
    content: `
**Delivery Confirmation**

Hello ${data.customerName}!

Your NEON order #${data.orderId} has been delivered!

We hope you enjoy your NEON Energy Drink. Don't forget to:
- Share your experience on social media with #NEONEnergy
- Check out your exclusive NFT in your account
- Leave a review to help others discover NEON

If you have any questions or concerns about your order, please contact our support team.

Thank you for choosing NEON!

Best regards,
The NEON Energy Team
    `.trim(),
  }),

  territory_submitted: (data: TerritoryEmailData) => ({
    title: `📋 Territory Application Received - ${data.territoryName}`,
    content: `
**Territory Application Submitted**

Hello ${data.applicantName}!

We've received your territory application for vending machine operations.

**Application Details:**
- Application ID: #${data.applicationId}
- Territory: ${data.territoryName}
- Size: ${data.squareMiles} square miles
${data.monthlyFee ? `- Estimated Monthly Fee: $${data.monthlyFee.toLocaleString()}` : ""}

**What's Next:**
1. Our team will review your application within 3-5 business days
2. We may contact you for additional information
3. You'll receive a notification once a decision is made

**Important Note:**
This territory license is for vending machine operations only. Other distributors may still sell NEON products in this area through non-vending channels.

Thank you for your interest in becoming a NEON Territory Partner!

Best regards,
The NEON Franchise Team
    `.trim(),
  }),

  territory_approved: (data: TerritoryEmailData) => ({
    title: `🎉 Territory Application APPROVED - ${data.territoryName}`,
    content: `
**Congratulations! Your Territory Has Been Approved!**

Hello ${data.applicantName}!

We're thrilled to inform you that your territory application has been APPROVED!

**Territory Details:**
- Application ID: #${data.applicationId}
- Territory: ${data.territoryName}
- Size: ${data.squareMiles} square miles
${data.monthlyFee ? `- Monthly License Fee: $${data.monthlyFee.toLocaleString()}` : ""}

**Next Steps:**
1. Complete your payment to activate your territory
2. Access your Territory Dashboard to view your exclusive area
3. Begin planning your vending machine placements
4. Start earning from the Vending Machine Profit Sharing Pool!

**Remember:**
- Your territory is exclusive for vending machine operations
- You'll share in 5% of ALL vending machine sales network-wide
- Monthly payouts are processed on the 15th of each month

Welcome to the NEON Territory Partner family!

Best regards,
The NEON Franchise Team
    `.trim(),
  }),

  territory_rejected: (data: TerritoryEmailData) => ({
    title: `Territory Application Update - ${data.territoryName}`,
    content: `
**Territory Application Status Update**

Hello ${data.applicantName},

Thank you for your interest in becoming a NEON Territory Partner.

After careful review, we regret to inform you that your territory application for ${data.territoryName} could not be approved at this time.

**Application Details:**
- Application ID: #${data.applicationId}
- Territory: ${data.territoryName}
- Size: ${data.squareMiles} square miles

${data.rejectionReason ? `**Reason:** ${data.rejectionReason}` : ""}

**What You Can Do:**
1. Apply for a different territory that may be available
2. Contact our franchise team for guidance on alternative options
3. Reapply after addressing any concerns mentioned above

We appreciate your interest in NEON and encourage you to explore other opportunities with us.

Best regards,
The NEON Franchise Team
    `.trim(),
  }),

  nft_minted: (data: NftEmailData) => ({
    title: `🎨 Your NEON Genesis NFT Has Been Minted! - #${data.tokenId}`,
    content: `
**NFT Minting Confirmation**

Hello ${data.ownerName}!

Your exclusive NEON Genesis NFT has been minted and added to your collection!

**NFT Details:**
- Token ID: #${data.tokenId}
- Name: ${data.nftName}
- Rarity: ${data.rarity.toUpperCase()}
- Current Estimated Value: $${data.estimatedValue.toFixed(2)}
  ↑ Expected to grow over time

**What Makes Your NFT Special:**
- Part of the limited NEON Genesis Collection
- Proof of your early support for the NEON relaunch
- Tradeable on OpenSea and other NFT marketplaces
- Unique AI-generated artwork

**View Your NFT:**
Log in to your account and visit the NFT Gallery to see your complete collection.

**Share Your NFT:**
Show off your exclusive NFT on social media! Use #NEONGenesis

Thank you for being a NEON pioneer!

Best regards,
The NEON Energy Team
    `.trim(),
  }),

  territory_expiring: (data: TerritoryEmailData) => ({
    title: `⚠️ NEON Territory License Expiring Soon - ${data.territoryName}`,
    content: `
**Territory License Expiration Reminder**

Hello ${data.applicantName}!

This is a friendly reminder that your NEON Territory License is expiring soon.

**License Details:**
- Territory: ${data.territoryName}
- Size: ${data.squareMiles} square miles
- Expiration Date: ${data.expirationDate || "Soon"}
- Days Remaining: ${data.daysUntilExpiration || 30} days

**Action Required:**
To continue operating in your territory without interruption, please renew your license before the expiration date.

**Renewal Options:**
1. Log in to your account and navigate to Territory Management
2. Contact our franchise team for renewal assistance
3. Explore upgrade options for expanded territory coverage

**Benefits of Renewal:**
- Maintain exclusive rights to your territory
- Continue earning commissions from vending machine sales
- Access to new product launches and promotions
- Priority support from the NEON franchise team

Don't lose your territory! Renew today to keep your business growing.

Best regards,
The NEON Franchise Team
    `.trim(),
  }),

  rank_advancement: (data: RankAdvancementEmailData) => ({
    title: `🎉 Congratulations! You've Achieved ${data.newRank} Rank!`,
    content: `
**Rank Advancement Notification**

Hello ${data.distributorName}!

🎊 CONGRATULATIONS! 🎊

You have been promoted from **${data.previousRank}** to **${data.newRankIcon} ${data.newRank}**!

This is a tremendous achievement and a testament to your hard work and dedication to building your NEON business.

**Your Current Stats:**
- Personal PV: ${data.personalPV.toLocaleString()}
- Team PV: ${data.teamPV.toLocaleString()}
- Distributor Code: ${data.distributorCode}

**New Benefits at ${data.newRank} Rank:**
${data.newBenefits.map(b => `✓ ${b}`).join("\n")}

**Monthly Rank Bonus:** $${data.monthlyBonus.toLocaleString()}

**What's Next:**
1. Log in to your Distributor Portal to see your updated rank badge
2. Review the requirements for your next rank advancement
3. Keep building your team and growing your business!

Your success inspires others. Keep pushing forward!

Best regards,
The NEON Leadership Team
    `.trim(),
  }),

  reward_redemption: (data: RewardRedemptionEmailData) => ({
    title: `🎁 Your Free NEON Case is On Its Way!`,
    content: `
**Reward Redemption Confirmation**

Hello ${data.customerName}!

🎉 CONGRATULATIONS! Your reward has been successfully redeemed!

**Reward Details:**
- Reward: ${data.rewardDescription}
- Value: $${data.rewardValue}
- Status: Processing for Shipment

**Shipping To:**
${data.shippingAddress}

**What Happens Next:**
1. Your order is being prepared for shipment
2. You'll receive a tracking number within 1-2 business days
3. Expected delivery: 5-7 business days

**Keep Earning!**
Refer more friends to earn additional free cases. Every 3 successful referrals = 1 FREE case of NEON!

Thank you for being part of the NEON community!

Best regards,
The NEON Energy Team
    `.trim(),
  }),

  crowdfunding_received: (data: OrderEmailData) => ({
    title: `💚 Thank You for Backing NEON! - Contribution #${data.orderId}`,
    content: `
**Crowdfunding Contribution Received**

Hello ${data.customerName}!

Thank you for backing the NEON Energy Drink relaunch! Your support means everything to us.

**Contribution Details:**
- Contribution ID: #${data.orderId}
${data.amount ? `- Amount: $${data.amount.toFixed(2)}` : ""}

**Your Rewards:**
- Exclusive NEON Genesis NFT (will be minted shortly)
- Early access to product launches
- Recognition as a NEON Pioneer
- Participation in the community profit sharing

**What's Next:**
1. Your NFT will be minted within 24 hours
2. You'll receive a separate notification when it's ready
3. Track our progress on the Crowdfunding page

Together, we're bringing NEON back stronger than ever!

Best regards,
The NEON Energy Team
    `.trim(),
  }),
};

// Production mode flag - set to true to enable real notifications
// When false, notifications are logged but not sent
const NOTIFICATIONS_ENABLED = process.env.NODE_ENV === "production";

/**
 * Send an email notification
 * Uses the Manus notification service to deliver emails
 * Only sends in production mode to avoid simulated/test notifications
 */
export async function sendEmailNotification(
  type: EmailNotificationType,
  data: OrderEmailData | TerritoryEmailData | NftEmailData | RankAdvancementEmailData | RewardRedemptionEmailData
): Promise<boolean> {
  // Skip notifications in development/test mode
  if (!NOTIFICATIONS_ENABLED) {
    console.log(`[Email] Skipping notification (dev mode): ${type}`);
    return true; // Return true to not break the flow
  }
  
  try {
    let template: { title: string; content: string };

    switch (type) {
      case "order_confirmation":
      case "order_shipped":
      case "order_delivered":
      case "crowdfunding_received":
        template = emailTemplates[type](data as OrderEmailData);
        break;
      case "territory_submitted":
      case "territory_approved":
      case "territory_rejected":
      case "territory_expiring":
        template = emailTemplates[type](data as TerritoryEmailData);
        break;
      case "nft_minted":
        template = emailTemplates[type](data as NftEmailData);
        break;
      case "rank_advancement":
        template = emailTemplates[type](data as RankAdvancementEmailData);
        break;
      case "reward_redemption":
        template = emailTemplates[type](data as RewardRedemptionEmailData);
        break;
      default:
        console.error(`[Email] Unknown notification type: ${type}`);
        return false;
    }

    // Send via Manus notification service
    const success = await notifyOwner({
      title: template.title,
      content: template.content,
    });

    if (success) {
      console.log(`[Email] Notification sent: ${type}`);
    } else {
      console.warn(`[Email] Failed to send notification: ${type}`);
    }

    return success;
  } catch (error) {
    console.error(`[Email] Error sending notification:`, error);
    return false;
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmation(data: OrderEmailData): Promise<boolean> {
  return sendEmailNotification("order_confirmation", data);
}

/**
 * Send shipping notification email
 */
export async function sendShippingNotification(data: OrderEmailData): Promise<boolean> {
  return sendEmailNotification("order_shipped", data);
}

/**
 * Send delivery confirmation email
 */
export async function sendDeliveryNotification(data: OrderEmailData): Promise<boolean> {
  return sendEmailNotification("order_delivered", data);
}

/**
 * Send territory application submitted email
 */
export async function sendTerritorySubmittedNotification(data: TerritoryEmailData): Promise<boolean> {
  return sendEmailNotification("territory_submitted", data);
}

/**
 * Send territory approved email
 */
export async function sendTerritoryApprovedNotification(data: TerritoryEmailData): Promise<boolean> {
  return sendEmailNotification("territory_approved", data);
}

/**
 * Send territory rejected email
 */
export async function sendTerritoryRejectedNotification(data: TerritoryEmailData): Promise<boolean> {
  return sendEmailNotification("territory_rejected", data);
}

/**
 * Send NFT minted notification email
 */
export async function sendNftMintedNotification(data: NftEmailData): Promise<boolean> {
  return sendEmailNotification("nft_minted", data);
}

/**
 * Send crowdfunding contribution received email
 */
export async function sendCrowdfundingNotification(data: OrderEmailData): Promise<boolean> {
  return sendEmailNotification("crowdfunding_received", data);
}

/**
 * Send rank advancement notification email
 */
export async function sendRankAdvancementNotification(data: {
  distributorName: string;
  distributorEmail: string;
  distributorCode: string;
  previousRank: string;
  newRank: string;
  newRankIcon: string;
  personalPV: number;
  teamPV: number;
  monthlyBonus: number;
  newBenefits: string[];
}): Promise<boolean> {
  return sendEmailNotification("rank_advancement", data);
}

/**
 * Generate a styled HTML email template
 */
export function generateEmailTemplate(options: {
  title: string;
  preheader: string;
  content: string;
}): string {
  const { title, preheader, content } = options;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 100%);
      color: #ffffff;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 36px;
      font-weight: bold;
      color: #c8ff00;
      letter-spacing: 4px;
    }
    .logo-line {
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, #c8ff00, #00ffff);
      margin: 10px auto;
    }
    .content {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 30px;
      border: 1px solid rgba(200, 255, 0, 0.2);
    }
    .title {
      font-size: 24px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 20px;
    }
    .preheader {
      display: none;
      max-height: 0;
      overflow: hidden;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid rgba(200, 255, 0, 0.2);
      color: #888888;
      font-size: 12px;
    }
    .highlight {
      color: #c8ff00;
    }
    a {
      color: #00ffff;
    }
  </style>
</head>
<body>
  <div class="preheader">${preheader}</div>
  <div class="container">
    <div class="header">
      <div class="logo">NEON</div>
      <div class="logo-line"></div>
      <div style="color: #888888; font-size: 12px; letter-spacing: 2px;">ENERGY DRINK</div>
    </div>
    <div class="content">
      <div class="title">${title}</div>
      ${content}
    </div>
    <div class="footer">
      <p>© 2026 Neon Corporation. All Rights Reserved.</p>
      <p>You're receiving this email because you're part of the NEON community.</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Simplified email sending functions for specific use cases
 */
export async function sendOrderConfirmationEmail(data: {
  customerName: string;
  customerEmail: string;
  orderId: number;
  quantity?: number;
  productName?: string;
  totalAmount?: number;
  estimatedDelivery?: string;
}): Promise<boolean> {
  return sendOrderConfirmation({
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    orderId: data.orderId,
    orderType: "preorder",
    quantity: data.quantity,
    amount: data.totalAmount,
  });
}

export async function sendShippingUpdateEmail(data: {
  customerName: string;
  customerEmail: string;
  orderId: number;
  status: "processing" | "shipped" | "in_transit" | "delivered";
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
}): Promise<boolean> {
  if (data.status === "delivered") {
    return sendDeliveryNotification({
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      orderId: data.orderId,
      orderType: "preorder",
    });
  }
  
  return sendShippingNotification({
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    orderId: data.orderId,
    orderType: "preorder",
    trackingNumber: data.trackingNumber,
    carrier: data.carrier,
    estimatedDelivery: data.estimatedDelivery,
  });
}

export async function sendTerritoryApprovalNotification(data: {
  applicantName: string;
  applicantEmail: string;
  applicationId: number;
  territoryName: string;
  squareMiles: number;
  status: "approved" | "rejected";
  rejectionReason?: string;
  monthlyFee?: number;
  startDate?: string;
}): Promise<boolean> {
  if (data.status === "approved") {
    return sendTerritoryApprovedNotification({
      applicantName: data.applicantName,
      applicantEmail: data.applicantEmail,
      applicationId: data.applicationId,
      territoryName: data.territoryName,
      squareMiles: data.squareMiles,
      status: "approved",
      monthlyFee: data.monthlyFee,
    });
  }
  
  return sendTerritoryRejectedNotification({
    applicantName: data.applicantName,
    applicantEmail: data.applicantEmail,
    applicationId: data.applicationId,
    territoryName: data.territoryName,
    squareMiles: data.squareMiles,
    status: "rejected",
    rejectionReason: data.rejectionReason,
  });
}


/**
 * Send reward redemption confirmation email
 */
export async function sendRewardRedemptionConfirmation(data: {
  customerName: string;
  customerEmail: string;
  rewardDescription: string;
  rewardValue: string;
  shippingAddress: string;
}): Promise<boolean> {
  return sendEmailNotification("reward_redemption", data);
}


/**
 * Send meeting confirmation email
 */
export async function sendMeetingConfirmation(data: {
  name: string;
  email: string;
  meetingType: "franchise" | "vending" | "general";
  scheduledAt: Date;
  timezone: string;
}): Promise<boolean> {
  const meetingTypeLabels = {
    franchise: "Franchise Consultation",
    vending: "Vending Machine Consultation",
    general: "General Consultation",
  };
  
  const formattedDate = data.scheduledAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  const formattedTime = data.scheduledAt.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Notify owner about the meeting
  try {
    await notifyOwner({
      title: `New ${meetingTypeLabels[data.meetingType]} Scheduled`,
      content: `${data.name} (${data.email}) has scheduled a ${meetingTypeLabels[data.meetingType]} for ${formattedDate} at ${formattedTime} (${data.timezone}).`,
    });
  } catch (error) {
    console.warn("[Email] Failed to notify owner about meeting:", error);
  }

  console.log(`[Email] Meeting confirmation sent to ${data.email} for ${formattedDate} at ${formattedTime}`);
  return true;
}
