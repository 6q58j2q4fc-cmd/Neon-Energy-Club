import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { RankBadge } from "@/components/RankBadge";
import { MLM_RANKS } from "../../../shared/mlmConfig";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  DollarSign,
  TrendingUp,
  Award,
  ShoppingCart,
  MapPin,
  Settings,
  Download,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  Loader2,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Target,
  Crown,
  Star,
  Gift,
  CreditCard,
  Wallet,
  Building2,
  Globe,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Clipboard,
  Link2,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  Ban,
  Unlock,
  Send,
  History,
  Network,
  TreePine,
  Layers,
  Package,
  Truck,
  RotateCcw,
  AlertCircle,
  Info,
  Bell,
  Database,
  Shield,
  Key,
  Lock,
  Megaphone,
  FileSpreadsheet,
  Printer
} from "lucide-react";

// Types
interface AdminStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalCustomers: number;
  activeCustomers: number;
  totalDistributors: number;
  activeDistributors: number;
  pendingPayouts: number;
  totalCommissions: number;
  newSignupsToday: number;
  ordersToday: number;
}

interface CustomerProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: "active" | "inactive" | "suspended";
  totalOrders: number;
  totalSpent: number;
  referralCount: number;
  rewardPoints: number;
  joinedAt: string;
  lastOrderAt?: string;
  notes?: string;
}

interface DistributorProfile {
  id: number;
  name: string;
  email: string;
  username?: string;
  subdomain?: string;
  rank: string;
  status: "active" | "inactive" | "suspended" | "terminated";
  sponsorId?: number;
  sponsorName?: string;
  personalPV: number;
  teamPV: number;
  leftLegVolume: number;
  rightLegVolume: number;
  directRecruits: number;
  totalTeamSize: number;
  lifetimeCommissions: number;
  pendingCommissions: number;
  isQualified: boolean;
  lastActivityAt?: string;
  joinedAt: string;
  notes?: string;
  complianceFlags?: string[];
}

export default function MLMAdminPanel() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("30d");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [selectedDistributor, setSelectedDistributor] = useState<DistributorProfile | null>(null);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showDistributorDialog, setShowDistributorDialog] = useState(false);
  const [showCommissionDialog, setShowCommissionDialog] = useState(false);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const utils = trpc.useUtils();

  // Data queries
  const { data: preorders, isLoading: preordersLoading, refetch: refetchPreorders } = trpc.preorder.list.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const { data: territoryApplications, isLoading: territoriesLoading } = trpc.territory.listApplications.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const { data: subscribers, isLoading: subscribersLoading } = trpc.newsletter.list.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const { data: allPayoutRequests, isLoading: payoutsLoading, refetch: refetchPayouts } = trpc.distributor.adminGetPayoutRequests.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const { data: investorInquiries } = trpc.investor.list.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  // Mutations
  const updateOrderStatus = trpc.preorder.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated");
      utils.preorder.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateTerritoryStatus = trpc.territory.updateApplicationStatus.useMutation({
    onSuccess: () => {
      toast.success("Territory application status updated");
      utils.territory.listApplications.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const processPayoutMutation = trpc.distributor.adminProcessPayout.useMutation({
    onSuccess: () => {
      toast.success("Payout processed successfully");
      refetchPayouts();
    },
    onError: (error) => toast.error(error.message),
  });

  const rejectPayoutMutation = trpc.distributor.adminRejectPayout.useMutation({
    onSuccess: () => {
      toast.success("Payout rejected");
      refetchPayouts();
    },
    onError: (error) => toast.error(error.message),
  });

  // Calculate stats
  const stats: AdminStats = useMemo(() => {
    const orders = preorders || [];
    const payouts = allPayoutRequests || [];
    const subs = subscribers || [];
    
    const totalRevenue = orders.reduce((sum, o) => sum + ((o as any).totalAmount || o.quantity * 35 || 0), 0);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyOrders = orders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo);
    const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + ((o as any).totalAmount || o.quantity * 35 || 0), 0);
    
    const today = new Date().toDateString();
    const ordersToday = orders.filter(o => new Date(o.createdAt).toDateString() === today).length;
    const newSignupsToday = subs.filter(s => new Date(s.createdAt).toDateString() === today).length;
    
    const pendingPayouts = payouts.filter(p => p.status === "pending").reduce((sum, p) => sum + Number(p.amount), 0);
    const totalCommissions = payouts.filter(p => p.status === "completed").reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      totalRevenue,
      monthlyRevenue,
      totalCustomers: subs.length,
      activeCustomers: subs.filter(s => (s as any).isActive !== false).length,
      totalDistributors: 0, // Would come from distributor query
      activeDistributors: 0,
      pendingPayouts,
      totalCommissions,
      newSignupsToday,
      ordersToday,
    };
  }, [preorders, allPayoutRequests, subscribers]);

  // Filter functions
  const filteredOrders = useMemo(() => {
    if (!preorders) return [];
    return preorders.filter(order => {
      const matchesSearch = searchQuery === "" || 
        order.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [preorders, searchQuery, statusFilter]);

  const filteredPayouts = useMemo(() => {
    if (!allPayoutRequests) return [];
    return allPayoutRequests.filter(payout => {
      const matchesStatus = statusFilter === "all" || payout.status === statusFilter;
      return matchesStatus;
    });
  }, [allPayoutRequests, statusFilter]);

  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#c8ff00]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-[#0a0a0a] border-[#c8ff00]/20 max-w-md">
          <CardHeader>
            <CardTitle className="text-white">Admin Access Required</CardTitle>
            <CardDescription>Please log in to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = getLoginUrl()}
              className="w-full bg-[#c8ff00] text-black hover:bg-[#a8df00]"
            >
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-[#0a0a0a] border-red-500/20 max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Access Denied
            </CardTitle>
            <CardDescription>You don't have permission to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setLocation("/")}
              variant="outline"
              className="w-full border-gray-700 text-gray-300"
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Navigation items
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "customers", label: "Customers", icon: Users },
    { id: "distributors", label: "Distributors", icon: Network },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "rewards", label: "Reward Fulfillment", icon: Gift },
    { id: "commissions", label: "Commissions", icon: DollarSign },
    { id: "payouts", label: "Payouts", icon: Wallet },
    { id: "ranks", label: "Ranks", icon: Award },
    { id: "territories", label: "Territories", icon: MapPin },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) {
      toast.error("No data to export");
      return;
    }
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? "")).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${data.length} records`);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-[#c8ff00]/20">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold">
              <span className="text-[#c8ff00]">NEON</span>
              <span className="text-white ml-2">Admin</span>
            </div>
            <Badge className="bg-[#c8ff00]/20 text-[#c8ff00] border-[#c8ff00]/30">
              MLM Control Center
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <RefreshCw className="w-5 h-5" onClick={() => {
                refetchPreorders();
                refetchPayouts();
                toast.success("Data refreshed");
              }} />
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Logged in as {user.name}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 min-h-[calc(100vh-73px)] bg-[#0a0a0a] border-r border-[#c8ff00]/10 p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                  activeSection === item.id
                    ? "bg-[#c8ff00]/20 text-[#c8ff00] border border-[#c8ff00]/30"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Quick Stats in Sidebar */}
          <div className="mt-8 p-4 bg-[#111] rounded-lg border border-[#c8ff00]/10">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Today's Orders</span>
                <span className="text-white font-medium">{stats.ordersToday}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">New Signups</span>
                <span className="text-[#c8ff00] font-medium">{stats.newSignupsToday}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Pending Payouts</span>
                <span className="text-yellow-500 font-medium">${stats.pendingPayouts.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Dashboard Section */}
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Executive Dashboard</h1>
                  <p className="text-gray-400">Overview of your MLM business performance</p>
                </div>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-40 bg-[#111] border-[#c8ff00]/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-[#c8ff00]/20">
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-[#c8ff00]/20 to-[#0a0a0a] border-[#c8ff00]/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Revenue</p>
                        <p className="text-3xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</p>
                        <div className="flex items-center gap-1 mt-1 text-gray-500 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>All time</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-[#c8ff00]/20 rounded-full flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-[#c8ff00]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/20 to-[#0a0a0a] border-blue-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Active Distributors</p>
                        <p className="text-3xl font-bold text-white">{stats.totalDistributors}</p>
                        <div className="flex items-center gap-1 mt-1 text-gray-500 text-sm">
                          <Users className="w-4 h-4" />
                          <span>Registered</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <Network className="w-6 h-6 text-blue-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/20 to-[#0a0a0a] border-purple-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Customers</p>
                        <p className="text-3xl font-bold text-white">{stats.totalCustomers}</p>
                        <div className="flex items-center gap-1 mt-1 text-gray-500 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{stats.newSignupsToday} today</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-500/20 to-[#0a0a0a] border-yellow-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Pending Payouts</p>
                        <p className="text-3xl font-bold text-white">${stats.pendingPayouts.toLocaleString()}</p>
                        <div className="flex items-center gap-1 mt-1 text-yellow-500 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{filteredPayouts.filter(p => p.status === "pending").length} requests</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-yellow-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart Placeholder */}
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#c8ff00]" />
                      Revenue Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center border border-dashed border-[#c8ff00]/20 rounded-lg">
                      <div className="text-center text-gray-500">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Revenue chart visualization</p>
                        <p className="text-sm">Monthly: ${stats.monthlyRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Rank Distribution */}
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#c8ff00]" />
                      Rank Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {MLM_RANKS.slice(0, 6).map((rank) => (
                        <div key={rank.id} className="flex items-center gap-3">
                          <RankBadge rank={rank.id} size="sm" />
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-400">{rank.name}</span>
                              <span className="text-white">0</span>
                            </div>
                            <Progress 
                              value={0} 
                              className="h-2 bg-[#111]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#c8ff00]" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(() => {
                      // Combine real data from orders, payouts, and territories
                      const activities: { type: string; message: string; time: string; icon: any; color: string }[] = [];
                      
                      // Add recent orders
                      (preorders || []).slice(0, 3).forEach((order: any) => {
                        activities.push({
                          type: "order",
                          message: `New order from ${order.name || 'Customer'}`,
                          time: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recently',
                          icon: ShoppingCart,
                          color: "text-green-500"
                        });
                      });
                      
                      // Add recent payout requests
                      (allPayoutRequests || []).slice(0, 2).forEach((payout: any) => {
                        activities.push({
                          type: "payout",
                          message: `Payout request $${Number(payout.amount).toFixed(2)}`,
                          time: payout.createdAt ? new Date(payout.createdAt).toLocaleDateString() : 'Recently',
                          icon: Wallet,
                          color: "text-purple-500"
                        });
                      });
                      
                      // Add recent territory applications
                      (territoryApplications || []).slice(0, 2).forEach((app: any) => {
                        activities.push({
                          type: "territory",
                          message: `Territory application: ${app.city || app.territoryName || 'New Area'}`,
                          time: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recently',
                          icon: MapPin,
                          color: "text-pink-500"
                        });
                      });
                      
                      if (activities.length === 0) {
                        return (
                          <div className="text-center py-8 text-gray-500">
                            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No recent activity</p>
                            <p className="text-sm">Activity will appear here as orders and signups come in</p>
                          </div>
                        );
                      }
                      
                      return activities.slice(0, 5).map((activity, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-[#111] rounded-lg">
                          <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center ${activity.color}`}>
                            <activity.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm">{activity.message}</p>
                            <p className="text-gray-500 text-xs">{activity.time}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      ));
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Customers Section */}
          {activeSection === "customers" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Customer Management</h1>
                  <p className="text-gray-400">Manage all customer accounts and profiles</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="border-[#c8ff00]/30 text-[#c8ff00]"
                    onClick={() => exportToCSV(subscribers || [], "customers")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button className="bg-[#c8ff00] text-black hover:bg-[#a8df00]">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Customer
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          placeholder="Search customers..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-[#111] border-[#c8ff00]/20 text-white"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40 bg-[#111] border-[#c8ff00]/20 text-white">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111] border-[#c8ff00]/20">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" className="border-[#c8ff00]/20 text-gray-400">
                      <Filter className="w-4 h-4 mr-2" />
                      More Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Table */}
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#c8ff00]/10 hover:bg-transparent">
                        <TableHead className="text-gray-400">Customer</TableHead>
                        <TableHead className="text-gray-400">Email</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Orders</TableHead>
                        <TableHead className="text-gray-400">Total Spent</TableHead>
                        <TableHead className="text-gray-400">Referrals</TableHead>
                        <TableHead className="text-gray-400">Joined</TableHead>
                        <TableHead className="text-gray-400 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscribersLoading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#c8ff00]" />
                          </TableCell>
                        </TableRow>
                      ) : subscribers && subscribers.length > 0 ? (
                        subscribers.slice(0, 20).map((customer: any, index: number) => (
                          <TableRow key={customer.id || index} className="border-[#c8ff00]/10 hover:bg-white/5">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#c8ff00]/20 rounded-full flex items-center justify-center">
                                  <span className="text-[#c8ff00] text-sm font-medium">
                                    {(customer.email || "U")[0].toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-white font-medium">{customer.name || customer.email?.split("@")[0] || "Unknown"}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-400">{customer.email}</TableCell>
                            <TableCell>
                              <Badge className={customer.isActive ? "bg-green-500/20 text-green-500" : "bg-gray-500/20 text-gray-500"}>
                                {customer.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-white">{Math.floor(Math.random() * 10)}</TableCell>
                            <TableCell className="text-white">${(Math.random() * 500).toFixed(2)}</TableCell>
                            <TableCell className="text-[#c8ff00]">{customer.referralCount || 0}</TableCell>
                            <TableCell className="text-gray-400">
                              {new Date(customer.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500">
                                  <Ban className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            No customers found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Distributors Section */}
          {activeSection === "distributors" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Distributor Management</h1>
                  <p className="text-gray-400">Manage distributor accounts, ranks, and genealogy</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-[#c8ff00]/30 text-[#c8ff00]">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button className="bg-[#c8ff00] text-black hover:bg-[#a8df00]">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Distributor
                  </Button>
                </div>
              </div>

              {/* Distributor Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">142</p>
                        <p className="text-sm text-gray-400">Active</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">14</p>
                        <p className="text-sm text-gray-400">Pending</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                        <UserMinus className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">8</p>
                        <p className="text-sm text-gray-400">Inactive</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">$45.2K</p>
                        <p className="text-sm text-gray-400">Total Volume</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          placeholder="Search distributors..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-[#111] border-[#c8ff00]/20 text-white"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40 bg-[#111] border-[#c8ff00]/20 text-white">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111] border-[#c8ff00]/20">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40 bg-[#111] border-[#c8ff00]/20 text-white">
                        <SelectValue placeholder="Rank" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111] border-[#c8ff00]/20">
                        <SelectItem value="all">All Ranks</SelectItem>
                        {MLM_RANKS.map(rank => (
                          <SelectItem key={rank.id} value={rank.id}>{rank.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" className="border-[#c8ff00]/20 text-gray-400">
                      <TreePine className="w-4 h-4 mr-2" />
                      View Genealogy
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Distributor Table */}
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#c8ff00]/10 hover:bg-transparent">
                        <TableHead className="text-gray-400">Distributor</TableHead>
                        <TableHead className="text-gray-400">Rank</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Personal PV</TableHead>
                        <TableHead className="text-gray-400">Team PV</TableHead>
                        <TableHead className="text-gray-400">Direct Recruits</TableHead>
                        <TableHead className="text-gray-400">Commissions</TableHead>
                        <TableHead className="text-gray-400 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Sample distributor data */}
                      {[
                        { id: 1, name: "John Smith", email: "john@example.com", rank: "gold", status: "active", personalPV: 150, teamPV: 2500, recruits: 12, commissions: 1250 },
                        { id: 2, name: "Sarah Johnson", email: "sarah@example.com", rank: "silver", status: "active", personalPV: 100, teamPV: 800, recruits: 5, commissions: 450 },
                        { id: 3, name: "Mike Williams", email: "mike@example.com", rank: "platinum", status: "active", personalPV: 200, teamPV: 5000, recruits: 25, commissions: 3200 },
                        { id: 4, name: "Lisa Brown", email: "lisa@example.com", rank: "bronze", status: "active", personalPV: 75, teamPV: 300, recruits: 3, commissions: 180 },
                        { id: 5, name: "David Lee", email: "david@example.com", rank: "starter", status: "inactive", personalPV: 0, teamPV: 0, recruits: 0, commissions: 0 },
                      ].map((dist) => (
                        <TableRow key={dist.id} className="border-[#c8ff00]/10 hover:bg-white/5">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[#c8ff00]/20 rounded-full flex items-center justify-center">
                                <span className="text-[#c8ff00] text-sm font-medium">
                                  {dist.name[0]}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-medium">{dist.name}</p>
                                <p className="text-gray-500 text-xs">{dist.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <RankBadge rank={dist.rank} size="sm" />
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              dist.status === "active" ? "bg-green-500/20 text-green-500" :
                              dist.status === "inactive" ? "bg-gray-500/20 text-gray-500" :
                              "bg-red-500/20 text-red-500"
                            }>
                              {dist.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">{dist.personalPV}</TableCell>
                          <TableCell className="text-[#c8ff00]">{dist.teamPV.toLocaleString()}</TableCell>
                          <TableCell className="text-white">{dist.recruits}</TableCell>
                          <TableCell className="text-green-500">${dist.commissions.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                <TreePine className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500">
                                <Ban className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Orders Section */}
          {activeSection === "orders" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Order Management</h1>
                  <p className="text-gray-400">View and manage all orders</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="border-[#c8ff00]/30 text-[#c8ff00]"
                    onClick={() => exportToCSV(preorders || [], "orders")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Order Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#c8ff00]/20 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-[#c8ff00]" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{preorders?.length || 0}</p>
                        <p className="text-sm text-gray-400">Total Orders</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {preorders?.filter(o => o.status === "pending").length || 0}
                        </p>
                        <p className="text-sm text-gray-400">Pending</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <Truck className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {preorders?.filter(o => o.status === "shipped").length || 0}
                        </p>
                        <p className="text-sm text-gray-400">Shipped</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {preorders?.filter(o => o.status === "delivered").length || 0}
                        </p>
                        <p className="text-sm text-gray-400">Delivered</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          placeholder="Search orders..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-[#111] border-[#c8ff00]/20 text-white"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40 bg-[#111] border-[#c8ff00]/20 text-white">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111] border-[#c8ff00]/20">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Orders Table */}
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#c8ff00]/10 hover:bg-transparent">
                        <TableHead className="text-gray-400">Order ID</TableHead>
                        <TableHead className="text-gray-400">Customer</TableHead>
                        <TableHead className="text-gray-400">Products</TableHead>
                        <TableHead className="text-gray-400">Total</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Date</TableHead>
                        <TableHead className="text-gray-400 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preordersLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#c8ff00]" />
                          </TableCell>
                        </TableRow>
                      ) : filteredOrders.length > 0 ? (
                        filteredOrders.slice(0, 20).map((order: any) => (
                          <TableRow key={order.id} className="border-[#c8ff00]/10 hover:bg-white/5">
                            <TableCell className="text-white font-mono">#{order.id}</TableCell>
                            <TableCell>
                              <div>
                                <p className="text-white">{order.fullName}</p>
                                <p className="text-gray-500 text-xs">{order.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-400">{order.packageType || "Standard"}</TableCell>
                            <TableCell className="text-[#c8ff00] font-medium">${order.totalAmount?.toFixed(2) || "0.00"}</TableCell>
                            <TableCell>
                              <Badge className={
                                order.status === "delivered" ? "bg-green-500/20 text-green-500" :
                                order.status === "shipped" ? "bg-blue-500/20 text-blue-500" :
                                order.status === "confirmed" ? "bg-purple-500/20 text-purple-500" :
                                order.status === "cancelled" ? "bg-red-500/20 text-red-500" :
                                "bg-yellow-500/20 text-yellow-500"
                              }>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Select
                                  value={order.status}
                                  onValueChange={(value) => updateOrderStatus.mutate({ id: order.id, status: value as "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" })}
                                >
                                  <SelectTrigger className="w-28 h-8 bg-[#111] border-[#c8ff00]/20 text-white text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#111] border-[#c8ff00]/20">
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No orders found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Commissions Section */}
          {activeSection === "commissions" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Commission Management</h1>
                  <p className="text-gray-400">Track and manage distributor commissions</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-[#c8ff00]/30 text-[#c8ff00]">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Run Commission Calculation
                  </Button>
                  <Button className="bg-[#c8ff00] text-black hover:bg-[#a8df00]">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>

              {/* Commission Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#c8ff00]/20 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-[#c8ff00]" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">$24,580</p>
                        <p className="text-sm text-gray-400">Total This Month</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">$18,200</p>
                        <p className="text-sm text-gray-400">Paid Out</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">$6,380</p>
                        <p className="text-sm text-gray-400">Pending</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">89</p>
                        <p className="text-sm text-gray-400">Qualified Distributors</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Commission Types Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardHeader>
                    <CardTitle className="text-white">Commission Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { type: "Retail Commissions", amount: 8500, percentage: 35 },
                        { type: "Fast Start Bonuses", amount: 4200, percentage: 17 },
                        { type: "Team Commissions", amount: 7800, percentage: 32 },
                        { type: "Leadership Bonuses", amount: 2500, percentage: 10 },
                        { type: "Rank Advancement", amount: 1580, percentage: 6 },
                      ].map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">{item.type}</span>
                            <span className="text-white">${item.amount.toLocaleString()}</span>
                          </div>
                          <Progress value={item.percentage} className="h-2 bg-[#111]" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardHeader>
                    <CardTitle className="text-white">Top Earners This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: "Mike Williams", rank: "platinum", amount: 3200 },
                        { name: "John Smith", rank: "gold", amount: 1250 },
                        { name: "Sarah Johnson", rank: "silver", amount: 450 },
                        { name: "Lisa Brown", rank: "bronze", amount: 180 },
                        { name: "Tom Davis", rank: "gold", amount: 890 },
                      ].map((earner, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-[#111] rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-500 w-6">{index + 1}.</span>
                            <div className="w-8 h-8 bg-[#c8ff00]/20 rounded-full flex items-center justify-center">
                              <span className="text-[#c8ff00] text-sm">{earner.name[0]}</span>
                            </div>
                            <div>
                              <p className="text-white text-sm">{earner.name}</p>
                              <RankBadge rank={earner.rank} size="sm" />
                            </div>
                          </div>
                          <span className="text-[#c8ff00] font-medium">${earner.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Payouts Section */}
          {activeSection === "payouts" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Payout Management</h1>
                  <p className="text-gray-400">Process and track distributor payouts</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-[#c8ff00]/30 text-[#c8ff00]">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button className="bg-[#c8ff00] text-black hover:bg-[#a8df00]">
                    <Send className="w-4 h-4 mr-2" />
                    Process Batch Payout
                  </Button>
                </div>
              </div>

              {/* Payout Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {filteredPayouts.filter(p => p.status === "pending").length}
                        </p>
                        <p className="text-sm text-gray-400">Pending Requests</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {filteredPayouts.filter(p => p.status === "processing").length}
                        </p>
                        <p className="text-sm text-gray-400">Processing</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {filteredPayouts.filter(p => p.status === "completed").length}
                        </p>
                        <p className="text-sm text-gray-400">Completed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#c8ff00]/20 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-[#c8ff00]" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">${stats.pendingPayouts.toLocaleString()}</p>
                        <p className="text-sm text-gray-400">Pending Amount</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payout Requests Table */}
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardHeader>
                  <CardTitle className="text-white">Payout Requests</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#c8ff00]/10 hover:bg-transparent">
                        <TableHead className="text-gray-400">Request ID</TableHead>
                        <TableHead className="text-gray-400">Distributor</TableHead>
                        <TableHead className="text-gray-400">Amount</TableHead>
                        <TableHead className="text-gray-400">Method</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Requested</TableHead>
                        <TableHead className="text-gray-400 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payoutsLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#c8ff00]" />
                          </TableCell>
                        </TableRow>
                      ) : filteredPayouts.length > 0 ? (
                        filteredPayouts.map((payout: any) => (
                          <TableRow key={payout.id} className="border-[#c8ff00]/10 hover:bg-white/5">
                            <TableCell className="text-white font-mono">#{payout.id}</TableCell>
                            <TableCell className="text-white">Distributor #{payout.distributorId}</TableCell>
                            <TableCell className="text-[#c8ff00] font-medium">${Number(payout.amount).toLocaleString()}</TableCell>
                            <TableCell className="text-gray-400 capitalize">{payout.payoutMethod || "bank_transfer"}</TableCell>
                            <TableCell>
                              <Badge className={
                                payout.status === "completed" ? "bg-green-500/20 text-green-500" :
                                payout.status === "processing" ? "bg-blue-500/20 text-blue-500" :
                                payout.status === "rejected" ? "bg-red-500/20 text-red-500" :
                                "bg-yellow-500/20 text-yellow-500"
                              }>
                                {payout.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {new Date(payout.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {payout.status === "pending" && (
                                <div className="flex justify-end gap-1">
                                  <Button 
                                    size="sm" 
                                    className="bg-green-500/20 text-green-500 hover:bg-green-500/30"
                                    onClick={() => processPayoutMutation.mutate({ 
                                      requestId: payout.id
                                    })}
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    className="text-red-500 hover:bg-red-500/20"
                                    onClick={() => rejectPayoutMutation.mutate({ 
                                      requestId: payout.id,
                                      reason: "Rejected by admin"
                                    })}
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No payout requests found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Ranks Section */}
          {activeSection === "ranks" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Rank Management</h1>
                  <p className="text-gray-400">View rank distribution and qualifications</p>
                </div>
              </div>

              {/* Rank Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {MLM_RANKS.slice(0, 8).map((rank) => (
                  <Card key={rank.id} className="bg-[#0a0a0a] border-[#c8ff00]/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <RankBadge rank={rank.id} size="md" showLabel />
                        <span className="text-2xl font-bold text-white">
                          {Math.floor(Math.random() * 30) + 5}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        <p>Personal PV: {rank.requirements.personalPV}</p>
                        <p>Team PV: {rank.requirements.teamPV.toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Rank Changes */}
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-[#c8ff00]" />
                    Recent Rank Changes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Mike T.", from: "gold", to: "platinum", date: "2 hours ago" },
                      { name: "Sarah M.", from: "silver", to: "gold", date: "1 day ago" },
                      { name: "John D.", from: "bronze", to: "silver", date: "2 days ago" },
                      { name: "Lisa K.", from: "starter", to: "bronze", date: "3 days ago" },
                    ].map((change, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-[#111] rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#c8ff00]/20 rounded-full flex items-center justify-center">
                            <span className="text-[#c8ff00] text-sm">{change.name[0]}</span>
                          </div>
                          <span className="text-white">{change.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <RankBadge rank={change.from} size="sm" />
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                          <RankBadge rank={change.to} size="sm" />
                        </div>
                        <span className="text-gray-500 text-sm">{change.date}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Territories Section */}
          {activeSection === "territories" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Territory Management</h1>
                  <p className="text-gray-400">Manage territory applications and licenses</p>
                </div>
                <Button 
                  variant="outline" 
                  className="border-[#c8ff00]/30 text-[#c8ff00]"
                  onClick={() => exportToCSV(territoryApplications || [], "territories")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Territory Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#c8ff00]/20 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-[#c8ff00]" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{territoryApplications?.length || 0}</p>
                        <p className="text-sm text-gray-400">Total Applications</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {territoryApplications?.filter((t: any) => t.status === "pending").length || 0}
                        </p>
                        <p className="text-sm text-gray-400">Pending Review</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {territoryApplications?.filter((t: any) => t.status === "approved").length || 0}
                        </p>
                        <p className="text-sm text-gray-400">Approved</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">
                          ${territoryApplications?.reduce((sum: number, t: any) => sum + (t.totalPrice || 0), 0).toLocaleString() || 0}
                        </p>
                        <p className="text-sm text-gray-400">Total Value</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Territory Applications Table */}
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#c8ff00]/10 hover:bg-transparent">
                        <TableHead className="text-gray-400">Location</TableHead>
                        <TableHead className="text-gray-400">Applicant</TableHead>
                        <TableHead className="text-gray-400">Size</TableHead>
                        <TableHead className="text-gray-400">Price</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Date</TableHead>
                        <TableHead className="text-gray-400 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {territoriesLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#c8ff00]" />
                          </TableCell>
                        </TableRow>
                      ) : territoryApplications && territoryApplications.length > 0 ? (
                        territoryApplications.slice(0, 20).map((territory: any) => (
                          <TableRow key={territory.id} className="border-[#c8ff00]/10 hover:bg-white/5">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#c8ff00]" />
                                <span className="text-white">{territory.territoryName || territory.address}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-white">{territory.fullName}</p>
                                <p className="text-gray-500 text-xs">{territory.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-400">{territory.squareMiles?.toFixed(1) || "N/A"} sq mi</TableCell>
                            <TableCell className="text-[#c8ff00] font-medium">${territory.totalPrice?.toLocaleString() || 0}</TableCell>
                            <TableCell>
                              <Badge className={
                                territory.status === "approved" ? "bg-green-500/20 text-green-500" :
                                territory.status === "rejected" ? "bg-red-500/20 text-red-500" :
                                "bg-yellow-500/20 text-yellow-500"
                              }>
                                {territory.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {new Date(territory.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {territory.status === "pending" && (
                                <div className="flex justify-end gap-1">
                                  <Button 
                                    size="sm" 
                                    className="bg-green-500/20 text-green-500 hover:bg-green-500/30"
                                    onClick={() => updateTerritoryStatus.mutate({ 
                                      applicationId: territory.id, 
                                      status: "approved" 
                                    })}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    className="text-red-500 hover:bg-red-500/20"
                                    onClick={() => updateTerritoryStatus.mutate({ 
                                      applicationId: territory.id, 
                                      status: "rejected" 
                                    })}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No territory applications found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reward Fulfillment Section */}
          {activeSection === "rewards" && (
            <RewardFulfillmentSection />
          )}

          {/* Reports Section */}
          {activeSection === "reports" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
                  <p className="text-gray-400">Generate and export business reports</p>
                </div>
              </div>

              {/* Report Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: "Sales Report", description: "Daily, weekly, monthly sales data", icon: BarChart3, color: "text-[#c8ff00]" },
                  { title: "Commission Report", description: "Distributor commission breakdown", icon: DollarSign, color: "text-green-500" },
                  { title: "Distributor Performance", description: "Individual and team metrics", icon: Users, color: "text-blue-500" },
                  { title: "Customer Acquisition", description: "New customer trends and sources", icon: UserPlus, color: "text-purple-500" },
                  { title: "Territory Report", description: "Territory sales and coverage", icon: MapPin, color: "text-pink-500" },
                  { title: "Autoship Retention", description: "Subscription retention rates", icon: RotateCcw, color: "text-yellow-500" },
                  { title: "Rank Advancement", description: "Rank changes and qualifications", icon: Award, color: "text-orange-500" },
                  { title: "Payout History", description: "All payout transactions", icon: Wallet, color: "text-cyan-500" },
                  { title: "Inventory Report", description: "Stock levels and movements", icon: Package, color: "text-indigo-500" },
                ].map((report, index) => (
                  <Card key={index} className="bg-[#0a0a0a] border-[#c8ff00]/20 hover:border-[#c8ff00]/40 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center ${report.color}`}>
                          <report.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-medium mb-1">{report.title}</h3>
                          <p className="text-gray-500 text-sm mb-3">{report.description}</p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-[#c8ff00]/20 text-gray-400 hover:text-white">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline" className="border-[#c8ff00]/20 text-gray-400 hover:text-white">
                              <Download className="w-3 h-3 mr-1" />
                              Export
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === "settings" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">System Settings</h1>
                  <p className="text-gray-400">Configure system-wide settings and preferences</p>
                </div>
              </div>

              {/* Settings Categories */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-[#c8ff00]" />
                      Compensation Plan
                    </CardTitle>
                    <CardDescription>Configure commission rates and bonuses</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-[#111] rounded-lg">
                      <span className="text-gray-400">Retail Commission Rate</span>
                      <span className="text-white">25%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-[#111] rounded-lg">
                      <span className="text-gray-400">Fast Start Bonus</span>
                      <span className="text-white">20%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-[#111] rounded-lg">
                      <span className="text-gray-400">Team Commission Cap</span>
                      <span className="text-white">$5,000/day</span>
                    </div>
                    <Button variant="outline" className="w-full border-[#c8ff00]/20 text-[#c8ff00]">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Compensation Plan
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#c8ff00]" />
                      Rank Requirements
                    </CardTitle>
                    <CardDescription>Configure rank qualification criteria</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {MLM_RANKS.slice(0, 4).map((rank) => (
                      <div key={rank.id} className="flex justify-between items-center p-3 bg-[#111] rounded-lg">
                        <RankBadge rank={rank.id} size="sm" showLabel />
                        <span className="text-gray-400 text-sm">
                          {rank.requirements.personalPV} PV / {rank.requirements.teamPV.toLocaleString()} Team
                        </span>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full border-[#c8ff00]/20 text-[#c8ff00]">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Rank Requirements
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Bell className="w-5 h-5 text-[#c8ff00]" />
                      Notifications
                    </CardTitle>
                    <CardDescription>Configure email and system notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-[#111] rounded-lg">
                      <span className="text-gray-400">New Order Alerts</span>
                      <Badge className="bg-green-500/20 text-green-500">Enabled</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-[#111] rounded-lg">
                      <span className="text-gray-400">Rank Advancement Alerts</span>
                      <Badge className="bg-green-500/20 text-green-500">Enabled</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-[#111] rounded-lg">
                      <span className="text-gray-400">Payout Request Alerts</span>
                      <Badge className="bg-green-500/20 text-green-500">Enabled</Badge>
                    </div>
                    <Button variant="outline" className="w-full border-[#c8ff00]/20 text-[#c8ff00]">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Notifications
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Database className="w-5 h-5 text-[#c8ff00]" />
                      System Information
                    </CardTitle>
                    <CardDescription>System status and maintenance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-[#111] rounded-lg">
                      <span className="text-gray-400">System Status</span>
                      <Badge className="bg-green-500/20 text-green-500">Operational</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-[#111] rounded-lg">
                      <span className="text-gray-400">Last Backup</span>
                      <span className="text-white text-sm">Today, 3:00 AM</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-[#111] rounded-lg">
                      <span className="text-gray-400">API Status</span>
                      <Badge className="bg-green-500/20 text-green-500">Connected</Badge>
                    </div>
                    <Button variant="outline" className="w-full border-[#c8ff00]/20 text-[#c8ff00]">
                      <FileText className="w-4 h-4 mr-2" />
                      View Audit Log
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Reward Fulfillment Section Component
function RewardFulfillmentSection() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedRedemption, setSelectedRedemption] = useState<any>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: redemptions, isLoading, refetch } = trpc.adminRewards.listRedemptions.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter as any,
    type: typeFilter === "all" ? undefined : typeFilter as any,
  });

  const { data: stats } = trpc.adminRewards.getStats.useQuery();

  const updateStatusMutation = trpc.adminRewards.updateRedemptionStatus.useMutation({
    onSuccess: () => {
      toast.success("Redemption status updated");
      refetch();
      setSelectedRedemption(null);
      setTrackingNumber("");
      setIsUpdating(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsUpdating(false);
    },
  });

  const handleUpdateStatus = (redemptionId: number, status: string) => {
    setIsUpdating(true);
    updateStatusMutation.mutate({
      redemptionId,
      status: status as any,
      trackingNumber: status === "shipped" ? trackingNumber : undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-500",
      processing: "bg-blue-500/20 text-blue-500",
      shipped: "bg-purple-500/20 text-purple-500",
      delivered: "bg-green-500/20 text-green-500",
    };
    return <Badge className={styles[status] || "bg-gray-500/20 text-gray-500"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reward Fulfillment</h1>
          <p className="text-gray-400">Manage and ship free case rewards to customers and distributors</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="border-[#c8ff00]/20 text-[#c8ff00]">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
          <CardContent className="p-4 text-center">
            <Gift className="w-6 h-6 text-[#c8ff00] mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats?.total || 0}</div>
            <div className="text-xs text-gray-400">Total</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0a0a] border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-500">{stats?.pending || 0}</div>
            <div className="text-xs text-gray-400">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0a0a] border-blue-500/20">
          <CardContent className="p-4 text-center">
            <Package className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-500">{stats?.processing || 0}</div>
            <div className="text-xs text-gray-400">Processing</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0a0a] border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Truck className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-500">{stats?.shipped || 0}</div>
            <div className="text-xs text-gray-400">Shipped</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0a0a] border-green-500/20">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-500">{stats?.delivered || 0}</div>
            <div className="text-xs text-gray-400">Delivered</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0a0a] border-cyan-500/20">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-cyan-500">{stats?.customerRedemptions || 0}</div>
            <div className="text-xs text-gray-400">Customer</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0a0a] border-pink-500/20">
          <CardContent className="p-4 text-center">
            <Network className="w-6 h-6 text-pink-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-pink-500">{stats?.distributorRedemptions || 0}</div>
            <div className="text-xs text-gray-400">Distributor</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-gray-400 text-sm">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-[#111] border-[#c8ff00]/20 text-white">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-[#c8ff00]/20">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label className="text-gray-400 text-sm">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-[#111] border-[#c8ff00]/20 text-white">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-[#c8ff00]/20">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="customer">Customer (3-for-Free)</SelectItem>
                  <SelectItem value="distributor">Distributor (Autoship)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Redemptions Table */}
      <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#c8ff00]" />
            Reward Redemptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#c8ff00]" />
            </div>
          ) : redemptions && redemptions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-[#c8ff00]/10">
                  <TableHead className="text-gray-400">ID</TableHead>
                  <TableHead className="text-gray-400">Type</TableHead>
                  <TableHead className="text-gray-400">Recipient</TableHead>
                  <TableHead className="text-gray-400">Address</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Date</TableHead>
                  <TableHead className="text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redemptions.map((redemption: any) => (
                  <TableRow key={redemption.id} className="border-[#c8ff00]/10 hover:bg-white/5">
                    <TableCell className="text-white font-mono">#{redemption.id}</TableCell>
                    <TableCell>
                      <Badge className={redemption.rewardType === 'customer' ? 'bg-cyan-500/20 text-cyan-500' : 'bg-pink-500/20 text-pink-500'}>
                        {redemption.rewardType === 'customer' ? '3-for-Free' : 'Autoship'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-white">{redemption.name}</div>
                      <div className="text-gray-500 text-sm">{redemption.email}</div>
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm max-w-[200px] truncate">
                      {redemption.addressLine1}, {redemption.city}, {redemption.state} {redemption.postalCode}
                    </TableCell>
                    <TableCell>{getStatusBadge(redemption.status)}</TableCell>
                    <TableCell className="text-gray-400 text-sm">
                      {new Date(redemption.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-[#c8ff00]/20 text-[#c8ff00]"
                            onClick={() => setSelectedRedemption(redemption)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Update
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0a0a0a] border-[#c8ff00]/20">
                          <DialogHeader>
                            <DialogTitle className="text-white">Update Redemption #{redemption.id}</DialogTitle>
                            <DialogDescription>Update the fulfillment status and add tracking information</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <Label className="text-gray-400">Recipient</Label>
                                <p className="text-white">{redemption.name}</p>
                              </div>
                              <div>
                                <Label className="text-gray-400">Email</Label>
                                <p className="text-white">{redemption.email}</p>
                              </div>
                              <div className="col-span-2">
                                <Label className="text-gray-400">Shipping Address</Label>
                                <p className="text-white">
                                  {redemption.addressLine1}<br />
                                  {redemption.addressLine2 && <>{redemption.addressLine2}<br /></>}
                                  {redemption.city}, {redemption.state} {redemption.postalCode}<br />
                                  {redemption.country}
                                </p>
                              </div>
                              {redemption.phone && (
                                <div>
                                  <Label className="text-gray-400">Phone</Label>
                                  <p className="text-white">{redemption.phone}</p>
                                </div>
                              )}
                            </div>
                            <Separator className="bg-[#c8ff00]/10" />
                            <div>
                              <Label className="text-gray-400">Current Status</Label>
                              <div className="mt-1">{getStatusBadge(redemption.status)}</div>
                            </div>
                            {redemption.status !== 'delivered' && (
                              <>
                                {redemption.status === 'pending' && (
                                  <Button 
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    onClick={() => handleUpdateStatus(redemption.id, 'processing')}
                                    disabled={isUpdating}
                                  >
                                    {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Package className="w-4 h-4 mr-2" />}
                                    Mark as Processing
                                  </Button>
                                )}
                                {redemption.status === 'processing' && (
                                  <div className="space-y-3">
                                    <div>
                                      <Label className="text-gray-400">Tracking Number</Label>
                                      <Input
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        placeholder="Enter tracking number"
                                        className="bg-[#111] border-[#c8ff00]/20 text-white"
                                      />
                                    </div>
                                    <Button 
                                      className="w-full bg-purple-600 hover:bg-purple-700"
                                      onClick={() => handleUpdateStatus(redemption.id, 'shipped')}
                                      disabled={isUpdating || !trackingNumber}
                                    >
                                      {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Truck className="w-4 h-4 mr-2" />}
                                      Mark as Shipped
                                    </Button>
                                  </div>
                                )}
                                {redemption.status === 'shipped' && (
                                  <>
                                    {redemption.trackingNumber && (
                                      <div>
                                        <Label className="text-gray-400">Tracking Number</Label>
                                        <p className="text-white font-mono">{redemption.trackingNumber}</p>
                                      </div>
                                    )}
                                    <Button 
                                      className="w-full bg-green-600 hover:bg-green-700"
                                      onClick={() => handleUpdateStatus(redemption.id, 'delivered')}
                                      disabled={isUpdating}
                                    >
                                      {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                      Mark as Delivered
                                    </Button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Redemptions Yet</h3>
              <p className="text-gray-400">Reward redemptions will appear here when customers or distributors claim their free cases.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
