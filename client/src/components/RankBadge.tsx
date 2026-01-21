import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Rank configuration with icons and colors
export const RANK_CONFIG = {
  starter: {
    name: "Starter",
    icon: "⚡",
    color: "#9CA3AF",
    bgColor: "rgba(156, 163, 175, 0.2)",
    description: "New distributor - Welcome to NEON!",
    requirements: "Enroll and activate account",
  },
  bronze: {
    name: "Bronze",
    icon: "🥉",
    color: "#CD7F32",
    bgColor: "rgba(205, 127, 50, 0.2)",
    description: "Bronze rank - Building momentum!",
    requirements: "100 PV personal, 500 PV team, 1 active leg",
  },
  silver: {
    name: "Silver",
    icon: "🥈",
    color: "#C0C0C0",
    bgColor: "rgba(192, 192, 192, 0.2)",
    description: "Silver rank - Rising star!",
    requirements: "150 PV personal, 2,000 PV team, 2 active legs",
  },
  gold: {
    name: "Gold",
    icon: "🥇",
    color: "#FFD700",
    bgColor: "rgba(255, 215, 0, 0.2)",
    description: "Gold rank - Proven leader!",
    requirements: "200 PV personal, 5,000 PV team, 2 active legs",
  },
  platinum: {
    name: "Platinum",
    icon: "💎",
    color: "#E5E4E2",
    bgColor: "rgba(229, 228, 226, 0.2)",
    description: "Platinum rank - Elite performer!",
    requirements: "250 PV personal, 15,000 PV team, 2 active legs",
  },
  diamond: {
    name: "Diamond",
    icon: "💠",
    color: "#B9F2FF",
    bgColor: "rgba(185, 242, 255, 0.2)",
    description: "Diamond rank - Top 1% achiever!",
    requirements: "300 PV personal, 50,000 PV team, 2 active legs",
  },
  crown: {
    name: "Crown Diamond",
    icon: "👑",
    color: "#9333EA",
    bgColor: "rgba(147, 51, 234, 0.2)",
    description: "Crown Diamond - Industry legend!",
    requirements: "400 PV personal, 150,000 PV team, 2 active legs",
  },
  ambassador: {
    name: "Ambassador",
    icon: "🏆",
    color: "#DC2626",
    bgColor: "rgba(220, 38, 38, 0.2)",
    description: "Ambassador - Pinnacle of success!",
    requirements: "500 PV personal, 500,000 PV team, 2 active legs",
  },
};

export type RankKey = keyof typeof RANK_CONFIG;

interface RankBadgeProps {
  rank: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showTooltip?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function RankBadge({ 
  rank, 
  size = "md", 
  showIcon = true, 
  showTooltip = true,
  showLabel = true,
  className = "" 
}: RankBadgeProps) {
  const rankKey = rank.toLowerCase() as RankKey;
  const config = RANK_CONFIG[rankKey] || RANK_CONFIG.starter;
  
  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  const iconSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const badge = (
    <Badge
      variant="outline"
      className={`uppercase font-semibold ${sizeClasses[size]} ${className}`}
      style={{ 
        borderColor: config.color, 
        color: config.color,
        backgroundColor: config.bgColor,
      }}
    >
      {showIcon && <span className={`${showLabel ? 'mr-1' : ''} ${iconSizes[size]}`}>{config.icon}</span>}
      {showLabel && config.name}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent 
          className="bg-black border-gray-700 text-white max-w-xs"
          side="top"
        >
          <div className="space-y-1">
            <div className="font-bold flex items-center gap-2">
              <span className="text-lg">{config.icon}</span>
              <span style={{ color: config.color }}>{config.name}</span>
            </div>
            <p className="text-gray-400 text-xs">{config.description}</p>
            <div className="pt-1 border-t border-gray-700">
              <p className="text-[10px] text-gray-500">Requirements:</p>
              <p className="text-[11px] text-gray-300">{config.requirements}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Compact icon-only badge for tree nodes
interface RankIconProps {
  rank: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export function RankIcon({ rank, size = "md", showTooltip = true }: RankIconProps) {
  const rankKey = rank.toLowerCase() as RankKey;
  const config = RANK_CONFIG[rankKey] || RANK_CONFIG.starter;
  
  const sizeClasses = {
    sm: "w-5 h-5 text-xs",
    md: "w-6 h-6 text-sm",
    lg: "w-8 h-8 text-base",
  };

  const icon = (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center border-2 shadow-lg`}
      style={{ 
        borderColor: config.color, 
        backgroundColor: config.bgColor,
        boxShadow: `0 0 8px ${config.color}40`,
      }}
    >
      <span>{config.icon}</span>
    </div>
  );

  if (!showTooltip) {
    return icon;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {icon}
        </TooltipTrigger>
        <TooltipContent 
          className="bg-black border-gray-700 text-white max-w-xs"
          side="top"
        >
          <div className="space-y-1">
            <div className="font-bold flex items-center gap-2">
              <span className="text-lg">{config.icon}</span>
              <span style={{ color: config.color }}>{config.name}</span>
            </div>
            <p className="text-gray-400 text-xs">{config.description}</p>
            <div className="pt-1 border-t border-gray-700">
              <p className="text-[10px] text-gray-500">Requirements:</p>
              <p className="text-[11px] text-gray-300">{config.requirements}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Rank progress indicator showing progress to next rank
interface RankProgressProps {
  currentRank: string;
  personalPV: number;
  teamPV: number;
}

export function RankProgress({ currentRank, personalPV, teamPV }: RankProgressProps) {
  const rankKeys = Object.keys(RANK_CONFIG) as RankKey[];
  const currentIndex = rankKeys.indexOf(currentRank.toLowerCase() as RankKey);
  const nextRank = currentIndex < rankKeys.length - 1 ? rankKeys[currentIndex + 1] : null;
  
  if (!nextRank) {
    return (
      <div className="text-center text-[#c8ff00] text-xs">
        🏆 Maximum Rank Achieved!
      </div>
    );
  }

  // Simplified progress calculation (would need actual rank requirements in production)
  const pvRequirements: Record<RankKey, { personal: number; team: number }> = {
    starter: { personal: 0, team: 0 },
    bronze: { personal: 100, team: 500 },
    silver: { personal: 150, team: 2000 },
    gold: { personal: 200, team: 5000 },
    platinum: { personal: 250, team: 15000 },
    diamond: { personal: 300, team: 50000 },
    crown: { personal: 400, team: 150000 },
    ambassador: { personal: 500, team: 500000 },
  };

  const nextReqs = pvRequirements[nextRank];
  const personalProgress = Math.min(100, (personalPV / nextReqs.personal) * 100);
  const teamProgress = Math.min(100, (teamPV / nextReqs.team) * 100);
  const overallProgress = (personalProgress + teamProgress) / 2;

  const nextConfig = RANK_CONFIG[nextRank];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">Next Rank:</span>
        <span className="flex items-center gap-1" style={{ color: nextConfig.color }}>
          {nextConfig.icon} {nextConfig.name}
        </span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${overallProgress}%`,
            backgroundColor: nextConfig.color,
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-500">
        <span>Personal: {personalPV}/{nextReqs.personal} PV</span>
        <span>Team: {teamPV.toLocaleString()}/{nextReqs.team.toLocaleString()} PV</span>
      </div>
    </div>
  );
}

// All ranks display for reference
export function AllRanksDisplay() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {(Object.keys(RANK_CONFIG) as RankKey[]).map((rankKey) => {
        const config = RANK_CONFIG[rankKey];
        return (
          <div 
            key={rankKey}
            className="p-3 rounded-lg border text-center"
            style={{ 
              borderColor: config.color,
              backgroundColor: config.bgColor,
            }}
          >
            <div className="text-2xl mb-1">{config.icon}</div>
            <div className="font-bold text-sm" style={{ color: config.color }}>
              {config.name}
            </div>
            <div className="text-[10px] text-gray-400 mt-1">
              {config.requirements.split(",")[0]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
