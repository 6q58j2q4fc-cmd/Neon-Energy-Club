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
  LogOut
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import GenealogyTree from "@/components/GenealogyTree";
import { AutoshipManager } from "@/components/AutoshipManager";
import { PayoutManager } from "@/components/PayoutManager";

export default function DistributorPortal() {
  const [, setLocation] = useLocation();
  const { user, loading, logout } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Use user data directly - distributor profile is linked to user account
  const distributorData = user ? { affiliateCode: user.id?.toString() || 'demo' } : null;

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

  // Mock data for demonstration (would come from API)
  const stats = {
    personalVolume: 350,
    groupVolume: 12500,
    leftLegVolume: 8500,
    rightLegVolume: 4000,
    teamSize: 47,
    personallyEnrolled: 8,
    rank: "Director",
    nextRank: "Executive",
    rankProgress: 65,
    weeklyEarnings: 2450,
    monthlyEarnings: 9800,
    totalEarnings: 45600,
    pendingCommissions: 1250
  };

  const recentActivity = [
    { type: "sale", description: "New customer order", amount: 72, date: "2 hours ago" },
    { type: "enrollment", description: "Sarah M. joined your team", amount: 499, date: "5 hours ago" },
    { type: "commission", description: "Binary bonus paid", amount: 850, date: "1 day ago" },
    { type: "sale", description: "Auto-ship renewal", amount: 36, date: "1 day ago" },
    { type: "enrollment", description: "Mike R. joined your team", amount: 199, date: "2 days ago" },
  ];

  const affiliateLink = distributorData?.affiliateCode 
    ? `https://neon.energy/ref/${distributorData.affiliateCode}`
    : `https://neon.energy/ref/${user?.id || 'demo'}`;

  const subdomain = distributorData?.affiliateCode 
    ? `${distributorData.affiliateCode}.neon.energy`
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
            { id: "team", icon: Users, label: "My Team" },
            { id: "sales", icon: ShoppingCart, label: "Sales" },
            { id: "commissions", icon: DollarSign, label: "Commissions" },
            { id: "payouts", icon: CreditCard, label: "Payouts" },
            { id: "marketing", icon: Share2, label: "Marketing" },
            { id: "training", icon: BookOpen, label: "Training" },
            { id: "autoship", icon: Repeat, label: "Auto-Ship" },
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
                {activeTab === "team" && "My Team"}
                {activeTab === "sales" && "Sales"}
                {activeTab === "commissions" && "Commissions"}
                {activeTab === "marketing" && "Marketing Tools"}
                {activeTab === "training" && "Training Center"}
                {activeTab === "autoship" && "Auto-Ship Management"}
                {activeTab === "settings" && "Settings"}
              </h2>
              <p className="text-gray-500 text-sm">Welcome back, {user?.name?.split(' ')[0] || 'Distributor'}!</p>
            </div>
            <div className="flex items-center gap-4">
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
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">{stats.rank}</span>
                      <span className="text-[#c8ff00]">{stats.nextRank}</span>
                    </div>
                    <Progress value={stats.rankProgress} className="h-3 mb-4" />
                    <p className="text-sm text-gray-500">
                      {100 - stats.rankProgress}% more to reach {stats.nextRank}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#c8ff00]" />
                      Binary Legs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">{stats.leftLegVolume.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Left Leg</div>
                      </div>
                      <div className="text-gray-600">VS</div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-500">{stats.rightLegVolume.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Right Leg</div>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <div className="text-sm text-gray-400">Weaker leg commission:</div>
                      <div className="text-xl font-bold text-[#c8ff00]">${(Math.min(stats.leftLegVolume, stats.rightLegVolume) * 0.1).toLocaleString()}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Links & Activity */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Quick Links */}
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardHeader>
                    <CardTitle>Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-black/50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Your Website</div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#c8ff00]" />
                        <span className="text-sm text-white truncate flex-1">{subdomain}</span>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`https://${subdomain}`, 'Website')}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-black/50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Affiliate Link</div>
                      <div className="flex items-center gap-2">
                        <Link className="w-4 h-4 text-[#c8ff00]" />
                        <span className="text-sm text-white truncate flex-1">{affiliateLink}</span>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(affiliateLink, 'Affiliate link')}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20 md:col-span-2">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-black/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              activity.type === 'sale' ? 'bg-green-500/20 text-green-500' :
                              activity.type === 'enrollment' ? 'bg-blue-500/20 text-blue-500' :
                              'bg-[#c8ff00]/20 text-[#c8ff00]'
                            }`}>
                              {activity.type === 'sale' && <ShoppingCart className="w-4 h-4" />}
                              {activity.type === 'enrollment' && <Users className="w-4 h-4" />}
                              {activity.type === 'commission' && <DollarSign className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="text-sm text-white">{activity.description}</div>
                              <div className="text-xs text-gray-500">{activity.date}</div>
                            </div>
                          </div>
                          <div className="text-[#c8ff00] font-bold">${activity.amount}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Team Tab */}
          {activeTab === "team" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-white">{stats.teamSize}</div>
                    <div className="text-gray-500">Total Team</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-[#c8ff00]">{stats.personallyEnrolled}</div>
                    <div className="text-gray-500">Personally Enrolled</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-green-500">12</div>
                    <div className="text-gray-500">Active This Month</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardHeader>
                  <CardTitle>Team Genealogy</CardTitle>
                  <CardDescription>Visual representation of your organization</CardDescription>
                </CardHeader>
                <CardContent>
                  <GenealogyTree 
                    rootDistributor={{ id: 1, distributorCode: 'NEON001', rank: 'Director', personalSales: 5000 }}
                    team={[
                      { id: 2, sponsorId: 1, distributorCode: 'NEON002', rank: 'Manager', personalSales: 2500 },
                      { id: 3, sponsorId: 1, distributorCode: 'NEON003', rank: 'Associate', personalSales: 1200 },
                      { id: 4, sponsorId: 2, distributorCode: 'NEON004', rank: 'Associate', personalSales: 800 },
                    ]}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Marketing Tab */}
          {activeTab === "marketing" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Affiliate Links */}
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardHeader>
                  <CardTitle>Your Marketing Links</CardTitle>
                  <CardDescription>Share these links to earn commissions on referrals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-black/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#c8ff00] font-medium">Personal Website</span>
                      <Button size="sm" onClick={() => window.open(`https://${subdomain}`, '_blank')}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 bg-black rounded-lg p-3">
                      <Globe className="w-5 h-5 text-gray-500" />
                      <code className="flex-1 text-sm text-white">{subdomain}</code>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`https://${subdomain}`, 'Website')}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-black/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#c8ff00] font-medium">Affiliate Link</span>
                      <Badge className="bg-green-500/20 text-green-500">Tracks all sales</Badge>
                    </div>
                    <div className="flex items-center gap-2 bg-black rounded-lg p-3">
                      <Link className="w-5 h-5 text-gray-500" />
                      <code className="flex-1 text-sm text-white">{affiliateLink}</code>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(affiliateLink, 'Affiliate link')}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-black/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#c8ff00] font-medium">Enrollment Link</span>
                      <Badge className="bg-blue-500/20 text-blue-500">For new distributors</Badge>
                    </div>
                    <div className="flex items-center gap-2 bg-black rounded-lg p-3">
                      <Users className="w-5 h-5 text-gray-500" />
                      <code className="flex-1 text-sm text-white">{affiliateLink}/join</code>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`${affiliateLink}/join`, 'Enrollment link')}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Marketing Materials */}
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardHeader>
                  <CardTitle>Marketing Materials</CardTitle>
                  <CardDescription>Download branded assets for your promotions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { name: "Social Media Kit", type: "ZIP", size: "15 MB", icon: Share2 },
                      { name: "Product Images", type: "ZIP", size: "8 MB", icon: Package },
                      { name: "Presentation Deck", type: "PDF", size: "5 MB", icon: FileText },
                      { name: "Video Ads", type: "ZIP", size: "120 MB", icon: Video },
                      { name: "Email Templates", type: "ZIP", size: "2 MB", icon: FileText },
                      { name: "Business Cards", type: "PDF", size: "1 MB", icon: CreditCard },
                    ].map((item, index) => (
                      <div key={index} className="p-4 bg-black/50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <item.icon className="w-8 h-8 text-[#c8ff00]" />
                          <div>
                            <div className="font-medium text-white">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.type} • {item.size}</div>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
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
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: "Getting Started", lessons: 5, duration: "45 min", progress: 100 },
                  { title: "Product Knowledge", lessons: 8, duration: "1.5 hrs", progress: 60 },
                  { title: "Sales Mastery", lessons: 12, duration: "2 hrs", progress: 30 },
                  { title: "Team Building", lessons: 10, duration: "1.5 hrs", progress: 0 },
                  { title: "Social Media Marketing", lessons: 6, duration: "1 hr", progress: 0 },
                  { title: "Leadership Development", lessons: 8, duration: "2 hrs", progress: 0 },
                ].map((course, index) => (
                  <Card key={index} className="bg-[#0a0a0a] border-[#c8ff00]/20">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-white text-lg">{course.title}</h3>
                          <p className="text-gray-500 text-sm">{course.lessons} lessons • {course.duration}</p>
                        </div>
                        {course.progress === 100 && (
                          <Badge className="bg-green-500/20 text-green-500">Completed</Badge>
                        )}
                      </div>
                      <Progress value={course.progress} className="h-2 mb-4" />
                      <Button 
                        className={course.progress === 100 ? 'bg-gray-700' : 'bg-[#c8ff00] text-black hover:bg-[#a8d600]'}
                        disabled={course.progress === 100}
                      >
                        {course.progress === 0 ? 'Start Course' : course.progress === 100 ? 'Completed' : 'Continue'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Commissions Tab */}
          {activeTab === "commissions" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-[#c8ff00]">${stats.pendingCommissions.toLocaleString()}</div>
                    <div className="text-gray-500">Pending</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-white">${stats.weeklyEarnings.toLocaleString()}</div>
                    <div className="text-gray-500">This Week</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-white">${stats.monthlyEarnings.toLocaleString()}</div>
                    <div className="text-gray-500">This Month</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-green-500">${stats.totalEarnings.toLocaleString()}</div>
                    <div className="text-gray-500">All Time</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardHeader>
                  <CardTitle>Commission History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { type: "Binary Bonus", amount: 850, date: "Jan 15, 2026", status: "Paid" },
                      { type: "Retail Profit", amount: 320, date: "Jan 14, 2026", status: "Paid" },
                      { type: "Fast Start Bonus", amount: 100, date: "Jan 13, 2026", status: "Paid" },
                      { type: "Team Commission", amount: 450, date: "Jan 12, 2026", status: "Paid" },
                      { type: "Binary Bonus", amount: 730, date: "Jan 8, 2026", status: "Paid" },
                    ].map((commission, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-black/50 rounded-lg">
                        <div>
                          <div className="font-medium text-white">{commission.type}</div>
                          <div className="text-sm text-gray-500">{commission.date}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#c8ff00]">${commission.amount}</div>
                          <Badge className="bg-green-500/20 text-green-500 text-xs">{commission.status}</Badge>
                        </div>
                      </div>
                    ))}
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
              className="space-y-6"
            >
              <AutoshipManager />
            </motion.div>
          )}

          {/* Payouts Tab */}
          {activeTab === "payouts" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <PayoutManager />
            </motion.div>
          )}

          {/* Sales Tab */}
          {activeTab === "sales" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-white">{stats.personalVolume}</div>
                    <div className="text-gray-500">Personal Volume</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-[#c8ff00]">23</div>
                    <div className="text-gray-500">Orders This Month</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-green-500">8</div>
                    <div className="text-gray-500">Retail Customers</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { customer: "John D.", product: "24-Pack", amount: 72, date: "2 hours ago" },
                      { customer: "Sarah M.", product: "Pro Pack", amount: 499, date: "5 hours ago" },
                      { customer: "Mike R.", product: "12-Pack", amount: 42, date: "1 day ago" },
                      { customer: "Lisa K.", product: "Auto-Ship", amount: 36, date: "1 day ago" },
                    ].map((order, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-black/50 rounded-lg">
                        <div>
                          <div className="font-medium text-white">{order.customer}</div>
                          <div className="text-sm text-gray-500">{order.product} • {order.date}</div>
                        </div>
                        <div className="font-bold text-[#c8ff00]">${order.amount}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
                  <CardTitle>Profile Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Full Name</label>
                      <Input defaultValue={user?.name || ''} className="bg-black border-gray-700" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Email</label>
                      <Input defaultValue={user?.email || ''} className="bg-black border-gray-700" disabled />
                    </div>
                  </div>
                  <Button className="bg-[#c8ff00] text-black hover:bg-[#a8d600]">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">Set up your payment method to receive commissions</p>
                  <Button variant="outline" className="border-[#c8ff00] text-[#c8ff00]">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Add Payment Method
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
