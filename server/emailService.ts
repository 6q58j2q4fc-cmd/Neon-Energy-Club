/**
 * Email Service for NEON Energy
 * Sends automated notifications for orders, referrals, and crowdfunding milestones
 */

import { notifyOwner } from "./_core/notification";

// Email templates with NEON branding
const EMAIL_TEMPLATES = {
  orderConfirmation: (data: {
    customerName: string;
    orderNumber: string;
    packageName: string;
    quantity: number;
    total: number;
    hasAutoship: boolean;
  }) => ({
    subject: `🎉 Order Confirmed - NEON Energy #${data.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #c8ff00; font-size: 32px; margin: 0;">NEON</h1>
          <p style="color: #fff; opacity: 0.8; margin: 5px 0;">ENERGY DRINK</p>
        </div>
        
        <h2 style="color: #c8ff00;">Order Confirmed!</h2>
        <p>Hey ${data.customerName},</p>
        <p>Thanks for pre-ordering NEON Energy! Your order has been confirmed and we're preparing it for shipment.</p>
        
        <div style="background: rgba(200, 255, 0, 0.1); border: 1px solid #c8ff00; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #c8ff00; margin-top: 0;">Order Details</h3>
          <p><strong>Order Number:</strong> ${data.orderNumber}</p>
          <p><strong>Package:</strong> ${data.packageName}</p>
          <p><strong>Quantity:</strong> ${data.quantity} cans</p>
          <p><strong>Total:</strong> $${data.total.toFixed(2)}</p>
          ${data.hasAutoship ? '<p style="color: #c8ff00;"><strong>✓ Auto-Ship Enabled</strong> - You\'re saving 15%!</p>' : ''}
        </div>
        
        <p>You'll receive another email with tracking information once your order ships.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://neonenergyclub.com/orders" style="background: #c8ff00; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Track Your Order</a>
        </div>
        
        <p style="color: #fff; opacity: 0.6; font-size: 12px; margin-top: 30px;">
          Questions? Reply to this email or visit our <a href="https://neonenergyclub.com/support" style="color: #c8ff00;">support center</a>.
        </p>
      </div>
    `,
  }),

  orderShipped: (data: {
    customerName: string;
    orderNumber: string;
    trackingNumber: string;
    carrier: string;
    estimatedDelivery: string;
  }) => ({
    subject: `📦 Your NEON Energy Order Has Shipped! #${data.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #c8ff00; font-size: 32px; margin: 0;">NEON</h1>
          <p style="color: #fff; opacity: 0.8; margin: 5px 0;">ENERGY DRINK</p>
        </div>
        
        <h2 style="color: #c8ff00;">Your Order Is On Its Way!</h2>
        <p>Hey ${data.customerName},</p>
        <p>Great news! Your NEON Energy order has shipped and is heading your way.</p>
        
        <div style="background: rgba(200, 255, 0, 0.1); border: 1px solid #c8ff00; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #c8ff00; margin-top: 0;">Shipping Details</h3>
          <p><strong>Order Number:</strong> ${data.orderNumber}</p>
          <p><strong>Carrier:</strong> ${data.carrier}</p>
          <p><strong>Tracking Number:</strong> <span style="font-family: monospace; color: #00ffff;">${data.trackingNumber}</span></p>
          <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://www.fedex.com/fedextrack/?trknbr=${data.trackingNumber}" style="background: #c8ff00; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Track Package</a>
        </div>
        
        <p style="color: #fff; opacity: 0.8;">We'll send you another email once your package is delivered.</p>
        
        <p style="color: #fff; opacity: 0.6; font-size: 12px; margin-top: 30px;">
          Questions about your shipment? Contact us at <a href="mailto:support@neonenergyclub.com" style="color: #c8ff00;">support@neonenergyclub.com</a>
        </p>
      </div>
    `,
  }),

  referralReward: (data: {
    customerName: string;
    referredFriendName: string;
    rewardAmount: number;
    totalReferrals: number;
  }) => ({
    subject: `🎁 You Earned a Reward! ${data.referredFriendName} Used Your Referral`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #c8ff00; font-size: 32px; margin: 0;">NEON</h1>
          <p style="color: #fff; opacity: 0.8; margin: 5px 0;">ENERGY DRINK</p>
        </div>
        
        <h2 style="color: #c8ff00;">You Earned a Reward!</h2>
        <p>Hey ${data.customerName},</p>
        <p>Awesome news! ${data.referredFriendName} just used your referral link to pre-order NEON Energy.</p>
        
        <div style="background: rgba(200, 255, 0, 0.1); border: 1px solid #c8ff00; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <h3 style="color: #c8ff00; margin-top: 0;">Your Reward</h3>
          <p style="font-size: 48px; font-weight: bold; color: #c8ff00; margin: 10px 0;">$${data.rewardAmount.toFixed(2)}</p>
          <p style="color: #fff; opacity: 0.8;">Credit added to your account</p>
        </div>
        
        <p>You've now referred <strong style="color: #c8ff00;">${data.totalReferrals} ${data.totalReferrals === 1 ? 'friend' : 'friends'}</strong> to NEON Energy. Keep sharing to earn more rewards!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://neonenergyclub.com/portal" style="background: #c8ff00; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Your Rewards</a>
        </div>
        
        <p style="color: #fff; opacity: 0.8;">Want to earn more? Share your unique referral link with friends and family!</p>
        
        <p style="color: #fff; opacity: 0.6; font-size: 12px; margin-top: 30px;">
          Questions about rewards? Visit our <a href="https://neonenergyclub.com/referral-program" style="color: #c8ff00;">referral program page</a>.
        </p>
      </div>
    `,
  }),

  crowdfundingMilestone: (data: {
    milestone: number;
    totalRaised: number;
    totalBackers: number;
    nextMilestone: number;
  }) => ({
    subject: `🚀 We Hit ${data.milestone}% Funding! - NEON Energy Relaunch`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #c8ff00; font-size: 32px; margin: 0;">NEON</h1>
          <p style="color: #fff; opacity: 0.8; margin: 5px 0;">ENERGY DRINK</p>
        </div>
        
        <h2 style="color: #c8ff00;">We Hit ${data.milestone}% Funding!</h2>
        <p>This is HUGE! Thanks to backers like you, we've reached ${data.milestone}% of our crowdfunding goal.</p>
        
        <div style="background: rgba(200, 255, 0, 0.1); border: 1px solid #c8ff00; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #c8ff00; margin-top: 0;">Campaign Progress</h3>
          <div style="background: rgba(255,255,255,0.1); height: 30px; border-radius: 15px; overflow: hidden; margin: 15px 0;">
            <div style="background: linear-gradient(90deg, #c8ff00, #00ffff); height: 100%; width: ${data.milestone}%; transition: width 0.5s;"></div>
          </div>
          <p><strong>Total Raised:</strong> $${data.totalRaised.toLocaleString()}</p>
          <p><strong>Total Backers:</strong> ${data.totalBackers.toLocaleString()}</p>
        </div>
        
        <p>We're on track to bring NEON Energy back stronger than ever. Next stop: ${data.nextMilestone}%!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://neonenergyclub.com/crowdfund" style="background: #c8ff00; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Campaign</a>
        </div>
        
        <p style="color: #fff; opacity: 0.8;">Help us reach the next milestone by sharing the campaign with your network!</p>
        
        <p style="color: #fff; opacity: 0.6; font-size: 12px; margin-top: 30px;">
          You're receiving this because you backed the NEON Energy relaunch campaign.
        </p>
      </div>
    `,
  }),

  autoshipReminder: (data: {
    customerName: string;
    packageName: string;
    renewalDate: string;
    amount: number;
  }) => ({
    subject: `⏰ Your NEON Auto-Ship Renews Soon - ${data.renewalDate}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #c8ff00; font-size: 32px; margin: 0;">NEON</h1>
          <p style="color: #fff; opacity: 0.8; margin: 5px 0;">ENERGY DRINK</p>
        </div>
        
        <h2 style="color: #c8ff00;">Your Auto-Ship Renews Soon</h2>
        <p>Hey ${data.customerName},</p>
        <p>Just a friendly reminder that your NEON Energy auto-ship subscription will renew on <strong style="color: #c8ff00;">${data.renewalDate}</strong>.</p>
        
        <div style="background: rgba(200, 255, 0, 0.1); border: 1px solid #c8ff00; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #c8ff00; margin-top: 0;">Renewal Details</h3>
          <p><strong>Package:</strong> ${data.packageName}</p>
          <p><strong>Renewal Date:</strong> ${data.renewalDate}</p>
          <p><strong>Amount:</strong> $${data.amount.toFixed(2)}</p>
          <p style="color: #c8ff00;"><strong>✓ You're Saving 15%</strong> with Auto-Ship</p>
        </div>
        
        <p>No action needed - we'll automatically process your order and ship it to you. You can modify or cancel your subscription anytime.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://neonenergyclub.com/portal" style="background: #c8ff00; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">Manage Subscription</a>
        </div>
        
        <p style="color: #fff; opacity: 0.6; font-size: 12px; margin-top: 30px;">
          Need to make changes? Visit your <a href="https://neonenergyclub.com/portal" style="color: #c8ff00;">customer portal</a> or reply to this email.
        </p>
      </div>
    `,
  }),
};

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(data: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  packageName: string;
  quantity: number;
  total: number;
  hasAutoship: boolean;
}) {
  const template = EMAIL_TEMPLATES.orderConfirmation(data);
  
  // Log email for development (in production, integrate with email service like SendGrid, AWS SES, etc.)
  console.log(`[Email] Sending order confirmation to ${data.customerEmail}`);
  console.log(`Subject: ${template.subject}`);
  
  // Notify owner of new order
  await notifyOwner({
    title: "New Order Placed",
    content: `${data.customerName} placed an order for ${data.packageName} (${data.quantity} cans) - $${data.total.toFixed(2)}${data.hasAutoship ? ' with Auto-Ship' : ''}`,
  });
  
  return { success: true, messageId: `order-${data.orderNumber}` };
}

/**
 * Send order shipped email
 */
export async function sendOrderShippedEmail(data: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
}) {
  const template = EMAIL_TEMPLATES.orderShipped(data);
  
  console.log(`[Email] Sending shipping notification to ${data.customerEmail}`);
  console.log(`Subject: ${template.subject}`);
  
  return { success: true, messageId: `shipped-${data.orderNumber}` };
}

/**
 * Send referral reward email
 */
export async function sendReferralRewardEmail(data: {
  customerEmail: string;
  customerName: string;
  referredFriendName: string;
  rewardAmount: number;
  totalReferrals: number;
}) {
  const template = EMAIL_TEMPLATES.referralReward(data);
  
  console.log(`[Email] Sending referral reward notification to ${data.customerEmail}`);
  console.log(`Subject: ${template.subject}`);
  
  // Notify owner of referral milestone
  if (data.totalReferrals % 10 === 0) {
    await notifyOwner({
      title: "Referral Milestone",
      content: `${data.customerName} has referred ${data.totalReferrals} customers!`,
    });
  }
  
  return { success: true, messageId: `referral-${Date.now()}` };
}

/**
 * Send crowdfunding milestone email
 */
export async function sendCrowdfundingMilestoneEmail(data: {
  milestone: number;
  totalRaised: number;
  totalBackers: number;
  nextMilestone: number;
  backerEmails: string[];
}) {
  const template = EMAIL_TEMPLATES.crowdfundingMilestone(data);
  
  console.log(`[Email] Sending crowdfunding milestone (${data.milestone}%) to ${data.backerEmails.length} backers`);
  console.log(`Subject: ${template.subject}`);
  
  // Notify owner of milestone
  await notifyOwner({
    title: `Crowdfunding Milestone: ${data.milestone}%`,
    content: `We've reached ${data.milestone}% funding with $${data.totalRaised.toLocaleString()} raised from ${data.totalBackers} backers!`,
  });
  
  return { success: true, messageId: `milestone-${data.milestone}` };
}

/**
 * Send auto-ship reminder email
 */
export async function sendAutoshipReminderEmail(data: {
  customerEmail: string;
  customerName: string;
  packageName: string;
  renewalDate: string;
  amount: number;
}) {
  const template = EMAIL_TEMPLATES.autoshipReminder(data);
  
  console.log(`[Email] Sending auto-ship reminder to ${data.customerEmail}`);
  console.log(`Subject: ${template.subject}`);
  
  return { success: true, messageId: `autoship-${Date.now()}` };
}

/**
 * Get email template HTML for preview/testing
 */
export function getEmailTemplate(
  templateName: keyof typeof EMAIL_TEMPLATES,
  data: any
) {
  return EMAIL_TEMPLATES[templateName](data);
}
