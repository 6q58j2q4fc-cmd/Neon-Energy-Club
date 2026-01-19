import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the notification module
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

describe("Email Notification System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Order Confirmation Email", () => {
    it("should format order confirmation email correctly", async () => {
      const { sendOrderConfirmationEmail } = await import("./emailNotifications");
      
      const result = await sendOrderConfirmationEmail({
        customerName: "John Doe",
        customerEmail: "john@example.com",
        orderId: 12345,
        quantity: 2,
        productName: "NEON Original",
        totalAmount: 59.98,
        estimatedDelivery: "April 2026",
      });
      
      expect(result).toBe(true);
    });

    it("should handle missing optional fields", async () => {
      const { sendOrderConfirmationEmail } = await import("./emailNotifications");
      
      const result = await sendOrderConfirmationEmail({
        customerName: "Jane Doe",
        customerEmail: "jane@example.com",
        orderId: 12346,
        quantity: 1,
      });
      
      expect(result).toBe(true);
    });
  });

  describe("Shipping Update Email", () => {
    it("should format shipping update email correctly", async () => {
      const { sendShippingUpdateEmail } = await import("./emailNotifications");
      
      const result = await sendShippingUpdateEmail({
        customerName: "John Doe",
        customerEmail: "john@example.com",
        orderId: 12345,
        status: "shipped",
        trackingNumber: "1Z999AA10123456784",
        carrier: "UPS",
        estimatedDelivery: "2026-04-20",
      });
      
      expect(result).toBe(true);
    });

    it("should handle different shipping statuses", async () => {
      const { sendShippingUpdateEmail } = await import("./emailNotifications");
      
      const statuses = ["processing", "shipped", "in_transit", "delivered"] as const;
      
      for (const status of statuses) {
        const result = await sendShippingUpdateEmail({
          customerName: "Test User",
          customerEmail: "test@example.com",
          orderId: 12347,
          status,
        });
        
        expect(result).toBe(true);
      }
    });
  });

  describe("Territory Notification Emails", () => {
    it("should format territory submission email correctly", async () => {
      const { sendTerritorySubmittedNotification } = await import("./emailNotifications");
      
      const result = await sendTerritorySubmittedNotification({
        applicantName: "John Doe",
        applicantEmail: "john@example.com",
        applicationId: 1001,
        territoryName: "Downtown Miami",
        squareMiles: 25.5,
        status: "submitted",
        monthlyFee: 500,
      });
      
      expect(result).toBe(true);
    });

    it("should format territory approval email correctly", async () => {
      const { sendTerritoryApprovalNotification } = await import("./emailNotifications");
      
      const result = await sendTerritoryApprovalNotification({
        applicantName: "John Doe",
        applicantEmail: "john@example.com",
        applicationId: 1001,
        territoryName: "Downtown Miami",
        squareMiles: 25.5,
        status: "approved",
        monthlyFee: 500,
        startDate: "2026-05-01",
      });
      
      expect(result).toBe(true);
    });

    it("should format territory rejection email correctly", async () => {
      const { sendTerritoryApprovalNotification } = await import("./emailNotifications");
      
      const result = await sendTerritoryApprovalNotification({
        applicantName: "Jane Doe",
        applicantEmail: "jane@example.com",
        applicationId: 1002,
        territoryName: "Central Park Area",
        squareMiles: 15.0,
        status: "rejected",
        rejectionReason: "Territory already claimed by another distributor",
      });
      
      expect(result).toBe(true);
    });
  });

  describe("Email Template Generation", () => {
    it("should generate valid HTML email content", async () => {
      const { generateEmailTemplate } = await import("./emailNotifications");
      
      const html = generateEmailTemplate({
        title: "Test Email",
        preheader: "This is a test",
        content: "<p>Hello World</p>",
      });
      
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("Test Email");
      expect(html).toContain("Hello World");
      expect(html).toContain("NEON");
    });

    it("should include proper styling in email template", async () => {
      const { generateEmailTemplate } = await import("./emailNotifications");
      
      const html = generateEmailTemplate({
        title: "Styled Email",
        preheader: "Check out this styled email",
        content: "<p>Content here</p>",
      });
      
      expect(html).toContain("background");
      expect(html).toContain("font-family");
    });
  });
});
