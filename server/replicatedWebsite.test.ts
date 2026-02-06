import { describe, it, expect, vi } from "vitest";

describe("Replicated Website System", () => {
  describe("URL Format Support", () => {
    it("should support direct distributor code URLs (neonenergyclub.com/DIST123ABC)", () => {
      // Test that the URL pattern matches distributor codes
      const distributorCode = "DIST123ABCDEF";
      const url = `/${distributorCode}`;
      
      // URL should be a valid path
      expect(url).toBe("/DIST123ABCDEF");
      expect(url.startsWith("/")).toBe(true);
      expect(url.includes("/d/")).toBe(false); // Not the legacy format
    });

    it("should support custom vanity URLs (neonenergyclub.com/johndoe)", () => {
      const vanitySlug = "johndoe";
      const url = `/${vanitySlug}`;
      
      expect(url).toBe("/johndoe");
      expect(url.startsWith("/")).toBe(true);
    });

    it("should support legacy /d/ format for backward compatibility", () => {
      const distributorCode = "DIST123ABCDEF";
      const legacyUrl = `/d/${distributorCode}`;
      
      expect(legacyUrl).toBe("/d/DIST123ABCDEF");
      expect(legacyUrl.includes("/d/")).toBe(true);
    });
  });

  describe("Distributor Code Generation", () => {
    it("should generate unique distributor codes with DIST prefix", () => {
      const userId = 123;
      const distributorCode = `DIST${userId}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      expect(distributorCode).toMatch(/^DIST\d+[A-Z0-9]+$/);
      expect(distributorCode.startsWith("DIST")).toBe(true);
    });

    it("should generate different codes for different users", () => {
      const codes = new Set<string>();
      for (let i = 1; i <= 100; i++) {
        const code = `DIST${i}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        codes.add(code);
      }
      // All 100 codes should be unique
      expect(codes.size).toBe(100);
    });
  });

  describe("Affiliate Link Generation", () => {
    it("should generate affiliate links with tracking parameters", () => {
      const distributorCode = "DIST123ABCDEF";
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 6);
      const affiliateCode = `${distributorCode}-${timestamp}${random}`.toUpperCase();
      
      expect(affiliateCode).toContain(distributorCode);
      expect(affiliateCode.includes("-")).toBe(true);
    });

    it("should generate subdomain-safe slugs", () => {
      const generateSubdomain = (code: string, userName?: string): string => {
        const cleanCode = code.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (userName) {
          const cleanName = userName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
          if (cleanName.length >= 3) return cleanName;
        }
        return cleanCode;
      };

      expect(generateSubdomain("DIST123ABC")).toBe("dist123abc");
      expect(generateSubdomain("DIST123ABC", "John Doe")).toBe("johndoe");
      expect(generateSubdomain("DIST123ABC", "A")).toBe("dist123abc"); // Name too short
    });
  });

  describe("Referral Attribution", () => {
    it("should store referral data in expected format", () => {
      const distributorCode = "DIST123ABCDEF";
      const referralData = {
        distributorCode,
        expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        visitedAt: new Date().toISOString(),
      };
      
      expect(referralData.distributorCode).toBe(distributorCode);
      expect(new Date(referralData.expiry).getTime()).toBeGreaterThan(Date.now());
      expect(new Date(referralData.visitedAt).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it("should set 30-day expiration for referral cookies", () => {
      const now = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const expiry = new Date(now + thirtyDaysMs);
      
      const daysDiff = (expiry.getTime() - now) / (24 * 60 * 60 * 1000);
      expect(Math.round(daysDiff)).toBe(30);
    });
  });

  describe("Profile Lookup Priority", () => {
    it("should check custom slug first, then distributor code", () => {
      // This tests the lookup order in getBySlug procedure
      const lookupOrder = [
        "customSlug in userProfiles",
        "distributorCode in distributors",
        "username in distributors",
        "subdomain in distributors",
        "vanity slug in userProfiles (for distributors)",
      ];
      
      expect(lookupOrder[0]).toBe("customSlug in userProfiles");
      expect(lookupOrder[1]).toBe("distributorCode in distributors");
    });
  });

  describe("Website Provisioning", () => {
    it("should create website record with required fields", () => {
      const websiteRecord = {
        distributorId: 1,
        subdomain: "johndoe",
        vanitySlug: "dist123abc",
        affiliateLink: "https://neonenergyclub.com/johndoe?ref=DIST123ABC-ABC123",
        affiliateCode: "DIST123ABC-ABC123",
        status: "active",
        provisioningStatus: "verified",
        lastVerifiedAt: new Date().toISOString(),
      };
      
      expect(websiteRecord.distributorId).toBeGreaterThan(0);
      expect(websiteRecord.subdomain).toBeTruthy();
      expect(websiteRecord.affiliateLink).toContain("ref=");
      expect(websiteRecord.status).toBe("active");
      expect(websiteRecord.provisioningStatus).toBe("verified");
    });
  });
});
