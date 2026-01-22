import { describe, it, expect, vi } from "vitest";

describe("Personalized Profile System", () => {
  describe("Slug Generation", () => {
    it("should generate a unique slug for a new profile", async () => {
      const { generateUniqueSlug } = await import("./db");
      const slug = await generateUniqueSlug("Test User");
      
      expect(slug).toBeDefined();
      expect(slug.length).toBeGreaterThanOrEqual(3);
      // Slug should be lowercase and contain only alphanumeric characters and hyphens
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    });

    it("should generate different slugs for different base names", async () => {
      const { generateUniqueSlug } = await import("./db");
      const slug1 = await generateUniqueSlug("John Smith");
      const slug2 = await generateUniqueSlug("Jane Doe");
      
      // While they could theoretically be the same with random suffixes,
      // the base part should be different
      expect(slug1).not.toEqual(slug2);
    });

    it("should clean up special characters in slug", async () => {
      const { generateUniqueSlug } = await import("./db");
      const slug = await generateUniqueSlug("Test@User#123!");
      
      // Should only contain lowercase letters, numbers, and hyphens
      expect(slug).toMatch(/^[a-z0-9-]+$/);
      expect(slug).not.toContain("@");
      expect(slug).not.toContain("#");
      expect(slug).not.toContain("!");
    });

    it("should handle empty or whitespace-only names", async () => {
      const { generateUniqueSlug } = await import("./db");
      const slug = await generateUniqueSlug("   ");
      
      // Should fall back to default
      expect(slug).toBeDefined();
      expect(slug.length).toBeGreaterThan(0);
    });
  });

  describe("Slug Availability Check", () => {
    it("should not allow reserved slugs", async () => {
      const { checkSlugAvailability } = await import("./db");
      
      // These should be reserved
      const reservedSlugs = ["admin", "api", "shop", "join", "about", "products", "faq"];
      
      for (const slug of reservedSlugs) {
        const result = await checkSlugAvailability(slug, 999999);
        expect(result.available).toBe(false);
      }
    });

    it("should reject slugs that are too short", async () => {
      const { checkSlugAvailability } = await import("./db");
      
      const result = await checkSlugAvailability("ab", 999999);
      expect(result.available).toBe(false);
    });

    it("should reject slugs with invalid characters", async () => {
      const { checkSlugAvailability } = await import("./db");
      
      const result = await checkSlugAvailability("test@slug", 999999);
      expect(result.available).toBe(false);
    });

    it("should allow valid slugs that are not reserved", async () => {
      const { checkSlugAvailability } = await import("./db");
      
      // Use a unique slug that shouldn't exist
      const uniqueSlug = "test-valid-slug-" + Date.now();
      const result = await checkSlugAvailability(uniqueSlug, 999999);
      expect(result.available).toBe(true);
    });

    it("should normalize slugs to lowercase", async () => {
      const { checkSlugAvailability } = await import("./db");
      
      const result = await checkSlugAvailability("ADMIN", 999999);
      expect(result.slug).toBe("admin");
      expect(result.available).toBe(false);
    });
  });

  describe("Profile Functions", () => {
    it("should have getPersonalizedProfile function", async () => {
      const { getPersonalizedProfile } = await import("./db");
      expect(typeof getPersonalizedProfile).toBe("function");
    });

    it("should have createDistributorProfile function", async () => {
      const { createDistributorProfile } = await import("./db");
      expect(typeof createDistributorProfile).toBe("function");
    });

    it("should have createCustomerProfile function", async () => {
      const { createCustomerProfile } = await import("./db");
      expect(typeof createCustomerProfile).toBe("function");
    });

    it("should have updatePersonalizedProfile function", async () => {
      const { updatePersonalizedProfile } = await import("./db");
      expect(typeof updatePersonalizedProfile).toBe("function");
    });

    it("should have updateProfileSlug function", async () => {
      const { updateProfileSlug } = await import("./db");
      expect(typeof updateProfileSlug).toBe("function");
    });

    it("should have getProfileBySlug function", async () => {
      const { getProfileBySlug } = await import("./db");
      expect(typeof getProfileBySlug).toBe("function");
    });

    it("should have incrementProfilePageView function", async () => {
      const { incrementProfilePageView } = await import("./db");
      expect(typeof incrementProfilePageView).toBe("function");
    });

    it("should have getProfileStats function", async () => {
      const { getProfileStats } = await import("./db");
      expect(typeof getProfileStats).toBe("function");
    });
  });

  describe("Profile Retrieval", () => {
    it("should return null for non-existent slug", async () => {
      const { getProfileBySlug } = await import("./db");
      
      const result = await getProfileBySlug("non-existent-slug-xyz-123-" + Date.now());
      expect(result).toBeNull();
    });

    it("should return null for non-existent user profile", async () => {
      const { getPersonalizedProfile } = await import("./db");
      
      const result = await getPersonalizedProfile(999999999);
      expect(result).toBeNull();
    });
  });
});
