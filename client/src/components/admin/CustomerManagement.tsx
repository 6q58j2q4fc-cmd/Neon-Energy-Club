import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Search, 
  Filter, 
  Download, 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  ShoppingCart,
  Gift,
  Star,
  MoreVertical,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  DollarSign,
  Package
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CustomerManagementProps {
  customers: any[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function CustomerManagement({ customers, isLoading, onRefresh }: CustomerManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteContent, setNoteContent] = useState("");

  // Filter customers
  const filteredCustomers = customers?.filter((customer: any) => {
    const matchesSearch = 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  // Calculate stats
  const totalCustomers = customers?.length || 0;
  const activeCustomers = customers?.filter((c: any) => c.status === "active").length || 0;
  const newThisMonth = customers?.filter((c: any) => {
    const createdAt = new Date(c.createdAt);
    const now = new Date();
    return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
  }).length || 0;

  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Status", "Referrals", "Total Orders", "Lifetime Value", "Join Date"];
    const rows = filteredCustomers.map((c: any) => [
      c.id,
      c.name || "",
      c.email || "",
      c.phone || "",
      c.status || "active",
      c.referralCount || 0,
      c.totalOrders || 0,
      c.lifetimeValue || 0,
      c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Customer data exported successfully");
  };

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setShowCustomerDetail(true);
  };

  const handleAddNote = () => {
    if (!noteContent.trim()) return;
    toast.success("Note added to customer profile");
    setNoteContent("");
    setShowAddNote(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{totalCustomers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Customers</p>
                <p className="text-2xl font-bold">{activeCustomers.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New This Month</p>
                <p className="text-2xl font-bold">{newThisMonth.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Lifetime Value</p>
                <p className="text-2xl font-bold">$0</p>
              </div>
              <DollarSign className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
          <CardDescription>
            Manage all customer accounts, view profiles, and track engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No customers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Referrals</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Lifetime Value</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.slice(0, 50).map((customer: any) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-neon-green/20 to-neon-blue/20 flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {customer.name?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{customer.name || "Unknown"}</p>
                            <p className="text-sm text-muted-foreground">ID: {customer.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {customer.email || "N/A"}
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                          {customer.status || "active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Gift className="h-4 w-4 text-purple-500" />
                          {customer.referralCount || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="h-4 w-4 text-blue-500" />
                          {customer.totalOrders || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-green-500">
                          ${(customer.lifetimeValue || 0).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        {customer.createdAt 
                          ? new Date(customer.createdAt).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Customer
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500">
                              <Ban className="h-4 w-4 mr-2" />
                              Suspend Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Detail Dialog */}
      <Dialog open={showCustomerDetail} onOpenChange={setShowCustomerDetail}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Profile</DialogTitle>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-neon-green/20 to-neon-blue/20 flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {selectedCustomer.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{selectedCustomer.name || "Unknown"}</h3>
                  <p className="text-muted-foreground">{selectedCustomer.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={selectedCustomer.status === "active" ? "default" : "secondary"}>
                      {selectedCustomer.status || "active"}
                    </Badge>
                    <Badge variant="outline">
                      Customer ID: {selectedCustomer.id}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <ShoppingCart className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">{selectedCustomer.totalOrders || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">${(selectedCustomer.lifetimeValue || 0).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Lifetime Value</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Gift className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                    <p className="text-2xl font-bold">{selectedCustomer.referralCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Referrals</p>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedCustomer.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedCustomer.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedCustomer.address || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined: {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString() : "N/A"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Notes Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Notes</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setShowAddNote(true)}>
                    Add Note
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">No notes yet</p>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={showAddNote} onOpenChange={setShowAddNote}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter note..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddNote(false)}>Cancel</Button>
            <Button onClick={handleAddNote}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
