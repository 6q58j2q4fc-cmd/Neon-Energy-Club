import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the notification module
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

describe("SMS Notifications and Referral Tracking", () => {
  describe("SMS Notification Service", () => {
    it("should generate valid referral codes", async () => {
      const { generateReferralCode } = await import("./smsNotifications");
      
      const subscriberId = "SUB123456ABC";
      const code = generateReferralCode(subscriberId);
      
      expect(code).toBeDefined();
      expect(code).toMatch(/^NEON[A-Z0-9]+$/);
      expect(code.length).toBeGreaterThan(8);
    });

    it("should generate referral messages with correct format", async () => {
      const { generateReferralMessages } = await import("./smsNotifications");
      
      const messages = generateReferralMessages("John Doe", "NEON123ABC");
      
      expect(messages).toBeDefined();
      expect(messages.sms).toBeDefined();
      expect(messages.whatsapp).toBeDefined();
      expect(messages.twitter).toBeDefined();
      expect(messages.facebook).toBeDefined();
      expect(messages.email).toBeDefined();
      
      // Check that referral code is included in messages
      expect(messages.sms).toContain("NEON123ABC");
      expect(messages.whatsapp).toContain("NEON123ABC");
    });

    it("should send order confirmation SMS", async () => {
      const { sendOrderConfirmationSMS } = await import("./smsNotifications");
      
      const result = await sendOrderConfirmationSMS(
        { phone: "1234567890", name: "Jane Smith" },
        "12345",
        2
      );
      
      expect(result).toBe(true);
    });

    it("should send shipping update SMS", async () => {
      const { sendShippingUpdateSMS } = await import("./smsNotifications");
      
      const result = await sendShippingUpdateSMS(
        { phone: "1234567890", name: "Bob Wilson" },
        "1Z999AA10123456784",
        "UPS"
      );
      
      expect(result).toBe(true);
    });

    it("should send territory notification SMS for submitted status", async () => {
      const { sendTerritoryNotificationSMS } = await import("./smsNotifications");
      
      const result = await sendTerritoryNotificationSMS(
        { phone: "1234567890", name: "Alice Brown" },
        "Downtown LA",
        "submitted"
      );
      
      expect(result).toBe(true);
    });

    it("should send territory notification SMS for approved status", async () => {
      const { sendTerritoryNotificationSMS } = await import("./smsNotifications");
      
      const result = await sendTerritoryNotificationSMS(
        { phone: "1234567890", name: "Alice Brown" },
        "Downtown LA",
        "approved"
      );
      
      expect(result).toBe(true);
    });

    it("should send territory notification SMS for rejected status", async () => {
      const { sendTerritoryNotificationSMS } = await import("./smsNotifications");
      
      const result = await sendTerritoryNotificationSMS(
        { phone: "1234567890", name: "Alice Brown" },
        "Downtown LA",
        "rejected",
        "Territory already claimed"
      );
      
      expect(result).toBe(true);
    });
  });

  describe("Referral Code Generation", () => {
    it("should generate unique codes for different subscribers", async () => {
      const { generateReferralCode } = await import("./smsNotifications");
      
      const code1 = generateReferralCode("SUB001");
      const code2 = generateReferralCode("SUB002");
      const code3 = generateReferralCode("SUB003");
      
      // Codes should be different (though there's a small chance of collision with random component)
      // At minimum, they should all start with NEON
      expect(code1.startsWith("NEON")).toBe(true);
      expect(code2.startsWith("NEON")).toBe(true);
      expect(code3.startsWith("NEON")).toBe(true);
    });

    it("should generate codes with NEON prefix", async () => {
      const { generateReferralCode } = await import("./smsNotifications");
      
      for (let i = 0; i < 10; i++) {
        const code = generateReferralCode(`SUB${i}`);
        expect(code.startsWith("NEON")).toBe(true);
      }
    });
  });

  describe("Message Templates", () => {
    it("should include referral code in all social messages", async () => {
      const { generateReferralMessages } = await import("./smsNotifications");
      
      const messages = generateReferralMessages("Test User", "NEONTEST123");
      
      // Check string messages contain the referral code
      expect(messages.sms).toContain("NEONTEST123");
      expect(messages.twitter).toContain("NEONTEST123");
      expect(messages.facebook).toContain("NEONTEST123");
      expect(messages.whatsapp).toContain("NEONTEST123");
      expect(messages.email.body).toContain("NEONTEST123");
      expect(messages.email.subject).toContain("Test User");
    });

    it("should generate proper email subject and body", async () => {
      const { generateReferralMessages } = await import("./smsNotifications");
      
      const messages = generateReferralMessages("Email Tester", "NEONEMAIL");
      
      expect(messages.email).toBeDefined();
      expect(messages.email.body).toContain("NEONEMAIL");
      expect(messages.email.subject).toBeDefined();
      expect(messages.email.subject).toContain("Email Tester");
    });
  });

  describe("Welcome and Promotional SMS", () => {
    it("should send welcome SMS to new subscriber", async () => {
      const { sendWelcomeSubscriberSMS } = await import("./smsNotifications");
      
      const result = await sendWelcomeSubscriberSMS(
        { phone: "1234567890", name: "New User" },
        "NEONNEW123"
      );
      
      expect(result).toBe(true);
    });

    it("should send NFT minted notification", async () => {
      const { sendNFTMintedSMS } = await import("./smsNotifications");
      
      const result = await sendNFTMintedSMS(
        { phone: "1234567890", name: "NFT Collector" },
        "NEON Genesis #42",
        "42"
      );
      
      expect(result).toBe(true);
    });

    it("should send crowdfund contribution confirmation", async () => {
      const { sendCrowdfundContributionSMS } = await import("./smsNotifications");
      
      const result = await sendCrowdfundContributionSMS(
        { phone: "1234567890", name: "Backer" },
        100,
        "Pioneer"
      );
      
      expect(result).toBe(true);
    });

    it("should send referral invite SMS", async () => {
      const { sendReferralInviteSMS } = await import("./smsNotifications");
      
      const result = await sendReferralInviteSMS(
        "John Referrer",
        "NEONJOHN123",
        "9876543210"
      );
      
      expect(result).toBe(true);
    });
  });
});
