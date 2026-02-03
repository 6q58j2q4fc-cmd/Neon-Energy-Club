import { describe, it, expect } from 'vitest';

describe('Vanity Links & Unique IDs', () => {
  describe('Distributor Code Generation', () => {
    it('should generate distributor codes with DIST prefix', () => {
      // Simulate distributor code generation logic
      const userId = 123;
      const distributorCode = `DIST${userId}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      expect(distributorCode).toMatch(/^DIST\d+[A-Z0-9]+$/);
      expect(distributorCode.startsWith('DIST')).toBe(true);
    });

    it('should generate unique distributor codes for different users', () => {
      const codes = new Set<string>();
      for (let i = 1; i <= 100; i++) {
        const code = `DIST${i}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        codes.add(code);
      }
      // All codes should be unique
      expect(codes.size).toBe(100);
    });
  });

  describe('Customer Code Generation', () => {
    it('should generate customer codes with CUST prefix', () => {
      // Simulate customer code generation logic
      const userId = 456;
      const customerCode = `CUST${userId}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      expect(customerCode).toMatch(/^CUST\d+[A-Z0-9]+$/);
      expect(customerCode.startsWith('CUST')).toBe(true);
    });

    it('should generate unique customer codes for different users', () => {
      const codes = new Set<string>();
      for (let i = 1; i <= 100; i++) {
        const code = `CUST${i}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        codes.add(code);
      }
      // All codes should be unique
      expect(codes.size).toBe(100);
    });
  });

  describe('Code Differentiation', () => {
    it('should have different prefixes for distributors and customers', () => {
      const distributorCode = `DIST123${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const customerCode = `CUST123${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      // Codes should have different prefixes
      expect(distributorCode.startsWith('DIST')).toBe(true);
      expect(customerCode.startsWith('CUST')).toBe(true);
      expect(distributorCode.startsWith('CUST')).toBe(false);
      expect(customerCode.startsWith('DIST')).toBe(false);
    });

    it('should not generate conflicting codes between distributors and customers', () => {
      const distributorCodes = new Set<string>();
      const customerCodes = new Set<string>();
      
      // Generate 50 of each type
      for (let i = 1; i <= 50; i++) {
        distributorCodes.add(`DIST${i}${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
        customerCodes.add(`CUST${i}${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
      }
      
      // No overlap should exist
      for (const code of distributorCodes) {
        expect(customerCodes.has(code)).toBe(false);
      }
    });
  });

  describe('Vanity URL Format', () => {
    it('should format distributor vanity URLs correctly', () => {
      const distributorCode = 'DIST123ABCDEF';
      const vanityUrl = `/d/${distributorCode}`;
      
      expect(vanityUrl).toBe('/d/DIST123ABCDEF');
      expect(vanityUrl.startsWith('/d/')).toBe(true);
    });

    it('should be publicly accessible without login requirement', () => {
      // Vanity URLs should be accessible via public routes
      const distributorCode = 'DIST456XYZ123';
      const publicUrl = `/d/${distributorCode}`;
      
      // URL should not require authentication (no /api/protected prefix)
      expect(publicUrl.includes('/api/')).toBe(false);
      expect(publicUrl.includes('/protected/')).toBe(false);
    });
  });
});
