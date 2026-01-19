import { describe, it, expect } from "vitest";
import {
  generateNftMetadata,
  getNetworkInfo,
  isValidAddress,
  getExplorerUrl,
} from "./blockchain";
import {
  calculateNftRarity,
  generateNftName,
} from "./db";

describe("Blockchain Integration Tests", () => {
  describe("NFT Rarity Calculation", () => {
    it("should calculate legendary rarity for tokens 1-10", () => {
      const result = calculateNftRarity(1);
      expect(result.rarity).toBe("legendary");
      expect(result.estimatedValue).toBe(10000);
    });

    it("should calculate epic rarity for tokens 11-50", () => {
      const result = calculateNftRarity(25);
      expect(result.rarity).toBe("epic");
      expect(result.estimatedValue).toBeGreaterThan(0);
    });

    it("should calculate rare rarity for tokens 51-200", () => {
      const result = calculateNftRarity(100);
      expect(result.rarity).toBe("rare");
    });

    it("should calculate uncommon rarity for tokens 201-500", () => {
      const result = calculateNftRarity(300);
      expect(result.rarity).toBe("uncommon");
    });

    it("should calculate common rarity for tokens 501+", () => {
      const result = calculateNftRarity(600);
      expect(result.rarity).toBe("common");
    });
  });

  describe("NFT Name Generation", () => {
    it("should generate correct name for legendary NFT", () => {
      const name = generateNftName(1, "legendary");
      expect(name).toBe("NEON Genesis #1");
    });

    it("should generate correct name for epic NFT", () => {
      const name = generateNftName(25, "epic");
      expect(name).toBe("NEON Pioneer #25");
    });

    it("should generate correct name for rare NFT", () => {
      const name = generateNftName(100, "rare");
      expect(name).toBe("NEON Founder #100");
    });
  });

  describe("Network Info", () => {
    it("should return valid network configuration", () => {
      const info = getNetworkInfo();
      expect(info).toHaveProperty("network");
      expect(info).toHaveProperty("chainId");
      expect(info).toHaveProperty("rpcUrl");
      expect(info).toHaveProperty("explorerUrl");
      expect(info).toHaveProperty("openseaUrl");
    });

    it("should return Mumbai testnet in development", () => {
      const info = getNetworkInfo();
      // In test environment, should default to testnet
      expect(info.network).toContain("Mumbai");
    });
  });

  describe("Address Validation", () => {
    it("should validate correct Ethereum addresses", () => {
      // Test with valid addresses
      expect(isValidAddress("0x0000000000000000000000000000000000000000")).toBe(true);
      expect(isValidAddress("0xdead000000000000000000000000000000000000")).toBe(true);
    });

    it("should reject invalid addresses", () => {
      expect(isValidAddress("invalid")).toBe(false);
      expect(isValidAddress("0x123")).toBe(false);
      expect(isValidAddress("")).toBe(false);
    });
  });

  describe("NFT Metadata Generation", () => {
    it("should generate OpenSea-compatible metadata", () => {
      const nft = {
        tokenId: 1,
        name: "NEON Genesis #1",
        description: "Test NFT",
        imageUrl: "https://example.com/image.png",
        rarity: "legendary",
        rarityRank: 1,
        estimatedValue: "10000",
        ownerName: "Test User",
      };

      const metadata = generateNftMetadata(nft);
      
      expect(metadata).toHaveProperty("name", "NEON Genesis #1");
      expect(metadata).toHaveProperty("description");
      expect(metadata).toHaveProperty("image");
      expect(metadata).toHaveProperty("external_url");
      expect(metadata).toHaveProperty("attributes");
      expect(Array.isArray((metadata as any).attributes)).toBe(true);
    });

    it("should include rarity attribute", () => {
      const nft = {
        tokenId: 1,
        name: "NEON Genesis #1",
        description: "Test NFT",
        imageUrl: null,
        rarity: "legendary",
        rarityRank: 1,
        estimatedValue: "10000",
        ownerName: null,
      };

      const metadata = generateNftMetadata(nft) as any;
      const rarityAttr = metadata.attributes.find((a: any) => a.trait_type === "Rarity");
      
      expect(rarityAttr).toBeDefined();
      expect(rarityAttr.value).toBe("Legendary");
    });
  });

  describe("URL Generation", () => {
    it("should generate explorer URL for transaction", () => {
      const url = getExplorerUrl("0x123abc");
      expect(url).toContain("polygonscan.com/tx/0x123abc");
    });
  });
});
