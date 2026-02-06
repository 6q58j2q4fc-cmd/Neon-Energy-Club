import { describe, it, expect } from 'vitest';
import {
  calculateImpactFromCans,
  getProductQuantitiesFromOrder,
  IMPACT_FORMULAS,
} from './charityImpact';

describe('Charity Impact Calculations', () => {
  describe('calculateImpactFromCans', () => {
    it('should calculate correct impact for NEON Original', () => {
      const result = calculateImpactFromCans(100, 0);
      
      expect(result.cansOriginal).toBe(100);
      expect(result.cansPink).toBe(0);
      expect(result.treesProtected).toBe(50); // 100 * 0.5
      expect(result.habitatProtected).toBe(1000); // 100 * 10
      expect(result.speciesSaved).toBe(10); // 100 * 0.1
      expect(result.animalLivesSaved).toBe(0);
    });

    it('should calculate correct impact for NEON Pink', () => {
      const result = calculateImpactFromCans(0, 80);
      
      expect(result.cansOriginal).toBe(0);
      expect(result.cansPink).toBe(80);
      expect(result.treesProtected).toBe(0);
      expect(result.habitatProtected).toBe(0);
      expect(result.speciesSaved).toBe(0);
      expect(result.animalLivesSaved).toBe(20); // 80 * 0.25
    });

    it('should calculate correct impact for mixed products', () => {
      const result = calculateImpactFromCans(50, 40);
      
      expect(result.cansOriginal).toBe(50);
      expect(result.cansPink).toBe(40);
      expect(result.treesProtected).toBe(25); // 50 * 0.5
      expect(result.habitatProtected).toBe(500); // 50 * 10
      expect(result.speciesSaved).toBe(5); // 50 * 0.1
      expect(result.animalLivesSaved).toBe(10); // 40 * 0.25
    });

    it('should handle zero cans', () => {
      const result = calculateImpactFromCans(0, 0);
      
      expect(result.cansOriginal).toBe(0);
      expect(result.cansPink).toBe(0);
      expect(result.treesProtected).toBe(0);
      expect(result.habitatProtected).toBe(0);
      expect(result.speciesSaved).toBe(0);
      expect(result.animalLivesSaved).toBe(0);
    });
  });

  describe('getProductQuantitiesFromOrder', () => {
    it('should count individual NEON Original cans', () => {
      const items = [
        { productSku: 'NEON-ORIGINAL', quantity: 12 },
      ];
      
      const result = getProductQuantitiesFromOrder(items);
      
      expect(result.cansOriginal).toBe(12);
      expect(result.cansPink).toBe(0);
    });

    it('should count NEON Original cases (24 cans per case)', () => {
      const items = [
        { productSku: 'NEON-ORIGINAL-CASE', quantity: 2 },
      ];
      
      const result = getProductQuantitiesFromOrder(items);
      
      expect(result.cansOriginal).toBe(48); // 2 cases * 24 cans
      expect(result.cansPink).toBe(0);
    });

    it('should count individual NEON Pink cans', () => {
      const items = [
        { productSku: 'NEON-PINK', quantity: 6 },
      ];
      
      const result = getProductQuantitiesFromOrder(items);
      
      expect(result.cansOriginal).toBe(0);
      expect(result.cansPink).toBe(6);
    });

    it('should count NEON Pink cases (24 cans per case)', () => {
      const items = [
        { productSku: 'NEON-PINK-CASE', quantity: 3 },
      ];
      
      const result = getProductQuantitiesFromOrder(items);
      
      expect(result.cansOriginal).toBe(0);
      expect(result.cansPink).toBe(72); // 3 cases * 24 cans
    });

    it('should handle mixed orders with both products', () => {
      const items = [
        { productSku: 'NEON-ORIGINAL', quantity: 12 },
        { productSku: 'NEON-PINK-CASE', quantity: 1 },
        { productSku: 'NEON-ORIGINAL-CASE', quantity: 1 },
      ];
      
      const result = getProductQuantitiesFromOrder(items);
      
      expect(result.cansOriginal).toBe(36); // 12 + (1 * 24)
      expect(result.cansPink).toBe(24); // 1 * 24
    });

    it('should handle case-insensitive SKUs', () => {
      const items = [
        { productSku: 'neon-original', quantity: 5 },
        { productSku: 'NEON-PINK', quantity: 3 },
      ];
      
      const result = getProductQuantitiesFromOrder(items);
      
      expect(result.cansOriginal).toBe(5);
      expect(result.cansPink).toBe(3);
    });

    it('should ignore non-NEON products', () => {
      const items = [
        { productSku: 'NEON-ORIGINAL', quantity: 10 },
        { productSku: 'OTHER-PRODUCT', quantity: 5 },
        { productSku: 'NEON-PINK', quantity: 8 },
      ];
      
      const result = getProductQuantitiesFromOrder(items);
      
      expect(result.cansOriginal).toBe(10);
      expect(result.cansPink).toBe(8);
    });

    it('should handle empty order', () => {
      const items: any[] = [];
      
      const result = getProductQuantitiesFromOrder(items);
      
      expect(result.cansOriginal).toBe(0);
      expect(result.cansPink).toBe(0);
    });
  });

  describe('Impact Formulas', () => {
    it('should have correct formula values', () => {
      expect(IMPACT_FORMULAS.NEON_ORIGINAL.treesPerCan).toBe(0.5);
      expect(IMPACT_FORMULAS.NEON_ORIGINAL.habitatSqFtPerCan).toBe(10);
      expect(IMPACT_FORMULAS.NEON_ORIGINAL.speciesPerCan).toBe(0.1);
      expect(IMPACT_FORMULAS.NEON_PINK.animalLivesPerCan).toBe(0.25);
      expect(IMPACT_FORMULAS.CANS_PER_CASE).toBe(24);
    });
  });

  describe('Real-world scenarios', () => {
    it('should calculate impact for a typical monthly personal order', () => {
      // Distributor orders 2 cases of Original and 1 case of Pink per month
      const items = [
        { productSku: 'NEON-ORIGINAL-CASE', quantity: 2 },
        { productSku: 'NEON-PINK-CASE', quantity: 1 },
      ];
      
      const { cansOriginal, cansPink } = getProductQuantitiesFromOrder(items);
      const impact = calculateImpactFromCans(cansOriginal, cansPink);
      
      expect(impact.cansOriginal).toBe(48); // 2 * 24
      expect(impact.cansPink).toBe(24); // 1 * 24
      expect(impact.treesProtected).toBe(24); // 48 * 0.5
      expect(impact.habitatProtected).toBe(480); // 48 * 10
      expect(impact.speciesSaved).toBeCloseTo(4.8, 1); // 48 * 0.1
      expect(impact.animalLivesSaved).toBe(6); // 24 * 0.25
    });

    it('should calculate impact for a team of 10 distributors', () => {
      // Each distributor orders 1 case of Original per month
      // Total: 10 cases = 240 cans
      const totalCans = 10 * 24;
      const impact = calculateImpactFromCans(totalCans, 0);
      
      expect(impact.treesProtected).toBe(120); // 240 * 0.5
      expect(impact.habitatProtected).toBe(2400); // 240 * 10
      expect(impact.speciesSaved).toBe(24); // 240 * 0.1
    });

    it('should calculate impact for a large team milestone (1000 cans)', () => {
      const impact = calculateImpactFromCans(1000, 0);
      
      expect(impact.treesProtected).toBe(500);
      expect(impact.habitatProtected).toBe(10000);
      expect(impact.speciesSaved).toBe(100);
    });
  });
});
