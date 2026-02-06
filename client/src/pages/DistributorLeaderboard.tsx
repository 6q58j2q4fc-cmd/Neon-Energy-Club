import { useState } from "react";
import { trpc } from "@/lib/trpc";
import HamburgerHeader from "@/components/HamburgerHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RankBadge, RankIcon } from "@/components/RankBadge";
import { Trophy, TrendingUp, Zap, Crown, Medal, Star, Users } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function DistributorLeaderboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("rank");
  
  // Check if user has access (distributor, franchise owner, vending owner, or admin)
  const { data: distributorProfile, isLoading: loadingDistributor } = trpc.distributor.me.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: territoryApps, isLoading: loadingTerritory } = trpc.territory.listApplications.useQuery(undefined, {
    enabled: !!user,
  });
  
  const isCheckingAccess = loadingDistributor || loadingTerritory;
  
  const hasAccess = user && (
    user.role === 'admin' || 
    !!distributorProfile || 
    (territoryApps && territoryApps.length > 0)
  );
  
  // Show access denied message if not authorized
  if (!isCheckingAccess && !hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#111] to-[#0a0a0a]">
        <HamburgerHeader />
        <div className="container mx-auto px-4 py-32 text-center">
          <Trophy className="w-20 h-20 text-[#c8ff00]/30 mx-auto mb-6" />
          <h1 className="text-4xl font-black text-white mb-4">Distributor Leaderboard</h1>
          <p className="text-xl text-gray-400 mb-8 max-w-md mx-auto">
            This leaderboard is exclusively available to NEON distributors, franchise owners, and vending machine operators.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/join" className="px-6 py-3 bg-[#c8ff00] text-black font-bold rounded-lg hover:bg-[#a8d600] transition-colors">
              Become a Distributor
            </a>
            <a href="/franchise" className="px-6 py-3 border border-[#c8ff00] text-[#c8ff00] font-bold rounded-lg hover:bg-[#c8ff00]/10 transition-colors">
              Franchise Opportunities
            </a>
            <a href="/vending" className="px-6 py-3 border border-[#c8ff00] text-[#c8ff00] font-bold rounded-lg hover:bg-[#c8ff00]/10 transition-colors">
              Vending Machines
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { data: byRank, isLoading: loadingRank } = trpc.distributor.leaderboardByRank.useQuery({ limit: 50 });
  const { data: byVolume, isLoading: loadingVolume } = trpc.distributor.leaderboardByVolume.useQuery({ limit: 50 });
  const { data: byPV, isLoading: loadingPV } = trpc.distributor.leaderboardByMonthlyPV.useQuery({ limit: 50 });
  const { data: myPosition } = trpc.distributor.myRankPosition.useQuery(undefined, { enabled: !!user });

  const getPositionStyle = (position: number) => {
    if (position === 1) return "bg-gradient-to-r from-yellow-400 to-amber-500 text-black";
    if (position === 2) return "bg-gradient-to-r from-gray-300 to-gray-400 text-black";
    if (position === 3) return "bg-gradient-to-r from-amber-600 to-amber-700 text-white";
    return "bg-zinc-800 text-white";
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (position === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (position === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-zinc-400 font-mono">#{position}</span>;
  };

  const renderLeaderboardTable = (data: any[] | undefined, isLoading: boolean, type: string) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#39FF14]"></div>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="text-center py-12 text-zinc-400">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No distributors found</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {data.map((distributor, index) => (
          <div
            key={distributor.id}
            className={`flex items-center gap-4 p-4 rounded-lg ${
              index < 3 ? "bg-zinc-800/50 border border-zinc-700" : "bg-zinc-900/50"
            }`}
          >
            {/* Position */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getPositionStyle(index + 1)}`}>
              {index < 3 ? getPositionIcon(index + 1) : <span className="text-sm font-bold">{index + 1}</span>}
            </div>

            {/* Rank Badge */}
            <div className="w-12">
              <RankIcon rank={distributor.rank || "starter"} size="md" />
            </div>

            {/* Distributor Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white truncate">
                  {distributor.username || distributor.distributorCode}
                </span>
                <RankBadge rank={distributor.rank || "starter"} size="sm" />
              </div>
              <div className="text-sm text-zinc-400">
                Code: {distributor.distributorCode}
              </div>
            </div>

            {/* Stats */}
            <div className="text-right">
              {type === "rank" && (
                <div>
                  <div className="text-lg font-bold text-[#39FF14]">
                    ${(distributor.teamSales / 100).toLocaleString()}
                  </div>
                  <div className="text-xs text-zinc-400">Team Volume</div>
                </div>
              )}
              {type === "volume" && (
                <div>
                  <div className="text-lg font-bold text-[#39FF14]">
                    ${(distributor.teamSales / 100).toLocaleString()}
                  </div>
                  <div className="text-xs text-zinc-400">
                    L: ${((distributor.leftLegVolume || 0) / 100).toLocaleString()} | R: ${((distributor.rightLegVolume || 0) / 100).toLocaleString()}
                  </div>
                </div>
              )}
              {type === "pv" && (
                <div>
                  <div className="text-lg font-bold text-[#39FF14]">
                    {distributor.monthlyPv?.toLocaleString() || 0} PV
                  </div>
                  <div className="text-xs text-zinc-400">This Month</div>
                </div>
              )}
            </div>

            {/* Active Status */}
            <Badge variant={distributor.isActive ? "default" : "secondary"} className={distributor.isActive ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}>
              {distributor.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <HamburgerHeader />

      <main className="container py-8 pt-24">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-full px-4 py-2 mb-4">
            <Trophy className="w-5 h-5 text-[#39FF14]" />
            <span className="text-[#39FF14] font-medium">Top Distributors</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Distributor <span className="text-[#39FF14]">Leaderboard</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Celebrating our top distributors who are leading the NEON movement. 
            See where you rank and get inspired to reach new heights!
          </p>
        </div>

        {/* User's Position Card */}
        {user && myPosition && (
          <Card className="bg-gradient-to-r from-[#39FF14]/10 to-transparent border-[#39FF14]/30 mb-8">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#39FF14]/20 flex items-center justify-center">
                    <Star className="w-8 h-8 text-[#39FF14]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Your Ranking</h3>
                    <p className="text-zinc-400">Keep pushing to climb higher!</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-[#39FF14]">#{myPosition}</div>
                  <div className="text-sm text-zinc-400">Overall Position</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Tabs */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-zinc-800/50">
                <TabsTrigger value="rank" className="data-[state=active]:bg-[#39FF14] data-[state=active]:text-black">
                  <Crown className="w-4 h-4 mr-2" />
                  By Rank
                </TabsTrigger>
                <TabsTrigger value="volume" className="data-[state=active]:bg-[#39FF14] data-[state=active]:text-black">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Team Volume
                </TabsTrigger>
                <TabsTrigger value="pv" className="data-[state=active]:bg-[#39FF14] data-[state=active]:text-black">
                  <Zap className="w-4 h-4 mr-2" />
                  Monthly PV
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="rank" className="mt-0">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white">Top Distributors by Rank</h3>
                  <p className="text-sm text-zinc-400">Ranked by achievement level and team performance</p>
                </div>
                {renderLeaderboardTable(byRank, loadingRank, "rank")}
              </TabsContent>
              <TabsContent value="volume" className="mt-0">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white">Top Distributors by Team Volume</h3>
                  <p className="text-sm text-zinc-400">Ranked by total team sales volume</p>
                </div>
                {renderLeaderboardTable(byVolume, loadingVolume, "volume")}
              </TabsContent>
              <TabsContent value="pv" className="mt-0">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white">Top Distributors by Monthly PV</h3>
                  <p className="text-sm text-zinc-400">Ranked by personal volume this month</p>
                </div>
                {renderLeaderboardTable(byPV, loadingPV, "pv")}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Rank Legend */}
        <Card className="bg-zinc-900/50 border-zinc-800 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Rank Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["starter", "bronze", "silver", "gold", "platinum", "diamond", "crown", "ambassador"].map((rank) => (
                <div key={rank} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                  <RankIcon rank={rank} size="md" />
                  <div>
                    <RankBadge rank={rank} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
