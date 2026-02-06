/**
 * Binary Tree Service - Refactored with proper async patterns
 * 
 * Handles all binary tree operations including:
 * - Placement logic (finding optimal position in tree)
 * - Tree traversal (upline/downline queries)
 * - Volume calculations (leg volumes, team volume)
 * - Spillover management
 */

import { getDb } from "./db";
import { eq, and, or, sql, inArray } from "drizzle-orm";
import { binaryTreePositions, distributors } from "../drizzle/schema";

export type PlacementPosition = 'left' | 'right';

export interface TreePosition {
  id: number;
  distributorId: number;
  parentId: number | null;
  sponsorId: number;
  position: PlacementPosition;
  depthLevel: number;
  createdAt: string;
}

export interface PlacementResult {
  parentId: number;
  position: PlacementPosition;
  depthLevel: number;
}

export interface LegVolumes {
  leftLegVolume: number;
  rightLegVolume: number;
}

/**
 * Get all downline distributor IDs (recursive)
 * 
 * @param distributorId - The distributor ID
 * @returns Array of downline distributor IDs
 */
export async function getAllDownline(distributorId: number): Promise<number[]> {
  const db = await getDb();
  
  try {
    // Get direct children
    const directChildren = await db
      .select()
      .from(binaryTreePositions)
      .where(eq(binaryTreePositions.parentId, distributorId));

    if (directChildren.length === 0) {
      return [];
    }

    // Collect all downline IDs recursively
    const downlineIds: number[] = [];
    const childIds = directChildren.map(child => child.distributorId);
    downlineIds.push(...childIds);

    // Recursively get downline for each child
    for (const childId of childIds) {
      const childDownline = await getAllDownline(childId);
      downlineIds.push(...childDownline);
    }

    return downlineIds;
  } catch (err) {
    console.error('[getAllDownline] Error:', err);
    return [];
  }
}

/**
 * Get direct children of a distributor
 * 
 * @param distributorId - The distributor ID
 * @returns Array of direct children tree positions
 */
export async function getDirectChildren(distributorId: number): Promise<TreePosition[]> {
  const db = await getDb();
  
  try {
    const children = await db
      .select()
      .from(binaryTreePositions)
      .where(eq(binaryTreePositions.parentId, distributorId));

    return children as TreePosition[];
  } catch (err) {
    console.error('[getDirectChildren] Error:', err);
    return [];
  }
}

/**
 * Get upline path from distributor to root
 * 
 * @param distributorId - The distributor ID
 * @returns Array of upline distributor IDs (from immediate parent to root)
 */
export async function getUplinePath(distributorId: number): Promise<number[]> {
  const db = await getDb();
  
  try {
    const upline: number[] = [];
    let currentId = distributorId;

    while (true) {
      const position = await db
        .select()
        .from(binaryTreePositions)
        .where(eq(binaryTreePositions.distributorId, currentId))
        .limit(1);

      if (position.length === 0 || !position[0].parentId) {
        break;
      }

      upline.push(position[0].parentId);
      currentId = position[0].parentId;
    }

    return upline;
  } catch (err) {
    console.error('[getUplinePath] Error:', err);
    return [];
  }
}

/**
 * Calculate leg volumes for a distributor
 * 
 * @param distributorId - The distributor ID
 * @returns Object with left and right leg volumes
 */
export async function calculateLegVolumes(distributorId: number): Promise<LegVolumes> {
  const db = await getDb();
  
  try {
    // Get direct children
    const children = await getDirectChildren(distributorId);
    
    let leftLegVolume = 0;
    let rightLegVolume = 0;

    for (const child of children) {
      // Get all downline for this child
      const downline = await getAllDownline(child.distributorId);
      const totalVolume = downline.length + 1; // +1 for the child itself

      if (child.position === 'left') {
        leftLegVolume += totalVolume;
      } else {
        rightLegVolume += totalVolume;
      }
    }

    return {
      leftLegVolume,
      rightLegVolume
    };
  } catch (err) {
    console.error('[calculateLegVolumes] Error:', err);
    return {
      leftLegVolume: 0,
      rightLegVolume: 0
    };
  }
}

/**
 * Get team size (total downline count)
 * 
 * @param distributorId - The distributor ID
 * @returns Total number of team members
 */
export async function getTeamSize(distributorId: number): Promise<number> {
  const downline = await getAllDownline(distributorId);
  return downline.length;
}

/**
 * Get tree depth for a distributor
 * 
 * @param distributorId - The distributor ID
 * @returns Maximum depth of the tree below this distributor
 */
export async function getTreeDepth(distributorId: number): Promise<number> {
  const db = await getDb();
  
  try {
    const children = await getDirectChildren(distributorId);
    
    if (children.length === 0) {
      return 0;
    }

    let maxDepth = 0;
    for (const child of children) {
      const childDepth = await getTreeDepth(child.distributorId);
      maxDepth = Math.max(maxDepth, childDepth + 1);
    }

    return maxDepth;
  } catch (err) {
    console.error('[getTreeDepth] Error:', err);
    return 0;
  }
}

/**
 * Find the optimal placement position for a new distributor in the binary tree
 * 
 * Algorithm:
 * 1. Check if sponsor has empty direct positions (left or right)
 * 2. If both filled, find next available position in sponsor's downline
 * 3. Prefer weaker leg to balance the tree
 * 
 * @param sponsorId - The distributor who recruited the new member
 * @returns PlacementResult with parentId, position, and depth level
 */
export async function findOptimalPlacement(sponsorId: number): Promise<PlacementResult> {
  const db = await getDb();
  
  try {
    // Get sponsor's tree position
    const sponsorPosition = await db
      .select()
      .from(binaryTreePositions)
      .where(eq(binaryTreePositions.distributorId, sponsorId))
      .limit(1);

    if (sponsorPosition.length === 0) {
      throw new Error(`Sponsor ${sponsorId} not found in binary tree`);
    }

    const sponsor = sponsorPosition[0];

    // Check if sponsor has direct children
    const directChildren = await db
      .select()
      .from(binaryTreePositions)
      .where(eq(binaryTreePositions.parentId, sponsorId));

    const hasLeft = directChildren.some(child => child.position === 'left');
    const hasRight = directChildren.some(child => child.position === 'right');

    // If sponsor has empty direct positions, place there
    if (!hasLeft) {
      return {
        parentId: sponsorId,
        position: 'left',
        depthLevel: sponsor.depthLevel + 1
      };
    }

    if (!hasRight) {
      return {
        parentId: sponsorId,
        position: 'right',
        depthLevel: sponsor.depthLevel + 1
      };
    }

    // Both direct positions filled, find next available position via spillover
    const placement = await findSpilloverPosition(sponsorId);
    return placement;
  } catch (err) {
    console.error('[findOptimalPlacement] Error:', err);
    throw err;
  }
}

/**
 * Find spillover position when sponsor's direct positions are full
 * Uses breadth-first search to find next available position
 * Prefers weaker leg to balance tree volume
 */
async function findSpilloverPosition(sponsorId: number): Promise<PlacementResult> {
  const db = await getDb();
  
  try {
    // Get leg volumes to determine weaker leg
    const legVolumes = await calculateLegVolumes(sponsorId);
    const weakerLeg: PlacementPosition = legVolumes.leftLegVolume <= legVolumes.rightLegVolume ? 'left' : 'right';

    // BFS to find first available position in weaker leg
    const queue: number[] = [sponsorId];
    const visited = new Set<number>();

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      
      if (visited.has(currentId)) {
        continue;
      }
      visited.add(currentId);

      const children = await getDirectChildren(currentId);
      
      // Check if current node has space
      const hasLeft = children.some(c => c.position === 'left');
      const hasRight = children.some(c => c.position === 'right');

      const currentPosition = await db
        .select()
        .from(binaryTreePositions)
        .where(eq(binaryTreePositions.distributorId, currentId))
        .limit(1);

      if (currentPosition.length === 0) continue;

      // Prefer weaker leg first
      if (weakerLeg === 'left' && !hasLeft) {
        return {
          parentId: currentId,
          position: 'left',
          depthLevel: currentPosition[0].depthLevel + 1
        };
      }

      if (weakerLeg === 'right' && !hasRight) {
        return {
          parentId: currentId,
          position: 'right',
          depthLevel: currentPosition[0].depthLevel + 1
        };
      }

      // Check other leg
      if (!hasLeft) {
        return {
          parentId: currentId,
          position: 'left',
          depthLevel: currentPosition[0].depthLevel + 1
        };
      }

      if (!hasRight) {
        return {
          parentId: currentId,
          position: 'right',
          depthLevel: currentPosition[0].depthLevel + 1
        };
      }

      // Add children to queue
      queue.push(...children.map(c => c.distributorId));
    }

    // Fallback: place under sponsor's left leg
    const sponsorPosition = await db
      .select()
      .from(binaryTreePositions)
      .where(eq(binaryTreePositions.distributorId, sponsorId))
      .limit(1);

    return {
      parentId: sponsorId,
      position: 'left',
      depthLevel: sponsorPosition[0].depthLevel + 1
    };
  } catch (err) {
    console.error('[findSpilloverPosition] Error:', err);
    throw err;
  }
}

/**
 * Place a new distributor in the binary tree
 * 
 * @param distributorId - The new distributor ID
 * @param sponsorId - The sponsor who recruited them
 * @param preferredPosition - Optional preferred position ('left' or 'right')
 * @returns The created tree position
 */
export async function placeDistributorInTree(
  distributorId: number,
  sponsorId: number,
  preferredPosition?: PlacementPosition
): Promise<TreePosition> {
  const db = await getDb();
  
  try {
    // Find optimal placement
    const placement = await findOptimalPlacement(sponsorId);

    // Create tree position
    const result = await db
      .insert(binaryTreePositions)
      .values({
        distributorId,
        parentId: placement.parentId,
        sponsorId,
        position: preferredPosition || placement.position,
        depthLevel: placement.depthLevel,
      });

    // Get the created position
    const created = await db
      .select()
      .from(binaryTreePositions)
      .where(eq(binaryTreePositions.distributorId, distributorId))
      .limit(1);

    console.log(`[Binary Tree] Placed distributor ${distributorId} under parent ${placement.parentId} at ${placement.position} position`);

    return created[0] as TreePosition;
  } catch (err) {
    console.error('[placeDistributorInTree] Error:', err);
    throw err;
  }
}

/**
 * Get tree statistics for a distributor
 * 
 * @param distributorId - The distributor ID
 * @returns Object with tree statistics
 */
export async function getTreeStatistics(distributorId: number) {
  try {
    const teamSize = await getTeamSize(distributorId);
    const treeDepth = await getTreeDepth(distributorId);
    const legVolumes = await calculateLegVolumes(distributorId);
    const upline = await getUplinePath(distributorId);

    return {
      teamSize,
      treeDepth,
      leftLegVolume: legVolumes.leftLegVolume,
      rightLegVolume: legVolumes.rightLegVolume,
      uplineCount: upline.length,
    };
  } catch (err) {
    console.error('[getTreeStatistics] Error:', err);
    return {
      teamSize: 0,
      treeDepth: 0,
      leftLegVolume: 0,
      rightLegVolume: 0,
      uplineCount: 0,
    };
  }
}
