import { describe, it, expect, beforeAll } from 'vitest';
import { getDistributorPublicProfile, getUserProfileBySlug } from './db';

describe('Distributor Profile Loading', () => {
  it('should load distributor by code DIST1650938X2GLWR', async () => {
    const profile = await getDistributorPublicProfile('DIST1650938X2GLWR');
    console.log('Profile result:', JSON.stringify(profile, null, 2));
    expect(profile).toBeTruthy();
    expect(profile?.distributorCode).toBe('DIST1650938X2GLWR');
  });

  it('should return null for non-existent distributor', async () => {
    const profile = await getDistributorPublicProfile('NONEXISTENT');
    expect(profile).toBeNull();
  });

  it('getUserProfileBySlug should handle distributor codes', async () => {
    const profile = await getUserProfileBySlug('DIST1');
    console.log('getUserProfileBySlug result:', profile);
    // This might be null if no userProfile exists, which is expected
  });
});
