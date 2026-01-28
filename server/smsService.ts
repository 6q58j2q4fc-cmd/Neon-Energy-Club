/**
 * SMS Notification Service
 * 
 * Sends SMS notifications using Twilio API for:
 * - Order shipped alerts
 * - Referral reward notifications
 * - Commission earned alerts
 * - Auto-ship renewal reminders
 * 
 * Usage:
 * 1. Set up Twilio account at https://www.twilio.com
 * 2. Add environment variables:
 *    - TWILIO_ACCOUNT_SID
 *    - TWILIO_AUTH_TOKEN
 *    - TWILIO_PHONE_NUMBER (your Twilio phone number)
 * 3. Call sendSMS() functions from your application code
 */

import { notifyOwner } from "./_core/notification";

// Twilio configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Check if Twilio is configured
const isTwilioConfigured = Boolean(
  TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER
);

/**
 * Send SMS using Twilio API
 */
async function sendTwilioSMS(to: string, body: string): Promise<boolean> {
  if (!isTwilioConfigured) {
    console.log("[SMS] Twilio not configured, skipping SMS send");
    return false;
  }

  try {
    // Twilio API endpoint
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    
    // Create form data
    const formData = new URLSearchParams();
    formData.append("From", TWILIO_PHONE_NUMBER!);
    formData.append("To", to);
    formData.append("Body", body);

    // Send request
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[SMS] Twilio API error:", error);
      return false;
    }

    const result = await response.json();
    console.log("[SMS] Message sent successfully:", result.sid);
    return true;
  } catch (error) {
    console.error("[SMS] Failed to send SMS:", error);
    return false;
  }
}

/**
 * Validate phone number format (US format)
 */
function validatePhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");
  
  // Check if it's a valid US phone number (10 or 11 digits)
  return digits.length === 10 || (digits.length === 11 && digits[0] === "1");
}

/**
 * Format phone number to E.164 format (+1XXXXXXXXXX)
 */
function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits[0] === "1") {
    return `+${digits}`;
  }
  
  return phone; // Return as-is if invalid
}

/**
 * Send order shipped SMS notification
 */
export async function sendOrderShippedSMS(params: {
  phoneNumber: string;
  customerName: string;
  orderNumber: string;
  trackingNumber: string;
  carrier: string;
}): Promise<boolean> {
  const { phoneNumber, customerName, orderNumber, trackingNumber, carrier } = params;
  
  if (!validatePhoneNumber(phoneNumber)) {
    console.log("[SMS] Invalid phone number:", phoneNumber);
    return false;
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  const message = `Hi ${customerName}! Your NEON Energy order #${orderNumber} has shipped via ${carrier}. Track it: ${trackingNumber}`;
  
  const success = await sendTwilioSMS(formattedPhone, message);
  
  if (success) {
    await notifyOwner({
      title: "SMS Sent: Order Shipped",
      content: `Sent order shipped SMS to ${customerName} (${phoneNumber})`,
    });
  }
  
  return success;
}

/**
 * Send referral reward SMS notification
 */
export async function sendReferralRewardSMS(params: {
  phoneNumber: string;
  customerName: string;
  rewardAmount: number;
  referredName: string;
}): Promise<boolean> {
  const { phoneNumber, customerName, rewardAmount, referredName } = params;
  
  if (!validatePhoneNumber(phoneNumber)) {
    console.log("[SMS] Invalid phone number:", phoneNumber);
    return false;
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  const message = `Congrats ${customerName}! You earned $${rewardAmount.toFixed(2)} because ${referredName} used your NEON Energy referral link! 🎉`;
  
  const success = await sendTwilioSMS(formattedPhone, message);
  
  if (success) {
    await notifyOwner({
      title: "SMS Sent: Referral Reward",
      content: `Sent referral reward SMS to ${customerName} (${phoneNumber})`,
    });
  }
  
  return success;
}

/**
 * Send commission earned SMS notification
 */
export async function sendCommissionEarnedSMS(params: {
  phoneNumber: string;
  distributorName: string;
  commissionAmount: number;
  commissionType: string;
}): Promise<boolean> {
  const { phoneNumber, distributorName, commissionAmount, commissionType } = params;
  
  if (!validatePhoneNumber(phoneNumber)) {
    console.log("[SMS] Invalid phone number:", phoneNumber);
    return false;
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  const message = `Great news ${distributorName}! You earned $${commissionAmount.toFixed(2)} in ${commissionType} commission! Check your distributor portal for details.`;
  
  const success = await sendTwilioSMS(formattedPhone, message);
  
  if (success) {
    await notifyOwner({
      title: "SMS Sent: Commission Earned",
      content: `Sent commission earned SMS to ${distributorName} (${phoneNumber})`,
    });
  }
  
  return success;
}

/**
 * Send auto-ship renewal reminder SMS
 */
export async function sendAutoShipReminderSMS(params: {
  phoneNumber: string;
  customerName: string;
  renewalDate: Date;
  amount: number;
}): Promise<boolean> {
  const { phoneNumber, customerName, renewalDate, amount } = params;
  
  if (!validatePhoneNumber(phoneNumber)) {
    console.log("[SMS] Invalid phone number:", phoneNumber);
    return false;
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  const dateStr = renewalDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const message = `Hi ${customerName}! Your NEON Energy auto-ship ($${amount.toFixed(2)}) renews on ${dateStr}. Manage your subscription in your customer portal.`;
  
  const success = await sendTwilioSMS(formattedPhone, message);
  
  if (success) {
    await notifyOwner({
      title: "SMS Sent: Auto-Ship Reminder",
      content: `Sent auto-ship reminder SMS to ${customerName} (${phoneNumber})`,
    });
  }
  
  return success;
}

/**
 * Send promotional SMS (for marketing campaigns)
 */
export async function sendPromotionalSMS(params: {
  phoneNumber: string;
  customerName: string;
  message: string;
}): Promise<boolean> {
  const { phoneNumber, customerName, message } = params;
  
  if (!validatePhoneNumber(phoneNumber)) {
    console.log("[SMS] Invalid phone number:", phoneNumber);
    return false;
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  const fullMessage = `Hi ${customerName}! ${message}`;
  
  const success = await sendTwilioSMS(formattedPhone, fullMessage);
  
  if (success) {
    await notifyOwner({
      title: "SMS Sent: Promotional",
      content: `Sent promotional SMS to ${customerName} (${phoneNumber})`,
    });
  }
  
  return success;
}

/**
 * Test SMS functionality
 */
export async function sendTestSMS(phoneNumber: string): Promise<boolean> {
  if (!validatePhoneNumber(phoneNumber)) {
    console.log("[SMS] Invalid phone number:", phoneNumber);
    return false;
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  const message = "This is a test message from NEON Energy! Your SMS notifications are working correctly. 🚀";
  
  return await sendTwilioSMS(formattedPhone, message);
}
