import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Star, Users, TrendingUp, Target, Award, Crown, Heart,
  Zap, Flame, Shield, Medal, Gift, Rocket, Diamond, Sparkles
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Badge definitions
export const BADGES = {
  FIRST_SALE: {
    id: "first_sale",
    name: "First Sale",
    description: "Made your first sale",
    icon: Zap,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/20",
    borderColor: "border-yellow-400/50",
    requirement: "Complete 1 sale",
    tier: "bronze",
  },
  TEN_REFERRALS: {
    id: "ten_referrals",
    name: "Referral Pro",
    description: "Reached 10 referrals",
    icon: Users,
    color: "text-blue-400",
    bgColor: "bg-blue-400/20",
    borderColor: "border-blue-400/50",
    requirement: "Get 10 referrals",
    tier: "silver",
  },
  TOP_SELLER: {
    id: "top_seller",
    name: "Top Seller",
    description: "Monthly top seller",
    icon: Trophy,
    color: "text-amber-400",
    bgColor: "bg-amber-400/20",
    borderColor: "border-amber-400/50",
    requirement: "Rank #1 in monthly sales",
    tier: "gold",
  },
  RISING_STAR: {
    id: "rising_star",
    name: "Rising Star",
    description: "Fastest growing distributor",
    icon: Star,
    color: "text-purple-400",
    bgColor: "bg-purple-400/20",
    borderColor: "border-purple-400/50",
    requirement: "Top growth rate this month",
    tier: "silver",
  },
  TEAM_BUILDER: {
    id: "team_builder",
    name: "Team Builder",
    description: "Built a team of 5+ members",
    icon: Users,
    color: "text-green-400",
    bgColor: "bg-green-400/20",
    borderColor: "border-green-400/50",
    requirement: "Recruit 5 team members",
    tier: "silver",
  },
  CONSISTENCY: {
    id: "consistency",
    name: "Consistency King",
    description: "Active for 3+ consecutive months",
    icon: Flame,
    color: "text-orange-400",
    bgColor: "bg-orange-400/20",
    borderColor: "border-orange-400/50",
    requirement: "Stay active 3 months",
    tier: "bronze",
  },
  ELITE: {
    id: "elite",
    name: "Elite Status",
    description: "Reached the highest rank",
    icon: Crown,
    color: "text-pink-400",
    bgColor: "bg-pink-400/20",
    borderColor: "border-pink-400/50",
    requirement: "Achieve Elite rank",
    tier: "platinum",
  },
  MENTOR: {
    id: "mentor",
    name: "Mentor",
    description: "Helped team members succeed",
    icon: Heart,
    color: "text-red-400",
    bgColor: "bg-red-400/20",
    borderColor: "border-red-400/50",
    requirement: "3 team members reach Silver rank",
    tier: "gold",
  },
  HUNDRED_SALES: {
    id: "hundred_sales",
    name: "Century Club",
    description: "Completed 100 sales",
    icon: Medal,
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/20",
    borderColor: "border-cyan-400/50",
    requirement: "Complete 100 sales",
    tier: "gold",
  },
  DIAMOND_ACHIEVER: {
    id: "diamond_achiever",
    name: "Diamond Achiever",
    description: "Reached $10,000 in commissions",
    icon: Diamond,
    color: "text-sky-300",
    bgColor: "bg-sky-300/20",
    borderColor: "border-sky-300/50",
    requirement: "Earn $10,000 in commissions",
    tier: "platinum",
  },
  LAUNCH_PIONEER: {
    id: "launch_pioneer",
    name: "Launch Pioneer",
    description: "Joined during pre-launch",
    icon: Rocket,
    color: "text-lime-400",
    bgColor: "bg-lime-400/20",
    borderColor: "border-lime-400/50",
    requirement: "Join before official launch",
    tier: "special",
  },
  SUPER_RECRUITER: {
    id: "super_recruiter",
    name: "Super Recruiter",
    description: "Recruited 25+ team members",
    icon: Sparkles,
    color: "text-violet-400",
    bgColor: "bg-violet-400/20",
    borderColor: "border-violet-400/50",
    requirement: "Recruit 25 team members",
    tier: "gold",
  },
} as const;

export type BadgeId = keyof typeof BADGES;

interface Badge {
  id: string;
  earnedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface BadgeDisplayProps {
  badge: typeof BADGES[BadgeId];
  earned: boolean;
  earnedAt?: Date;
  progress?: number;
  maxProgress?: number;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  animate?: boolean;
}

// Single badge display component
export function BadgeDisplay({ 
  badge, 
  earned, 
  earnedAt,
  progress = 0,
  maxProgress = 100,
  size = "md",
  showTooltip = true,
  animate = false
}: BadgeDisplayProps) {
  const Icon = badge.icon;
  
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const badgeContent = (
    <motion.div
      initial={animate ? { scale: 0, rotate: -180 } : false}
      animate={animate ? { scale: 1, rotate: 0 } : false}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className={cn(
        "relative rounded-full flex items-center justify-center border-2 transition-all duration-300",
        sizeClasses[size],
        earned ? badge.bgColor : "bg-muted/50",
        earned ? badge.borderColor : "border-muted",
        earned ? "shadow-lg" : "opacity-50 grayscale"
      )}
    >
      <Icon className={cn(
        iconSizes[size],
        earned ? badge.color : "text-muted-foreground"
      )} />
      
      {/* Glow effect for earned badges */}
      {earned && (
        <div className={cn(
          "absolute inset-0 rounded-full blur-md -z-10",
          badge.bgColor,
          "opacity-50"
        )} />
      )}
    </motion.div>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{badge.name}</p>
            <p className="text-sm text-muted-foreground">{badge.description}</p>
            {earned ? (
              <p className="text-xs text-green-400">
                Earned {earnedAt ? new Date(earnedAt).toLocaleDateString() : ""}
              </p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">{badge.requirement}</p>
                {progress > 0 && (
                  <div className="mt-2">
                    <Progress value={(progress / maxProgress) * 100} className="h-1" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {progress} / {maxProgress}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Badge showcase component for profile pages
interface BadgeShowcaseProps {
  earnedBadges: Badge[];
  showProgress?: boolean;
  maxDisplay?: number;
}

export function BadgeShowcase({ 
  earnedBadges, 
  showProgress = true,
  maxDisplay = 12
}: BadgeShowcaseProps) {
  const [showAll, setShowAll] = useState(false);
  
  const allBadges = Object.values(BADGES);
  const displayBadges = showAll ? allBadges : allBadges.slice(0, maxDisplay);
  
  const earnedBadgeIds = new Set(earnedBadges.map(b => b.id));
  const earnedCount = earnedBadges.length;
  const totalCount = allBadges.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Achievement Badges
            </CardTitle>
            <CardDescription>
              {earnedCount} of {totalCount} badges earned
            </CardDescription>
          </div>
          {showProgress && (
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{earnedCount}</p>
              <p className="text-xs text-muted-foreground">Badges</p>
            </div>
          )}
        </div>
        {showProgress && (
          <Progress value={(earnedCount / totalCount) * 100} className="mt-2" />
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
          {displayBadges.map((badge) => {
            const earnedBadge = earnedBadges.find(b => b.id === badge.id);
            return (
              <BadgeDisplay
                key={badge.id}
                badge={badge}
                earned={earnedBadgeIds.has(badge.id)}
                earnedAt={earnedBadge?.earnedAt}
                progress={earnedBadge?.progress}
                maxProgress={earnedBadge?.maxProgress}
                size="md"
              />
            );
          })}
        </div>
        
        {allBadges.length > maxDisplay && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-4 text-sm text-primary hover:underline"
          >
            {showAll ? "Show less" : `Show all ${totalCount} badges`}
          </button>
        )}
      </CardContent>
    </Card>
  );
}

// Compact badge row for leaderboard entries
interface BadgeRowProps {
  earnedBadges: Badge[];
  maxDisplay?: number;
}

export function BadgeRow({ earnedBadges, maxDisplay = 5 }: BadgeRowProps) {
  const displayBadges = earnedBadges.slice(0, maxDisplay);
  const remaining = earnedBadges.length - maxDisplay;

  return (
    <div className="flex items-center gap-1">
      {displayBadges.map((badge) => {
        const badgeInfo = Object.values(BADGES).find(b => b.id === badge.id);
        if (!badgeInfo) return null;
        
        return (
          <BadgeDisplay
            key={badge.id}
            badge={badgeInfo}
            earned={true}
            earnedAt={badge.earnedAt}
            size="sm"
          />
        );
      })}
      {remaining > 0 && (
        <span className="text-xs text-muted-foreground ml-1">
          +{remaining}
        </span>
      )}
    </div>
  );
}

// Badge unlock notification component
interface BadgeUnlockNotificationProps {
  badge: typeof BADGES[BadgeId];
  onClose: () => void;
}

export function BadgeUnlockNotification({ badge, onClose }: BadgeUnlockNotificationProps) {
  const Icon = badge.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Card className="w-80 border-2 border-yellow-400/50 bg-background/95 backdrop-blur-sm shadow-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 15,
                  delay: 0.2
                }}
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center border-2",
                  badge.bgColor,
                  badge.borderColor
                )}
              >
                <Icon className={cn("w-8 h-8", badge.color)} />
              </motion.div>
              
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wider">
                    Badge Unlocked!
                  </p>
                  <p className="text-lg font-bold">{badge.name}</p>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                </motion.div>
              </div>
            </div>
            
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={onClose}
              className="mt-4 w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Dismiss
            </motion.button>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

// Helper function to check badge eligibility
export function checkBadgeEligibility(stats: {
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
}): BadgeId[] {
  const eligibleBadges: BadgeId[] = [];

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
}

export default BadgeShowcase;
