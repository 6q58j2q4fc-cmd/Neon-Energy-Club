import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Package, 
  Search, 
  Filter, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  ArrowLeft,
  RefreshCw,
  Download,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Tag
} from "lucide-react";
import { ShippingLabelModal } from "@/components/ShippingLabelModal";

type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  totalAmount: string;
  createdAt: Date;
  trackingNumber: string | null;
  nftImageUrl: string | null;
  shippingAddress: string;
  userId: number | null;
  distributorId: number | null;
  packageId: number;
  paymentStatus: string;
  updatedAt: Date;
}

export default function AdminOrders() {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>("pending");
  const [newTrackingNumber, setNewTrackingNumber] = useState("");
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>("paid");
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [shippingOrderId, setShippingOrderId] = useState<number | null>(null);
  const [shippingOrderNumber, setShippingOrderNumber] = useState("");
  
  const ordersPerPage = 20;

  // Fetch orders
  const { data: ordersData, isLoading, refetch } = trpc.admin.orders.useQuery({
    page,
    limit: ordersPerPage,
    status: statusFilter as any,
    search: searchQuery || undefined
  });

  // Update order mutation
  const updateOrderMutation = trpc.admin.updateOrder.useMutation({
    onSuccess: () => {
      refetch();
      setEditModalOpen(false);
      setSelectedOrder(null);
    }
  });

  // Bulk update mutation - placeholder
  const bulkUpdateMutation = {
    mutate: async ({ orderIds, status }: { orderIds: number[], status: string }) => {
      // Update each order individually
      for (const orderId of orderIds) {
        await updateOrderMutation.mutateAsync({ orderId, status: status as any });
      }
      refetch();
      setBulkModalOpen(false);
      setSelectedOrders([]);
    },
    isPending: false
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1a1a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#c8ff00] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0a1a1a] flex items-center justify-center">
        <Card className="bg-zinc-900/50 border-red-500/30 max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-zinc-400 mb-4">You must be an admin to access this page.</p>
            <Link href="/">
              <Button variant="outline" className="border-[#c8ff00]/50 text-[#c8ff00]">
                Return Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const orders = (ordersData?.orders || []) as unknown as Order[];
  const totalOrders = ordersData?.pagination?.total || 0;
  const totalPages = Math.ceil(totalOrders / ordersPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "paid": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "shipped": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      case "delivered": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "cancelled": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "paid": return <CheckCircle className="w-4 h-4" />;
      case "shipped": return <Truck className="w-4 h-4" />;
      case "delivered": return <Package className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o) => o.id));
    }
  };

  const handleSelectOrder = (orderId: number) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status as OrderStatus);
    setNewTrackingNumber(order.trackingNumber || "");
    setEditModalOpen(true);
  };

  const handleSaveOrder = () => {
    if (!selectedOrder) return;
    updateOrderMutation.mutate({
      orderId: selectedOrder.id,
      status: newStatus as "pending" | "paid" | "shipped" | "delivered" | "cancelled"
    });
  };

  const handleBulkUpdate = () => {
    bulkUpdateMutation.mutate({
      orderIds: selectedOrders,
      status: bulkStatus as string
    });
  };

  // Export mutation to get all orders
  const exportMutation = trpc.admin.exportAllOrders.useQuery(
    undefined,
    { enabled: false }
  );

  const exportOrders = async () => {
    const result = await exportMutation.refetch();
    if (!result.data) return;
    
    const exportData = result.data.orders;
    const headers = [
      "Order #", "Customer Name", "Email", "Phone", "Status", "Quantity", 
      "Total ($)", "Address", "City", "State", "Postal Code", 
      "Country", "Tracking #", "Carrier", "NFT ID", "NFT Status", "Notes", "Created At", "Updated At"
    ];
    
    const csvContent = [
      headers.join(","),
      ...exportData.map((o: any) => [
        `"${o.orderNumber}"`,
        `"${o.customerName}"`,
        `"${o.customerEmail}"`,
        `"${o.phone}"`,
        o.status,
        o.quantity,
        o.total,
        `"${o.address}"`,
        `"${o.city}"`,
        `"${o.state}"`,
        `"${o.postalCode}"`,
        o.country,
        `"${o.trackingNumber}"`,
        `"${o.carrier}"`,
        `"${o.nftId}"`,
        o.nftMintStatus,
        `"${(o.notes || '').replace(/"/g, '""')}"`,
        o.createdAt,
        o.updatedAt
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `neon-orders-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToExcel = async () => {
    const result = await exportMutation.refetch();
    if (!result.data) return;
    
    const exportData = result.data.orders;
    // Create Excel-compatible XML
    let excelContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Orders">
    <Table>
      <Row>
        <Cell><Data ss:Type="String">Order #</Data></Cell>
        <Cell><Data ss:Type="String">Customer Name</Data></Cell>
        <Cell><Data ss:Type="String">Email</Data></Cell>
        <Cell><Data ss:Type="String">Phone</Data></Cell>
        <Cell><Data ss:Type="String">Status</Data></Cell>
        <Cell><Data ss:Type="String">Quantity</Data></Cell>
        <Cell><Data ss:Type="String">Total ($)</Data></Cell>
        <Cell><Data ss:Type="String">Address</Data></Cell>
        <Cell><Data ss:Type="String">City</Data></Cell>
        <Cell><Data ss:Type="String">State</Data></Cell>
        <Cell><Data ss:Type="String">Postal Code</Data></Cell>
        <Cell><Data ss:Type="String">Country</Data></Cell>
        <Cell><Data ss:Type="String">Tracking #</Data></Cell>
        <Cell><Data ss:Type="String">Carrier</Data></Cell>
        <Cell><Data ss:Type="String">NFT ID</Data></Cell>
        <Cell><Data ss:Type="String">NFT Status</Data></Cell>
        <Cell><Data ss:Type="String">Created At</Data></Cell>
      </Row>`;
    
    exportData.forEach((o: any) => {
      excelContent += `
      <Row>
        <Cell><Data ss:Type="String">${o.orderNumber}</Data></Cell>
        <Cell><Data ss:Type="String">${o.customerName}</Data></Cell>
        <Cell><Data ss:Type="String">${o.customerEmail}</Data></Cell>
        <Cell><Data ss:Type="String">${o.phone}</Data></Cell>
        <Cell><Data ss:Type="String">${o.status}</Data></Cell>
        <Cell><Data ss:Type="Number">${o.quantity}</Data></Cell>
        <Cell><Data ss:Type="Number">${o.total}</Data></Cell>
        <Cell><Data ss:Type="String">${o.address}</Data></Cell>
        <Cell><Data ss:Type="String">${o.city}</Data></Cell>
        <Cell><Data ss:Type="String">${o.state}</Data></Cell>
        <Cell><Data ss:Type="String">${o.postalCode}</Data></Cell>
        <Cell><Data ss:Type="String">${o.country}</Data></Cell>
        <Cell><Data ss:Type="String">${o.trackingNumber}</Data></Cell>
        <Cell><Data ss:Type="String">${o.carrier}</Data></Cell>
        <Cell><Data ss:Type="String">${o.nftId}</Data></Cell>
        <Cell><Data ss:Type="String">${o.nftMintStatus}</Data></Cell>
        <Cell><Data ss:Type="String">${o.createdAt}</Data></Cell>
      </Row>`;
    });
    
    excelContent += `
    </Table>
  </Worksheet>
</Workbook>`;
    
    const blob = new Blob([excelContent], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `neon-orders-${new Date().toISOString().split("T")[0]}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0a1a1a]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0a1a1a] via-[#0d2818] to-[#0a1a1a] border-b border-[#c8ff00]/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Package className="w-6 h-6 text-[#c8ff00]" />
                  Order Management
                </h1>
                <p className="text-zinc-400 text-sm">Manage orders, update statuses, and add tracking numbers</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10"
                onClick={exportOrders}
              >
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button 
                variant="outline" 
                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                onClick={exportToExcel}
              >
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button 
                variant="outline" 
                className="border-zinc-700 text-zinc-400 hover:text-white"
                onClick={() => refetch()}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filters and Search */}
        <Card className="bg-zinc-900/50 border-zinc-800 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  placeholder="Search by order #, customer name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-800/50 border-zinc-700 text-white"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] bg-zinc-800/50 border-zinc-700 text-white">
                    <Filter className="w-4 h-4 mr-2 text-zinc-500" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <Card className="bg-[#c8ff00]/10 border-[#c8ff00]/30 mb-6">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <p className="text-[#c8ff00] font-medium">
                  {selectedOrders.length} order{selectedOrders.length > 1 ? "s" : ""} selected
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-zinc-700 text-zinc-400"
                    onClick={() => setSelectedOrders([])}
                  >
                    Clear Selection
                  </Button>
                  <Button 
                    size="sm"
                    className="bg-[#c8ff00] text-black hover:bg-[#a8d600]"
                    onClick={() => setBulkModalOpen(true)}
                  >
                    Bulk Update Status
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orders Table */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Orders</CardTitle>
                <CardDescription className="text-zinc-400">
                  {totalOrders} total orders
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-[#c8ff00] border-t-transparent rounded-full" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">No orders found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left py-3 px-4">
                        <Checkbox 
                          checked={selectedOrders.length === orders.length && orders.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Order #</th>
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Customer</th>
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Status</th>
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Total</th>
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Tracking</th>
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">NFT</th>
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium text-sm">Date</th>
                      <th className="text-right py-3 px-4 text-zinc-400 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order: Order) => (
                      <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                        <td className="py-3 px-4">
                          <Checkbox 
                            checked={selectedOrders.includes(order.id)}
                            onCheckedChange={() => handleSelectOrder(order.id)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[#c8ff00] font-mono font-medium">
                            NEON-{order.orderNumber}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-white font-medium">{order.customerName}</p>
                            <p className="text-zinc-500 text-sm">{order.customerEmail}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-white font-medium">${parseFloat(order.totalAmount || '0').toFixed(2)}</span>
                        </td>
                        <td className="py-3 px-4">
                          {order.trackingNumber ? (
                            <span className="text-cyan-400 font-mono text-sm">{order.trackingNumber}</span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {order.nftImageUrl ? (
                            <a href={order.nftImageUrl} target="_blank" rel="noopener noreferrer">
                              <img 
                                src={order.nftImageUrl} 
                                alt="NFT" 
                                className="w-10 h-10 rounded border border-[#c8ff00]/30 object-cover hover:border-[#c8ff00] transition-colors"
                              />
                            </a>
                          ) : (
                            <div className="w-10 h-10 rounded border border-zinc-700 flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-zinc-600" />
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-zinc-400 text-sm">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/track-order?order=NEON-${order.orderNumber}`}>
                              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-zinc-400 hover:text-[#c8ff00]"
                              onClick={() => handleEditOrder(order)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-zinc-400 hover:text-amber-400"
                              onClick={() => {
                                setShippingOrderId(order.id);
                                setShippingOrderNumber(order.orderNumber);
                                setShippingModalOpen(true);
                              }}
                              title="Generate Shipping Label"
                            >
                              <Tag className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-zinc-800">
                <p className="text-zinc-400 text-sm">
                  Showing {((page - 1) * ordersPerPage) + 1} to {Math.min(page * ordersPerPage, totalOrders)} of {totalOrders}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-zinc-400"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-zinc-400 text-sm px-2">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-zinc-400"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Order Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              Edit Order NEON-{selectedOrder?.orderNumber}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Update order status and tracking information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Order Status</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as OrderStatus)}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Tracking Number</Label>
              <Input
                placeholder="Enter tracking number..."
                value={newTrackingNumber}
                onChange={(e) => setNewTrackingNumber(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 text-white"
              />
              <p className="text-zinc-500 text-xs">Leave empty if not yet shipped</p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              className="border-zinc-700 text-zinc-400"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-[#c8ff00] text-black hover:bg-[#a8d600]"
              onClick={handleSaveOrder}
              disabled={updateOrderMutation.isPending}
            >
              {updateOrderMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Update Modal */}
      <Dialog open={bulkModalOpen} onOpenChange={setBulkModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              Bulk Update {selectedOrders.length} Orders
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Update the status of all selected orders at once
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">New Status</Label>
              <Select value={bulkStatus} onValueChange={(v) => setBulkStatus(v as OrderStatus)}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              className="border-zinc-700 text-zinc-400"
              onClick={() => setBulkModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-[#c8ff00] text-black hover:bg-[#a8d600]"
              onClick={handleBulkUpdate}
              disabled={bulkUpdateMutation.isPending}
            >
              {bulkUpdateMutation.isPending ? "Updating..." : `Update ${selectedOrders.length} Orders`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shipping Label Modal */}
      {shippingOrderId && (
        <ShippingLabelModal
          open={shippingModalOpen}
          onOpenChange={setShippingModalOpen}
          orderId={shippingOrderId}
          orderNumber={shippingOrderNumber}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
