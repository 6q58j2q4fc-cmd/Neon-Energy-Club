import { describe, it, expect } from "vitest";
import {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendReferralRewardEmail,
  sendCrowdfundingMilestoneEmail,
  sendAutoshipReminderEmail,
  getEmailTemplate,
} from "./emailService";

describe("Email Service", () => {
  it("should send order confirmation email", async () => {
    const result = await sendOrderConfirmationEmail({
      customerEmail: "test@example.com",
      customerName: "John Doe",
      orderNumber: "NEON-2026-001",
      packageName: "12-Pack",
      quantity: 12,
      total: 30.59,
      hasAutoship: true,
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toContain("order-NEON-2026-001");
  });

  it("should send order shipped email", async () => {
    const result = await sendOrderShippedEmail({
      customerEmail: "test@example.com",
      customerName: "John Doe",
      orderNumber: "NEON-2026-001",
      trackingNumber: "1Z999AA10123456784",
      carrier: "FedEx",
      estimatedDelivery: "April 15, 2026",
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toContain("shipped-NEON-2026-001");
  });

  it("should send referral reward email", async () => {
    const result = await sendReferralRewardEmail({
      customerEmail: "test@example.com",
      customerName: "John Doe",
      referredFriendName: "Jane Smith",
      rewardAmount: 10.0,
      totalReferrals: 5,
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toContain("referral-");
  });

  it("should send crowdfunding milestone email", async () => {
    const result = await sendCrowdfundingMilestoneEmail({
      milestone: 50,
      totalRaised: 500000,
      totalBackers: 1250,
      nextMilestone: 75,
      backerEmails: ["test1@example.com", "test2@example.com"],
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe("milestone-50");
  });

  it("should send auto-ship reminder email", async () => {
    const result = await sendAutoshipReminderEmail({
      customerEmail: "test@example.com",
      customerName: "John Doe",
      packageName: "12-Pack",
      renewalDate: "February 15, 2026",
      amount: 30.59,
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toContain("autoship-");
  });

  it("should generate email template HTML", () => {
    const template = getEmailTemplate("orderConfirmation", {
      customerName: "John Doe",
      orderNumber: "NEON-2026-001",
      packageName: "12-Pack",
      quantity: 12,
      total: 30.59,
      hasAutoship: true,
    });

    expect(template.subject).toContain("Order Confirmed");
    expect(template.html).toContain("NEON");
    expect(template.html).toContain("John Doe");
    expect(template.html).toContain("NEON-2026-001");
    expect(template.html).toContain("Auto-Ship");
  });

  it("should include tracking link in shipped email", () => {
    const template = getEmailTemplate("orderShipped", {
      customerName: "John Doe",
      orderNumber: "NEON-2026-001",
      trackingNumber: "1Z999AA10123456784",
      carrier: "FedEx",
      estimatedDelivery: "April 15, 2026",
    });

    expect(template.html).toContain("1Z999AA10123456784");
    expect(template.html).toContain("fedextrack");
  });

  it("should show reward amount in referral email", () => {
    const template = getEmailTemplate("referralReward", {
      customerName: "John Doe",
      referredFriendName: "Jane Smith",
      rewardAmount: 10.0,
      totalReferrals: 5,
    });

    expect(template.html).toContain("$10.00");
    expect(template.html).toContain("Jane Smith");
    expect(template.html).toContain("5 friends");
  });

  it("should display milestone progress in crowdfunding email", () => {
    const template = getEmailTemplate("crowdfundingMilestone", {
      milestone: 75,
      totalRaised: 750000,
      totalBackers: 1875,
      nextMilestone: 100,
    });

    expect(template.html).toContain("75%");
    expect(template.html).toContain("$750,000");
    expect(template.html).toContain("1,875");
  });

  it("should show auto-ship discount in reminder email", () => {
    const template = getEmailTemplate("autoshipReminder", {
      customerName: "John Doe",
      packageName: "12-Pack",
      renewalDate: "February 15, 2026",
      amount: 30.59,
    });

    expect(template.html).toContain("15%");
    expect(template.html).toContain("February 15, 2026");
    expect(template.html).toContain("$30.59");
  });
});
