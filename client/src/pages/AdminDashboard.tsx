import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { UserManagementTab } from "@/components/UserManagementTab";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  MapPin,
  Mail,
  FileText,
  Gem,
  TrendingUp,
  DollarSign,
  Package,
  Settings,
  Download,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  Loader2,
  BarChart3,
  Globe,
  Zap,
  UserCheck,
  Building2,
  CreditCard,
  Bell,
  Database,
  Link2,
  Shield,
  Key,
  UserCog
} from "lucide-react";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const utils = trpc.useUtils();

  // Data queries
  const { data: preorders, isLoading: preordersLoading } = trpc.preorder.list.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const { data: territoryApplications, isLoading: territoriesLoading } = trpc.territory.listApplications.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const { data: subscribers, isLoading: subscribersLoading } = trpc.newsletter.list.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const { data: blogPosts, isLoading: blogLoading } = trpc.blog.list.useQuery({ limit: 100 }, {
    enabled: !!user && user.role === "admin",
  });

  const { data: investorInquiries, isLoading: investorsLoading } = trpc.investor.list.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const { data: allPayoutRequests, isLoading: payoutsLoading } = trpc.distributor.adminGetPayoutRequests.useQuery(undefined, {
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

  const updateInvestorStatus = trpc.investor.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Investor inquiry status updated");
      utils.investor.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteBlogPost = trpc.blog.delete.useMutation({
    onSuccess: () => {
      toast.success("Blog post deleted");
      utils.blog.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const processPayoutMutation = trpc.distributor.adminProcessPayout.useMutation({
    onSuccess: () => {
      toast.success("Payout processed successfully");
      utils.distributor.adminGetPayoutRequests.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  // Auth checks
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#c8ff00]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <Card className="bg-[#0a0a0a] border-[#c8ff00]/30 max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[#c8ff00]">Authentication Required</CardTitle>
            <CardDescription className="text-gray-400">Please log in to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = getLoginUrl())} className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <Card className="bg-[#0a0a0a] border-[#c8ff00]/30 max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[#c8ff00]">Access Denied</CardTitle>
            <CardDescription className="text-gray-400">You do not have permission to access this page</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats
  const totalOrders = preorders?.length || 0;
  const pendingOrders = preorders?.filter(o => o.status === "pending").length || 0;
  const totalRevenue = preorders?.reduce((sum, o) => sum + (o.quantity * 42), 0) || 0;
  const totalTerritories = territoryApplications?.length || 0;
  const pendingTerritories = territoryApplications?.filter(t => t.status === "submitted" || t.status === "draft").length || 0;
  const totalSubscribers = subscribers?.length || 0;
  const totalInvestors = investorInquiries?.length || 0;

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return "";
        if (typeof val === "string" && (val.includes(",") || val.includes('"') || val.includes("\n"))) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success(`Exported ${data.length} records to ${filename}.csv`);
  };

  // CRM Integration placeholder
  const syncToCRM = (crmType: string) => {
    toast.info(`CRM Integration: ${crmType} sync would be triggered here. Configure API keys in Settings.`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#0a0a0a] border-r border-[#c8ff00]/20 z-50 hidden lg:block">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#c8ff00] neon-text cursor-pointer flex items-center gap-2" onClick={() => setLocation("/")}>
            <Zap className="w-6 h-6" />
            NEON® Admin
          </h1>
        </div>

        <nav className="px-4 space-y-1">
          {[
            { id: "overview", icon: LayoutDashboard, label: "Overview" },
            { id: "orders", icon: ShoppingCart, label: "Orders" },
            { id: "customers", icon: Users, label: "Customers" },
            { id: "distributors", icon: UserCheck, label: "Distributors" },
            { id: "usermanagement", icon: Shield, label: "User Management" },
            { id: "territories", icon: MapPin, label: "Territories" },
            { id: "subscribers", icon: Mail, label: "Subscribers" },
            { id: "blog", icon: FileText, label: "Blog Posts" },
            { id: "nfts", icon: Gem, label: "NFTs" },
            { id: "investors", icon: Building2, label: "Investors" },
            { id: "payouts", icon: DollarSign, label: "Payouts" },
            { id: "crm", icon: Link2, label: "CRM Integration" },
            { id: "settings", icon: Settings, label: "Settings" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id ? "bg-[#c8ff00]/20 text-[#c8ff00]" : "text-gray-400 hover:text-white hover:bg-white/5"
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
              <span className="text-[#c8ff00] font-bold">{user?.name?.[0] || "A"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white truncate">{user?.name || "Admin"}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            </div>
          </div>
          <Button onClick={() => setLocation("/")} variant="outline" className="w-full border-gray-700 text-gray-400 hover:text-white">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Site
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-[#c8ff00]/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold capitalize">{activeTab === "crm" ? "CRM Integration" : activeTab}</h2>
              <p className="text-gray-500 text-sm">Manage your NEON business</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="border-[#c8ff00]/30 text-[#c8ff00]" onClick={() => utils.invalidate()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/20 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-[#c8ff00]" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{totalOrders}</div>
                        <div className="text-xs text-gray-500">Total Orders</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Total Revenue</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{totalTerritories}</div>
                        <div className="text-xs text-gray-500">Territory Apps</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{totalSubscribers}</div>
                        <div className="text-xs text-gray-500">Subscribers</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pending Items */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-[#c8ff00]" />
                      Pending Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-black/50 rounded-lg">
                      <span className="text-gray-400">Pending Orders</span>
                      <Badge className="bg-yellow-500/20 text-yellow-500">{pendingOrders}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-black/50 rounded-lg">
                      <span className="text-gray-400">Pending Territories</span>
                      <Badge className="bg-blue-500/20 text-blue-500">{pendingTerritories}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-black/50 rounded-lg">
                      <span className="text-gray-400">Investor Inquiries</span>
                      <Badge className="bg-purple-500/20 text-purple-500">{totalInvestors}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#c8ff00]" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-black/50 rounded-lg">
                      <span className="text-gray-400">Blog Posts</span>
                      <span className="text-white font-bold">{blogPosts?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-black/50 rounded-lg">
                      <span className="text-gray-400">Active Territories</span>
                      <span className="text-white font-bold">{territoryApplications?.filter(t => t.status === "approved").length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-black/50 rounded-lg">
                      <span className="text-gray-400">Referral Rate</span>
                      <span className="text-white font-bold">{subscribers && subscribers.length > 0 ? Math.round((subscribers.filter((s: any) => s.referrerId).length / subscribers.length) * 100) : 0}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="Search orders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-black border-[#c8ff00]/30 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 bg-black border-[#c8ff00]/30">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-[#c8ff00]/30">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => exportToCSV(preorders || [], "orders")} className="bg-[#c8ff00] text-black hover:bg-[#a8d600]">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardContent className="p-0">
                  {preordersLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-[#c8ff00]" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#c8ff00]/20">
                          <TableHead className="text-[#c8ff00]">ID</TableHead>
                          <TableHead className="text-[#c8ff00]">Customer</TableHead>
                          <TableHead className="text-[#c8ff00]">Email</TableHead>
                          <TableHead className="text-[#c8ff00]">Qty</TableHead>
                          <TableHead className="text-[#c8ff00]">Total</TableHead>
                          <TableHead className="text-[#c8ff00]">Status</TableHead>
                          <TableHead className="text-[#c8ff00]">Date</TableHead>
                          <TableHead className="text-[#c8ff00]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preorders
                          ?.filter(o => 
                            (statusFilter === "all" || o.status === statusFilter) &&
                            (searchQuery === "" || o.name.toLowerCase().includes(searchQuery.toLowerCase()) || o.email.toLowerCase().includes(searchQuery.toLowerCase()))
                          )
                          .map((order) => (
                            <TableRow key={order.id} className="border-[#c8ff00]/10">
                              <TableCell className="text-white">#{order.id}</TableCell>
                              <TableCell className="text-white">{order.name}</TableCell>
                              <TableCell className="text-gray-400">{order.email}</TableCell>
                              <TableCell className="text-white">{order.quantity}</TableCell>
                              <TableCell className="text-[#c8ff00]">${order.quantity * 42}</TableCell>
                              <TableCell>
                                <Select
                                  value={order.status}
                                  onValueChange={(value) => updateOrderStatus.mutate({ id: order.id, status: value as any })}
                                >
                                  <SelectTrigger className="w-32 bg-black border-[#c8ff00]/30 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-black border-[#c8ff00]/30">
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Territories Tab */}
          {activeTab === "territories" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="Search territories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-black border-[#c8ff00]/30 w-64"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setLocation("/admin/territories")} variant="outline" className="border-[#c8ff00]/30 text-[#c8ff00]">
                    <MapPin className="w-4 h-4 mr-2" />
                    Full View
                  </Button>
                  <Button onClick={() => exportToCSV(territoryApplications || [], "territories")} className="bg-[#c8ff00] text-black hover:bg-[#a8d600]">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>

              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardContent className="p-0">
                  {territoriesLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-[#c8ff00]" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#c8ff00]/20">
                          <TableHead className="text-[#c8ff00]">ID</TableHead>
                          <TableHead className="text-[#c8ff00]">Applicant</TableHead>
                          <TableHead className="text-[#c8ff00]">Territory</TableHead>
                          <TableHead className="text-[#c8ff00]">Size</TableHead>
                          <TableHead className="text-[#c8ff00]">Cost</TableHead>
                          <TableHead className="text-[#c8ff00]">Status</TableHead>
                          <TableHead className="text-[#c8ff00]">Date</TableHead>
                          <TableHead className="text-[#c8ff00]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {territoryApplications?.map((app) => (
                          <TableRow key={app.id} className="border-[#c8ff00]/10">
                            <TableCell className="text-white">#{app.id}</TableCell>
                            <TableCell className="text-white">{app.firstName} {app.lastName}</TableCell>
                            <TableCell className="text-gray-400">{app.territoryName || "N/A"}</TableCell>
                            <TableCell className="text-white">{app.radiusMiles} mi</TableCell>
                            <TableCell className="text-[#c8ff00]">${(app.totalCost || 0).toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge className={
                                app.status === "approved" ? "bg-green-500/20 text-green-500" :
                                app.status === "rejected" ? "bg-red-500/20 text-red-500" :
                                "bg-yellow-500/20 text-yellow-500"
                              }>
                                {app.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-400">{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {(app.status === "submitted" || app.status === "draft") && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-green-500 hover:text-green-400"
                                      onClick={() => updateTerritoryStatus.mutate({ applicationId: app.id, status: "approved" })}
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-500 hover:text-red-400"
                                      onClick={() => updateTerritoryStatus.mutate({ applicationId: app.id, status: "rejected" })}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Subscribers Tab */}
          {activeTab === "subscribers" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-white">{totalSubscribers}</div>
                    <div className="text-gray-500 text-sm">Total Subscribers</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-green-500">{subscribers?.filter(s => s.status === "active").length || 0}</div>
                    <div className="text-gray-500 text-sm">Active</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-[#c8ff00]">{subscribers?.filter(s => s.referrerId).length || 0}</div>
                    <div className="text-gray-500 text-sm">Via Referral</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-purple-500">{subscribers?.reduce((sum: number, s: any) => sum + (s.referralCount || 0), 0) || 0}</div>
                    <div className="text-gray-500 text-sm">Total Referrals</div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex items-center justify-between">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Search subscribers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-black border-[#c8ff00]/30 w-64"
                  />
                </div>
                <Button onClick={() => exportToCSV(subscribers || [], "subscribers")} className="bg-[#c8ff00] text-black hover:bg-[#a8d600]">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardContent className="p-0">
                  {subscribersLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-[#c8ff00]" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#c8ff00]/20">
                          <TableHead className="text-[#c8ff00]">Email</TableHead>
                          <TableHead className="text-[#c8ff00]">Name</TableHead>
                          <TableHead className="text-[#c8ff00]">Referrals</TableHead>
                          <TableHead className="text-[#c8ff00]">Discount Tier</TableHead>
                          <TableHead className="text-[#c8ff00]">Status</TableHead>
                          <TableHead className="text-[#c8ff00]">Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subscribers
                          ?.filter((s: any) => searchQuery === "" || s.email.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((sub: any) => (
                            <TableRow key={sub.id} className="border-[#c8ff00]/10">
                              <TableCell className="text-white">{sub.email}</TableCell>
                              <TableCell className="text-gray-400">{sub.name || "—"}</TableCell>
                              <TableCell className="text-[#c8ff00]">{sub.referralCount || 0}</TableCell>
                              <TableCell>
                                <Badge className={
                                  sub.discountTier >= 2 ? "bg-[#c8ff00]/20 text-[#c8ff00]" :
                                  sub.discountTier === 1 ? "bg-blue-500/20 text-blue-500" :
                                  "bg-gray-500/20 text-gray-500"
                                }>
                                  Tier {sub.discountTier}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={sub.status === "active" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}>
                                  {sub.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-400">{new Date(sub.createdAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Blog Tab */}
          {activeTab === "blog" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-black border-[#c8ff00]/30 w-64"
                  />
                </div>
                <Button onClick={() => exportToCSV(blogPosts || [], "blog_posts")} className="bg-[#c8ff00] text-black hover:bg-[#a8d600]">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardContent className="p-0">
                  {blogLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-[#c8ff00]" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#c8ff00]/20">
                          <TableHead className="text-[#c8ff00]">Title</TableHead>
                          <TableHead className="text-[#c8ff00]">Category</TableHead>
                          <TableHead className="text-[#c8ff00]">Status</TableHead>
                          <TableHead className="text-[#c8ff00]">Views</TableHead>
                          <TableHead className="text-[#c8ff00]">Published</TableHead>
                          <TableHead className="text-[#c8ff00]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {blogPosts
                          ?.filter(p => searchQuery === "" || p.title.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((post) => (
                            <TableRow key={post.id} className="border-[#c8ff00]/10">
                              <TableCell className="text-white max-w-xs truncate">{post.title}</TableCell>
                              <TableCell>
                                <Badge className="bg-[#c8ff00]/20 text-[#c8ff00]">{post.category}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={post.status === "published" ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"}>
                                  {post.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-400">{post.views || 0}</TableCell>
                              <TableCell className="text-gray-400">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "—"}</TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={() => window.open(`/blog/${post.slug}`, "_blank")}>
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400" onClick={() => deleteBlogPost.mutate({ id: post.id })}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Investors Tab */}
          {activeTab === "investors" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Search investors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-black border-[#c8ff00]/30 w-64"
                  />
                </div>
                <Button onClick={() => exportToCSV(investorInquiries || [], "investors")} className="bg-[#c8ff00] text-black hover:bg-[#a8d600]">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardContent className="p-0">
                  {investorsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-[#c8ff00]" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#c8ff00]/20">
                          <TableHead className="text-[#c8ff00]">Name</TableHead>
                          <TableHead className="text-[#c8ff00]">Email</TableHead>
                          <TableHead className="text-[#c8ff00]">Company</TableHead>
                          <TableHead className="text-[#c8ff00]">Investment Range</TableHead>
                          <TableHead className="text-[#c8ff00]">Status</TableHead>
                          <TableHead className="text-[#c8ff00]">Date</TableHead>
                          <TableHead className="text-[#c8ff00]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {investorInquiries
                          ?.filter(i => searchQuery === "" || i.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((inquiry) => (
                            <TableRow key={inquiry.id} className="border-[#c8ff00]/10">
                              <TableCell className="text-white">{inquiry.name}</TableCell>
                              <TableCell className="text-gray-400">{inquiry.email}</TableCell>
                              <TableCell className="text-gray-400">{inquiry.company || "—"}</TableCell>
                              <TableCell className="text-[#c8ff00]">{inquiry.investmentRange}</TableCell>
                              <TableCell>
                                <Select
                                  value={inquiry.status}
                                  onValueChange={(value) => updateInvestorStatus.mutate({ id: inquiry.id, status: value as any })}
                                >
                                  <SelectTrigger className="w-32 bg-black border-[#c8ff00]/30 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-black border-[#c8ff00]/30">
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="qualified">Qualified</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-gray-400">{new Date(inquiry.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payouts Tab */}
          {activeTab === "payouts" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Search payouts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-black border-[#c8ff00]/30 w-64"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 bg-black border-[#c8ff00]/30">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-[#c8ff00]/30">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => exportToCSV(allPayoutRequests || [], "payout_requests")} className="bg-[#c8ff00] text-black hover:bg-[#a8d600]">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>

              {/* Payout Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-500">
                      {allPayoutRequests?.filter(p => p.status === "pending").length || 0}
                    </div>
                    <div className="text-gray-500">Pending</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-blue-500">
                      {allPayoutRequests?.filter(p => p.status === "approved" || p.status === "processing").length || 0}
                    </div>
                    <div className="text-gray-500">Processing</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-[#c8ff00]">
                      ${((allPayoutRequests?.filter(p => p.status === "pending" || p.status === "approved").reduce((sum, p) => sum + p.amount, 0) || 0) / 100).toLocaleString()}
                    </div>
                    <div className="text-gray-500">Pending Amount</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-green-500">
                      ${((allPayoutRequests?.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0) || 0) / 100).toLocaleString()}
                    </div>
                    <div className="text-gray-500">Total Paid</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardContent className="p-0">
                  {payoutsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-[#c8ff00]" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#c8ff00]/20">
                          <TableHead className="text-[#c8ff00]">ID</TableHead>
                          <TableHead className="text-[#c8ff00]">Distributor</TableHead>
                          <TableHead className="text-[#c8ff00]">Amount</TableHead>
                          <TableHead className="text-[#c8ff00]">Net Amount</TableHead>
                          <TableHead className="text-[#c8ff00]">Method</TableHead>
                          <TableHead className="text-[#c8ff00]">Status</TableHead>
                          <TableHead className="text-[#c8ff00]">Requested</TableHead>
                          <TableHead className="text-[#c8ff00]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allPayoutRequests
                          ?.filter(p => statusFilter === "all" || p.status === statusFilter)
                          ?.filter(p => searchQuery === "" || p.distributorId?.toString().includes(searchQuery))
                          .map((payout) => (
                            <TableRow key={payout.id} className="border-[#c8ff00]/10">
                              <TableCell className="text-white">#{payout.id}</TableCell>
                              <TableCell className="text-white">Distributor #{payout.distributorId}</TableCell>
                              <TableCell className="text-white font-medium">${(payout.amount / 100).toFixed(2)}</TableCell>
                              <TableCell className="text-[#c8ff00]">${(payout.netAmount / 100).toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge className="bg-gray-500/20 text-gray-300">
                                  {payout.payoutMethod?.replace("_", " ") || "N/A"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  payout.status === "completed" ? "bg-green-500/20 text-green-500" :
                                  payout.status === "pending" ? "bg-yellow-500/20 text-yellow-500" :
                                  payout.status === "approved" ? "bg-blue-500/20 text-blue-500" :
                                  payout.status === "processing" ? "bg-purple-500/20 text-purple-500" :
                                  "bg-red-500/20 text-red-500"
                                }>
                                  {payout.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-400">
                                {new Date(payout.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  {payout.status === "pending" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-green-500 hover:text-green-400"
                                      onClick={() => {
                                        trpc.distributor.adminApprovePayout.useMutation().mutate({ requestId: payout.id });
                                        toast.success("Payout approved");
                                        utils.distributor.adminGetPayoutRequests.invalidate();
                                      }}
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {payout.status === "approved" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-blue-500 hover:text-blue-400"
                                      onClick={() => processPayoutMutation.mutate({ requestId: payout.id })}
                                    >
                                      <RefreshCw className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* CRM Integration Tab */}
          {activeTab === "crm" && (
            <div className="space-y-6">
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardHeader>
                  <CardTitle>CRM Integration</CardTitle>
                  <CardDescription>Connect your NEON admin panel with external CRM systems</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Zoho CRM */}
                  <div className="p-4 bg-black/50 rounded-lg border border-[#c8ff00]/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                          <Database className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">Zoho CRM</h3>
                          <p className="text-sm text-gray-500">Sync contacts, leads, and deals</p>
                        </div>
                      </div>
                      <Badge className="bg-yellow-500/20 text-yellow-500">Not Connected</Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-400">API Key</Label>
                        <Input placeholder="Enter Zoho API Key" className="bg-black border-[#c8ff00]/30 mt-1" />
                      </div>
                      <div>
                        <Label className="text-gray-400">Organization ID</Label>
                        <Input placeholder="Enter Organization ID" className="bg-black border-[#c8ff00]/30 mt-1" />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={() => syncToCRM("Zoho")} className="bg-[#c8ff00] text-black hover:bg-[#a8d600]">
                        Connect Zoho
                      </Button>
                      <Button variant="outline" className="border-[#c8ff00]/30 text-[#c8ff00]">
                        Test Connection
                      </Button>
                    </div>
                  </div>

                  {/* HubSpot */}
                  <div className="p-4 bg-black/50 rounded-lg border border-[#c8ff00]/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                          <Globe className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">HubSpot</h3>
                          <p className="text-sm text-gray-500">Marketing automation and CRM</p>
                        </div>
                      </div>
                      <Badge className="bg-yellow-500/20 text-yellow-500">Not Connected</Badge>
                    </div>
                    <div>
                      <Label className="text-gray-400">API Key</Label>
                      <Input placeholder="Enter HubSpot API Key" className="bg-black border-[#c8ff00]/30 mt-1" />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={() => syncToCRM("HubSpot")} className="bg-[#c8ff00] text-black hover:bg-[#a8d600]">
                        Connect HubSpot
                      </Button>
                    </div>
                  </div>

                  {/* Salesforce */}
                  <div className="p-4 bg-black/50 rounded-lg border border-[#c8ff00]/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">Salesforce</h3>
                          <p className="text-sm text-gray-500">Enterprise CRM solution</p>
                        </div>
                      </div>
                      <Badge className="bg-yellow-500/20 text-yellow-500">Not Connected</Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-400">Consumer Key</Label>
                        <Input placeholder="Enter Consumer Key" className="bg-black border-[#c8ff00]/30 mt-1" />
                      </div>
                      <div>
                        <Label className="text-gray-400">Consumer Secret</Label>
                        <Input type="password" placeholder="Enter Consumer Secret" className="bg-black border-[#c8ff00]/30 mt-1" />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={() => syncToCRM("Salesforce")} className="bg-[#c8ff00] text-black hover:bg-[#a8d600]">
                        Connect Salesforce
                      </Button>
                    </div>
                  </div>

                  {/* Sync Options */}
                  <Card className="bg-black/30 border-[#c8ff00]/10">
                    <CardHeader>
                      <CardTitle className="text-lg">Sync Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Auto-sync new orders</span>
                        <Badge className="bg-green-500/20 text-green-500">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Auto-sync new subscribers</span>
                        <Badge className="bg-green-500/20 text-green-500">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Auto-sync territory applications</span>
                        <Badge className="bg-green-500/20 text-green-500">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Auto-sync investor inquiries</span>
                        <Badge className="bg-green-500/20 text-green-500">Enabled</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === "customers" && (
            <div className="space-y-6">
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardHeader>
                  <CardTitle>Customer Management</CardTitle>
                  <CardDescription>View and manage all registered customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Customer data is derived from pre-orders and user registrations. Use the Orders tab to view customer purchase history.</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Distributors Tab */}
          {activeTab === "distributors" && (
            <div className="space-y-6">
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardHeader>
                  <CardTitle>Distributor Management</CardTitle>
                  <CardDescription>Manage MLM distributors, ranks, and commissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">Distributor enrollment and management features are available in the Distributor Portal.</p>
                  <Button onClick={() => setLocation("/distributor-portal")} className="bg-[#c8ff00] text-black hover:bg-[#a8d600]">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Distributor Portal
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* NFTs Tab */}
          {activeTab === "nfts" && (
            <div className="space-y-6">
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardHeader>
                  <CardTitle>NFT Management</CardTitle>
                  <CardDescription>View and manage issued NFTs</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">NFTs are automatically issued with each order. View the NFT Gallery for all issued tokens.</p>
                  <Button onClick={() => setLocation("/nft-gallery")} className="bg-[#c8ff00] text-black hover:bg-[#a8d600]">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View NFT Gallery
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* User Management Tab */}
          {activeTab === "usermanagement" && (
            <UserManagementTab />
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
                <CardHeader>
                  <CardTitle>Admin Settings</CardTitle>
                  <CardDescription>Configure admin panel preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-black/50 rounded-lg">
                    <h3 className="font-bold text-white mb-2">Email Notifications</h3>
                    <p className="text-sm text-gray-400 mb-4">Configure when to receive admin notifications</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">New orders</span>
                        <Badge className="bg-green-500/20 text-green-500">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Territory applications</span>
                        <Badge className="bg-green-500/20 text-green-500">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Investor inquiries</span>
                        <Badge className="bg-green-500/20 text-green-500">Enabled</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
