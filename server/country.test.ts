import { describe, it, expect } from 'vitest';
import { SUPPORTED_COUNTRIES, getCountryByCode, getCountryFlag, getCountryName } from '../shared/countries';

describe('Country Selection', () => {
  describe('SUPPORTED_COUNTRIES list', () => {
    it('should have at least 30 countries', () => {
      expect(SUPPORTED_COUNTRIES.length).toBeGreaterThanOrEqual(30);
    });

    it('should include United States', () => {
      const usa = SUPPORTED_COUNTRIES.find(c => c.code === 'US');
      expect(usa).toBeDefined();
      expect(usa?.name).toBe('United States');
      expect(usa?.flag).toBe('🇺🇸');
    });

    it('should include United Kingdom', () => {
      const uk = SUPPORTED_COUNTRIES.find(c => c.code === 'GB');
      expect(uk).toBeDefined();
      expect(uk?.name).toBe('United Kingdom');
      expect(uk?.flag).toBe('🇬🇧');
    });

    it('should include Canada', () => {
      const canada = SUPPORTED_COUNTRIES.find(c => c.code === 'CA');
      expect(canada).toBeDefined();
      expect(canada?.name).toBe('Canada');
      expect(canada?.flag).toBe('🇨🇦');
    });

    it('should have unique country codes', () => {
      const codes = SUPPORTED_COUNTRIES.map(c => c.code);
      const uniqueCodes = [...new Set(codes)];
      expect(codes.length).toBe(uniqueCodes.length);
    });
  });

  describe('getCountryByCode', () => {
    it('should return country for valid code', () => {
      const country = getCountryByCode('US');
      expect(country).toBeDefined();
      expect(country?.name).toBe('United States');
    });

    it('should return null for invalid code', () => {
      const country = getCountryByCode('XX');
      expect(country).toBeNull();
    });

    it('should handle lowercase codes', () => {
      const country = getCountryByCode('us');
      expect(country).toBeDefined();
      expect(country?.code).toBe('US');
    });

    it('should return null for null input', () => {
      const country = getCountryByCode(null);
      expect(country).toBeNull();
    });

    it('should return null for undefined input', () => {
      const country = getCountryByCode(undefined);
      expect(country).toBeNull();
    });
  });

  describe('getCountryFlag', () => {
    it('should return flag emoji for valid code', () => {
      const flag = getCountryFlag('US');
      expect(flag).toBe('🇺🇸');
    });

    it('should return empty string for invalid code', () => {
      const flag = getCountryFlag('XX');
      expect(flag).toBe('');
    });

    it('should return empty string for null', () => {
      const flag = getCountryFlag(null);
      expect(flag).toBe('');
    });

    it('should return empty string for empty string', () => {
      const flag = getCountryFlag('');
      expect(flag).toBe('');
    });
  });

  describe('getCountryName', () => {
    it('should return country name for valid code', () => {
      const name = getCountryName('US');
      expect(name).toBe('United States');
    });

    it('should return code for invalid code', () => {
      const name = getCountryName('XX');
      expect(name).toBe('XX');
    });

    it('should return empty string for null', () => {
      const name = getCountryName(null);
      expect(name).toBe('');
    });
  });
});
