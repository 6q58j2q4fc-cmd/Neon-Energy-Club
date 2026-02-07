import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Trophy, Users, TrendingUp, Crown, Medal, Award, Star, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeaderboardEntry {
  position: number;
  displayName: string;
  profilePhoto: string | null;
  location: string | null;
  rank: string;
  teamSize: number;
  monthlyVolume: number;
  earningsTier: string;
}

const rankColors: Record<string, string> = {
  starter: "bg-gray-500",
  bronze: "bg-amber-700",
  silver: "bg-gray-400",
  gold: "bg-yellow-500",
  platinum: "bg-cyan-400",
  diamond: "bg-purple-500",
  "double diamond": "bg-purple-600",
  "triple diamond": "bg-purple-700",
  "crown diamond": "bg-gradient-to-r from-purple-600 to-pink-500",
  "royal diamond": "bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600",
};

const tierIcons: Record<string, typeof Trophy> = {
  "Diamond": Crown,
  "Platinum": Trophy,
  "Gold": Medal,
  "Silver": Award,
  "Bronze": Star,
  "Rising Star": Zap,
};

function getPositionStyle(position: number) {
  switch (position) {
    case 1:
      return "bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black";
    case 2:
      return "bg-gradient-to-r from-gray-300 to-gray-400 text-black font-bold";
    case 3:
      return "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold";
    default:
      return "bg-[#1a1a1a] text-gray-400";
  }
}

export default function LeaderboardWidget({ 
  limit = 10,
  showTitle = true,
  compact = false 
}: { 
  limit?: number;
  showTitle?: boolean;
  compact?: boolean;
}) {
  const { data: leaderboard, isLoading } = trpc.distributor.getLeaderboard.useQuery(
    { limit },
    { refetchInterval: 60000 } // Refresh every minute
  );

  if (isLoading) {
    return (
      <Card className="bg-black/50 border-[#c8ff00]/30 backdrop-blur-sm">
        {showTitle && (
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-[#c8ff00]">
              <Trophy className="w-5 h-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-[#1a1a1a] rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Card className="bg-black/50 border-[#c8ff00]/30 backdrop-blur-sm">
        {showTitle && (
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-[#c8ff00]">
              <Trophy className="w-5 h-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            Be the first to join the leaderboard!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/50 border-[#c8ff00]/30 backdrop-blur-sm overflow-hidden">
      {showTitle && (
        <CardHeader className="pb-2 border-b border-[#c8ff00]/20">
          <CardTitle className="flex items-center gap-2 text-[#c8ff00]">
            <Trophy className="w-5 h-5" />
            Top Performers
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={compact ? "p-2" : "p-4"}>
        <div className="space-y-2">
          {leaderboard.map((entry: LeaderboardEntry, index: number) => {
            const TierIcon = tierIcons[entry.earningsTier] || Star;
            const isTopThree = entry.position <= 3;
            
            return (
              <div
                key={index}
                className={`
                  flex items-center gap-3 p-2 rounded-lg transition-all duration-300
                  ${isTopThree ? 'bg-[#c8ff00]/10 border border-[#c8ff00]/30' : 'bg-[#0a0a0a] hover:bg-[#1a1a1a]'}
                  ${entry.position === 1 ? 'ring-2 ring-[#c8ff00]/50' : ''}
                `}
              >
                {/* Position Badge */}
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm
                  ${getPositionStyle(entry.position)}
                `}>
                  {entry.position}
                </div>

                {/* Profile Photo */}
                <div className="relative">
                  <div className={`
                    w-10 h-10 rounded-full overflow-hidden border-2
                    ${isTopThree ? 'border-[#c8ff00]' : 'border-gray-700'}
                  `}>
                    {entry.profilePhoto ? (
                      <img 
                        src={entry.profilePhoto} 
                        alt={(entry?.displayName ?? "N/A")}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#c8ff00]/30 to-[#c8ff00]/10 flex items-center justify-center">
                        <span className="text-[#c8ff00] font-bold text-sm">
                          {(entry?.displayName ?? "N/A").charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  {entry.position === 1 && (
                    <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold truncate ${isTopThree ? 'text-white' : 'text-gray-300'}`}>
                      {(entry?.displayName ?? "N/A")}
                    </span>
                    <span className={`
                      text-[10px] px-1.5 py-0.5 rounded uppercase font-bold
                      ${rankColors[entry.rank.toLowerCase()] || 'bg-gray-600'}
                      text-white
                    `}>
                      {entry.rank}
                    </span>
                  </div>
                  {!compact && (
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {entry.location && (
                        <span>{entry.location}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {entry.teamSize} team
                      </span>
                    </div>
                  )}
                </div>

                {/* Earnings Tier */}
                <div className="flex items-center gap-1 text-[#c8ff00]">
                  <TierIcon className="w-4 h-4" />
                  {!compact && (
                    <span className="text-xs font-medium">{entry.earningsTier}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Join CTA */}
        <div className="mt-4 pt-4 border-t border-[#c8ff00]/20 text-center">
          <p className="text-xs text-gray-500">
            Join the NEON team and climb the leaderboard!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
