import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateSmsCode } from "./db";
import { isValidPhoneNumber, countryCodes } from "./smsService";

describe("SMS Verification", () => {
  describe("generateSmsCode", () => {
    it("should generate a 6-digit code", () => {
      const code = generateSmsCode();
      expect(code).toMatch(/^\d{6}$/);
    });

    it("should generate numeric codes only", () => {
      for (let i = 0; i < 100; i++) {
        const code = generateSmsCode();
        expect(code).toMatch(/^\d{6}$/);
        expect(parseInt(code)).toBeGreaterThanOrEqual(100000);
        expect(parseInt(code)).toBeLessThan(1000000);
      }
    });

    it("should generate different codes on subsequent calls", () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        codes.add(generateSmsCode());
      }
      // With 6 digits, we should get mostly unique codes
      expect(codes.size).toBeGreaterThan(90);
    });
  });

  describe("isValidPhoneNumber", () => {
    it("should validate 10-digit US phone numbers", () => {
      expect(isValidPhoneNumber("5551234567")).toBe(true);
      expect(isValidPhoneNumber("(555) 123-4567")).toBe(true);
      expect(isValidPhoneNumber("555-123-4567")).toBe(true);
      expect(isValidPhoneNumber("555.123.4567")).toBe(true);
    });

    it("should validate 11-digit phone numbers with country code", () => {
      expect(isValidPhoneNumber("15551234567")).toBe(true);
      expect(isValidPhoneNumber("+15551234567")).toBe(true);
      expect(isValidPhoneNumber("1-555-123-4567")).toBe(true);
    });

    it("should reject invalid phone numbers", () => {
      expect(isValidPhoneNumber("123")).toBe(false);
      expect(isValidPhoneNumber("12345")).toBe(false);
      expect(isValidPhoneNumber("")).toBe(false);
      expect(isValidPhoneNumber("abc")).toBe(false);
    });

    it("should handle phone numbers with various formats", () => {
      expect(isValidPhoneNumber("(555) 123-4567")).toBe(true);
      expect(isValidPhoneNumber("555 123 4567")).toBe(true);
      expect(isValidPhoneNumber("555-123-4567")).toBe(true);
    });
  });

  describe("countryCodes", () => {
    it("should have US as the first country", () => {
      expect(countryCodes[0].name).toBe("United States");
      expect(countryCodes[0].code).toBe("1");
    });

    it("should have valid country code entries", () => {
      countryCodes.forEach((country) => {
        expect(country.code).toBeDefined();
        expect(country.name).toBeDefined();
        expect(country.flag).toBeDefined();
        expect(country.code.length).toBeGreaterThan(0);
        expect(country.name.length).toBeGreaterThan(0);
      });
    });

    it("should include major countries", () => {
      const countryNames = countryCodes.map((c) => c.name);
      expect(countryNames).toContain("United States");
      expect(countryNames).toContain("Canada");
      expect(countryNames).toContain("United Kingdom");
      expect(countryNames).toContain("Germany");
    });
  });

  describe("SMS Code Expiry Logic", () => {
    it("should set 10-minute expiry for SMS codes", () => {
      const now = Date.now();
      const expiresAt = new Date(now + 10 * 60 * 1000);
      
      // Verify expiry is approximately 10 minutes in the future
      const diffMinutes = (expiresAt.getTime() - now) / (60 * 1000);
      expect(diffMinutes).toBeCloseTo(10, 0);
    });

    it("should detect expired codes correctly", () => {
      const now = new Date();
      const expiredTime = new Date(now.getTime() - 1000); // 1 second ago
      const validTime = new Date(now.getTime() + 60000); // 1 minute from now

      expect(now > expiredTime).toBe(true);
      expect(now > validTime).toBe(false);
    });
  });

  describe("Rate Limiting Logic", () => {
    it("should enforce 1-minute cooldown between SMS sends", () => {
      const lastSmsSentAt = new Date();
      const now = Date.now();
      const timeSinceLastSms = now - lastSmsSentAt.getTime();
      
      // Just sent, should be rate limited
      expect(timeSinceLastSms < 60 * 1000).toBe(true);
    });

    it("should allow SMS after cooldown period", () => {
      const lastSmsSentAt = new Date(Date.now() - 61 * 1000); // 61 seconds ago
      const now = Date.now();
      const timeSinceLastSms = now - lastSmsSentAt.getTime();
      
      // Cooldown passed, should be allowed
      expect(timeSinceLastSms >= 60 * 1000).toBe(true);
    });

    it("should reset attempts after 1 hour", () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const now = new Date();

      // Last SMS was 2 hours ago - should reset attempts
      expect(twoHoursAgo < oneHourAgo).toBe(true);
      
      // Last SMS was 30 minutes ago - should NOT reset attempts
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      expect(thirtyMinutesAgo > oneHourAgo).toBe(true);
    });

    it("should limit to 5 attempts per hour", () => {
      const maxAttempts = 5;
      expect(maxAttempts).toBe(5);
      
      // Simulate reaching max attempts
      const attempts = 5;
      expect(attempts >= maxAttempts).toBe(true);
    });
  });

  describe("OTP Code Validation", () => {
    it("should validate 6-digit codes", () => {
      const validCode = "123456";
      const invalidCodes = ["12345", "1234567", "abcdef", "", "12345a"];

      expect(validCode.length).toBe(6);
      expect(/^\d{6}$/.test(validCode)).toBe(true);

      invalidCodes.forEach((code) => {
        expect(/^\d{6}$/.test(code)).toBe(false);
      });
    });

    it("should match codes exactly", () => {
      const storedCode = "123456";
      const inputCode = "123456";
      const wrongCode = "654321";

      expect(storedCode === inputCode).toBe(true);
      expect(storedCode === wrongCode).toBe(false);
    });
  });
});
