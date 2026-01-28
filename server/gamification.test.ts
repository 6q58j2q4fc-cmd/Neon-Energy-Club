import { describe, it, expect } from "vitest";

// Test badge eligibility logic
describe("Badge System", () => {
  // Badge eligibility criteria
  const checkBadgeEligibility = (stats: {
    totalSales: number;
    totalReferrals: number;
    teamSize: number;
    monthsActive: number;
    rank: string;
    totalCommissions: number;
    isTopSeller: boolean;
    isRisingStar: boolean;
    teamMembersAtSilver: number;
    joinedDuringPrelaunch: boolean;
  }) => {
    const eligibleBadges: string[] = [];

    if (stats.totalSales >= 1) eligibleBadges.push("FIRST_SALE");
    if (stats.totalReferrals >= 10) eligibleBadges.push("TEN_REFERRALS");
    if (stats.isTopSeller) eligibleBadges.push("TOP_SELLER");
    if (stats.isRisingStar) eligibleBadges.push("RISING_STAR");
    if (stats.teamSize >= 5) eligibleBadges.push("TEAM_BUILDER");
    if (stats.monthsActive >= 3) eligibleBadges.push("CONSISTENCY");
    if (stats.rank === "Elite" || stats.rank === "Diamond") eligibleBadges.push("ELITE");
    if (stats.teamMembersAtSilver >= 3) eligibleBadges.push("MENTOR");
    if (stats.totalSales >= 100) eligibleBadges.push("HUNDRED_SALES");
    if (stats.totalCommissions >= 10000) eligibleBadges.push("DIAMOND_ACHIEVER");
    if (stats.joinedDuringPrelaunch) eligibleBadges.push("LAUNCH_PIONEER");
    if (stats.teamSize >= 25) eligibleBadges.push("SUPER_RECRUITER");

    return eligibleBadges;
  };

  it("should award FIRST_SALE badge when user has at least 1 sale", () => {
    const stats = {
      totalSales: 1,
      totalReferrals: 0,
      teamSize: 0,
      monthsActive: 1,
      rank: "Starter",
      totalCommissions: 50,
      isTopSeller: false,
      isRisingStar: false,
      teamMembersAtSilver: 0,
      joinedDuringPrelaunch: false,
    };

    const badges = checkBadgeEligibility(stats);
    expect(badges).toContain("FIRST_SALE");
  });

  it("should award TEN_REFERRALS badge when user has 10+ referrals", () => {
    const stats = {
      totalSales: 5,
      totalReferrals: 10,
      teamSize: 3,
      monthsActive: 2,
      rank: "Bronze",
      totalCommissions: 200,
      isTopSeller: false,
      isRisingStar: false,
      teamMembersAtSilver: 0,
      joinedDuringPrelaunch: false,
    };

    const badges = checkBadgeEligibility(stats);
    expect(badges).toContain("TEN_REFERRALS");
    expect(badges).toContain("FIRST_SALE");
  });

  it("should award TEAM_BUILDER badge when team size is 5+", () => {
    const stats = {
      totalSales: 10,
      totalReferrals: 5,
      teamSize: 5,
      monthsActive: 2,
      rank: "Silver",
      totalCommissions: 500,
      isTopSeller: false,
      isRisingStar: false,
      teamMembersAtSilver: 0,
      joinedDuringPrelaunch: false,
    };

    const badges = checkBadgeEligibility(stats);
    expect(badges).toContain("TEAM_BUILDER");
  });

  it("should award CONSISTENCY badge when active for 3+ months", () => {
    const stats = {
      totalSales: 15,
      totalReferrals: 8,
      teamSize: 4,
      monthsActive: 3,
      rank: "Silver",
      totalCommissions: 800,
      isTopSeller: false,
      isRisingStar: false,
      teamMembersAtSilver: 0,
      joinedDuringPrelaunch: false,
    };

    const badges = checkBadgeEligibility(stats);
    expect(badges).toContain("CONSISTENCY");
  });

  it("should award ELITE badge when rank is Elite or Diamond", () => {
    const stats = {
      totalSales: 200,
      totalReferrals: 50,
      teamSize: 30,
      monthsActive: 12,
      rank: "Elite",
      totalCommissions: 15000,
      isTopSeller: true,
      isRisingStar: false,
      teamMembersAtSilver: 5,
      joinedDuringPrelaunch: true,
    };

    const badges = checkBadgeEligibility(stats);
    expect(badges).toContain("ELITE");
    expect(badges).toContain("DIAMOND_ACHIEVER");
    expect(badges).toContain("SUPER_RECRUITER");
    expect(badges).toContain("MENTOR");
  });

  it("should award LAUNCH_PIONEER badge for pre-launch members", () => {
    const stats = {
      totalSales: 0,
      totalReferrals: 0,
      teamSize: 0,
      monthsActive: 0,
      rank: "Starter",
      totalCommissions: 0,
      isTopSeller: false,
      isRisingStar: false,
      teamMembersAtSilver: 0,
      joinedDuringPrelaunch: true,
    };

    const badges = checkBadgeEligibility(stats);
    expect(badges).toContain("LAUNCH_PIONEER");
    expect(badges).not.toContain("FIRST_SALE");
  });

  it("should award multiple badges for high performers", () => {
    const stats = {
      totalSales: 150,
      totalReferrals: 30,
      teamSize: 25,
      monthsActive: 6,
      rank: "Diamond",
      totalCommissions: 12000,
      isTopSeller: true,
      isRisingStar: true,
      teamMembersAtSilver: 4,
      joinedDuringPrelaunch: true,
    };

    const badges = checkBadgeEligibility(stats);
    
    // Should have many badges
    expect(badges.length).toBeGreaterThan(8);
    expect(badges).toContain("FIRST_SALE");
    expect(badges).toContain("TEN_REFERRALS");
    expect(badges).toContain("TOP_SELLER");
    expect(badges).toContain("RISING_STAR");
    expect(badges).toContain("TEAM_BUILDER");
    expect(badges).toContain("CONSISTENCY");
    expect(badges).toContain("ELITE");
    expect(badges).toContain("MENTOR");
    expect(badges).toContain("HUNDRED_SALES");
    expect(badges).toContain("DIAMOND_ACHIEVER");
    expect(badges).toContain("LAUNCH_PIONEER");
    expect(badges).toContain("SUPER_RECRUITER");
  });

  it("should not award badges when criteria not met", () => {
    const stats = {
      totalSales: 0,
      totalReferrals: 0,
      teamSize: 0,
      monthsActive: 0,
      rank: "Starter",
      totalCommissions: 0,
      isTopSeller: false,
      isRisingStar: false,
      teamMembersAtSilver: 0,
      joinedDuringPrelaunch: false,
    };

    const badges = checkBadgeEligibility(stats);
    expect(badges.length).toBe(0);
  });
});

// Test chat bot response logic
describe("Live Chat Bot Responses", () => {
  const BOT_RESPONSES: Record<string, string> = {
    "order": "You can track your order by logging into your account and visiting the Orders page.",
    "account": "For account-related issues, please visit your Profile page or Settings.",
    "commission": "Commissions are calculated based on your personal sales and team performance.",
    "distributor": "Great! To become a distributor, click 'Join Now' on our homepage.",
    "support": "I'll connect you with our support team right away.",
    "default": "Thanks for your message! I'm here to help.",
  };

  const getResponseKey = (message: string): string => {
    const lowerContent = message.toLowerCase();
    
    if (lowerContent.includes("order") || lowerContent.includes("track")) {
      return "order";
    } else if (lowerContent.includes("account") || lowerContent.includes("login") || lowerContent.includes("password")) {
      return "account";
    } else if (lowerContent.includes("commission") || lowerContent.includes("earn") || lowerContent.includes("money")) {
      return "commission";
    } else if (lowerContent.includes("distributor") || lowerContent.includes("join") || lowerContent.includes("sign up")) {
      return "distributor";
    } else if (lowerContent.includes("support") || lowerContent.includes("agent") || lowerContent.includes("human") || lowerContent.includes("help")) {
      return "support";
    }
    
    return "default";
  };

  it("should respond to order tracking questions", () => {
    const key = getResponseKey("How do I track my order?");
    expect(key).toBe("order");
    expect(BOT_RESPONSES[key]).toContain("track your order");
  });

  it("should respond to account questions", () => {
    const key = getResponseKey("I need help with my account login");
    expect(key).toBe("account");
    expect(BOT_RESPONSES[key]).toContain("account-related");
  });

  it("should respond to commission questions", () => {
    const key = getResponseKey("How do commissions work?");
    expect(key).toBe("commission");
    expect(BOT_RESPONSES[key]).toContain("Commissions");
  });

  it("should respond to distributor questions", () => {
    const key = getResponseKey("I want to become a distributor");
    expect(key).toBe("distributor");
    expect(BOT_RESPONSES[key]).toContain("Join Now");
  });

  it("should escalate to support when requested", () => {
    const key = getResponseKey("I need to speak with a human agent");
    expect(key).toBe("support");
    expect(BOT_RESPONSES[key]).toContain("support team");
  });

  it("should use default response for unrecognized messages", () => {
    const key = getResponseKey("Hello there!");
    expect(key).toBe("default");
    expect(BOT_RESPONSES[key]).toContain("here to help");
  });

  it("should handle mixed case messages", () => {
    const key = getResponseKey("WHERE IS MY ORDER?");
    expect(key).toBe("order");
  });

  it("should handle multiple keywords", () => {
    const key = getResponseKey("I want to track my order and earn money");
    expect(key).toBe("order"); // First match wins
  });
});
