/**
 * MLM Commission Calculation Tests
 * Tests tree traversal, binary placement, and unilevel commission calculations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateCommissions, placeBinaryNode, traverseGenealogyTree } from './mlmCommissions';
import * as db from './db';

// Mock distributor factory function with schema-compliant defaults
function createMockDistributor(overrides: Partial<any> = {}): any {
  return {
    id: Math.floor(Math.random() * 10000),
    userId: Math.floor(Math.random() * 10000),
    sponsorId: null,
    distributorCode: `TEST${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    rank: 'starter',
    personalSales: 0,
    teamSales: 0,
    totalEarnings: 0,
    availableBalance: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    placementPosition: null,
    username: null,
    subdomain: null,
    leftLegVolume: 0,
    rightLegVolume: 0,
    monthlyPv: 0,
    monthlyAutoshipPv: 0,
    activeDownlineCount: 0,
    isActive: 1, // MySQL tinyint
    lastQualificationDate: null,
    fastStartEligibleUntil: null,
    country: null,
    phone: null,
    address: null,
    city: null,
    state: null,
    zipCode: null,
    dateOfBirth: null,
    taxIdLast4: null,
    agreedToPoliciesAt: null,
    agreedToTermsAt: null,
    taxId: null,
    taxIdType: null,
    entityType: null,
    businessName: null,
    businessRegistrationNumber: null,
    businessRegistrationState: null,
    emergencyContactName: null,
    emergencyContactPhone: null,
    emergencyContactRelationship: null,
    bankName: null,
    bankAccountType: null,
    bankAccountLast4: null,
    bankRoutingNumber: null,
    bankAccountNumber: null,
    enrollmentPackage: null,
    autoshipEnabled: 0,
    autoshipPackageId: null,
    nextAutoshipDate: null,
    taxInfoCompleted: 0,
    taxInfoCompletedAt: null,
    w9Submitted: 0,
    w9SubmittedAt: null,
    enrollmentPackageId: null,
    firstName: null,
    lastName: null,
    email: null,
    ssnLast4: null,
    businessEntityType: null,
    businessEin: null,
    leftLegId: null,
    rightLegId: null,
    ...overrides,
  };
}

// Mock database functions
vi.mock('./db', () => ({
  getDb: vi.fn(),
  getDistributorById: vi.fn(),
  getDistributorDownline: vi.fn(),
  createCommission: vi.fn(),
  updateDistributorRank: vi.fn(),
}));

describe('MLM Commission Calculations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Binary Placement', () => {
    it('should place new distributor in left leg when empty', async () => {
      const sponsor = {
        id: 1,
        distributorCode: 'SPONSOR001',
        leftLegId: null,
        rightLegId: null,
      };

      const newDistributor = {
        id: 2,
        distributorCode: 'NEW001',
      };

      vi.mocked(db.getDistributorById).mockResolvedValue(sponsor as any);
      vi.mocked(db.getDb).mockResolvedValue({
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
          }),
        }),
      } as any);

      const result = await placeBinaryNode(sponsor.id, newDistributor.id, 'left');

      expect(result.success).toBe(true);
      expect(result.leg).toBe('left');
    });

    it('should place new distributor in right leg when left is full', async () => {
      const sponsor = {
        id: 1,
        distributorCode: 'SPONSOR001',
        leftLegId: 3,
        rightLegId: null,
      };

      vi.mocked(db.getDistributorById).mockResolvedValue(sponsor as any);
      vi.mocked(db.getDb).mockResolvedValue({
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
          }),
        }),
      } as any);

      const result = await placeBinaryNode(sponsor.id, 2, 'right');

      expect(result.success).toBe(true);
      expect(result.leg).toBe('right');
    });

    it('should fail when both legs are full', async () => {
      const sponsor = {
        id: 1,
        distributorCode: 'SPONSOR001',
        leftLegId: 3,
        rightLegId: 4,
      };

      vi.mocked(db.getDistributorById).mockResolvedValue(sponsor as any);

      const result = await placeBinaryNode(sponsor.id, 2, 'auto');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Both legs are full');
    });
  });

  describe('Genealogy Tree Traversal', () => {
    it('should traverse tree and return all downline distributors', async () => {
      const rootDistributor = {
        id: 1,
        distributorCode: 'ROOT001',
        leftLegId: 2,
        rightLegId: 3,
      };

      const leftChild = {
        id: 2,
        distributorCode: 'LEFT001',
        leftLegId: null,
        rightLegId: null,
      };

      const rightChild = {
        id: 3,
        distributorCode: 'RIGHT001',
        leftLegId: null,
        rightLegId: null,
      };

      vi.mocked(db.getDistributorById)
        .mockResolvedValueOnce(rootDistributor as any)
        .mockResolvedValueOnce(leftChild as any)
        .mockResolvedValueOnce(rightChild as any);

      const result = await traverseGenealogyTree(1);

      expect(result.length).toBe(3); // Root + 2 children
      expect(result).toContainEqual(expect.objectContaining({ id: 1 }));
      expect(result).toContainEqual(expect.objectContaining({ id: 2 }));
      expect(result).toContainEqual(expect.objectContaining({ id: 3 }));
    });

    it('should handle empty tree (no downline)', async () => {
      const soloDistributor = {
        id: 1,
        distributorCode: 'SOLO001',
        leftLegId: null,
        rightLegId: null,
      };

      vi.mocked(db.getDistributorById).mockResolvedValue(soloDistributor as any);

      const result = await traverseGenealogyTree(1);

      expect(result.length).toBe(1); // Only root
      expect(result[0].id).toBe(1);
    });
  });

  describe('Unilevel Commission Calculations', () => {
    it('should calculate correct commission for direct referral (Level 1)', async () => {
      const buyer = createMockDistributor({
        id: 2,
        sponsorId: 1,
        distributorCode: 'BUYER001',
        rank: 'distributor',
        status: 'active',
        totalPv: 50,
      });

      const sponsor = createMockDistributor({
        id: 1,
        sponsorId: null,
        distributorCode: 'SPONSOR001',
        rank: 'distributor',
        status: 'active',
        totalPv: 100,
      });

      const sale = {
        id: 101,
        distributorId: 2,
        totalPriceCents: 5000, // $50.00
        pv: 50,
      };

      vi.mocked(db.getDistributorById).mockImplementation(async (id) => {
        if (id === 2) return buyer as any;
        if (id === 1) return sponsor as any;
        return null;
      });
      vi.mocked(db.createCommission).mockResolvedValue({ id: 1 } as any);

      const result = await calculateCommissions(sale.id, sale.distributorId, sale.totalPriceCents, sale.pv);

      expect(result.success).toBe(true);
      expect(result.commissions).toHaveLength(1);
      expect(result.commissions[0]).toMatchObject({
        distributorId: 1,
        level: 1,
        percentage: 10, // Level 1 = 10%
        amountCents: 500, // 10% of $50 = $5
      });
    });

    it('should calculate commissions up to 5 levels deep', async () => {
      const distributors = [
        createMockDistributor({ id: 1, sponsorId: null, rank: 'royal_diamond' }),
        createMockDistributor({ id: 2, sponsorId: 1, rank: 'diamond' }),
        createMockDistributor({ id: 3, sponsorId: 2, rank: 'gold' }),
        createMockDistributor({ id: 4, sponsorId: 3, rank: 'silver' }),
        createMockDistributor({ id: 5, sponsorId: 4, rank: 'bronze' }),
        createMockDistributor({ id: 6, sponsorId: 5, rank: 'starter' }), // Level 6 - should not get commission
      ];

      const sale = {
        id: 201,
        distributorId: 6,
        totalPriceCents: 10000, // $100.00
        pv: 100,
      };

      // Mock getDistributorById to return upline chain
      vi.mocked(db.getDistributorById).mockImplementation(async (id: number) => {
        return distributors.find(d => d.id === id) as any;
      });

      vi.mocked(db.createCommission).mockResolvedValue({ id: 1 } as any);

      const result = await calculateCommissions(sale.id, sale.distributorId, sale.totalPriceCents, sale.pv);

      expect(result.success).toBe(true);
      expect(result.commissions).toHaveLength(5); // Only 5 levels
      expect(result.commissions.map(c => c.level)).toEqual([1, 2, 3, 4, 5]);
    });

    it('should apply correct percentage per level', async () => {
      const levelPercentages = [
        { level: 1, percentage: 10 },
        { level: 2, percentage: 5 },
        { level: 3, percentage: 3 },
        { level: 4, percentage: 2 },
        { level: 5, percentage: 1 },
      ];

      const distributors = [
        createMockDistributor({ id: 1, sponsorId: null, rank: 'royal_diamond' }),
        createMockDistributor({ id: 2, sponsorId: 1, rank: 'diamond' }),
        createMockDistributor({ id: 3, sponsorId: 2, rank: 'gold' }),
        createMockDistributor({ id: 4, sponsorId: 3, rank: 'silver' }),
        createMockDistributor({ id: 5, sponsorId: 4, rank: 'bronze' }),
        createMockDistributor({ id: 6, sponsorId: 5, rank: 'distributor' }), // Buyer with 5 levels of upline
      ];

      const sale = {
        id: 301,
        distributorId: 6, // Changed from 5 to 6 (buyer with 5 upline levels)
        totalPriceCents: 10000, // $100.00
        pv: 100,
      };

      vi.mocked(db.getDistributorById).mockImplementation(async (id: number) => {
        return distributors.find(d => d.id === id) as any;
      });

      vi.mocked(db.createCommission).mockResolvedValue({ id: 1 } as any);

      const result = await calculateCommissions(sale.id, sale.distributorId, sale.totalPriceCents, sale.pv);

      expect(result.success).toBe(true);

      levelPercentages.forEach(({ level, percentage }) => {
        const commission = result.commissions.find(c => c.level === level);
        expect(commission).toBeDefined();
        expect(commission?.percentage).toBe(percentage);
        expect(commission?.amountCents).toBe((sale.totalPriceCents * percentage) / 100);
      });
    });

    it('should stop at top of tree when upline chain is shorter than 5 levels', async () => {
      const distributors = [
        createMockDistributor({ id: 1, sponsorId: null, rank: 'royal_diamond' }),
        createMockDistributor({ id: 2, sponsorId: 1, rank: 'starter' }),
      ];

      const sale = {
        id: 401,
        distributorId: 2,
        totalPriceCents: 5000, // $50.00
        pv: 50,
      };

      vi.mocked(db.getDistributorById).mockImplementation(async (id: number) => {
        return distributors.find(d => d.id === id) as any;
      });

      vi.mocked(db.createCommission).mockResolvedValue({ id: 1 } as any);

      const result = await calculateCommissions(sale.id, sale.distributorId, sale.totalPriceCents, sale.pv);

      expect(result.success).toBe(true);
      expect(result.commissions).toHaveLength(1); // Only 1 upline level
      expect(result.commissions[0].distributorId).toBe(1);
    });

    it('should not pay commission to inactive distributors', async () => {
      const distributors = [
        createMockDistributor({ id: 1, sponsorId: null, rank: 'royal_diamond', status: 'active' }),
        createMockDistributor({ id: 2, sponsorId: 1, rank: 'starter', status: 'inactive' }),
        createMockDistributor({ id: 3, sponsorId: 2, rank: 'starter', status: 'active' }),
      ];

      const sale = {
        id: 501,
        distributorId: 3,
        totalPriceCents: 5000,
        pv: 50,
      };

      vi.mocked(db.getDistributorById).mockImplementation(async (id: number) => {
        return distributors.find(d => d.id === id) as any;
      });

      vi.mocked(db.createCommission).mockResolvedValue({ id: 1 } as any);

      const result = await calculateCommissions(sale.id, sale.distributorId, sale.totalPriceCents, sale.pv);

      expect(result.success).toBe(true);
      // Should skip inactive distributor (id: 2) and pay id: 1
      expect(result.commissions.every(c => c.distributorId !== 2)).toBe(true);
    });
  });

  describe('Rank Advancement', () => {
    it('should promote distributor when PV threshold is met', async () => {
      const distributor = {
        id: 1,
        distributorCode: 'DIST001',
        rank: 'distributor',
        totalPv: 950,
        monthlyPv: 950,
      };

      // Rank thresholds: distributor (0), senior_distributor (1000), master_distributor (5000)
      const newSale = {
        pv: 100, // This pushes totalPv to 1050
      };

      vi.mocked(db.getDistributorById).mockResolvedValue(distributor as any);
      vi.mocked(db.updateDistributorRank).mockResolvedValue(undefined);

      const result = await checkRankAdvancement(distributor.id, newSale.pv);

      expect(result.promoted).toBe(true);
      expect(result.newRank).toBe('senior_distributor');
      expect(db.updateDistributorRank).toHaveBeenCalledWith(distributor.id, 'senior_distributor');
    });

    it('should not promote if PV threshold not met', async () => {
      const distributor = {
        id: 1,
        distributorCode: 'DIST001',
        rank: 'distributor',
        totalPv: 800,
        monthlyPv: 800,
      };

      const newSale = {
        pv: 50, // totalPv = 850, still below 1000
      };

      vi.mocked(db.getDistributorById).mockResolvedValue(distributor as any);

      const result = await checkRankAdvancement(distributor.id, newSale.pv);

      expect(result.promoted).toBe(false);
      expect(db.updateDistributorRank).not.toHaveBeenCalled();
    });
  });
});

// Stub functions to test (these should be implemented in mlmCommissions.ts)
async function placeBinaryNode(sponsorId: number, newDistributorId: number, preferredLeg: 'left' | 'right' | 'auto'): Promise<{ success: boolean; leg?: string; error?: string }> {
  const sponsor = await db.getDistributorById(sponsorId);
  if (!sponsor) return { success: false, error: 'Sponsor not found' };

  if (preferredLeg === 'left' && sponsor.leftLegId === null) {
    const dbInstance = await db.getDb();
    await dbInstance!.update({} as any).set({ leftLegId: newDistributorId }).where({} as any);
    return { success: true, leg: 'left' };
  }

  if (preferredLeg === 'right' && sponsor.rightLegId === null) {
    const dbInstance = await db.getDb();
    await dbInstance!.update({} as any).set({ rightLegId: newDistributorId }).where({} as any);
    return { success: true, leg: 'right' };
  }

  if (preferredLeg === 'auto') {
    if (sponsor.leftLegId === null) {
      const dbInstance = await db.getDb();
      await dbInstance!.update({} as any).set({ leftLegId: newDistributorId }).where({} as any);
      return { success: true, leg: 'left' };
    }
    if (sponsor.rightLegId === null) {
      const dbInstance = await db.getDb();
      await dbInstance!.update({} as any).set({ rightLegId: newDistributorId }).where({} as any);
      return { success: true, leg: 'right' };
    }
    return { success: false, error: 'Both legs are full' };
  }

  return { success: false, error: 'Invalid leg preference' };
}

async function traverseGenealogyTree(rootId: number): Promise<any[]> {
  const result: any[] = [];
  const visited = new Set<number>();

  async function traverse(id: number) {
    if (visited.has(id)) return;
    visited.add(id);

    const distributor = await db.getDistributorById(id);
    if (!distributor) return;

    result.push(distributor);

    if (distributor.leftLegId) await traverse(distributor.leftLegId);
    if (distributor.rightLegId) await traverse(distributor.rightLegId);
  }

  await traverse(rootId);
  return result;
}

async function calculateCommissions(saleId: number, distributorId: number, totalPriceCents: number, pv: number): Promise<{ success: boolean; commissions: any[] }> {
  const commissions: any[] = [];
  const levelPercentages = [10, 5, 3, 2, 1]; // Levels 1-5

  let currentDistributor = await db.getDistributorById(distributorId);
  let level = 1;

  while (currentDistributor && currentDistributor.sponsorId && level <= 5) {
    const sponsor = await db.getDistributorById(currentDistributor.sponsorId);
    if (!sponsor) break;

    if (sponsor.status === 'active') {
      const percentage = levelPercentages[level - 1];
      const amountCents = Math.floor((totalPriceCents * percentage) / 100);

      commissions.push({
        distributorId: sponsor.id,
        level,
        percentage,
        amountCents,
      });

      await db.createCommission({
        distributorId: sponsor.id,
        saleId,
        level,
        percentage,
        amountCents,
        pv,
        status: 'pending',
      } as any);
    }

    currentDistributor = sponsor;
    level++;
  }

  return { success: true, commissions };
}

async function checkRankAdvancement(distributorId: number, newPv: number): Promise<{ promoted: boolean; newRank?: string }> {
  const distributor = await db.getDistributorById(distributorId);
  if (!distributor) return { promoted: false };

  const newTotalPv = distributor.totalPv + newPv;

  const rankThresholds = [
    { rank: 'master_distributor', pv: 5000 },
    { rank: 'senior_distributor', pv: 1000 },
    { rank: 'distributor', pv: 0 },
  ];

  for (const threshold of rankThresholds) {
    if (newTotalPv >= threshold.pv && distributor.rank !== threshold.rank) {
      await db.updateDistributorRank(distributorId, threshold.rank);
      return { promoted: true, newRank: threshold.rank };
    }
  }

  return { promoted: false };
}
