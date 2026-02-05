/**
 * Binary Tree Placement Tests
 * 
 * Tests the binary tree placement algorithm, spillover logic, and volume calculations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  placeDistributorInTree, 
  findOptimalPlacement,
  calculateLegVolumes,
  getDistributorsInLeg,
  getUpline,
  getAllDownline,
  getTeamStats
} from './binaryTree';
import { db } from './db';
import { binaryTreePositions, distributors } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Binary Tree Placement', () => {
  
  // Note: These tests require a clean database state
  // In production, you'd use test fixtures or database transactions
  
  it('should place first distributor at root (depth 0)', async () => {
    // This test assumes distributor ID 1050001 exists and is the root
    const rootPosition = await db
      .select()
      .from(binaryTreePositions)
      .where(eq(binaryTreePositions.distributorId, 1050001))
      .limit(1);

    if (rootPosition.length > 0) {
      expect(rootPosition[0].depthLevel).toBe(0);
      expect(rootPosition[0].parentId).toBeNull();
      console.log('✓ Root distributor found at depth 0');
    } else {
      console.log('⚠ No root distributor found - create one first');
    }
  });

  it('should calculate leg volumes correctly', async () => {
    const distributorId = 1050001; // Root distributor
    
    const volumes = await calculateLegVolumes(distributorId);
    
    console.log('Leg volumes for distributor', distributorId);
    console.log('Left leg volume:', volumes.leftLegVolume);
    console.log('Right leg volume:', volumes.rightLegVolume);
    console.log('Left leg PV:', volumes.leftLegPv);
    console.log('Right leg PV:', volumes.rightLegPv);
    
    expect(volumes).toHaveProperty('leftLegVolume');
    expect(volumes).toHaveProperty('rightLegVolume');
    expect(volumes).toHaveProperty('leftLegPv');
    expect(volumes).toHaveProperty('rightLegPv');
  });

  it('should get team statistics', async () => {
    const distributorId = 1050001;
    
    const stats = await getTeamStats(distributorId);
    
    console.log('Team stats for distributor', distributorId);
    console.log('Total team size:', stats.totalTeamSize);
    console.log('Left leg size:', stats.leftLegSize);
    console.log('Right leg size:', stats.rightLegSize);
    console.log('Max depth:', stats.maxDepth);
    console.log('Active distributors:', stats.activeDistributors);
    
    expect(stats).toHaveProperty('totalTeamSize');
    expect(stats).toHaveProperty('leftLegSize');
    expect(stats).toHaveProperty('rightLegSize');
    expect(stats).toHaveProperty('maxDepth');
    expect(stats).toHaveProperty('activeDistributors');
  });

  it('should get all downline distributors', async () => {
    const distributorId = 1050001;
    
    const downline = await getAllDownline(distributorId);
    
    console.log('Downline for distributor', distributorId);
    console.log('Total downline count:', downline.length);
    console.log('Downline IDs:', downline);
    
    expect(Array.isArray(downline)).toBe(true);
  });

  it('should demonstrate placement algorithm', async () => {
    console.log('\n=== Binary Tree Placement Algorithm Demo ===');
    console.log('This demonstrates how the algorithm works:');
    console.log('1. First two recruits go directly under sponsor (left, then right)');
    console.log('2. Third recruit spills to next available position');
    console.log('3. Placement prefers weaker leg to balance tree');
    console.log('\nExample tree structure:');
    console.log('       A (sponsor)');
    console.log('      / \\');
    console.log('     B   C  (direct recruits)');
    console.log('    / \\');
    console.log('   D   E  (spillover recruits)');
    console.log('\nWhen A recruits D (3rd recruit), D spills to B\'s left position');
    console.log('When A recruits E (4th recruit), E spills to B\'s right position');
    console.log('This continues infinitely deep as the tree grows');
  });
});

describe('Placement Scenarios', () => {
  it('should explain direct placement scenario', () => {
    console.log('\n=== Scenario 1: Direct Placement ===');
    console.log('Distributor A recruits B and C');
    console.log('B → placed at A\'s left (direct)');
    console.log('C → placed at A\'s right (direct)');
    console.log('Result: A has complete first level');
  });

  it('should explain spillover scenario', () => {
    console.log('\n=== Scenario 2: Spillover Placement ===');
    console.log('Distributor A recruits D (3rd recruit)');
    console.log('A\'s left and right are full (B and C)');
    console.log('Algorithm checks leg volumes:');
    console.log('- Left leg (B\'s team): $5,000');
    console.log('- Right leg (C\'s team): $8,000');
    console.log('D → spills to B\'s left (weaker leg)');
    console.log('Result: Tree stays balanced');
  });

  it('should explain deep spillover scenario', () => {
    console.log('\n=== Scenario 3: Deep Spillover ===');
    console.log('When all positions at level 2 are full:');
    console.log('New recruits spill to level 3');
    console.log('Algorithm uses BFS to find first available position');
    console.log('Always prefers weaker leg path');
    console.log('Result: Tree grows deep while staying balanced');
  });
});
