import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { 
  TrendingUp, Users, DollarSign, Link as LinkIcon, Copy, ExternalLink, 
  Award, Target, Zap, ArrowUp, ArrowDown, Clock, CheckCircle, XCircle,
  Share2, BarChart3, PieChart, Activity, Sparkles
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import GenealogyTree from "@/components/GenealogyTree";

export default function DistributorDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [newLinkCampaign, setNewLinkCampaign] = useState("");

  const distributorInfo = trpc.distributor.me.useQuery();
  const distributorStats = trpc.distributor.stats.useQuery();
  const team = trpc.distributor.team.useQuery();
  const affiliateLinks = trpc.distributor.affiliateLinks.useQuery();

  const createLink = trpc.distributor.createAffiliateLink.useMutation({
    onSuccess: (data) => {
      toast.success("Affiliate link created!");
      setNewLinkCampaign("");
      affiliateLinks.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create link");
    },
  });

  if (loading || distributorInfo.isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#c8ff00] text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (!user) {
    setLocation("/join");
    return null;
  }

  if (!distributorInfo.data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Not a Distributor</h2>
          <p className="text-gray-400">You need to enroll as a distributor to access this page.</p>
          <Button onClick={() => setLocation("/join")} className="bg-[#c8ff00] text-black">
            Become a Distributor
          </Button>
        </div>
      </div>
    );
  }

  const distributor = distributorInfo.data;
  const stats = distributorStats.data;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleCreateLink = () => {
    createLink.mutate({
      campaignName: newLinkCampaign || undefined,
      targetPath: "/",
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#c8ff00]/20 py-4">
        <div className="container px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/")}>
              <div className="w-10 h-10 rounded-lg bg-[#c8ff00] flex items-center justify-center">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <div>
                <div className="text-xl font-black neon-text">NEON® DISTRIBUTOR</div>
                <div className="text-xs text-gray-500">ID: {distributor.distributorCode}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setLocation("/")} className="border-[#c8ff00]/30 text-white">
                Back to Site
              </Button>
              <div className="text-right">
                <div className="text-sm text-gray-400">Welcome back,</div>
                <div className="font-bold">{user.name}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container px-6 py-12">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-[#c8ff00]/20 to-[#0a0a0a] border-[#c8ff00]">
            <CardHeader className="pb-3">
              <CardDescription className="text-[#c8ff00]">Total Earnings</CardDescription>
              <CardTitle className="text-4xl font-black text-white">
                ${((distributor.totalEarnings || 0) / 100).toFixed(2)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span>All-time</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#0a0a0a] to-black border-[#c8ff00]/30">
            <CardHeader className="pb-3">
              <CardDescription>Available Balance</CardDescription>
              <CardTitle className="text-4xl font-black">
                ${((distributor.availableBalance || 0) / 100).toFixed(2)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="bg-[#c8ff00] text-black hover:bg-[#a8d600] w-full">
                Request Payout
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#0a0a0a] to-black border-[#c8ff00]/30">
            <CardHeader className="pb-3">
              <CardDescription>Personal Sales</CardDescription>
              <CardTitle className="text-4xl font-black">
                ${((distributor.personalSales || 0) / 100).toFixed(0)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Activity className="w-4 h-4" />
                <span>This month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#0a0a0a] to-black border-[#c8ff00]/30">
            <CardHeader className="pb-3">
              <CardDescription>Team Size</CardDescription>
              <CardTitle className="text-4xl font-black">
                {stats?.teamSize || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Users className="w-4 h-4" />
                <span>Active members</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rank Badge */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-[#c8ff00]/10 to-transparent border-[#c8ff00]/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#c8ff00]/20 flex items-center justify-center neon-glow">
                    <Award className="w-8 h-8 text-[#c8ff00]" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Current Rank</div>
                    <div className="text-3xl font-black text-[#c8ff00] uppercase">{distributor.rank}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-2">Next Rank: Bronze</div>
                  <div className="w-64 h-2 bg-black/50 rounded-full overflow-hidden">
                    <div className="h-full bg-[#c8ff00] w-1/3"></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">$5,000 more in team sales needed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-[#0a0a0a] border border-[#c8ff00]/30 flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="compensation">Comp Plan</TabsTrigger>
            <TabsTrigger value="links">Affiliate Links</TabsTrigger>
            <TabsTrigger value="team">My Team</TabsTrigger>
            <TabsTrigger value="genealogy">Genealogy</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Quick Actions */}
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#c8ff00]" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] justify-start">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share My Link
                  </Button>
                  <Button variant="outline" className="w-full border-[#c8ff00]/30 justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Invite Team Member
                  </Button>
                  <Button variant="outline" className="w-full border-[#c8ff00]/30 justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                  <Button variant="outline" className="w-full border-[#c8ff00]/30 justify-start">
                    <Target className="w-4 h-4 mr-2" />
                    Set Goals
                  </Button>
                </CardContent>
              </Card>

              {/* Distributor Code */}
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
                <CardHeader>
                  <CardTitle>Your Distributor Code</CardTitle>
                  <CardDescription>Share this code with new recruits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={distributor.distributorCode}
                      readOnly
                      className="bg-black border-[#c8ff00]/30 text-white font-mono text-lg"
                    />
                    <Button
                      onClick={() => copyToClipboard(distributor.distributorCode)}
                      className="bg-[#c8ff00] text-black hover:bg-[#a8d600]"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-4 bg-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-lg">
                    <p className="text-sm text-gray-300">
                      When someone signs up with your code, they become part of your team and you earn commissions on their sales!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Sales */}
            <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>Your latest transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.recentSales && stats.recentSales.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentSales.map((sale: any) => (
                      <div key={sale.id} className="flex items-center justify-between p-4 bg-black/50 rounded-lg border border-[#c8ff00]/20">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#c8ff00]/20 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-[#c8ff00]" />
                          </div>
                          <div>
                            <div className="font-semibold">{sale.productName || "Product Sale"}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(sale.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#c8ff00]">
                            ${((sale.amount || 0) / 100).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">{sale.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No sales yet. Start sharing your links!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compensation Plan Tab */}
          <TabsContent value="compensation" className="space-y-8">
            {/* Your Rank Progress */}
            <Card className="bg-gradient-to-r from-[#c8ff00]/10 to-transparent border-[#c8ff00]/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#c8ff00]" />
                  Your Rank Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-black/30 rounded-lg">
                    <div className="text-3xl font-black text-[#c8ff00] uppercase mb-1">{distributor.rank}</div>
                    <div className="text-sm text-gray-400">Current Rank</div>
                  </div>
                  <div className="text-center p-4 bg-black/30 rounded-lg">
                    <div className="text-3xl font-black text-white">{((distributor.personalSales || 0) / 100).toFixed(0)}</div>
                    <div className="text-sm text-gray-400">Personal Volume (PV)</div>
                  </div>
                  <div className="text-center p-4 bg-black/30 rounded-lg">
                    <div className="text-3xl font-black text-white">{((distributor.totalEarnings || 0) / 100).toFixed(0)}</div>
                    <div className="text-sm text-gray-400">Group Volume (GV)</div>
                  </div>
                  <div className="text-center p-4 bg-black/30 rounded-lg">
                    <div className="text-3xl font-black text-white">{stats?.teamSize || 0}</div>
                    <div className="text-sm text-gray-400">Active Legs</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commission Breakdown */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
                <CardHeader>
                  <CardTitle>Your Commission Rates</CardTitle>
                  <CardDescription>Based on your current rank</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-black/50 rounded-lg">
                    <span className="text-gray-300">Retail Profit</span>
                    <span className="text-2xl font-bold text-[#c8ff00]">20-30%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-black/50 rounded-lg">
                    <span className="text-gray-300">Level 1 Team</span>
                    <span className="text-2xl font-bold text-[#c8ff00]">10%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-black/50 rounded-lg">
                    <span className="text-gray-300">Level 2 Team</span>
                    <span className="text-2xl font-bold text-[#c8ff00]">5%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-black/50 rounded-lg">
                    <span className="text-gray-300">Binary Bonus</span>
                    <span className="text-2xl font-bold text-[#c8ff00]">10%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
                <CardHeader>
                  <CardTitle>Next Rank Requirements</CardTitle>
                  <CardDescription>What you need to advance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-lg">
                    <div className="text-lg font-bold text-[#c8ff00] mb-2">Manager</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Personal Volume</span>
                        <span className="text-white">500 PV</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Group Volume</span>
                        <span className="text-white">2,000 GV</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Active Legs</span>
                        <span className="text-white">2 legs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rank Bonus</span>
                        <span className="text-[#c8ff00] font-bold">$500</span>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => setLocation('/compensation')} className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600]">
                    View Full Comp Plan
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Earnings Potential */}
            <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
              <CardHeader>
                <CardTitle>Earnings Potential by Rank</CardTitle>
                <CardDescription>Estimated monthly earnings at each level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-4">
                  {[
                    { rank: 'Associate', earnings: '$500-$2K', color: 'text-gray-400' },
                    { rank: 'Manager', earnings: '$2K-$5K', color: 'text-green-400' },
                    { rank: 'Director', earnings: '$5K-$15K', color: 'text-blue-400' },
                    { rank: 'Executive', earnings: '$15K-$30K', color: 'text-purple-400' },
                    { rank: 'Presidential', earnings: '$50K+', color: 'text-[#c8ff00]' },
                  ].map((level) => (
                    <div key={level.rank} className="text-center p-4 bg-black/50 rounded-lg border border-[#c8ff00]/20">
                      <div className={`text-sm font-semibold mb-1 ${level.color}`}>{level.rank}</div>
                      <div className="text-xl font-black text-white">{level.earnings}</div>
                      <div className="text-xs text-gray-500">per month</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Affiliate Links Tab */}
          <TabsContent value="links" className="space-y-8">
            <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
              <CardHeader>
                <CardTitle>Create New Affiliate Link</CardTitle>
                <CardDescription>Generate trackable links for your campaigns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign">Campaign Name (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="campaign"
                      placeholder="e.g., Instagram Bio, Email Campaign"
                      value={newLinkCampaign}
                      onChange={(e) => setNewLinkCampaign(e.target.value)}
                      className="bg-black border-[#c8ff00]/30"
                    />
                    <Button
                      onClick={handleCreateLink}
                      disabled={createLink.isPending}
                      className="bg-[#c8ff00] text-black hover:bg-[#a8d600]"
                    >
                      {createLink.isPending ? "Creating..." : "Generate"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
              <CardHeader>
                <CardTitle>Your Affiliate Links</CardTitle>
                <CardDescription>Track performance of your marketing campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                {affiliateLinks.data && affiliateLinks.data.length > 0 ? (
                  <div className="space-y-4">
                    {affiliateLinks.data.map((link: any) => (
                      <div key={link.id} className="p-4 bg-black/50 rounded-lg border border-[#c8ff00]/20">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="font-semibold mb-1">
                              {link.campaignName || "Default Campaign"}
                            </div>
                            <div className="text-sm text-gray-500 font-mono break-all">
                              https://neon.energy/?ref={link.linkCode}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(`https://neon.energy/?ref=${link.linkCode}`)}
                              className="border-[#c8ff00]/30"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`https://neon.energy/?ref=${link.linkCode}`, "_blank")}
                              className="border-[#c8ff00]/30"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-[#c8ff00]">{link.clicks || 0}</div>
                            <div className="text-xs text-gray-500">Clicks</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-[#c8ff00]">{link.conversions || 0}</div>
                            <div className="text-xs text-gray-500">Conversions</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-[#c8ff00]">
                              {link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(1) : 0}%
                            </div>
                            <div className="text-xs text-gray-500">Conv. Rate</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <LinkIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No affiliate links yet. Create your first one above!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-8">
            <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
              <CardHeader>
                <CardTitle>My Team</CardTitle>
                <CardDescription>Direct recruits and their performance</CardDescription>
              </CardHeader>
              <CardContent>
                {team.data && team.data.length > 0 ? (
                  <div className="space-y-4">
                    {team.data.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-black/50 rounded-lg border border-[#c8ff00]/20">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-[#c8ff00]/20 flex items-center justify-center">
                            <Users className="w-6 h-6 text-[#c8ff00]" />
                          </div>
                          <div>
                            <div className="font-semibold">{member.distributorCode}</div>
                            <div className="text-sm text-gray-500">
                              Joined {new Date(member.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#c8ff00]">
                            ${((member.personalSales || 0) / 100).toFixed(0)}
                          </div>
                          <div className="text-xs text-gray-500 uppercase">{member.rank}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-4">No team members yet. Start recruiting!</p>
                    <Button className="bg-[#c8ff00] text-black hover:bg-[#a8d600]">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Your Code
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab - Add Genealogy */}
          <TabsContent value="genealogy" className="space-y-8">
            {distributorInfo.data && team.data && (
              <GenealogyTree rootDistributor={distributorInfo.data} team={team.data} />
            )}
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions" className="space-y-8">
            <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
              <CardHeader>
                <CardTitle>Commission History</CardTitle>
                <CardDescription>All your earnings and payouts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No commission history yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
