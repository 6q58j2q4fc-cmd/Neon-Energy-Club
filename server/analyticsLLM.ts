import { invokeLLM } from "./_core/llm";

/**
 * LLM-powered analytics for distributor performance tracking
 */

interface DistributorAnalytics {
  distributorId: number;
  distributorCode: string;
  rank: string;
  personalSales: number;
  teamSales: number;
  leftLegVolume: number;
  rightLegVolume: number;
  monthlyPV: number;
  totalDownline: number;
  activeDownline: number;
  commissionTotal: number;
  joinDate: Date;
}

interface TeamMember {
  id: number;
  name: string | null;
  rank: string;
  personalSales: number;
  teamSales: number;
  monthlyPV: number;
  isActive: number;
  joinDate: Date;
}

interface AnalyticsInsight {
  category: "performance" | "growth" | "commission" | "team" | "recommendation";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  actionable: boolean;
  suggestedAction?: string;
}

/**
 * Generate personalized insights for a distributor using LLM
 */
export async function generateDistributorInsights(
  analytics: DistributorAnalytics,
  teamMembers: TeamMember[]
): Promise<AnalyticsInsight[]> {
  const prompt = `You are an MLM business analytics expert. Analyze the following distributor's performance and provide actionable insights.

**Distributor Profile:**
- Rank: ${analytics.rank}
- Personal Volume (PV): ${analytics.monthlyPV}
- Personal Sales: $${(analytics.personalSales / 100).toFixed(2)}
- Team Sales: $${(analytics.teamSales / 100).toFixed(2)}
- Left Leg Volume: $${(analytics.leftLegVolume / 100).toFixed(2)}
- Right Leg Volume: $${(analytics.rightLegVolume / 100).toFixed(2)}
- Total Downline: ${analytics.totalDownline}
- Active Downline: ${analytics.activeDownline}
- Total Commissions Earned: $${(analytics.commissionTotal / 100).toFixed(2)}
- Days in Business: ${Math.floor((Date.now() - analytics.joinDate.getTime()) / (1000 * 60 * 60 * 24))}

**Team Overview:**
${teamMembers.slice(0, 10).map(member => `- ${member.name || "Anonymous"}: ${member.rank}, PV: ${member.monthlyPV}, ${member.isActive ? "Active" : "Inactive"}`).join("\n")}

Provide 3-5 specific, actionable insights in the following categories:
1. Performance analysis (current strengths and weaknesses)
2. Growth opportunities (how to expand the team)
3. Commission optimization (how to maximize earnings)
4. Team development (how to support downline)
5. Next steps (specific recommendations for this week)

Focus on:
- Binary leg balance (left vs right)
- Personal volume requirements
- Team activity levels
- Rank advancement opportunities
- Commission structure optimization

Return insights as a JSON array with this structure:
{
  "insights": [
    {
      "category": "performance" | "growth" | "commission" | "team" | "recommendation",
      "title": "Brief title",
      "description": "Detailed explanation",
      "priority": "high" | "medium" | "low",
      "actionable": true/false,
      "suggestedAction": "Specific action to take (if actionable)"
    }
  ]
}`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert MLM business analyst. Provide specific, data-driven insights that help distributors grow their business. Be encouraging but realistic."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "distributor_insights",
          strict: true,
          schema: {
            type: "object",
            properties: {
              insights: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: {
                      type: "string",
                      enum: ["performance", "growth", "commission", "team", "recommendation"]
                    },
                    title: { type: "string" },
                    description: { type: "string" },
                    priority: {
                      type: "string",
                      enum: ["high", "medium", "low"]
                    },
                    actionable: { type: "boolean" },
                    suggestedAction: { type: "string" }
                  },
                  required: ["category", "title", "description", "priority", "actionable"],
                  additionalProperties: false
                }
              }
            },
            required: ["insights"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in LLM response");
    }

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentStr);
    return parsed.insights;
  } catch (error) {
    console.error("[Analytics LLM] Error generating insights:", error);
    // Return fallback insights
    return generateFallbackInsights(analytics);
  }
}

/**
 * Analyze team performance trends using LLM
 */
export async function analyzeTeamTrends(
  teamMembers: TeamMember[],
  timeframe: "week" | "month" | "quarter"
): Promise<string> {
  const activeCount = teamMembers.filter(m => m.isActive).length;
  const totalPV = teamMembers.reduce((sum, m) => sum + m.monthlyPV, 0);
  const avgPV = teamMembers.length > 0 ? totalPV / teamMembers.length : 0;

  const prompt = `Analyze this MLM team's performance over the past ${timeframe}:

**Team Metrics:**
- Total Members: ${teamMembers.length}
- Active Members: ${activeCount} (${((activeCount / teamMembers.length) * 100).toFixed(1)}%)
- Total Team PV: ${totalPV}
- Average PV per Member: ${avgPV.toFixed(1)}

**Member Breakdown by Rank:**
${Object.entries(
    teamMembers.reduce((acc, m) => {
      acc[m.rank] = (acc[m.rank] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([rank, count]) => `- ${rank}: ${count} members`).join("\n")}

Provide a brief (2-3 sentences) analysis of:
1. Overall team health
2. Key trends or patterns
3. Main area of concern or opportunity`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an MLM team performance analyst. Provide concise, data-driven insights."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const content = response.choices[0]?.message?.content;
    const contentStr = typeof content === 'string' ? content : '';
    return contentStr || "Team analysis unavailable";
  } catch (error) {
    console.error("[Analytics LLM] Error analyzing team trends:", error);
    return `Your team has ${activeCount} active members out of ${teamMembers.length} total. Focus on activating inactive members and supporting your top performers.`;
  }
}

/**
 * Generate commission optimization recommendations
 */
export async function generateCommissionOptimization(
  analytics: DistributorAnalytics
): Promise<string[]> {
  const legImbalance = Math.abs(analytics.leftLegVolume - analytics.rightLegVolume);
  const legImbalancePercent = legImbalance / Math.max(analytics.leftLegVolume, analytics.rightLegVolume, 1) * 100;

  const prompt = `As an MLM compensation plan expert, provide 3 specific recommendations to maximize commissions for this distributor:

**Current Status:**
- Rank: ${analytics.rank}
- Monthly PV: ${analytics.monthlyPV}
- Left Leg: $${(analytics.leftLegVolume / 100).toFixed(2)}
- Right Leg: $${(analytics.rightLegVolume / 100).toFixed(2)}
- Leg Imbalance: ${legImbalancePercent.toFixed(1)}%
- Total Commissions: $${(analytics.commissionTotal / 100).toFixed(2)}

Focus on:
1. Binary leg balancing strategies
2. Personal volume optimization
3. Team building tactics for maximum commission potential

Provide 3 specific, actionable recommendations.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an MLM compensation expert. Provide specific, actionable recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const content = response.choices[0]?.message?.content || "";
    // Parse recommendations from response
    const contentStr = typeof content === 'string' ? content : '';
    const recommendations = contentStr
      .split("\n")
      .filter((line: string) => line.trim().match(/^\d+\./)) 
      .map((line: string) => line.replace(/^\d+\.\s*/, "").trim())
      .filter((line: string) => line.length > 0);
    return recommendations.length > 0 ? recommendations : generateFallbackRecommendations(analytics);
  } catch (error) {
    console.error("[Analytics LLM] Error generating commission optimization:", error);
    return generateFallbackRecommendations(analytics);
  }
}

/**
 * Fallback insights when LLM is unavailable
 */
function generateFallbackInsights(analytics: DistributorAnalytics): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] = [];

  // Check leg balance
  const legImbalance = Math.abs(analytics.leftLegVolume - analytics.rightLegVolume);
  if (legImbalance > 10000) {
    insights.push({
      category: "commission",
      title: "Binary Leg Imbalance Detected",
      description: `Your binary legs are unbalanced. Left: $${(analytics.leftLegVolume / 100).toFixed(2)}, Right: $${(analytics.rightLegVolume / 100).toFixed(2)}. Balancing your legs can significantly increase your commission earnings.`,
      priority: "high",
      actionable: true,
      suggestedAction: analytics.leftLegVolume > analytics.rightLegVolume 
        ? "Focus on recruiting and placing new members in your right leg"
        : "Focus on recruiting and placing new members in your left leg"
    });
  }

  // Check personal volume
  if (analytics.monthlyPV < 48) {
    insights.push({
      category: "performance",
      title: "Personal Volume Below Activity Requirement",
      description: `Your current PV is ${analytics.monthlyPV}. You need 48 PV to maintain active status and earn commissions. Consider setting up an autoship to ensure consistent monthly volume.`,
      priority: "high",
      actionable: true,
      suggestedAction: "Set up a monthly autoship of at least 2 cases (48 PV) to stay active"
    });
  }

  // Check team activity
  const activityRate = analytics.totalDownline > 0 
    ? (analytics.activeDownline / analytics.totalDownline) * 100 
    : 0;
  if (activityRate < 50 && analytics.totalDownline > 0) {
    insights.push({
      category: "team",
      title: "Low Team Activity Rate",
      description: `Only ${analytics.activeDownline} out of ${analytics.totalDownline} team members are active (${activityRate.toFixed(1)}%). Inactive team members don't contribute to your volume or commissions.`,
      priority: "medium",
      actionable: true,
      suggestedAction: "Reach out to inactive team members and help them set up autoships"
    });
  }

  // Growth recommendation
  insights.push({
    category: "growth",
    title: "Team Expansion Opportunity",
    description: `Growing your team is key to building residual income. Each active distributor you sponsor can build their own team, multiplying your earnings potential.`,
    priority: "medium",
    actionable: true,
    suggestedAction: "Share your personalized referral link on social media and with your network"
  });

  return insights;
}

/**
 * Fallback recommendations when LLM is unavailable
 */
function generateFallbackRecommendations(analytics: DistributorAnalytics): string[] {
  const recommendations: string[] = [];

  const legImbalance = Math.abs(analytics.leftLegVolume - analytics.rightLegVolume);
  if (legImbalance > 5000) {
    const weakerLeg = analytics.leftLegVolume < analytics.rightLegVolume ? "left" : "right";
    recommendations.push(
      `Balance your binary legs by focusing new recruits on your ${weakerLeg} side to maximize binary commissions`
    );
  }

  if (analytics.monthlyPV < 100) {
    recommendations.push(
      "Increase your personal volume to qualify for higher commission percentages and bonuses"
    );
  }

  recommendations.push(
    "Help your team members set up autoships to create stable, predictable monthly volume"
  );

  return recommendations;
}
