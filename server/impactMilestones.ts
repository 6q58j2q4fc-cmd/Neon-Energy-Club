/**
 * Impact Milestones & Badge System
 * 
 * Tracks and awards achievements for environmental impact
 * Includes shareable badges for social media
 */

import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { distributors } from "../drizzle/schema";
import { getLifetimeImpact, type ImpactCalculation } from "./charityImpact";
import { BADGE_URLS } from "./badgeUrls";

export interface Milestone {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'trees' | 'habitat' | 'species' | 'animals' | 'total' | 'team';
  threshold: number;
  badgeColor: string;
  badgeImageUrl?: string;
  shareText: string;
}

export interface Achievement {
  milestone: Milestone;
  achievedAt: string;
  currentValue: number;
  shareUrl?: string;
}

// Helper function to attach badge URLs to milestones
function attachBadgeUrls(milestones: Milestone[]): Milestone[] {
  return milestones.map(m => ({
    ...m,
    badgeImageUrl: BADGE_URLS[m.id] || undefined
  }));
}

// Define all charity impact milestones (without badge URLs)
const RAW_MILESTONES: Milestone[] = [
  // Tree Protection Milestones
  {
    id: 'first_tree',
    name: 'First Tree',
    description: 'Protected your first tree',
    icon: '🌱',
    category: 'trees',
    threshold: 1,
    badgeColor: '#90EE90',
    shareText: 'I just protected my first tree with NEON Energy! 🌱 Join me in making a difference!'
  },
  {
    id: 'forest_starter',
    name: 'Forest Starter',
    description: 'Protected 10 trees',
    icon: '🌿',
    category: 'trees',
    threshold: 10,
    badgeColor: '#228B22',
    shareText: 'I\'ve protected 10 trees with NEON Energy! 🌿 Every can makes a difference!'
  },
  {
    id: 'tree_guardian',
    name: 'Tree Guardian',
    description: 'Protected 100 trees',
    icon: '🌳',
    category: 'trees',
    threshold: 100,
    badgeColor: '#006400',
    shareText: 'Proud to have protected 100 trees with NEON Energy! 🌳 Join the movement!'
  },
  {
    id: 'forest_hero',
    name: 'Forest Hero',
    description: 'Protected 500 trees',
    icon: '🏞️',
    category: 'trees',
    threshold: 500,
    badgeColor: '#2F4F2F',
    shareText: '500 trees protected thanks to NEON Energy! 🏞️ Together we\'re saving the rainforest!'
  },
  {
    id: 'rainforest_champion',
    name: 'Rainforest Champion',
    description: 'Protected 1,000 trees',
    icon: '🌴',
    category: 'trees',
    threshold: 1000,
    badgeColor: '#1B5E20',
    shareText: '1,000 trees protected! 🌴 NEON Energy is changing the world one can at a time!'
  },
  
  // Animal Lives Saved Milestones (NEON Pink)
  {
    id: 'first_life',
    name: 'First Life',
    description: 'Saved your first animal life',
    icon: '💗',
    category: 'animals',
    threshold: 1,
    badgeColor: '#FFB6C1',
    shareText: 'I just saved my first animal life with NEON Pink! 💗 Join me in protecting wildlife!'
  },
  {
    id: 'wildlife_friend',
    name: 'Wildlife Friend',
    description: 'Saved 10 animal lives',
    icon: '🦋',
    category: 'animals',
    threshold: 10,
    badgeColor: '#FF69B4',
    shareText: '10 animal lives saved with NEON Pink! 🦋 Every sip supports conservation!'
  },
  {
    id: 'animal_protector',
    name: 'Animal Protector',
    description: 'Saved 100 animal lives',
    icon: '🦜',
    category: 'animals',
    threshold: 100,
    badgeColor: '#FF1493',
    shareText: '100 animal lives saved! 🦜 NEON Pink is making a real difference!'
  },
  {
    id: 'wildlife_guardian',
    name: 'Wildlife Guardian',
    description: 'Saved 500 animal lives',
    icon: '🐆',
    category: 'animals',
    threshold: 500,
    badgeColor: '#C71585',
    shareText: '500 animals protected thanks to NEON Pink! 🐆 Join the conservation movement!'
  },
  {
    id: 'species_savior',
    name: 'Species Savior',
    description: 'Saved 1,000 animal lives',
    icon: '🦁',
    category: 'animals',
    threshold: 1000,
    badgeColor: '#8B008B',
    shareText: '1,000 animal lives saved! 🦁 NEON Pink is protecting endangered species!'
  },
  
  // Habitat Protection Milestones
  {
    id: 'habitat_helper',
    name: 'Habitat Helper',
    description: 'Protected 100 sq ft of habitat',
    icon: '🏕️',
    category: 'habitat',
    threshold: 100,
    badgeColor: '#8FBC8F',
    shareText: 'Protected 100 sq ft of rainforest habitat with NEON! 🏕️'
  },
  {
    id: 'habitat_hero',
    name: 'Habitat Hero',
    description: 'Protected 1,000 sq ft of habitat',
    icon: '🌄',
    category: 'habitat',
    threshold: 1000,
    badgeColor: '#556B2F',
    shareText: '1,000 sq ft of habitat protected! 🌄 NEON Energy is saving ecosystems!'
  },
  {
    id: 'ecosystem_champion',
    name: 'Ecosystem Champion',
    description: 'Protected 5,000 sq ft of habitat',
    icon: '🗻',
    category: 'habitat',
    threshold: 5000,
    badgeColor: '#3CB371',
    shareText: '5,000 sq ft of rainforest saved! 🗻 Together we\'re protecting biodiversity!'
  },
  
  // Species Protection Milestones
  {
    id: 'species_supporter',
    name: 'Species Supporter',
    description: 'Protected 10 species',
    icon: '🐸',
    category: 'species',
    threshold: 10,
    badgeColor: '#9ACD32',
    shareText: 'Protecting 10 species with NEON Energy! 🐸 Biodiversity matters!'
  },
  {
    id: 'biodiversity_hero',
    name: 'Biodiversity Hero',
    description: 'Protected 100 species',
    icon: '🦎',
    category: 'species',
    threshold: 100,
    badgeColor: '#6B8E23',
    shareText: '100 species protected! 🦎 NEON Energy supports biodiversity!'
  },
  
  // Team Impact Milestones
  {
    id: 'team_starter',
    name: 'Team Starter',
    description: 'Your team protected 100 trees',
    icon: '👥',
    category: 'team',
    threshold: 100,
    badgeColor: '#4169E1',
    shareText: 'My team has protected 100 trees! 👥 Join us in making an impact with NEON!'
  },
  {
    id: 'team_leader',
    name: 'Team Leader',
    description: 'Your team protected 500 trees',
    icon: '🏆',
    category: 'team',
    threshold: 500,
    badgeColor: '#1E90FF',
    shareText: 'Leading a team that\'s protected 500 trees! 🏆 NEON Energy multiplies impact!'
  },
  {
    id: 'team_champion',
    name: 'Team Champion',
    description: 'Your team protected 1,000 trees',
    icon: '👑',
    category: 'team',
    threshold: 1000,
    badgeColor: '#0000CD',
    shareText: 'My team has protected 1,000 trees! 👑 Together we\'re changing the world!'
  },
  
  // Total Impact Milestones (Combined)
  {
    id: 'impact_beginner',
    name: 'Impact Beginner',
    description: 'Made your first 10 impacts',
    icon: '⭐',
    category: 'total',
    threshold: 10,
    badgeColor: '#FFD700',
    shareText: 'Started my environmental journey with NEON Energy! ⭐'
  },
  {
    id: 'impact_warrior',
    name: 'Impact Warrior',
    description: 'Made 100 total impacts',
    icon: '💫',
    category: 'total',
    threshold: 100,
    badgeColor: '#FFA500',
    shareText: '100 environmental impacts and counting! 💫 NEON Energy makes it easy!'
  },
  {
    id: 'earth_champion',
    name: 'Earth Champion',
    description: 'Made 1,000 total impacts',
    icon: '🌍',
    category: 'total',
    threshold: 1000,
    badgeColor: '#FF4500',
    shareText: '1,000 impacts for the planet! 🌍 NEON Energy is my choice for sustainable energy!'
  },
  {
    id: 'planet_hero',
    name: 'Planet Hero',
    description: 'Made 5,000 total impacts',
    icon: '🌟',
    category: 'total',
    threshold: 5000,
    badgeColor: '#DC143C',
    shareText: '5,000 environmental impacts! 🌟 NEON Energy: Fuel your body, save the planet!'
  },
];

// Export milestones with badge URLs attached
export const CHARITY_MILESTONES = attachBadgeUrls(RAW_MILESTONES);

/**
 * Check which milestones a distributor has achieved
 * 
 * @param distributorId - The distributor ID
 * @returns Array of achieved milestones
 */
export async function checkAchievedMilestones(distributorId: number): Promise<Achievement[]> {
  try {
    // Get lifetime impact
    const impact = await getLifetimeImpact(distributorId);
    
    const achievements: Achievement[] = [];
    const now = new Date().toISOString();

    // Check each milestone
    for (const milestone of CHARITY_MILESTONES) {
      let currentValue = 0;
      
      switch (milestone.category) {
        case 'trees':
          currentValue = Math.floor(impact.treesProtected);
          break;
        case 'habitat':
          currentValue = Math.floor(impact.habitatProtected);
          break;
        case 'species':
          currentValue = Math.floor(impact.speciesSaved);
          break;
        case 'animals':
          currentValue = Math.floor(impact.animalLivesSaved);
          break;
        case 'total':
          currentValue = Math.floor(
            impact.treesProtected + 
            impact.habitatProtected / 10 + 
            impact.speciesSaved * 10 + 
            impact.animalLivesSaved * 4
          );
          break;
        case 'team':
          // Team milestones use trees as the metric
          currentValue = Math.floor(impact.treesProtected);
          break;
      }

      if (currentValue >= milestone.threshold) {
        achievements.push({
          milestone,
          achievedAt: now,
          currentValue,
          shareUrl: generateShareUrl(milestone, distributorId),
        });
      }
    }

    return achievements;
  } catch (err) {
    console.error('[checkAchievedMilestones] Error:', err);
    return [];
  }
}

/**
 * Get next milestone to achieve for a distributor
 * 
 * @param distributorId - The distributor ID
 * @param category - Optional category filter
 * @returns Next milestone to achieve
 */
export async function getNextMilestone(
  distributorId: number,
  category?: Milestone['category']
): Promise<{ milestone: Milestone; progress: number; remaining: number; currentValue: number; progressPercent: number } | null> {
  try {
    const impact = await getLifetimeImpact(distributorId);
    const achieved = await checkAchievedMilestones(distributorId);
    const achievedIds = new Set(achieved.map(a => a.milestone.id));

    // Filter milestones
    let milestones = CHARITY_MILESTONES;
    if (category) {
      milestones = milestones.filter(m => m.category === category);
    }

    // Find next unachieved milestone
    for (const milestone of milestones) {
      if (achievedIds.has(milestone.id)) {
        continue;
      }

      let currentValue = 0;
      switch (milestone.category) {
        case 'trees':
          currentValue = Math.floor(impact.treesProtected);
          break;
        case 'habitat':
          currentValue = Math.floor(impact.habitatProtected);
          break;
        case 'species':
          currentValue = Math.floor(impact.speciesSaved);
          break;
        case 'animals':
          currentValue = Math.floor(impact.animalLivesSaved);
          break;
        case 'total':
          currentValue = Math.floor(
            impact.treesProtected + 
            impact.habitatProtected / 10 + 
            impact.speciesSaved * 10 + 
            impact.animalLivesSaved * 4
          );
          break;
        case 'team':
          currentValue = Math.floor(impact.treesProtected);
          break;
      }

      return {
        milestone,
        progress: (currentValue / milestone.threshold) * 100,
        remaining: milestone.threshold - currentValue,
        currentValue,
        progressPercent: Math.min(100, (currentValue / milestone.threshold) * 100),
      };
    }

    return null;
  } catch (err) {
    console.error('[getNextMilestone] Error:', err);
    return null;
  }
}

/**
 * Generate shareable URL for a milestone achievement
 * 
 * @param milestone - The milestone
 * @param distributorId - The distributor ID
 * @returns Share URL
 */
function generateShareUrl(milestone: Milestone, distributorId: number): string {
  const baseUrl = process.env.VITE_APP_URL || 'https://neonenergy.com';
  return `${baseUrl}/impact/badge/${milestone.id}?distributor=${distributorId}`;
}

/**
 * Get milestone statistics for a distributor
 * 
 * @param distributorId - The distributor ID
 * @returns Milestone statistics
 */
export async function getMilestoneStats(distributorId: number) {
  try {
    const achieved = await checkAchievedMilestones(distributorId);
    const totalMilestones = CHARITY_MILESTONES.length;
    const achievedCount = achieved.length;
    
    // Group by category
    const byCategory: Record<string, number> = {};
    for (const achievement of achieved) {
      const cat = achievement.milestone.category;
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    }

    return {
      totalMilestones,
      achievedCount,
      percentage: (achievedCount / totalMilestones) * 100,
      byCategory,
      recentAchievements: achieved.slice(-5).reverse(),
    };
  } catch (err) {
    console.error('[getMilestoneStats] Error:', err);
    return {
      totalMilestones: CHARITY_MILESTONES.length,
      achievedCount: 0,
      percentage: 0,
      byCategory: {},
      recentAchievements: [],
    };
  }
}
