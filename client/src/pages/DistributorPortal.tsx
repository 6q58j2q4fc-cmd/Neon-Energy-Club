import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { getLoginUrl } from "@/const";
import { 
  Zap, 
  Users, 
  TrendingUp, 
  Award,
  DollarSign,
  Star,
  Crown,
  Target,
  Gift,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  BarChart3,
  Calendar,
  Download,
  Settings,
  HelpCircle,
  BookOpen,
  Video,
  FileText,
  Share2,
  Link,
  Globe,
  ChevronRight,
  Bell,
  CreditCard,
  Package,
  ShoppingCart,
  Repeat,
  LogOut,
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import GenealogyTree from "@/components/GenealogyTree";
import MyTeam from "@/components/MyTeam";
import { AutoshipManager } from "@/components/AutoshipManager";
import { PayoutManager } from "@/components/PayoutManager";
import { RankHistory } from "@/components/RankHistory";
import DistributorRewards from "@/components/DistributorRewards";
import ProfileEditor from "@/components/ProfileEditor";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import NavigationHeader from "@/components/NavigationHeader";

export default function DistributorPortal() {
  const [, setLocation] = useLocation();
  const { user, loading, logout } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch real distributor data from API
  const { data: distributorProfile, isLoading: profileLoading } = trpc.distributor.me.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: distributorStats, isLoading: statsLoading } = trpc.distributor.stats.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: teamData, isLoading: teamLoading } = trpc.distributor.team.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: commissions, isLoading: commissionsLoading } = trpc.distributor.commissions.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: rankProgress, isLoading: rankLoading } = trpc.distributor.rankProgress.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Redirect to login if not authenticated
  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-[#0a0a0a] border-[#c8ff00]/30 max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <Zap className="w-16 h-16 text-[#c8ff00] mx-auto mb-4" />
            <CardTitle className="text-2xl">Distributor Portal</CardTitle>
            <CardDescription>Please sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => window.location.href = getLoginUrl()}
              className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => setLocation("/join")}
              variant="outline"
              className="w-full border-[#c8ff00] text-[#c8ff00]"
            >
              Become a Distributor
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#c8ff00] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Not a distributor yet
  if (!distributorProfile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-[#0a0a0a] border-[#c8ff00]/30 max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Not Yet a Distributor</CardTitle>
            <CardDescription>
              You haven't enrolled as a NEON distributor yet. Join now to start building your business!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setLocation("/join")}
              className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
            >
              Become a Distributor
            </Button>
            <Button 
              onClick={() => setLocation("/customer-portal")}
              variant="outline"
              className="w-full border-gray-600 text-gray-400"
            >
              Go to Customer Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use real data from API, with fallbacks to 0
  // rankProgress is an object with personalPV, teamPV, legVolume details
  const rankProgressData = rankProgress as any;
  const overallProgress = rankProgressData?.personalPV?.percentage || 0;
  const statsData = distributorStats as any;
  const distributorInfo = statsData?.distributor || {};
  
  const stats = {
    personalVolume: distributorInfo?.personalVolume || 0,
    groupVolume: distributorInfo?.groupVolume || 0,
    leftLegVolume: distributorInfo?.leftLegVolume || 0,
    rightLegVolume: distributorInfo?.rightLegVolume || 0,
    teamSize: statsData?.teamSize || teamData?.length || 0,
    personallyEnrolled: distributorInfo?.personallyEnrolled || 0,
    rank: distributorProfile?.rank || "Brand Partner",
    nextRank: rankProgressData?.nextRank?.name || rankProgressData?.nextRank?.key || "Senior Partner",
    rankProgress: overallProgress,
    weeklyEarnings: (commissions?.totals as any)?.thisWeek || 0,
    monthlyEarnings: (commissions?.totals as any)?.thisMonth || 0,
    totalEarnings: commissions?.totals?.total || 0,
    pendingCommissions: commissions?.totals?.pending || 0
  };

  // Get recent activity from real commissions data
  const commissionsList = commissions?.commissions || [];
  const recentActivity = commissionsList.slice(0, 5).map((c: any) => ({
    type: c.commissionType || "commission",
    description: c.description || `${c.commissionType} commission`,
    amount: Number(c.amount) || 0,
    date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Recently"
  }));

  // Use neonenergyclub.com domain for referral links
  const referralDomain = "https://neonenergyclub.com";
  const affiliateLink = distributorProfile?.distributorCode 
    ? `${referralDomain}/${distributorProfile.distributorCode}`
    : `${referralDomain}/${user?.id || 'demo'}`;

  const subdomain = distributorProfile?.subdomain 
    ? `${distributorProfile.subdomain}.neon.energy`
    : distributorProfile?.username
    ? `${distributorProfile.username}.neon.energy`
    : `${user?.name?.toLowerCase().replace(/\s+/g, '') || 'demo'}.neon.energy`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#0a0a0a] border-r border-[#c8ff00]/20 z-50 hidden lg:block">
        <div className="p-6">
          <h1 
            className="text-2xl font-bold text-[#c8ff00] neon-text cursor-pointer flex items-center gap-2" 
            onClick={() => setLocation("/")}
          >
            <Zap className="w-6 h-6" />
            NEON®
          </h1>
        </div>

        <nav className="px-4 space-y-2">
          {[
            { id: "dashboard", icon: BarChart3, label: "Dashboard" },
            { id: "my-website", icon: Globe, label: "My Website" },
            { id: "team", icon: Users, label: "My Team" },
            { id: "sales", icon: ShoppingCart, label: "Sales" },
            { id: "commissions", icon: DollarSign, label: "Commissions" },
            { id: "payouts", icon: CreditCard, label: "Payouts" },
            { id: "rank-history", icon: Award, label: "Rank History" },
            { id: "marketing", icon: Share2, label: "Marketing" },
            { id: "training", icon: BookOpen, label: "Training" },
            { id: "autoship", icon: Repeat, label: "Auto-Ship" },
            { id: "rewards", icon: Gift, label: "3-for-Free" },
            { id: "settings", icon: Settings, label: "Settings" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id 
                  ? 'bg-[#c8ff00]/20 text-[#c8ff00]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#c8ff00]/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#c8ff00]/20 flex items-center justify-center">
              <span className="text-[#c8ff00] font-bold">{user?.name?.[0] || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white truncate">{user?.name || 'User'}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            </div>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="w-full border-gray-700 text-gray-400 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-[#c8ff00]/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {activeTab === "dashboard" && "Dashboard"}
                {activeTab === "my-website" && "My Website"}
                {activeTab === "team" && "My Team"}
                {activeTab === "sales" && "Sales"}
                {activeTab === "commissions" && "Commissions"}
                {activeTab === "payouts" && "Payouts"}
                {activeTab === "rank-history" && "Rank History"}
                {activeTab === "marketing" && "Marketing Tools"}
                {activeTab === "training" && "Training Center"}
                {activeTab === "autoship" && "Auto-Ship Management"}
                {activeTab === "rewards" && "3-for-Free Rewards"}
                {activeTab === "settings" && "Settings"}
              </h2>
              <p className="text-gray-500 text-sm">Welcome back, {user?.name?.split(' ')[0] || 'Distributor'}!</p>
            </div>
            <div className="flex items-center gap-4">
                <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10"
              >
                Back
              </Button>
              <Button
                onClick={() => setLocation("/")}
                className="bg-[#c8ff00] hover:bg-[#d4ff33] text-black font-bold"
              >
                Home
              </Button>
              <Button variant="outline" className="border-[#c8ff00]/30 text-[#c8ff00]">
                <Bell className="w-4 h-4" />
              </Button>
              <Button 
                onClick={() => setLocation("/shop")}
                className="bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Shop
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <>
              {/* AI Analytics Section */}
              <AnalyticsDashboard />
              
              {/* Original Dashboard Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/20 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-[#c8ff00]" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">${stats.weeklyEarnings.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">This Week</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{stats.groupVolume.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Group Volume</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{stats.teamSize}</div>
                        <div className="text-xs text-gray-500">Team Members</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Award className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{stats.rank}</div>
                        <div className="text-xs text-gray-500">Current Rank</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Rank Progress & Binary */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-[#c8ff00]" />
                      Rank Progress
                    </CardTitle>
                    <CardDescription>
                      {stats.rank} → {stats.nextRank}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Progress to {stats.nextRank}</span>
                          <span className="text-[#c8ff00]">{stats.rankProgress}%</span>
                        </div>
                        <Progress value={stats.rankProgress} className="h-3" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="text-center p-3 bg-black/50 rounded-lg">
                          <div className="text-lg font-bold text-white">{stats.personalVolume}</div>
                          <div className="text-xs text-gray-500">Personal PV</div>
                        </div>
                        <div className="text-center p-3 bg-black/50 rounded-lg">
                          <div className="text-lg font-bold text-white">{stats.personallyEnrolled}</div>
                          <div className="text-xs text-gray-500">Personally Enrolled</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-500" />
                      Binary Legs
                    </CardTitle>
                    <CardDescription>Team volume distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <div className="text-2xl font-bold text-blue-400">{stats.leftLegVolume.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">Left Leg</div>
                      </div>
                      <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="text-2xl font-bold text-green-400">{stats.rightLegVolume.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">Right Leg</div>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <div className="text-sm text-gray-500">
                        Weaker leg: {stats.leftLegVolume <= stats.rightLegVolume ? 'Left' : 'Right'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity & Earnings */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#c8ff00]" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentActivity.length > 0 ? (
                      <div className="space-y-3">
                        {recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-black/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                activity.type === 'sale' ? 'bg-green-500/20' :
                                activity.type === 'enrollment' ? 'bg-blue-500/20' :
                                'bg-[#c8ff00]/20'
                              }`}>
                                {activity.type === 'sale' && <ShoppingCart className="w-4 h-4 text-green-500" />}
                                {activity.type === 'enrollment' && <Users className="w-4 h-4 text-blue-500" />}
                                {activity.type === 'commission' && <DollarSign className="w-4 h-4 text-[#c8ff00]" />}
                              </div>
                              <div>
                                <div className="text-sm text-white">{activity.description}</div>
                                <div className="text-xs text-gray-500">{activity.date}</div>
                              </div>
                            </div>
                            <div className="text-[#c8ff00] font-bold">+${activity.amount}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No recent activity</p>
                        <p className="text-sm">Start building your team to see activity here!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      Earnings Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-black/50 rounded-lg">
                        <span className="text-gray-400">This Week</span>
                        <span className="text-xl font-bold text-white">${stats.weeklyEarnings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-black/50 rounded-lg">
                        <span className="text-gray-400">This Month</span>
                        <span className="text-xl font-bold text-white">${stats.monthlyEarnings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-black/50 rounded-lg">
                        <span className="text-gray-400">Lifetime</span>
                        <span className="text-xl font-bold text-[#c8ff00]">${stats.totalEarnings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <span className="text-yellow-400">Pending</span>
                        <span className="text-xl font-bold text-yellow-400">${stats.pendingCommissions.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Links */}
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="w-5 h-5 text-[#c8ff00]" />
                    Your Links
                  </CardTitle>
                  <CardDescription>Share these links to grow your business</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Affiliate Link</label>
                      <div className="flex gap-2">
                        <Input 
                          value={affiliateLink} 
                          readOnly 
                          className="bg-black/50 border-gray-700 text-white"
                        />
                        <Button 
                          onClick={() => copyToClipboard(affiliateLink, "Affiliate link")}
                          variant="outline"
                          className="border-[#c8ff00]/30 text-[#c8ff00]"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Your Subdomain</label>
                      <div className="flex gap-2">
                        <Input 
                          value={subdomain} 
                          readOnly 
                          className="bg-black/50 border-gray-700 text-white"
                        />
                        <Button 
                          onClick={() => copyToClipboard(`https://${subdomain}`, "Subdomain")}
                          variant="outline"
                          className="border-[#c8ff00]/30 text-[#c8ff00]"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            </>
          )}

          {/* Team Tab */}
          {activeTab === "team" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <MyTeam />
            </motion.div>
          )}

          {/* Sales Tab */}
          {activeTab === "sales" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                  <CardDescription>Track your personal and team sales</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-black/50 rounded-lg">
                      <div className="text-2xl font-bold text-[#c8ff00]">{stats.personalVolume}</div>
                      <div className="text-sm text-gray-500">Personal Volume</div>
                    </div>
                    <div className="text-center p-4 bg-black/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">{stats.groupVolume.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Group Volume</div>
                    </div>
                    <div className="text-center p-4 bg-black/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">{stats.leftLegVolume.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Left Leg</div>
                    </div>
                    <div className="text-center p-4 bg-black/50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400">{stats.rightLegVolume.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Right Leg</div>
                    </div>
                  </div>
                  {stats.groupVolume === 0 && (
                    <div className="mt-6 text-center py-8 bg-black/30 rounded-lg">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                      <p className="text-gray-400">No sales yet</p>
                      <p className="text-sm text-gray-500">Share your affiliate link to start earning!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Commissions Tab */}
          {activeTab === "commissions" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardHeader>
                  <CardTitle>Commission History</CardTitle>
                  <CardDescription>Your earnings from sales and team building</CardDescription>
                </CardHeader>
                <CardContent>
                  {commissionsLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c8ff00]" />
                    </div>
                  ) : commissionsList && commissionsList.length > 0 ? (
                    <div className="space-y-3">
                      {commissionsList.map((commission: any, index: number) => (
                        <div key={commission.id || index} className="flex items-center justify-between p-4 bg-black/50 rounded-lg">
                          <div>
                            <div className="font-medium text-white">{commission.description || commission.commissionType}</div>
                            <div className="text-sm text-gray-500">
                              {commission.createdAt ? new Date(commission.createdAt).toLocaleDateString() : 'Recently'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-[#c8ff00]">+${Number(commission.amount).toFixed(2)}</div>
                            <Badge variant="outline" className={
                              commission.status === 'paid' ? 'border-green-500 text-green-500' :
                              commission.status === 'pending' ? 'border-yellow-500 text-yellow-500' :
                              'border-gray-500 text-gray-500'
                            }>
                              {commission.status || 'pending'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                      <p className="text-gray-400">No commissions yet</p>
                      <p className="text-sm text-gray-500">Build your team and make sales to earn commissions!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Payouts Tab */}
          {activeTab === "payouts" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PayoutManager />
            </motion.div>
          )}

          {/* Rank History Tab */}
          {activeTab === "rank-history" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <RankHistory />
            </motion.div>
          )}

          {/* Marketing Tab */}
          {activeTab === "marketing" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-[#c8ff00]" />
                    Marketing Materials
                  </CardTitle>
                  <CardDescription>Resources to help you grow your business</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-black/50 rounded-lg text-center">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-[#c8ff00]" />
                      <h4 className="font-medium text-white">Product Brochures</h4>
                      <p className="text-sm text-gray-500 mb-3">Download PDF brochures</p>
                      <Button variant="outline" size="sm" className="border-[#c8ff00]/30 text-[#c8ff00]">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    <div className="p-4 bg-black/50 rounded-lg text-center">
                      <Video className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <h4 className="font-medium text-white">Video Library</h4>
                      <p className="text-sm text-gray-500 mb-3">Promotional videos</p>
                      <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-500">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                    <div className="p-4 bg-black/50 rounded-lg text-center">
                      <Globe className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <h4 className="font-medium text-white">Social Media Kit</h4>
                      <p className="text-sm text-gray-500 mb-3">Images & templates</p>
                      <Button variant="outline" size="sm" className="border-green-500/30 text-green-500">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Your Links */}
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardHeader>
                  <CardTitle>Your Sharing Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Main Affiliate Link</label>
                      <div className="flex gap-2">
                        <Input value={affiliateLink} readOnly className="bg-black/50 border-gray-700" />
                        <Button onClick={() => copyToClipboard(affiliateLink, "Link")} className="bg-[#c8ff00] text-black">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Training Tab */}
          {activeTab === "training" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#c8ff00]" />
                    Training Center
                  </CardTitle>
                  <CardDescription>Learn how to build your NEON business</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-black/50 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Getting Started Guide</h4>
                      <p className="text-sm text-gray-500 mb-3">Learn the basics of your NEON business</p>
                      <Button variant="outline" size="sm" className="border-[#c8ff00]/30 text-[#c8ff00]">
                        Start Learning
                      </Button>
                    </div>
                    <div className="p-4 bg-black/50 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Compensation Plan</h4>
                      <p className="text-sm text-gray-500 mb-3">Understand how you earn</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-[#c8ff00]/30 text-[#c8ff00]"
                        onClick={() => setLocation("/compensation")}
                      >
                        View Plan
                      </Button>
                    </div>
                    <div className="p-4 bg-black/50 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Product Knowledge</h4>
                      <p className="text-sm text-gray-500 mb-3">Learn about NEON products</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-[#c8ff00]/30 text-[#c8ff00]"
                        onClick={() => setLocation("/products")}
                      >
                        View Products
                      </Button>
                    </div>
                    <div className="p-4 bg-black/50 rounded-lg">
                      <h4 className="font-medium text-white mb-2">FAQ</h4>
                      <p className="text-sm text-gray-500 mb-3">Common questions answered</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-[#c8ff00]/30 text-[#c8ff00]"
                        onClick={() => setLocation("/faq")}
                      >
                        View FAQ
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Auto-Ship Tab */}
          {activeTab === "autoship" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AutoshipManager />
            </motion.div>
          )}

          {/* Rewards Tab */}
          {activeTab === "rewards" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {distributorProfile && (
                <DistributorRewards distributorId={distributorProfile.id} />
              )}
            </motion.div>
          )}

          {/* My Website Tab */}
          {activeTab === "my-website" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="bg-gradient-to-br from-[#c8ff00]/10 to-purple-500/10 border-[#c8ff00]/30">
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <Globe className="w-12 h-12 text-[#c8ff00] mx-auto mb-3" />
                    <h3 className="text-2xl font-bold text-white mb-2">Your Personal NEON Website</h3>
                    <p className="text-gray-400">
                      Customize your landing page to attract customers and build your team
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <ProfileEditor userType="distributor" />
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#c8ff00]" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-black/50 rounded-lg">
                      <h4 className="font-medium text-white mb-1">Profile Information</h4>
                      <p className="text-sm text-gray-500 mb-3">Update your personal details</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-[#c8ff00]/30 text-[#c8ff00]"
                        onClick={() => setLocation("/profile")}
                      >
                        Edit Profile
                      </Button>
                    </div>
                    <div className="p-4 bg-black/50 rounded-lg">
                      <h4 className="font-medium text-white mb-1">Payout Settings</h4>
                      <p className="text-sm text-gray-500 mb-3">Manage your payout preferences</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-[#c8ff00]/30 text-[#c8ff00]"
                        onClick={() => setActiveTab("payouts")}
                      >
                        Manage Payouts
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-[#c8ff00]/20 px-4 py-2 z-50">
        <div className="flex justify-around">
          {[
            { id: "dashboard", icon: BarChart3, label: "Home" },
            { id: "team", icon: Users, label: "Team" },
            { id: "commissions", icon: DollarSign, label: "Earnings" },
            { id: "marketing", icon: Share2, label: "Share" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg ${
                activeTab === item.id ? 'text-[#c8ff00]' : 'text-gray-500'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
