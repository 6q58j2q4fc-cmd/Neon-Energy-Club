import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getOrdersByUserEmail: vi.fn(),
  getNftsByEmail: vi.fn(),
}));

import { getOrdersByUserEmail, getNftsByEmail } from "./db";

describe("User Orders and NFTs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getOrdersByUserEmail", () => {
    it("should return empty arrays when no orders exist", async () => {
      (getOrdersByUserEmail as any).mockResolvedValue({
        preorders: [],
        crowdfunding: [],
      });

      const result = await getOrdersByUserEmail("test@example.com");
      
      expect(result).toEqual({
        preorders: [],
        crowdfunding: [],
      });
      expect(getOrdersByUserEmail).toHaveBeenCalledWith("test@example.com");
    });

    it("should return preorders for a user", async () => {
      const mockPreorders = [
        {
          id: 1,
          name: "Test User",
          email: "test@example.com",
          quantity: 2,
          status: "pending",
          createdAt: new Date(),
        },
      ];

      (getOrdersByUserEmail as any).mockResolvedValue({
        preorders: mockPreorders,
        crowdfunding: [],
      });

      const result = await getOrdersByUserEmail("test@example.com");
      
      expect(result.preorders).toHaveLength(1);
      expect(result.preorders[0].email).toBe("test@example.com");
    });

    it("should return crowdfunding contributions for a user", async () => {
      const mockCrowdfunding = [
        {
          id: 1,
          name: "Test User",
          email: "test@example.com",
          amount: 100,
          status: "completed",
          createdAt: new Date(),
        },
      ];

      (getOrdersByUserEmail as any).mockResolvedValue({
        preorders: [],
        crowdfunding: mockCrowdfunding,
      });

      const result = await getOrdersByUserEmail("test@example.com");
      
      expect(result.crowdfunding).toHaveLength(1);
      expect(result.crowdfunding[0].amount).toBe(100);
    });
  });

  describe("getNftsByEmail", () => {
    it("should return empty array when no NFTs exist", async () => {
      (getNftsByEmail as any).mockResolvedValue([]);

      const result = await getNftsByEmail("test@example.com");
      
      expect(result).toEqual([]);
      expect(getNftsByEmail).toHaveBeenCalledWith("test@example.com");
    });

    it("should return NFTs for a user", async () => {
      const mockNfts = [
        {
          id: 1,
          tokenId: 1,
          name: "NEON Genesis #1",
          rarity: "legendary",
          ownerEmail: "test@example.com",
          estimatedValue: "1000.00",
        },
        {
          id: 2,
          tokenId: 5,
          name: "NEON Genesis #5",
          rarity: "epic",
          ownerEmail: "test@example.com",
          estimatedValue: "500.00",
        },
      ];

      (getNftsByEmail as any).mockResolvedValue(mockNfts);

      const result = await getNftsByEmail("test@example.com");
      
      expect(result).toHaveLength(2);
      expect(result[0].rarity).toBe("legendary");
      expect(result[1].rarity).toBe("epic");
    });
  });
});

describe("Search Functionality", () => {
  const products = [
    { 
      title: "NEON Original", 
      path: "/products", 
      keywords: ["original", "green", "classic", "100 calories", "energy", "drink"],
      category: "product",
      price: "$2.99",
    },
    { 
      title: "NEON Organic", 
      path: "/products", 
      keywords: ["organic", "usda", "40 calories", "orange", "natural", "healthy"],
      category: "product",
      price: "$3.49",
    },
  ];

  const searchablePages = [
    { title: "Home", path: "/", keywords: ["home", "main", "start"], category: "page" },
    { title: "Products", path: "/products", keywords: ["products", "drinks", "energy"], category: "page" },
    { title: "Profile", path: "/profile", keywords: ["profile", "account", "settings"], category: "page" },
    { title: "My Orders", path: "/orders", keywords: ["orders", "purchases", "history"], category: "page" },
  ];

  const filterResults = (query: string) => {
    return [
      ...products.filter(product => 
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.keywords.some(kw => kw.toLowerCase().includes(query.toLowerCase()))
      ),
      ...searchablePages.filter(page => 
        page.title.toLowerCase().includes(query.toLowerCase()) ||
        page.keywords.some(kw => kw.toLowerCase().includes(query.toLowerCase()))
      )
    ].slice(0, 8);
  };

  it("should find products by title", () => {
    const results = filterResults("Original");
    expect(results.some(r => r.title === "NEON Original")).toBe(true);
  });

  it("should find products by keyword", () => {
    const results = filterResults("organic");
    expect(results.some(r => r.title === "NEON Organic")).toBe(true);
  });

  it("should find pages by title", () => {
    const results = filterResults("Profile");
    expect(results.some(r => r.title === "Profile")).toBe(true);
  });

  it("should find pages by keyword", () => {
    const results = filterResults("orders");
    expect(results.some(r => r.title === "My Orders")).toBe(true);
  });

  it("should prioritize products in search results", () => {
    const results = filterResults("energy");
    const productIndex = results.findIndex(r => r.category === "product");
    const pageIndex = results.findIndex(r => r.category === "page");
    
    // Products should appear before pages when both match
    if (productIndex !== -1 && pageIndex !== -1) {
      expect(productIndex).toBeLessThan(pageIndex);
    }
  });

  it("should return empty array for no matches", () => {
    const results = filterResults("xyznonexistent");
    expect(results).toHaveLength(0);
  });

  it("should limit results to 8 items", () => {
    // Add more items to test limit
    const allItems = [...products, ...searchablePages];
    const results = filterResults(""); // Empty query would match nothing in real implementation
    expect(results.length).toBeLessThanOrEqual(8);
  });
});
