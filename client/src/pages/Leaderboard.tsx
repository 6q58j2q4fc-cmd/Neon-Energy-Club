import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import HamburgerHeader from "@/components/HamburgerHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, Target, TrendingUp, Crown, Medal, Star, Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function Leaderboard() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<"all" | "monthly" | "weekly">("all");
  const [copied, setCopied] = useState(false);
  
  const { data: leaderboard, isLoading } = trpc.sms.leaderboard.useQuery({ 
    limit: 50, 
    timeframe 
  });
  
  const { data: stats } = trpc.sms.leaderboardStats.useQuery();
  const { data: myPosition } = trpc.sms.myPosition.useQuery(undefined, {
    enabled: !!user,
  });

  const copyReferralLink = () => {
    if (myPosition?.referralCode) {
      navigator.clipboard.writeText(`https://neonpreord-dr9acum3.manus.space/ref/${myPosition.referralCode}`);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getTierIcon = (tier: { name: string; badge: string }) => {
    return <span className="text-2xl">{tier.badge}</span>;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <HamburgerHeader />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#c8ff00]/10 via-transparent to-[#ff00ff]/10" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#c8ff00]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#ff00ff]/20 rounded-full blur-3xl" />
        
        <div className="container relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c8ff00]/20 border border-[#c8ff00]/30 mb-6">
              <Trophy className="w-5 h-5 text-[#c8ff00]" />
              <span className="text-[#c8ff00] font-semibold">REFERRAL CHAMPIONS</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4">
              LEADER<span className="text-[#c8ff00]">BOARD</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join the NEON revolution and climb the ranks! Refer friends, earn rewards, and compete for exclusive prizes.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Card className="bg-black/50 border-[#c8ff00]/30 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-[#c8ff00] mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{stats?.totalReferrers || 0}</div>
                <div className="text-sm text-gray-400">Active Referrers</div>
              </CardContent>
            </Card>
            <Card className="bg-black/50 border-[#c8ff00]/30 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-[#c8ff00] mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{stats?.totalReferrals || 0}</div>
                <div className="text-sm text-gray-400">Total Referrals</div>
              </CardContent>
            </Card>
            <Card className="bg-black/50 border-[#c8ff00]/30 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-[#c8ff00] mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{stats?.totalCustomerConversions || 0}</div>
                <div className="text-sm text-gray-400">Customers Converted</div>
              </CardContent>
            </Card>
            <Card className="bg-black/50 border-[#c8ff00]/30 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-[#c8ff00] mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{stats?.totalDistributorConversions || 0}</div>
                <div className="text-sm text-gray-400">Distributors Recruited</div>
              </CardContent>
            </Card>
          </div>

          {/* User's Position Card */}
          {user && myPosition && (
            <Card className="bg-gradient-to-r from-[#c8ff00]/20 to-[#ff00ff]/20 border-[#c8ff00]/50 backdrop-blur-sm mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#c8ff00]/20 flex items-center justify-center">
                      {getTierIcon(myPosition.tier)}
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Your Position</div>
                      <div className="text-3xl font-bold text-white">#{myPosition.position}</div>
                      <Badge 
                        className="mt-1" 
                        style={{ backgroundColor: myPosition.tier.color, color: '#000' }}
                      >
                        {myPosition.tier.name} Tier
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-8 text-center">
                    <div>
                      <div className="text-2xl font-bold text-[#c8ff00]">{myPosition.totalReferrals}</div>
                      <div className="text-sm text-gray-400">Referrals</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#c8ff00]">{myPosition.customersReferred}</div>
                      <div className="text-sm text-gray-400">Customers</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#c8ff00]">{myPosition.points}</div>
                      <div className="text-sm text-gray-400">Points</div>
                    </div>
                  </div>
                  <Button 
                    onClick={copyReferralLink}
                    className="bg-[#c8ff00] text-black hover:bg-[#a8df00] font-bold"
                  >
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? "Copied!" : "Copy Referral Link"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tier Rewards Info */}
          <Card className="bg-black/50 border-[#c8ff00]/30 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#c8ff00]" />
                Tier Rewards & Prizes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {[
                  { name: 'Starter', badge: '⭐', color: '#c8ff00', refs: '1-4', reward: '10% Off' },
                  { name: 'Bronze', badge: '🥉', color: '#cd7f32', refs: '5-9', reward: '15% Off' },
                  { name: 'Silver', badge: '🥈', color: '#c0c0c0', refs: '10-24', reward: '20% Off + Free Case' },
                  { name: 'Gold', badge: '🥇', color: '#ffd700', refs: '25-49', reward: '25% Off + Merch Pack' },
                  { name: 'Platinum', badge: '🏆', color: '#e5e4e2', refs: '50-99', reward: '30% Off + VIP Access' },
                  { name: 'Diamond', badge: '💎', color: '#b9f2ff', refs: '100+', reward: 'Free Year Supply' },
                ].map((tier) => (
                  <div 
                    key={tier.name}
                    className="text-center p-4 rounded-lg bg-black/30 border border-gray-800 hover:border-[#c8ff00]/50 transition-colors"
                  >
                    <div className="text-3xl mb-2">{tier.badge}</div>
                    <div className="font-bold text-white" style={{ color: tier.color }}>{tier.name}</div>
                    <div className="text-xs text-gray-400 mb-2">{tier.refs} referrals</div>
                    <div className="text-xs text-[#c8ff00]">{tier.reward}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard Table */}
          <Card className="bg-black/50 border-[#c8ff00]/30 backdrop-blur-sm">
            <CardHeader>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-[#c8ff00]" />
                  Top Referrers
                </CardTitle>
                <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
                  <TabsList className="bg-black/50">
                    <TabsTrigger value="all" className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black">
                      All Time
                    </TabsTrigger>
                    <TabsTrigger value="monthly" className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black">
                      This Month
                    </TabsTrigger>
                    <TabsTrigger value="weekly" className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black">
                      This Week
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-[#c8ff00] border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-gray-400">Loading leaderboard...</p>
                </div>
              ) : leaderboard && leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-800">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-4">Name</div>
                    <div className="col-span-2 text-center">Tier</div>
                    <div className="col-span-2 text-center">Referrals</div>
                    <div className="col-span-1 text-center hidden md:block">Customers</div>
                    <div className="col-span-2 text-center">Points</div>
                  </div>
                  
                  {/* Rows */}
                  {leaderboard.map((leader: any, index: number) => (
                    <div 
                      key={leader.subscriberId}
                      className={`grid grid-cols-12 gap-4 px-4 py-3 rounded-lg transition-colors ${
                        index < 3 
                          ? 'bg-gradient-to-r from-[#c8ff00]/10 to-transparent border border-[#c8ff00]/30' 
                          : 'hover:bg-white/5'
                      } ${
                        myPosition?.referralCode === leader.subscriberId 
                          ? 'ring-2 ring-[#c8ff00]' 
                          : ''
                      }`}
                    >
                      <div className="col-span-1 flex items-center">
                        {getRankIcon(leader.rank)}
                      </div>
                      <div className="col-span-4 flex items-center gap-2">
                        <span className="text-white font-medium">{leader.name}</span>
                        {myPosition?.referralCode === leader.subscriberId && (
                          <Badge className="bg-[#c8ff00] text-black text-xs">You</Badge>
                        )}
                      </div>
                      <div className="col-span-2 flex items-center justify-center gap-1">
                        <span className="text-lg">{leader.tier.badge}</span>
                        <span className="text-sm hidden md:inline" style={{ color: leader.tier.color }}>
                          {leader.tier.name}
                        </span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-white font-bold">{leader.totalReferrals}</span>
                      </div>
                      <div className="col-span-1 text-center hidden md:block">
                        <span className="text-gray-400">{leader.customersReferred}</span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-[#c8ff00] font-bold">{leader.points}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Be the First!</h3>
                  <p className="text-gray-400 mb-6">
                    No referrers yet. Start sharing and claim the #1 spot!
                  </p>
                  <Button className="bg-[#c8ff00] text-black hover:bg-[#a8df00] font-bold">
                    <Share2 className="w-4 h-4 mr-2" />
                    Start Referring
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ranking Methodology */}
          <Card className="bg-black/50 border-gray-800 backdrop-blur-sm mt-8">
            <CardHeader>
              <CardTitle className="text-white text-lg">Ranking Methodology</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 text-sm space-y-2">
              <p>
                <strong className="text-white">Points Calculation:</strong> Referrals × 10 + Customers Converted × 50 + Distributors Recruited × 100
              </p>
              <p>
                <strong className="text-white">Tier Assignment:</strong> Based on total referral count (Starter: 1-4, Bronze: 5-9, Silver: 10-24, Gold: 25-49, Platinum: 50-99, Diamond: 100+)
              </p>
              <p>
                <strong className="text-white">Ranking Order:</strong> Primary sort by total referrals, secondary by customer conversions, tertiary by distributor conversions
              </p>
              <p>
                <strong className="text-white">Data Updates:</strong> Leaderboard updates in real-time as new referrals and conversions are tracked
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
