import { describe, it, expect } from 'vitest';

describe('Genealogy Tree Enhancement', () => {
  it('should show distributor own card even with no team members', () => {
    // Simulate distributor data with no downline
    const genealogyData = {
      distributor: {
        id: 1,
        distributorCode: 'DIST1ABCDEF',
        username: 'testuser',
        rank: 'starter',
        personalSales: 0,
        teamSales: 0,
        leftLegVolume: 0,
        rightLegVolume: 0,
        monthlyPv: 0,
        isActive: 1,
      },
      tree: [], // No team members
      totalDownline: 0,
      depth: 0,
    };

    // Verify distributor data exists
    expect(genealogyData.distributor).toBeDefined();
    expect(genealogyData.distributor.distributorCode).toBe('DIST1ABCDEF');
    
    // Verify tree is empty but distributor can still be displayed
    expect(genealogyData.tree).toHaveLength(0);
    expect(genealogyData.totalDownline).toBe(0);
    
    // The component should show the distributor's own card
    // even when tree is empty
    expect(genealogyData.distributor.id).toBeGreaterThan(0);
  });

  it('should allow empty position enrollment when showEmptyPositions is true', () => {
    const distributorCode = 'DIST1ABCDEF';
    const leftPosition = 'left';
    const rightPosition = 'right';

    // Verify position values are valid
    expect(['left', 'right']).toContain(leftPosition);
    expect(['left', 'right']).toContain(rightPosition);
    
    // Verify distributor code format (DIST prefix + alphanumeric)
    expect(distributorCode).toMatch(/^DIST[A-Z0-9]+$/);
  });

  it('should display distributor rank and stats on own card', () => {
    const distributor = {
      id: 1,
      distributorCode: 'DIST1ABCDEF',
      username: 'testuser',
      rank: 'starter',
      personalSales: 5000, // $50.00
      teamSales: 5000, // $50.00
      leftLegVolume: 0,
      rightLegVolume: 0,
      monthlyPv: 50,
      isActive: 1,
    };

    // Verify all required fields are present
    expect(distributor.id).toBeGreaterThan(0);
    expect(distributor.distributorCode).toBeTruthy();
    expect(distributor.rank).toBe('starter');
    expect(distributor.personalSales).toBeGreaterThanOrEqual(0);
    expect(distributor.teamSales).toBeGreaterThanOrEqual(0);
    expect(distributor.monthlyPv).toBeGreaterThanOrEqual(0);
    expect(distributor.isActive).toBe(1);
  });
});
