import { describe, it, expect } from 'vitest';
import { generateDistributorInsights, analyzeTeamTrends, generateCommissionOptimization } from './analyticsLLM';

describe('Analytics LLM System', () => {
  describe('generateDistributorInsights', () => {
    it('should generate insights for a new distributor', async () => {
      const analytics = {
        distributorId: 1,
        distributorCode: 'TEST001',
        rank: 'starter',
        personalSales: 0,
        teamSales: 0,
        leftLegVolume: 0,
        rightLegVolume: 0,
        monthlyPv: 0,
        totalDownline: 0,
        activeDownline: 0,
        commissionTotal: 0,
        joinDate: new Date(),
      };

      const teamMembers: any[] = [];

      const insights = await generateDistributorInsights(analytics, teamMembers);

      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);

      // Check insight structure
      insights.forEach(insight => {
        expect(insight).toHaveProperty('category');
        expect(insight).toHaveProperty('title');
        expect(insight).toHaveProperty('description');
        expect(insight).toHaveProperty('priority');
        expect(insight).toHaveProperty('actionable');
        expect(['performance', 'growth', 'commission', 'team', 'recommendation']).toContain(insight.category);
        expect(['high', 'medium', 'low']).toContain(insight.priority);
      });
    }, 30000); // 30 second timeout for LLM call

    it('should identify leg imbalance', async () => {
      const analytics = {
        distributorId: 1,
        distributorCode: 'TEST001',
        rank: 'bronze',
        personalSales: 10000,
        teamSales: 50000,
        leftLegVolume: 30000, // Imbalanced
        rightLegVolume: 5000,
        monthlyPv: 48,
        totalDownline: 5,
        activeDownline: 3,
        commissionTotal: 5000,
        joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      };

      const teamMembers: any[] = [];

      const insights = await generateDistributorInsights(analytics, teamMembers);

      // Should have at least one insight about leg balance
      const hasLegBalanceInsight = insights.some(
        insight => insight.description.toLowerCase().includes('leg') || 
                  insight.description.toLowerCase().includes('balance')
      );

      expect(hasLegBalanceInsight).toBe(true);
    }, 30000);

    it('should identify low personal volume', async () => {
      const analytics = {
        distributorId: 1,
        distributorCode: 'TEST001',
        rank: 'starter',
        personalSales: 2000,
        teamSales: 10000,
        leftLegVolume: 5000,
        rightLegVolume: 5000,
        monthlyPv: 24, // Below 48 PV requirement
        totalDownline: 3,
        activeDownline: 2,
        commissionTotal: 1000,
        joinDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      };

      const teamMembers: any[] = [];

      const insights = await generateDistributorInsights(analytics, teamMembers);

      // Should have an insight about personal volume
      const hasPVInsight = insights.some(
        insight => insight.description.toLowerCase().includes('pv') || 
                  insight.description.toLowerCase().includes('personal volume') ||
                  insight.description.toLowerCase().includes('active')
      );

      expect(hasPVInsight).toBe(true);
    }, 30000);
  });

  describe('analyzeTeamTrends', () => {
    it('should analyze team with mixed activity levels', async () => {
      const teamMembers = [
        {
          id: 1,
          name: 'Active Member 1',
          rank: 'bronze',
          personalSales: 5000,
          teamSales: 10000,
          monthlyPv: 48,
          isActive: 1,
          joinDate: new Date(),
        },
        {
          id: 2,
          name: 'Inactive Member',
          rank: 'starter',
          personalSales: 0,
          teamSales: 0,
          monthlyPv: 0,
          isActive: 0,
          joinDate: new Date(),
        },
        {
          id: 3,
          name: 'Active Member 2',
          rank: 'silver',
          personalSales: 8000,
          teamSales: 15000,
          monthlyPv: 96,
          isActive: 1,
          joinDate: new Date(),
        },
      ];

      const analysis = await analyzeTeamTrends(teamMembers, 'month');

      expect(analysis).toBeDefined();
      expect(typeof analysis).toBe('string');
      expect(analysis.length).toBeGreaterThan(0);
    }, 30000);

    it('should handle empty team', async () => {
      const teamMembers: any[] = [];

      const analysis = await analyzeTeamTrends(teamMembers, 'week');

      expect(analysis).toBeDefined();
      expect(typeof analysis).toBe('string');
    }, 30000);
  });

  describe('generateCommissionOptimization', () => {
    it('should provide recommendations for balanced legs', async () => {
      const analytics = {
        distributorId: 1,
        distributorCode: 'TEST001',
        rank: 'gold',
        personalSales: 15000,
        teamSales: 100000,
        leftLegVolume: 50000,
        rightLegVolume: 50000, // Balanced
        monthlyPv: 96,
        totalDownline: 10,
        activeDownline: 8,
        commissionTotal: 15000,
        joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      };

      const recommendations = await generateCommissionOptimization(analytics);

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      recommendations.forEach(rec => {
        expect(typeof rec).toBe('string');
        expect(rec.length).toBeGreaterThan(0);
      });
    }, 30000);

    it('should provide recommendations for imbalanced legs', async () => {
      const analytics = {
        distributorId: 1,
        distributorCode: 'TEST001',
        rank: 'bronze',
        personalSales: 5000,
        teamSales: 30000,
        leftLegVolume: 25000, // Heavy imbalance
        rightLegVolume: 5000,
        monthlyPv: 48,
        totalDownline: 5,
        activeDownline: 3,
        commissionTotal: 3000,
        joinDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      };

      const recommendations = await generateCommissionOptimization(analytics);

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);

      // Should mention leg balancing
      const hasLegBalanceRec = recommendations.some(
        rec => rec.toLowerCase().includes('leg') || rec.toLowerCase().includes('balance')
      );

      expect(hasLegBalanceRec).toBe(true);
    }, 30000);
  });
});
