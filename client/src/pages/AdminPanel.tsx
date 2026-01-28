import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Settings,
  Package,
  FileText,
  Activity,
  Search,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Home,
  ArrowLeft,
  RefreshCw,
  Eye,
  Ban,
  UserCheck,
  Mail,
  Truck,
  Clock,
  AlertCircle,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import NavigationHeader from "@/components/NavigationHeader";
import { format, formatDistanceToNow } from "date-fns";

export default function AdminPanel() {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c8ff00]"></div>
      </div>
    );
  }
  
  // Redirect if not admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-[#0a0a0a] border-[#c8ff00]/30 max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>You must be an admin to access this page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate("/")} 
              className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600]"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NavigationHeader />
      
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-[#c8ff00]">Admin Panel</h1>
            <p className="text-gray-400">Manage your NEON Energy platform</p>
          </div>
          <Badge variant="outline" className="text-[#c8ff00] border-[#c8ff00]">
            Admin: {user.name || user.email}
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-[#0a0a0a] border border-[#c8ff00]/30">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black">Dashboard</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black">Users</TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black">Orders</TabsTrigger>
            <TabsTrigger value="commissions" className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black">Commissions</TabsTrigger>
            <TabsTrigger value="distributors" className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black">Distributors</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="commissions">
            <CommissionManagement />
          </TabsContent>

          <TabsContent value="distributors">
            <DistributorManagement />
          </TabsContent>

          <TabsContent value="settings">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Admin Dashboard with Real Data
function AdminDashboard() {
  const { data: stats, isLoading, refetch } = trpc.admin.stats.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  const { data: recentActivity } = trpc.admin.recentActivity.useQuery(undefined, {
    refetchInterval: 10000,
  });

  const dashboardStats = stats || {
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCommissions: 0,
    newUsersToday: 0,
    ordersToday: 0,
    revenueToday: 0,
    activeDistributors: 0,
    pendingOrders: 0,
    pendingCommissions: 0,
  };

  return (
    <div className="space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          className="border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
            <Users className="h-4 w-4 text-[#c8ff00]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboardStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-green-500">
              +{dashboardStats.newUsersToday} today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-[#c8ff00]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboardStats.totalOrders.toLocaleString()}</div>
            <p className="text-xs text-green-500">
              +{dashboardStats.ordersToday} today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-[#c8ff00]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${dashboardStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-500">
              +${dashboardStats.revenueToday.toLocaleString()} today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Commissions Paid</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#c8ff00]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${dashboardStats.totalCommissions.toLocaleString()}</div>
            <p className="text-xs text-gray-400">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Distributors</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboardStats.activeDistributors}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboardStats.pendingOrders}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pending Commissions</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${dashboardStats.pendingCommissions.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
          <CardDescription className="text-gray-400">Latest platform activity in real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-b border-[#c8ff00]/10 pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'order' ? 'bg-green-500/20' :
                      activity.type === 'user' ? 'bg-blue-500/20' :
                      activity.type === 'commission' ? 'bg-yellow-500/20' :
                      'bg-gray-500/20'
                    }`}>
                      {activity.type === 'order' ? <ShoppingCart className="h-4 w-4 text-green-500" /> :
                       activity.type === 'user' ? <Users className="h-4 w-4 text-blue-500" /> :
                       activity.type === 'commission' ? <DollarSign className="h-4 w-4 text-yellow-500" /> :
                       <Activity className="h-4 w-4 text-gray-500" />}
                    </div>
                    <div>
                      <p className="font-medium text-white">{activity.title}</p>
                      <p className="text-sm text-gray-400">{activity.description}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {activity.createdAt ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }) : 'Just now'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// User Management with Real Data
function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const { data: usersData, isLoading, refetch } = trpc.admin.users.useQuery({
    search: searchQuery,
    role: roleFilter !== "all" ? roleFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
    limit: 10,
  });

  const updateUserMutation = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      toast.success("User updated successfully");
      refetch();
      setEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user");
    },
  });

  const suspendUserMutation = trpc.admin.suspendUser.useMutation({
    onSuccess: () => {
      toast.success("User status updated");
      refetch();
    },
  });

  const users = usersData?.users || [];
  const totalPages = usersData?.totalPages || 1;
  
  return (
    <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">User Management</CardTitle>
            <CardDescription className="text-gray-400">
              Manage all platform users ({usersData?.total || 0} total)
            </CardDescription>
          </div>
          <Button className="bg-[#c8ff00] text-black hover:bg-[#a8d600]">
            <Download className="h-4 w-4 mr-2" />
            Export Users
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black border-[#c8ff00]/30 text-white"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px] bg-black border-[#c8ff00]/30 text-white">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="distributor">Distributor</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-black border-[#c8ff00]/30 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c8ff00]"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {users.length > 0 ? users.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-[#c8ff00]/20 rounded-lg hover:border-[#c8ff00]/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#c8ff00]/20 flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="h-5 w-5 text-[#c8ff00]" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                    <Badge className={
                      user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                      user.role === 'distributor' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }>
                      {user.role}
                    </Badge>
                    <Badge variant={user.status === 'active' ? "default" : "secondary"} className={
                      user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }>
                      {user.status || 'active'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setEditDialogOpen(true);
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => suspendUserMutation.mutate({ 
                        userId: user.id, 
                        suspend: user.status !== 'suspended' 
                      })}
                      className="text-gray-400 hover:text-white"
                    >
                      {user.status === 'suspended' ? (
                        <UserCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        <Ban className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No users found</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-[#c8ff00]/30"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center px-4 text-gray-400">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border-[#c8ff00]/30"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-[#0a0a0a] border-[#c8ff00]/30 text-white">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update user information
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input 
                  value={selectedUser.name || ''} 
                  onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                  className="bg-black border-[#c8ff00]/30"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  value={selectedUser.email || ''} 
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                  className="bg-black border-[#c8ff00]/30"
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select 
                  value={selectedUser.role} 
                  onValueChange={(v) => setSelectedUser({...selectedUser, role: v})}
                >
                  <SelectTrigger className="bg-black border-[#c8ff00]/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="distributor">Distributor</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => updateUserMutation.mutate(selectedUser)}
              className="bg-[#c8ff00] text-black hover:bg-[#a8d600]"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Order Management with Real Data
function OrderManagement() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  
  const { data: ordersData, isLoading, refetch } = trpc.admin.orders.useQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
    limit: 10,
  });

  const updateOrderMutation = trpc.admin.updateOrder.useMutation({
    onSuccess: () => {
      toast.success("Order updated successfully");
      refetch();
    },
  });

  const orders = ordersData?.orders || [];
  const totalPages = ordersData?.totalPages || 1;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    processing: 'bg-blue-500/20 text-blue-400',
    shipped: 'bg-purple-500/20 text-purple-400',
    delivered: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };
  
  return (
    <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Order Management</CardTitle>
            <CardDescription className="text-gray-400">
              Track and manage all orders ({ordersData?.total || 0} total)
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-black border-[#c8ff00]/30 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-[#c8ff00] text-black hover:bg-[#a8d600]">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c8ff00]"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.length > 0 ? orders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-4 border border-[#c8ff00]/20 rounded-lg">
                <div className="flex items-center gap-4">
                  <Package className="h-5 w-5 text-[#c8ff00]" />
                  <div>
                    <p className="font-medium text-white">Order #{order.orderNumber || order.id}</p>
                    <p className="text-sm text-gray-400">{order.customerName || order.customerEmail}</p>
                    <p className="text-xs text-gray-500">
                      {order.createdAt ? format(new Date(order.createdAt), 'MMM d, yyyy h:mm a') : 'Unknown date'}
                    </p>
                  </div>
                  <Badge className={statusColors[order.status] || statusColors.pending}>
                    {order.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-white">${order.total?.toFixed(2) || '0.00'}</span>
                  <Select 
                    value={order.status}
                    onValueChange={(status) => updateOrderMutation.mutate({ orderId: order.id, status })}
                  >
                    <SelectTrigger className="w-[130px] bg-black border-[#c8ff00]/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-gray-400">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No orders found</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="border-[#c8ff00]/30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="flex items-center px-4 text-gray-400">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="border-[#c8ff00]/30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Commission Management with Real Data
function CommissionManagement() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  
  const { data: commissionsData, isLoading, refetch } = trpc.admin.commissions.useQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
    limit: 10,
  });

  const approveCommissionMutation = trpc.admin.approveCommission.useMutation({
    onSuccess: () => {
      toast.success("Commission approved");
      refetch();
    },
  });

  const rejectCommissionMutation = trpc.admin.rejectCommission.useMutation({
    onSuccess: () => {
      toast.success("Commission rejected");
      refetch();
    },
  });

  const commissions = commissionsData?.commissions || [];
  const totalPages = commissionsData?.totalPages || 1;
  
  return (
    <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Commission Management</CardTitle>
            <CardDescription className="text-gray-400">
              Manage distributor commissions ({commissionsData?.total || 0} total)
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-black border-[#c8ff00]/30 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-[#c8ff00] text-black hover:bg-[#a8d600]">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c8ff00]"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {commissions.length > 0 ? commissions.map((commission: any) => (
              <div key={commission.id} className="flex items-center justify-between p-4 border border-[#c8ff00]/20 rounded-lg">
                <div className="flex items-center gap-4">
                  <DollarSign className="h-5 w-5 text-[#c8ff00]" />
                  <div>
                    <p className="font-medium text-white">{commission.distributorName || 'Unknown Distributor'}</p>
                    <p className="text-sm text-gray-400">Commission #{commission.id}</p>
                    <p className="text-xs text-gray-500">{commission.type || 'Standard'}</p>
                  </div>
                  <Badge className={
                    commission.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                    commission.status === 'approved' ? 'bg-blue-500/20 text-blue-400' :
                    commission.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }>
                    {commission.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-white">${commission.amount?.toFixed(2) || '0.00'}</span>
                  {commission.status === 'pending' && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => approveCommissionMutation.mutate({ commissionId: commission.id })}
                        className="text-green-500 hover:text-green-400"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => rejectCommissionMutation.mutate({ commissionId: commission.id })}
                        className="text-red-500 hover:text-red-400"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-gray-400">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No commissions found</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="border-[#c8ff00]/30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="flex items-center px-4 text-gray-400">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="border-[#c8ff00]/30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Distributor Management
function DistributorManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  
  const { data: distributorsData, isLoading } = trpc.admin.distributors.useQuery({
    search: searchQuery,
    page,
    limit: 10,
  });

  const distributors = distributorsData?.distributors || [];
  const totalPages = distributorsData?.totalPages || 1;
  
  return (
    <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Distributor Management</CardTitle>
            <CardDescription className="text-gray-400">
              Manage all distributors ({distributorsData?.total || 0} total)
            </CardDescription>
          </div>
          <Button className="bg-[#c8ff00] text-black hover:bg-[#a8d600]">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search distributors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black border-[#c8ff00]/30 text-white"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c8ff00]"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {distributors.length > 0 ? distributors.map((dist: any) => (
                <div key={dist.id} className="flex items-center justify-between p-4 border border-[#c8ff00]/20 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#c8ff00]/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-[#c8ff00]" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{dist.name || dist.username || 'Unknown'}</p>
                      <p className="text-sm text-gray-400">Code: {dist.distributorCode}</p>
                    </div>
                    <Badge className="bg-[#c8ff00]/20 text-[#c8ff00]">{dist.rank}</Badge>
                    <Badge className={dist.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {dist.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="text-right">
                      <p>Personal: ${dist.personalSales?.toLocaleString() || 0}</p>
                      <p>Team: ${dist.teamSales?.toLocaleString() || 0}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No distributors found</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-[#c8ff00]/30"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center px-4 text-gray-400">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border-[#c8ff00]/30"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// System Settings
function SystemSettings() {
  return (
    <div className="space-y-6">
      <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
        <CardHeader>
          <CardTitle className="text-white">System Configuration</CardTitle>
          <CardDescription className="text-gray-400">Configure platform settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-white">Company Name</Label>
              <Input defaultValue="NEON Energy" className="bg-black border-[#c8ff00]/30 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Support Email</Label>
              <Input defaultValue="support@neonenergy.com" className="bg-black border-[#c8ff00]/30 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Default Commission Rate (%)</Label>
              <Input type="number" defaultValue="10" className="bg-black border-[#c8ff00]/30 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Minimum Payout ($)</Label>
              <Input type="number" defaultValue="50" className="bg-black border-[#c8ff00]/30 text-white" />
            </div>
          </div>
          <Button className="bg-[#c8ff00] text-black hover:bg-[#a8d600]">
            Save Settings
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
        <CardHeader>
          <CardTitle className="text-white">Payment Gateway</CardTitle>
          <CardDescription className="text-gray-400">Configure payment processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-[#c8ff00]/20 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-white">Stripe</p>
                <p className="text-sm text-gray-400">Payment processing</p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400">Connected</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Missing import for CreditCard
import { CreditCard } from "lucide-react";
