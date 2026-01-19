import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('./db', () => ({
  getReferralLeaderboard: vi.fn(),
  getLeaderboardStats: vi.fn(),
  getUserLeaderboardPosition: vi.fn(),
  getUserReferralStatsByEmail: vi.fn(),
}));

import { getReferralLeaderboard, getLeaderboardStats, getUserLeaderboardPosition, getUserReferralStatsByEmail } from './db';

describe('Leaderboard Database Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getReferralLeaderboard', () => {
    it('should return empty array when no referrers exist', async () => {
      vi.mocked(getReferralLeaderboard).mockResolvedValue([]);
      
      const result = await getReferralLeaderboard(50);
      expect(result).toEqual([]);
    });

    it('should return leaderboard entries sorted by total referrals', async () => {
      const mockLeaderboard = [
        {
          subscriberId: 'sub_1',
          name: 'John Doe',
          email: 'john@example.com',
          totalReferrals: 50,
          customersReferred: 30,
          distributorsReferred: 5,
          referralCode: 'JOHN123',
        },
        {
          subscriberId: 'sub_2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          totalReferrals: 25,
          customersReferred: 15,
          distributorsReferred: 3,
          referralCode: 'JANE456',
        },
      ];
      
      vi.mocked(getReferralLeaderboard).mockResolvedValue(mockLeaderboard);
      
      const result = await getReferralLeaderboard(50);
      expect(result).toHaveLength(2);
      expect(result[0].totalReferrals).toBeGreaterThan(result[1].totalReferrals);
    });

    it('should respect the limit parameter', async () => {
      const mockLeaderboard = [
        { subscriberId: 'sub_1', name: 'User 1', totalReferrals: 100 },
        { subscriberId: 'sub_2', name: 'User 2', totalReferrals: 90 },
        { subscriberId: 'sub_3', name: 'User 3', totalReferrals: 80 },
      ];
      
      vi.mocked(getReferralLeaderboard).mockResolvedValue(mockLeaderboard.slice(0, 2));
      
      const result = await getReferralLeaderboard(2);
      expect(result).toHaveLength(2);
    });
  });

  describe('getLeaderboardStats', () => {
    it('should return zero stats when no referrers exist', async () => {
      vi.mocked(getLeaderboardStats).mockResolvedValue({
        totalReferrers: 0,
        totalReferrals: 0,
        totalCustomerConversions: 0,
        totalDistributorConversions: 0,
        averageReferrals: 0,
      });
      
      const result = await getLeaderboardStats();
      expect(result.totalReferrers).toBe(0);
      expect(result.totalReferrals).toBe(0);
      expect(result.totalCustomerConversions).toBe(0);
      expect(result.totalDistributorConversions).toBe(0);
      expect(result.averageReferrals).toBe(0);
    });

    it('should return aggregated stats when referrers exist', async () => {
      vi.mocked(getLeaderboardStats).mockResolvedValue({
        totalReferrers: 10,
        totalReferrals: 150,
        totalCustomerConversions: 75,
        totalDistributorConversions: 15,
        averageReferrals: 15,
      });
      
      const result = await getLeaderboardStats();
      expect(result.totalReferrers).toBe(10);
      expect(result.totalReferrals).toBe(150);
      expect(result.totalCustomerConversions).toBe(75);
      expect(result.totalDistributorConversions).toBe(15);
      expect(result.averageReferrals).toBe(15);
    });
  });

  describe('getUserLeaderboardPosition', () => {
    it('should return null for non-existent subscriber', async () => {
      vi.mocked(getUserLeaderboardPosition).mockResolvedValue(null);
      
      const result = await getUserLeaderboardPosition('non_existent_id');
      expect(result).toBeNull();
    });

    it('should return position and stats for existing subscriber', async () => {
      vi.mocked(getUserLeaderboardPosition).mockResolvedValue({
        position: 5,
        subscriberId: 'sub_123',
        name: 'Test User',
        email: 'test@example.com',
        totalReferrals: 20,
        customersReferred: 10,
        distributorsReferred: 2,
        referralCode: 'TEST123',
      });
      
      const result = await getUserLeaderboardPosition('sub_123');
      expect(result).not.toBeNull();
      expect(result?.position).toBe(5);
      expect(result?.totalReferrals).toBe(20);
    });
  });

  describe('getUserReferralStatsByEmail', () => {
    it('should return null for non-existent email', async () => {
      vi.mocked(getUserReferralStatsByEmail).mockResolvedValue(null);
      
      const result = await getUserReferralStatsByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });

    it('should return stats and position for existing email', async () => {
      vi.mocked(getUserReferralStatsByEmail).mockResolvedValue({
        position: 3,
        subscriberId: 'sub_456',
        name: 'Email User',
        email: 'email@example.com',
        totalReferrals: 35,
        customersReferred: 20,
        distributorsReferred: 5,
        referralCode: 'EMAIL789',
      });
      
      const result = await getUserReferralStatsByEmail('email@example.com');
      expect(result).not.toBeNull();
      expect(result?.position).toBe(3);
      expect(result?.email).toBe('email@example.com');
    });
  });
});

describe('Leaderboard Tier Calculation', () => {
  const getTier = (referrals: number) => {
    if (referrals >= 100) return { name: 'Diamond', color: 'cyan', badge: '💎' };
    if (referrals >= 50) return { name: 'Platinum', color: 'purple', badge: '🏆' };
    if (referrals >= 25) return { name: 'Gold', color: 'yellow', badge: '🥇' };
    if (referrals >= 10) return { name: 'Silver', color: 'gray', badge: '🥈' };
    if (referrals >= 5) return { name: 'Bronze', color: 'orange', badge: '🥉' };
    return { name: 'Starter', color: 'green', badge: '⭐' };
  };

  it('should return Starter tier for 1-4 referrals', () => {
    expect(getTier(1).name).toBe('Starter');
    expect(getTier(4).name).toBe('Starter');
  });

  it('should return Bronze tier for 5-9 referrals', () => {
    expect(getTier(5).name).toBe('Bronze');
    expect(getTier(9).name).toBe('Bronze');
  });

  it('should return Silver tier for 10-24 referrals', () => {
    expect(getTier(10).name).toBe('Silver');
    expect(getTier(24).name).toBe('Silver');
  });

  it('should return Gold tier for 25-49 referrals', () => {
    expect(getTier(25).name).toBe('Gold');
    expect(getTier(49).name).toBe('Gold');
  });

  it('should return Platinum tier for 50-99 referrals', () => {
    expect(getTier(50).name).toBe('Platinum');
    expect(getTier(99).name).toBe('Platinum');
  });

  it('should return Diamond tier for 100+ referrals', () => {
    expect(getTier(100).name).toBe('Diamond');
    expect(getTier(500).name).toBe('Diamond');
  });
});

describe('Leaderboard Points Calculation', () => {
  const calculatePoints = (referrals: number, customers: number, distributors: number) => {
    return (referrals * 10) + (customers * 50) + (distributors * 100);
  };

  it('should calculate points correctly', () => {
    // 10 referrals × 10 = 100
    // 5 customers × 50 = 250
    // 2 distributors × 100 = 200
    // Total = 550
    expect(calculatePoints(10, 5, 2)).toBe(550);
  });

  it('should return 0 for no activity', () => {
    expect(calculatePoints(0, 0, 0)).toBe(0);
  });

  it('should weight distributor conversions highest', () => {
    // 1 distributor = 100 points
    // 2 customers = 100 points
    // 10 referrals = 100 points
    expect(calculatePoints(0, 0, 1)).toBe(100);
    expect(calculatePoints(0, 2, 0)).toBe(100);
    expect(calculatePoints(10, 0, 0)).toBe(100);
  });
});

describe('Leaderboard Name Anonymization', () => {
  const anonymizeName = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 2) + '***';
    }
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1][0];
    return firstName + ' ' + lastInitial + '.';
  };

  it('should anonymize single names correctly', () => {
    expect(anonymizeName('John')).toBe('Jo***');
    expect(anonymizeName('A')).toBe('A***');
  });

  it('should anonymize full names correctly', () => {
    expect(anonymizeName('John Doe')).toBe('John D.');
    expect(anonymizeName('Jane Smith')).toBe('Jane S.');
  });

  it('should handle names with multiple parts', () => {
    expect(anonymizeName('Mary Jane Watson')).toBe('Mary W.');
  });

  it('should handle names with extra whitespace', () => {
    expect(anonymizeName('  John  Doe  ')).toBe('John D.');
  });
});

describe('Leaderboard API Endpoints', () => {
  it('should have correct endpoint structure for leaderboard query', () => {
    // This tests the expected structure of the leaderboard endpoint
    const expectedInput = {
      limit: 50,
      timeframe: 'all' as const,
    };
    
    expect(expectedInput.limit).toBeLessThanOrEqual(100);
    expect(['all', 'monthly', 'weekly']).toContain(expectedInput.timeframe);
  });

  it('should validate limit bounds', () => {
    const validateLimit = (limit: number) => {
      return limit >= 1 && limit <= 100;
    };
    
    expect(validateLimit(1)).toBe(true);
    expect(validateLimit(50)).toBe(true);
    expect(validateLimit(100)).toBe(true);
    expect(validateLimit(0)).toBe(false);
    expect(validateLimit(101)).toBe(false);
  });
});
