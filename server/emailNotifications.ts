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


/**
 * Send email verification email
 */
export async function sendEmailVerification(data: {
  name: string;
  email: string;
  verificationUrl: string;
  expiresIn: string;
}): Promise<boolean> {
  const template = {
    title: `✉️ Verify Your Email - NEON Energy`,
    content: `
**Email Verification Required**

Hello ${data.name}!

Thank you for signing up as a NEON Distributor! To complete your registration and activate your account, please verify your email address.

**Click the link below to verify your email:**
${data.verificationUrl}

**Important:**
- This link will expire in ${data.expiresIn}
- If you didn't create a NEON account, please ignore this email
- For security, do not share this link with anyone

**What happens after verification:**
1. Your distributor account will be fully activated
2. You'll get access to your personalized distributor website
3. You can start building your team and earning commissions
4. Access to training materials and marketing resources

If the link doesn't work, copy and paste it into your browser.

Need help? Contact our support team.

Best regards,
The NEON Energy Team
    `.trim(),
  };

  // Skip notifications in development/test mode
  if (!NOTIFICATIONS_ENABLED) {
    console.log(`[Email] Skipping email verification (dev mode) for: ${data.email}`);
    console.log(`[Email] Verification URL: ${data.verificationUrl}`);
    return true;
  }

  try {
    const success = await notifyOwner({
      title: template.title,
      content: template.content,
    });

    if (success) {
      console.log(`[Email] Verification email sent to: ${data.email}`);
    } else {
      console.warn(`[Email] Failed to send verification email to: ${data.email}`);
    }

    return success;
  } catch (error) {
    console.error(`[Email] Error sending verification email:`, error);
    return false;
  }
}

/**
 * Send email verification success notification
 */
export async function sendEmailVerificationSuccess(data: {
  name: string;
  email: string;
  distributorCode: string;
  portalUrl: string;
}): Promise<boolean> {
  const template = {
    title: `✅ Email Verified - Welcome to NEON!`,
    content: `
**Email Successfully Verified!**

Hello ${data.name}!

🎉 Congratulations! Your email has been verified and your NEON Distributor account is now fully activated!

**Your Distributor Details:**
- Distributor Code: ${data.distributorCode}
- Email: ${data.email}

**What's Next:**
1. **Access Your Portal:** Visit your distributor dashboard to get started
   ${data.portalUrl}

2. **Customize Your Website:** Upload your photo and personalize your distributor page

3. **Share Your Link:** Start sharing your unique referral link to build your team

4. **Complete Training:** Access our training resources to maximize your success

**Your Personalized Website:**
Your unique distributor website is ready! Share it with friends and family to start earning commissions.

Welcome to the NEON family! We're excited to have you on board.

Best regards,
The NEON Energy Team
    `.trim(),
  };

  // Skip notifications in development/test mode
  if (!NOTIFICATIONS_ENABLED) {
    console.log(`[Email] Skipping verification success email (dev mode) for: ${data.email}`);
    return true;
  }

  try {
    const success = await notifyOwner({
      title: template.title,
      content: template.content,
    });

    if (success) {
      console.log(`[Email] Verification success email sent to: ${data.email}`);
    } else {
      console.warn(`[Email] Failed to send verification success email to: ${data.email}`);
    }

    return success;
  } catch (error) {
    console.error(`[Email] Error sending verification success email:`, error);
    return false;
  }
}


/**
 * MFA Email Notifications
 * Send security-related emails for MFA events
 */

interface MfaEmailData {
  userName: string;
  userEmail: string;
  eventType: 'enabled' | 'disabled' | 'backup_used';
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  backupCodesRemaining?: number;
}

/**
 * Send email when MFA is enabled on an account
 */
export async function sendMfaEnabledEmail(data: {
  userName: string;
  userEmail: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<boolean> {
  try {
    const timestamp = new Date();
    const formattedDate = timestamp.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    const emailHtml = generateEmailTemplate({
      title: '🔐 Two-Factor Authentication Enabled',
      preheader: 'Your account is now more secure with 2FA enabled',
      content: `
        <h2 style="color: #c8ff00; margin-bottom: 16px;">Two-Factor Authentication Enabled</h2>
        <p style="color: #ffffff; font-size: 16px; line-height: 1.6;">
          Hi ${data.userName},
        </p>
        <p style="color: #cccccc; font-size: 15px; line-height: 1.6;">
          Great news! Two-factor authentication (2FA) has been successfully enabled on your NEON Energy account.
          Your account is now protected with an extra layer of security.
        </p>
        
        <div style="background: rgba(200, 255, 0, 0.1); border: 1px solid rgba(200, 255, 0, 0.3); border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #c8ff00; margin: 0 0 12px 0; font-size: 16px;">Security Details</h3>
          <table style="width: 100%; color: #cccccc; font-size: 14px;">
            <tr>
              <td style="padding: 4px 0; color: #888888;">Date & Time:</td>
              <td style="padding: 4px 0;">${formattedDate}</td>
            </tr>
            ${data.ipAddress ? `
            <tr>
              <td style="padding: 4px 0; color: #888888;">IP Address:</td>
              <td style="padding: 4px 0;">${data.ipAddress}</td>
            </tr>
            ` : ''}
            ${data.userAgent ? `
            <tr>
              <td style="padding: 4px 0; color: #888888;">Device:</td>
              <td style="padding: 4px 0;">${data.userAgent.substring(0, 50)}...</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.3); border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="color: #ffc107; margin: 0; font-size: 14px;">
            <strong>⚠️ Important:</strong> Make sure to save your backup codes in a secure location.
            You'll need them if you ever lose access to your authenticator app.
          </p>
        </div>

        <p style="color: #888888; font-size: 13px; margin-top: 24px;">
          If you didn't make this change, please contact our support team immediately and change your password.
        </p>
        
        <div style="text-align: center; margin-top: 24px;">
          <a href="https://neonenergy.com/security" style="display: inline-block; background: #c8ff00; color: #000000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px;">View Security Settings</a>
        </div>
      `
    });

    // Send via notification system
    const success = await notifyOwner({
      title: `🔐 MFA Enabled: ${data.userName}`,
      content: `User ${data.userName} (${data.userEmail}) has enabled two-factor authentication on their account.`
    });

    console.log(`[Email] MFA enabled notification sent for ${data.userEmail}`);
    return success;
  } catch (error) {
    console.error(`[Email] Error sending MFA enabled email:`, error);
    return false;
  }
}

/**
 * Send email when MFA is disabled on an account
 */
export async function sendMfaDisabledEmail(data: {
  userName: string;
  userEmail: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<boolean> {
  try {
    const timestamp = new Date();
    const formattedDate = timestamp.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    const emailHtml = generateEmailTemplate({
      title: '⚠️ Two-Factor Authentication Disabled',
      preheader: 'Your account security settings have changed',
      content: `
        <h2 style="color: #ff6b6b; margin-bottom: 16px;">Two-Factor Authentication Disabled</h2>
        <p style="color: #ffffff; font-size: 16px; line-height: 1.6;">
          Hi ${data.userName},
        </p>
        <p style="color: #cccccc; font-size: 15px; line-height: 1.6;">
          Two-factor authentication (2FA) has been disabled on your NEON Energy account.
          Your account is now less secure without this extra layer of protection.
        </p>
        
        <div style="background: rgba(255, 107, 107, 0.1); border: 1px solid rgba(255, 107, 107, 0.3); border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #ff6b6b; margin: 0 0 12px 0; font-size: 16px;">Security Alert Details</h3>
          <table style="width: 100%; color: #cccccc; font-size: 14px;">
            <tr>
              <td style="padding: 4px 0; color: #888888;">Date & Time:</td>
              <td style="padding: 4px 0;">${formattedDate}</td>
            </tr>
            ${data.ipAddress ? `
            <tr>
              <td style="padding: 4px 0; color: #888888;">IP Address:</td>
              <td style="padding: 4px 0;">${data.ipAddress}</td>
            </tr>
            ` : ''}
            ${data.userAgent ? `
            <tr>
              <td style="padding: 4px 0; color: #888888;">Device:</td>
              <td style="padding: 4px 0;">${data.userAgent.substring(0, 50)}...</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.3); border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="color: #ffc107; margin: 0; font-size: 14px;">
            <strong>🔒 Security Recommendation:</strong> We strongly recommend re-enabling 2FA to protect your account
            from unauthorized access. Without 2FA, your account is more vulnerable to security threats.
          </p>
        </div>

        <p style="color: #ff6b6b; font-size: 14px; font-weight: bold; margin-top: 24px;">
          If you didn't make this change, your account may be compromised. Please:
        </p>
        <ol style="color: #cccccc; font-size: 14px; line-height: 1.8;">
          <li>Change your password immediately</li>
          <li>Re-enable two-factor authentication</li>
          <li>Contact our support team</li>
        </ol>
        
        <div style="text-align: center; margin-top: 24px;">
          <a href="https://neonenergy.com/security" style="display: inline-block; background: #c8ff00; color: #000000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px;">Re-enable 2FA Now</a>
        </div>
      `
    });

    // Send via notification system
    const success = await notifyOwner({
      title: `⚠️ MFA Disabled: ${data.userName}`,
      content: `User ${data.userName} (${data.userEmail}) has disabled two-factor authentication on their account.`
    });

    console.log(`[Email] MFA disabled notification sent for ${data.userEmail}`);
    return success;
  } catch (error) {
    console.error(`[Email] Error sending MFA disabled email:`, error);
    return false;
  }
}

/**
 * Send email when a backup code is used
 */
export async function sendMfaBackupCodeUsedEmail(data: {
  userName: string;
  userEmail: string;
  backupCodesRemaining: number;
  ipAddress?: string;
  userAgent?: string;
}): Promise<boolean> {
  try {
    const timestamp = new Date();
    const formattedDate = timestamp.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    const urgencyLevel = data.backupCodesRemaining <= 2 ? 'high' : data.backupCodesRemaining <= 5 ? 'medium' : 'low';
    const urgencyColor = urgencyLevel === 'high' ? '#ff6b6b' : urgencyLevel === 'medium' ? '#ffc107' : '#c8ff00';

    const emailHtml = generateEmailTemplate({
      title: '🔑 Backup Code Used for Login',
      preheader: `A backup code was used to access your account. ${data.backupCodesRemaining} codes remaining.`,
      content: `
        <h2 style="color: #ffc107; margin-bottom: 16px;">Backup Code Used</h2>
        <p style="color: #ffffff; font-size: 16px; line-height: 1.6;">
          Hi ${data.userName},
        </p>
        <p style="color: #cccccc; font-size: 15px; line-height: 1.6;">
          A backup code was just used to sign in to your NEON Energy account.
          This is a security notification to keep you informed about your account activity.
        </p>
        
        <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.3); border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #ffc107; margin: 0 0 12px 0; font-size: 16px;">Login Details</h3>
          <table style="width: 100%; color: #cccccc; font-size: 14px;">
            <tr>
              <td style="padding: 4px 0; color: #888888;">Date & Time:</td>
              <td style="padding: 4px 0;">${formattedDate}</td>
            </tr>
            ${data.ipAddress ? `
            <tr>
              <td style="padding: 4px 0; color: #888888;">IP Address:</td>
              <td style="padding: 4px 0;">${data.ipAddress}</td>
            </tr>
            ` : ''}
            ${data.userAgent ? `
            <tr>
              <td style="padding: 4px 0; color: #888888;">Device:</td>
              <td style="padding: 4px 0;">${data.userAgent.substring(0, 50)}...</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="background: rgba(${urgencyLevel === 'high' ? '255, 107, 107' : urgencyLevel === 'medium' ? '255, 193, 7' : '200, 255, 0'}, 0.1); border: 1px solid ${urgencyColor}; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
          <p style="color: ${urgencyColor}; margin: 0 0 8px 0; font-size: 24px; font-weight: bold;">
            ${data.backupCodesRemaining}
          </p>
          <p style="color: #cccccc; margin: 0; font-size: 14px;">
            Backup codes remaining
          </p>
          ${data.backupCodesRemaining <= 2 ? `
          <p style="color: #ff6b6b; margin: 8px 0 0 0; font-size: 13px; font-weight: bold;">
            ⚠️ Critical: Generate new backup codes immediately!
          </p>
          ` : data.backupCodesRemaining <= 5 ? `
          <p style="color: #ffc107; margin: 8px 0 0 0; font-size: 13px;">
            Consider generating new backup codes soon.
          </p>
          ` : ''}
        </div>

        <p style="color: #cccccc; font-size: 14px; line-height: 1.6;">
          <strong>Why did this happen?</strong><br>
          Backup codes are used when you can't access your authenticator app. If this wasn't you,
          someone may have access to your backup codes.
        </p>

        <p style="color: #888888; font-size: 13px; margin-top: 24px;">
          If you didn't use a backup code to sign in, please change your password and generate new backup codes immediately.
        </p>
        
        <div style="text-align: center; margin-top: 24px;">
          <a href="https://neonenergy.com/security" style="display: inline-block; background: #c8ff00; color: #000000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px;">Manage Security Settings</a>
        </div>
      `
    });

    // Send via notification system
    const success = await notifyOwner({
      title: `🔑 Backup Code Used: ${data.userName}`,
      content: `User ${data.userName} (${data.userEmail}) used a backup code to log in. ${data.backupCodesRemaining} codes remaining.`
    });

    console.log(`[Email] Backup code used notification sent for ${data.userEmail}`);
    return success;
  } catch (error) {
    console.error(`[Email] Error sending backup code used email:`, error);
    return false;
  }
}

/**
 * Send all MFA-related email notifications
 */
export async function sendMfaNotification(data: MfaEmailData): Promise<boolean> {
  switch (data.eventType) {
    case 'enabled':
      return sendMfaEnabledEmail({
        userName: data.userName,
        userEmail: data.userEmail,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent
      });
    case 'disabled':
      return sendMfaDisabledEmail({
        userName: data.userName,
        userEmail: data.userEmail,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent
      });
    case 'backup_used':
      return sendMfaBackupCodeUsedEmail({
        userName: data.userName,
        userEmail: data.userEmail,
        backupCodesRemaining: data.backupCodesRemaining || 0,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent
      });
    default:
      console.error(`[Email] Unknown MFA event type: ${data.eventType}`);
      return false;
  }
}


// ============ MFA Recovery Email Functions ============

/**
 * Send MFA recovery request email with verification link
 */
export async function sendMfaRecoveryEmail(data: {
  userName: string;
  userEmail: string;
  recoveryToken: string;
  ipAddress?: string;
}): Promise<boolean> {
  try {
    const timestamp = new Date();
    const formattedDate = timestamp.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // Recovery link (frontend will handle this route)
    const recoveryLink = `${process.env.VITE_APP_URL || ''}/mfa-recovery?token=${data.recoveryToken}`;

    const emailHtml = generateEmailTemplate({
      title: '🔐 MFA Account Recovery Request',
      preheader: 'A request was made to recover access to your account.',
      content: `
        <h2 style="color: #ffc107; margin-bottom: 16px;">Account Recovery Request</h2>
        <p style="color: #ffffff; font-size: 16px; line-height: 1.6;">
          Hi ${data.userName},
        </p>
        <p style="color: #cccccc; font-size: 15px; line-height: 1.6;">
          We received a request to recover access to your NEON Energy account. If you lost access to your 
          authenticator app and backup codes, you can use the link below to start the recovery process.
        </p>
        
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border: 1px solid #c8ff00; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <p style="color: #c8ff00; font-size: 14px; margin-bottom: 16px; font-weight: 600;">
            ⚠️ IMPORTANT SECURITY NOTICE
          </p>
          <ul style="color: #cccccc; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>This link expires in <strong style="color: #ffffff;">24 hours</strong></li>
            <li>You will need to verify your identity</li>
            <li>An administrator will review your request</li>
            <li>If you did not request this, please ignore this email</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${recoveryLink}" style="display: inline-block; background: linear-gradient(135deg, #c8ff00 0%, #a8e600 100%); color: #000000; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Start Recovery Process
          </a>
        </div>

        <div style="background: rgba(255, 107, 107, 0.1); border: 1px solid rgba(255, 107, 107, 0.3); border-radius: 8px; padding: 16px; margin-top: 24px;">
          <p style="color: #ff6b6b; font-size: 14px; margin: 0;">
            <strong>Request Details:</strong><br>
            Time: ${formattedDate}<br>
            IP Address: ${data.ipAddress || 'Unknown'}
          </p>
        </div>
      `,
    });

    await notifyOwner({
      title: `MFA Recovery Request - ${data.userEmail}`,
      content: emailHtml,
    });

    console.log(`[Email] MFA recovery email sent to ${data.userEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send MFA recovery email:', error);
    return false;
  }
}

/**
 * Send MFA recovery completion email (approved or rejected)
 */
export async function sendMfaRecoveryCompletedEmail(data: {
  userName: string;
  userEmail: string;
  approved: boolean;
  reason?: string;
}): Promise<boolean> {
  try {
    const statusColor = data.approved ? '#c8ff00' : '#ff6b6b';
    const statusText = data.approved ? 'Approved' : 'Rejected';
    const statusIcon = data.approved ? '✅' : '❌';

    const emailHtml = generateEmailTemplate({
      title: `${statusIcon} MFA Recovery ${statusText}`,
      preheader: `Your account recovery request has been ${statusText.toLowerCase()}.`,
      content: `
        <h2 style="color: ${statusColor}; margin-bottom: 16px;">Recovery Request ${statusText}</h2>
        <p style="color: #ffffff; font-size: 16px; line-height: 1.6;">
          Hi ${data.userName},
        </p>
        
        ${data.approved ? `
          <p style="color: #cccccc; font-size: 15px; line-height: 1.6;">
            Great news! Your account recovery request has been <strong style="color: #c8ff00;">approved</strong>. 
            Two-factor authentication has been disabled on your account.
          </p>
          
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border: 1px solid #c8ff00; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <p style="color: #c8ff00; font-size: 14px; margin-bottom: 16px; font-weight: 600;">
              🔒 RECOMMENDED NEXT STEPS
            </p>
            <ol style="color: #cccccc; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Log in to your account</li>
              <li>Go to Security Settings</li>
              <li>Set up MFA again with a new authenticator app</li>
              <li>Save your new backup codes in a secure location</li>
            </ol>
          </div>
        ` : `
          <p style="color: #cccccc; font-size: 15px; line-height: 1.6;">
            Unfortunately, your account recovery request has been <strong style="color: #ff6b6b;">rejected</strong>.
          </p>
          
          ${data.reason ? `
            <div style="background: rgba(255, 107, 107, 0.1); border: 1px solid rgba(255, 107, 107, 0.3); border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="color: #ff6b6b; font-size: 14px; margin: 0;">
                <strong>Reason:</strong> ${data.reason}
              </p>
            </div>
          ` : ''}
          
          <p style="color: #cccccc; font-size: 15px; line-height: 1.6;">
            If you believe this was a mistake or need further assistance, please contact our support team.
          </p>
        `}
      `,
    });

    await notifyOwner({
      title: `MFA Recovery ${statusText} - ${data.userEmail}`,
      content: emailHtml,
    });

    console.log(`[Email] MFA recovery ${statusText.toLowerCase()} email sent to ${data.userEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send MFA recovery completion email:', error);
    return false;
  }
}


/**
 * Send order confirmation email with NFT preview and SEC disclaimer
 */
export async function sendOrderConfirmationWithNft(data: {
  customerName: string;
  customerEmail: string;
  orderId: number;
  orderNumber: string; // Formatted as 00001, 00002, etc.
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    flavor?: string;
  }>;
  subtotal: number;
  total: number;
  nftImageUrl?: string;
  nftRarity?: string;
  shippingAddress?: string;
}): Promise<boolean> {
  try {
    // Generate items list HTML
    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid rgba(200, 255, 0, 0.1);">
          <span style="color: #ffffff; font-weight: 600;">${item.name}</span>
          ${item.flavor ? `<br><span style="color: #888; font-size: 12px;">Flavor: ${item.flavor}</span>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid rgba(200, 255, 0, 0.1); text-align: center; color: #888;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid rgba(200, 255, 0, 0.1); text-align: right; color: #c8ff00; font-weight: 600;">
          $${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('');

    // NFT preview section
    const nftSection = data.nftImageUrl ? `
      <div style="background: linear-gradient(135deg, rgba(200, 255, 0, 0.1) 0%, rgba(0, 255, 255, 0.05) 100%); border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid rgba(200, 255, 0, 0.3);">
        <h3 style="color: #c8ff00; margin: 0 0 16px 0; font-size: 18px; text-align: center;">
          🎁 Your Exclusive NFT Gift
        </h3>
        <div style="text-align: center; margin-bottom: 16px;">
          <img 
            src="${data.nftImageUrl}" 
            alt="NEON Genesis NFT #${data.orderNumber}" 
            style="max-width: 280px; width: 100%; border-radius: 12px; border: 2px solid rgba(200, 255, 0, 0.5); box-shadow: 0 0 30px rgba(200, 255, 0, 0.2);"
          />
        </div>
        <div style="text-align: center;">
          <p style="color: #ffffff; font-size: 16px; margin: 0 0 8px 0; font-weight: 600;">
            NEON Genesis NFT #${data.orderNumber}
          </p>
          ${data.nftRarity ? `
            <span style="display: inline-block; background: ${getRarityColor(data.nftRarity)}; color: #000; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase;">
              ${data.nftRarity}
            </span>
          ` : ''}
        </div>
        <p style="color: #888; font-size: 13px; text-align: center; margin: 16px 0 0 0; line-height: 1.5;">
          Your unique NFT artwork will be minted after the 90-day pre-launch period when crowdfunding goals are met.
        </p>
      </div>
    ` : '';

    // SEC Disclaimer section
    const secDisclaimer = `
      <div style="background: rgba(255, 107, 107, 0.1); border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid rgba(255, 107, 107, 0.3);">
        <h4 style="color: #ff6b6b; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
          ⚠️ Important NFT Disclosure
        </h4>
        <p style="color: #aaa; font-size: 12px; line-height: 1.6; margin: 0 0 12px 0;">
          <strong style="color: #fff;">NFT Gift Program:</strong> The NFT included with your purchase is a complimentary gift and is NOT a purchase of securities. 
          NEON Corporation does not offer, sell, or promote NFTs as investment vehicles or securities.
        </p>
        <p style="color: #aaa; font-size: 12px; line-height: 1.6; margin: 0 0 12px 0;">
          <strong style="color: #fff;">No Investment Expectation:</strong> NFTs are provided solely as collectible digital art with no expectation of profit, 
          appreciation, or return on investment. Any future value is speculative and not guaranteed.
        </p>
        <p style="color: #aaa; font-size: 12px; line-height: 1.6; margin: 0 0 12px 0;">
          <strong style="color: #fff;">Regulatory Compliance:</strong> If required by applicable law, NEON Corporation will register the NFT Gift Program 
          with the SEC or other regulatory bodies. We are committed to full compliance with all securities and digital asset regulations.
        </p>
        <p style="color: #888; font-size: 11px; line-height: 1.5; margin: 0; font-style: italic;">
          By accepting this NFT gift, you acknowledge that you have read and agree to our 
          <a href="https://neonenergy.com/nft-disclosure" style="color: #c8ff00;">NFT Gift Program Disclosure</a> 
          and <a href="https://neonenergy.com/terms" style="color: #c8ff00;">Terms of Service</a>.
        </p>
      </div>
    `;

    const emailHtml = generateEmailTemplate({
      title: `🎉 Order Confirmed - NEON #${data.orderNumber}`,
      preheader: `Thank you for your NEON pre-order! Your exclusive NFT is being prepared.`,
      content: `
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #c8ff00 0%, #00ffff 100%); padding: 3px; border-radius: 50%;">
            <div style="background: #0a1a1a; border-radius: 50%; padding: 16px;">
              <span style="font-size: 48px;">✓</span>
            </div>
          </div>
          <h1 style="color: #c8ff00; font-size: 28px; margin: 16px 0 8px 0;">Order Confirmed!</h1>
          <p style="color: #888; font-size: 14px; margin: 0;">Order #${data.orderNumber}</p>
        </div>

        <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Hello <strong>${data.customerName}</strong>,
        </p>
        
        <p style="color: #aaa; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Thank you for your NEON Energy pre-order! We're thrilled to have you join the NEON revolution. 
          Your order has been confirmed and you'll receive updates as we prepare for shipping.
        </p>

        <!-- Order Details -->
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid rgba(255, 255, 255, 0.1);">
          <h3 style="color: #c8ff00; margin: 0 0 16px 0; font-size: 16px;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="padding: 12px; text-align: left; color: #888; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid rgba(200, 255, 0, 0.2);">Item</th>
                <th style="padding: 12px; text-align: center; color: #888; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid rgba(200, 255, 0, 0.2);">Qty</th>
                <th style="padding: 12px; text-align: right; color: #888; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid rgba(200, 255, 0, 0.2);">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 16px 12px 8px; text-align: right; color: #888;">Subtotal:</td>
                <td style="padding: 16px 12px 8px; text-align: right; color: #fff;">$${data.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 8px 12px; text-align: right; color: #c8ff00; font-weight: 700; font-size: 18px;">Total:</td>
                <td style="padding: 8px 12px; text-align: right; color: #c8ff00; font-weight: 700; font-size: 18px;">$${data.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        ${data.shippingAddress ? `
        <!-- Shipping Address -->
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid rgba(255, 255, 255, 0.1);">
          <h3 style="color: #c8ff00; margin: 0 0 12px 0; font-size: 16px;">📦 Shipping Address</h3>
          <p style="color: #fff; margin: 0; line-height: 1.6;">${data.shippingAddress.replace(/\n/g, '<br>')}</p>
        </div>
        ` : ''}

        <!-- NFT Preview -->
        ${nftSection}

        <!-- Pre-Order Timeline -->
        <div style="background: rgba(0, 255, 255, 0.05); border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid rgba(0, 255, 255, 0.2);">
          <h3 style="color: #00ffff; margin: 0 0 16px 0; font-size: 16px;">📅 What Happens Next</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <div style="width: 24px; height: 24px; background: #c8ff00; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span style="color: #000; font-size: 12px; font-weight: 700;">1</span>
              </div>
              <div>
                <p style="color: #fff; margin: 0 0 4px 0; font-weight: 600;">Order Confirmed</p>
                <p style="color: #888; margin: 0; font-size: 13px;">Your pre-order is secured at early bird pricing</p>
              </div>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <div style="width: 24px; height: 24px; background: rgba(200, 255, 0, 0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span style="color: #c8ff00; font-size: 12px; font-weight: 700;">2</span>
              </div>
              <div>
                <p style="color: #fff; margin: 0 0 4px 0; font-weight: 600;">Production Phase</p>
                <p style="color: #888; margin: 0; font-size: 13px;">Once crowdfunding goals are met, production begins</p>
              </div>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <div style="width: 24px; height: 24px; background: rgba(200, 255, 0, 0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span style="color: #c8ff00; font-size: 12px; font-weight: 700;">3</span>
              </div>
              <div>
                <p style="color: #fff; margin: 0 0 4px 0; font-weight: 600;">Shipping Begins</p>
                <p style="color: #888; margin: 0; font-size: 13px;">Orders ship after the 90-day pre-launch period</p>
              </div>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <div style="width: 24px; height: 24px; background: rgba(200, 255, 0, 0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span style="color: #c8ff00; font-size: 12px; font-weight: 700;">4</span>
              </div>
              <div>
                <p style="color: #fff; margin: 0 0 4px 0; font-weight: 600;">NFT Minting</p>
                <p style="color: #888; margin: 0; font-size: 13px;">Your exclusive NFT is minted and delivered to your account</p>
              </div>
            </div>
          </div>
        </div>

        <!-- SEC Disclaimer -->
        ${secDisclaimer}

        <!-- CTA - Track Order Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://neonenergy.com/track-order?order=NEON-${data.orderNumber}" style="display: inline-block; background: linear-gradient(135deg, #c8ff00 0%, #a8d600 100%); color: #000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 4px 15px rgba(200, 255, 0, 0.3);">
            📦 Track Your Order
          </a>
          <p style="color: #666; font-size: 12px; margin-top: 12px;">
            Or visit: <a href="https://neonenergy.com/track-order" style="color: #c8ff00;">neonenergy.com/track-order</a> and enter order #NEON-${data.orderNumber}
          </p>
        </div>

        <p style="color: #888; font-size: 14px; line-height: 1.6; text-align: center;">
          Questions about your order? Contact us at <a href="mailto:support@neonenergy.com" style="color: #c8ff00;">support@neonenergy.com</a>
        </p>
      `
    });

    // Send via notification service
    await notifyOwner({
      title: `New Order #${data.orderNumber} - $${data.total.toFixed(2)}`,
      content: `Customer: ${data.customerName} (${data.customerEmail})\nItems: ${data.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}\nTotal: $${data.total.toFixed(2)}`
    });

    console.log(`[Email] Order confirmation with NFT sent to ${data.customerEmail} for order #${data.orderNumber}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send order confirmation with NFT:', error);
    return false;
  }
}

// Helper function for NFT rarity colors
function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    'Common': '#9ca3af',
    'Uncommon': '#22c55e',
    'Rare': '#3b82f6',
    'Epic': '#a855f7',
    'Legendary': '#f59e0b',
    'Mythic': '#ef4444',
  };
  return colors[rarity] || '#c8ff00';
}


/**
 * Send order status change notification email
 * Triggered when order status changes (shipped, delivered, etc.)
 */
export async function sendOrderStatusChangeEmail(data: {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  previousStatus: string;
  newStatus: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  trackingUrl?: string;
  nftImageUrl?: string;
}): Promise<boolean> {
  const statusMessages: Record<string, { title: string; message: string; icon: string }> = {
    'processing': {
      title: 'Your Order is Being Processed',
      message: 'Great news! We\'ve started processing your NEON Energy order. Our team is preparing your items for shipment.',
      icon: '⚙️',
    },
    'shipped': {
      title: 'Your Order Has Shipped!',
      message: 'Your NEON Energy order is on its way! Track your package using the tracking information below.',
      icon: '📦',
    },
    'in_transit': {
      title: 'Your Order is In Transit',
      message: 'Your NEON Energy package is making its way to you. Check the tracking link for real-time updates.',
      icon: '🚚',
    },
    'out_for_delivery': {
      title: 'Out for Delivery Today!',
      message: 'Exciting news! Your NEON Energy order is out for delivery and should arrive today.',
      icon: '🎉',
    },
    'delivered': {
      title: 'Your Order Has Been Delivered!',
      message: 'Your NEON Energy order has been delivered. We hope you enjoy your purchase!',
      icon: '✅',
    },
    'cancelled': {
      title: 'Order Cancelled',
      message: 'Your NEON Energy order has been cancelled. If you have any questions, please contact our support team.',
      icon: '❌',
    },
  };

  const statusInfo = statusMessages[data.newStatus] || {
    title: `Order Status Update: ${data.newStatus}`,
    message: `Your order status has been updated to: ${data.newStatus}`,
    icon: '📋',
  };

  const trackingSection = data.trackingNumber && data.carrier ? `
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid rgba(200, 255, 0, 0.2);">
      <h3 style="color: #c8ff00; margin: 0 0 16px 0; font-size: 18px;">📍 Tracking Information</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #9ca3af; font-size: 14px;">Carrier:</td>
          <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 600;">${data.carrier}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #9ca3af; font-size: 14px;">Tracking Number:</td>
          <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-family: monospace;">${data.trackingNumber}</td>
        </tr>
        ${data.estimatedDelivery ? `
        <tr>
          <td style="padding: 8px 0; color: #9ca3af; font-size: 14px;">Estimated Delivery:</td>
          <td style="padding: 8px 0; color: #c8ff00; font-size: 14px; font-weight: 600;">${data.estimatedDelivery}</td>
        </tr>
        ` : ''}
      </table>
      ${data.trackingUrl ? `
      <div style="margin-top: 16px; text-align: center;">
        <a href="${data.trackingUrl}" style="display: inline-block; background: linear-gradient(135deg, #c8ff00 0%, #a8e600 100%); color: #0a0a0a; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">
          Track Your Package →
        </a>
      </div>
      ` : ''}
    </div>
  ` : '';

  const nftSection = data.nftImageUrl ? `
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid rgba(200, 255, 0, 0.2); text-align: center;">
      <h3 style="color: #c8ff00; margin: 0 0 16px 0; font-size: 18px;">🎨 Your Exclusive NFT</h3>
      <img src="${data.nftImageUrl}" alt="Your NEON NFT" style="max-width: 200px; border-radius: 12px; border: 2px solid #c8ff00; margin-bottom: 12px;" />
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        Your unique NFT will be minted after the pre-launch period
      </p>
    </div>
  ` : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${statusInfo.title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #c8ff00; font-size: 32px; margin: 0; text-shadow: 0 0 20px rgba(200, 255, 0, 0.5);">
            ⚡ NEON ENERGY
          </h1>
        </div>

        <!-- Status Icon -->
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 64px;">${statusInfo.icon}</span>
        </div>

        <!-- Main Content -->
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 32px; border: 1px solid rgba(200, 255, 0, 0.3);">
          <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0; text-align: center;">
            ${statusInfo.title}
          </h2>
          
          <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
            Hi ${data.customerName},<br><br>
            ${statusInfo.message}
          </p>

          <!-- Order Number -->
          <div style="background: rgba(200, 255, 0, 0.1); border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
            <span style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order Number</span>
            <p style="color: #c8ff00; font-size: 24px; font-weight: 700; margin: 8px 0 0 0; font-family: monospace;">
              ${data.orderNumber}
            </p>
          </div>

          ${trackingSection}
          ${nftSection}

          <!-- Track Order Button -->
          <div style="text-align: center; margin-top: 24px;">
            <a href="https://neon-energy.manus.space/track-order?order=${encodeURIComponent(data.orderNumber)}" style="display: inline-block; background: linear-gradient(135deg, #c8ff00 0%, #a8e600 100%); color: #0a0a0a; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 4px 20px rgba(200, 255, 0, 0.3);">
              View Order Details
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(200, 255, 0, 0.2);">
          <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">
            Questions? Contact us at support@neonenergy.com
          </p>
          <p style="color: #4b5563; font-size: 11px; margin: 0;">
            © 2025 NEON Energy. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await notifyOwner({
      title: `Order ${data.orderNumber} - ${statusInfo.title}`,
      content: `Customer: ${data.customerName} (${data.customerEmail})\nStatus: ${data.previousStatus} → ${data.newStatus}${data.trackingNumber ? `\nTracking: ${data.trackingNumber}` : ''}`,
    });
    
    console.log(`[Email] Order status change notification sent to ${data.customerEmail}: ${data.newStatus}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send order status change notification:', error);
    return false;
  }
}

/**
 * Send delivery confirmation email with review request
 */
export async function sendDeliveryConfirmationEmail(data: {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  deliveredAt: Date;
  nftImageUrl?: string;
}): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your NEON Order Has Arrived!</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #c8ff00; font-size: 32px; margin: 0; text-shadow: 0 0 20px rgba(200, 255, 0, 0.5);">
            ⚡ NEON ENERGY
          </h1>
        </div>

        <!-- Celebration Icon -->
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 80px;">🎉</span>
        </div>

        <!-- Main Content -->
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 32px; border: 1px solid rgba(200, 255, 0, 0.3);">
          <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0; text-align: center;">
            Your Order Has Arrived!
          </h2>
          
          <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
            Hi ${data.customerName},<br><br>
            Great news! Your NEON Energy order <strong style="color: #c8ff00;">${data.orderNumber}</strong> has been delivered.
          </p>

          <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="color: #22c55e; font-size: 14px;">✓ Delivered on ${data.deliveredAt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          ${data.nftImageUrl ? `
          <div style="text-align: center; margin-bottom: 24px;">
            <h3 style="color: #c8ff00; margin: 0 0 16px 0; font-size: 18px;">🎨 Your Exclusive NFT</h3>
            <img src="${data.nftImageUrl}" alt="Your NEON NFT" style="max-width: 200px; border-radius: 12px; border: 2px solid #c8ff00;" />
            <p style="color: #9ca3af; font-size: 12px; margin: 12px 0 0 0;">
              NFT minting begins after the pre-launch period ends
            </p>
          </div>
          ` : ''}

          <!-- CTA Buttons -->
          <div style="text-align: center; margin-top: 24px;">
            <a href="https://neon-energy.manus.space/my-orders" style="display: inline-block; background: linear-gradient(135deg, #c8ff00 0%, #a8e600 100%); color: #0a0a0a; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; margin: 0 8px 12px 8px;">
              View My Orders
            </a>
            <a href="https://neon-energy.manus.space/shop" style="display: inline-block; background: transparent; color: #c8ff00; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; border: 2px solid #c8ff00; margin: 0 8px 12px 8px;">
              Shop Again
            </a>
          </div>
        </div>

        <!-- Share Section -->
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 24px; margin-top: 24px; text-align: center; border: 1px solid rgba(200, 255, 0, 0.2);">
          <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 12px 0;">Share Your NEON Experience</h3>
          <p style="color: #9ca3af; font-size: 14px; margin: 0 0 16px 0;">
            Love your NEON Energy? Share it with friends!
          </p>
          <div>
            <a href="https://twitter.com/intent/tweet?text=Just%20received%20my%20NEON%20Energy%20order!%20⚡%20%23NEONEnergy%20%23EnergyDrink" style="display: inline-block; background: #1da1f2; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 12px; margin: 4px;">Twitter</a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=https://neon-energy.manus.space" style="display: inline-block; background: #4267b2; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 12px; margin: 4px;">Facebook</a>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(200, 255, 0, 0.2);">
          <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">
            Questions? Contact us at support@neonenergy.com
          </p>
          <p style="color: #4b5563; font-size: 11px; margin: 0;">
            © 2025 NEON Energy. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await notifyOwner({
      title: `Order ${data.orderNumber} Delivered`,
      content: `Customer: ${data.customerName} (${data.customerEmail})\nDelivered: ${data.deliveredAt.toISOString()}`,
    });
    
    console.log(`[Email] Delivery confirmation sent to ${data.customerEmail}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send delivery confirmation:', error);
    return false;
  }
}
