import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Key,
  Shield,
  UserCog,
  Loader2,
  Users,
  UserCheck,
  Building2,
  ShoppingCart
} from "lucide-react";

export function UserManagementTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const utils = trpc.useUtils();
  
  const { data: users, isLoading } = trpc.admin.listUsers.useQuery({
    limit: 100,
    offset: 0,
    role: roleFilter === "all" ? undefined : roleFilter as any,
    search: searchQuery || undefined
  });

  const { data: stats } = trpc.admin.getDashboardStats.useQuery();

  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated successfully");
      utils.admin.listUsers.invalidate();
      setEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const resetPasswordMutation = trpc.admin.resetUserPassword.useMutation({
    onSuccess: (data) => {
      toast.success(`Password reset. Temporary password: ${data.temporaryPassword}`);
      setResetPasswordDialogOpen(false);
      setNewPassword("");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("User deleted successfully");
      utils.admin.listUsers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-500/20 text-red-500";
      case "distributor": return "bg-blue-500/20 text-blue-500";
      case "franchisee": return "bg-purple-500/20 text-purple-500";
      case "customer": return "bg-green-500/20 text-green-500";
      default: return "bg-gray-500/20 text-gray-500";
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case "admin": return <Shield className="w-4 h-4" />;
      case "distributor": return <UserCheck className="w-4 h-4" />;
      case "franchisee": return <Building2 className="w-4 h-4" />;
      case "customer": return <ShoppingCart className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-[#c8ff00]">{stats?.totalUsers || 0}</div>
            <div className="text-gray-500">Total Users</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-500">{stats?.distributors || 0}</div>
            <div className="text-gray-500">Distributors</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-500">{stats?.franchisees || 0}</div>
            <div className="text-gray-500">Franchisees</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-500">{stats?.customers || 0}</div>
            <div className="text-gray-500">Customers</div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Card */}
      <Card className="bg-[#0a0a0a] border-[#c8ff00]/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="w-5 h-5 text-[#c8ff00]" />
                User Management
              </CardTitle>
              <CardDescription>Manage users, roles, and permissions</CardDescription>
            </div>
            <Button
              variant="outline"
              className="border-[#c8ff00]/30 text-[#c8ff00]"
              onClick={() => utils.admin.listUsers.invalidate()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black border-[#c8ff00]/30"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px] bg-black border-[#c8ff00]/30">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="distributor">Distributor</SelectItem>
                <SelectItem value="franchisee">Franchisee</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#c8ff00]" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#c8ff00]/20">
                  <TableHead className="text-[#c8ff00]">User</TableHead>
                  <TableHead className="text-[#c8ff00]">Email</TableHead>
                  <TableHead className="text-[#c8ff00]">Role</TableHead>
                  <TableHead className="text-[#c8ff00]">User Type</TableHead>
                  <TableHead className="text-[#c8ff00]">Joined</TableHead>
                  <TableHead className="text-[#c8ff00]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.users?.map((user) => (
                  <TableRow key={user.id} className="border-[#c8ff00]/10">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#c8ff00]/20 flex items-center justify-center">
                          <span className="text-[#c8ff00] font-bold text-sm">
                            {user.name?.[0]?.toUpperCase() || "U"}
                          </span>
                        </div>
                        <span className="text-white font-medium">{user.name || "Unknown"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role || "user")}>
                        {user.role || "user"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-400">
                        {getUserTypeIcon(user.userType || "customer")}
                        <span className="capitalize">{user.userType || "customer"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {/* Edit Role Dialog */}
                        <Dialog open={editDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                          setEditDialogOpen(open);
                          if (open) setSelectedUser(user);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-500 hover:text-blue-400"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-[#0a0a0a] border-[#c8ff00]/20">
                            <DialogHeader>
                              <DialogTitle>Edit User Role</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <Label>User</Label>
                                <p className="text-gray-400">{selectedUser?.name} ({selectedUser?.email})</p>
                              </div>
                              <div>
                                <Label>Role</Label>
                                <Select
                                  defaultValue={selectedUser?.role || "user"}
                                  onValueChange={(value) => {
                                    if (selectedUser) {
                                      updateRoleMutation.mutate({
                                        userId: selectedUser.id,
                                        role: value as any
                                      });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="bg-black border-[#c8ff00]/30 mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>User Type</Label>
                                <Select
                                  defaultValue={selectedUser?.userType || "customer"}
                                  onValueChange={(value) => {
                                    if (selectedUser) {
                                      updateRoleMutation.mutate({
                                        userId: selectedUser.id,
                                        userType: value as any
                                      });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="bg-black border-[#c8ff00]/30 mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="customer">Customer</SelectItem>
                                    <SelectItem value="distributor">Distributor</SelectItem>
                                    <SelectItem value="franchisee">Franchisee</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Reset Password Dialog */}
                        <Dialog open={resetPasswordDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                          setResetPasswordDialogOpen(open);
                          if (open) setSelectedUser(user);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-yellow-500 hover:text-yellow-400"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Key className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-[#0a0a0a] border-[#c8ff00]/20">
                            <DialogHeader>
                              <DialogTitle>Reset Password</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <p className="text-gray-400">
                                Reset password for {selectedUser?.name} ({selectedUser?.email})?
                              </p>
                              <div>
                                <Label>New Password (optional)</Label>
                                <Input
                                  type="password"
                                  placeholder="Leave blank for auto-generated"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  className="bg-black border-[#c8ff00]/30 mt-1"
                                />
                              </div>
                              <Button
                                onClick={() => {
                                  if (selectedUser) {
                                    resetPasswordMutation.mutate({
                                      userId: selectedUser.id,
                                      newPassword: newPassword || undefined
                                    });
                                  }
                                }}
                                className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600]"
                                disabled={resetPasswordMutation.isPending}
                              >
                                {resetPasswordMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                  <Key className="w-4 h-4 mr-2" />
                                )}
                                Reset Password
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Delete User */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-400"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${user.name}?`)) {
                              deleteUserMutation.mutate({ userId: user.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {users?.users?.length === 0 && !isLoading && (
            <div className="text-center py-12 text-gray-500">
              No users found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
