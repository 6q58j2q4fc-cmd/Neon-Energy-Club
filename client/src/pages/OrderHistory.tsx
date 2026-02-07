import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  DollarSign,
  MapPin,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";

// Order status type
type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

// Mock order data (will be replaced with real data from API)
const mockOrders = [
  {
    id: "ORD-2026-001",
    date: new Date("2026-01-15").toISOString(),
    status: "delivered" as OrderStatus,
    total: 149.97,
    items: [
      { name: "NEON Original (24-pack)", quantity: 2, price: 59.99, image: "/neon-can-transparent.png" },
      { name: "NEON Pink (12-pack)", quantity: 1, price: 29.99, image: "/neon-pink-can-transparent.png" },
    ],
    shippingAddress: {
      name: "John Doe",
      street: "123 Energy Lane",
      city: "Miami",
      state: "FL",
      zip: "33101",
      country: "USA"
    },
    trackingNumber: "1Z999AA10123456784",
    carrier: "UPS"
  },
  {
    id: "ORD-2026-002",
    date: new Date("2026-01-28").toISOString(),
    status: "shipped" as OrderStatus,
    total: 59.99,
    items: [
      { name: "NEON Original (24-pack)", quantity: 1, price: 59.99, image: "/neon-can-transparent.png" },
    ],
    shippingAddress: {
      name: "John Doe",
      street: "123 Energy Lane",
      city: "Miami",
      state: "FL",
      zip: "33101",
      country: "USA"
    },
    trackingNumber: "1Z999AA10123456785",
    carrier: "UPS"
  },
  {
    id: "ORD-2026-003",
    date: new Date("2026-01-30").toISOString(),
    status: "processing" as OrderStatus,
    total: 89.98,
    items: [
      { name: "NEON Pink (24-pack)", quantity: 1, price: 64.99, image: "/neon-pink-can-transparent.png" },
      { name: "NEON Starter Pack", quantity: 1, price: 24.99, image: "/neon-can-transparent.png" },
    ],
    shippingAddress: {
      name: "John Doe",
      street: "123 Energy Lane",
      city: "Miami",
      state: "FL",
      zip: "33101",
      country: "USA"
    },
    trackingNumber: null,
    carrier: null
  },
];

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof Clock; bgColor: string }> = {
  pending: { label: "Pending", color: "text-yellow-400", icon: Clock, bgColor: "bg-yellow-400/20" },
  processing: { label: "Processing", color: "text-blue-400", icon: RefreshCw, bgColor: "bg-blue-400/20" },
  shipped: { label: "Shipped", color: "text-purple-400", icon: Truck, bgColor: "bg-purple-400/20" },
  delivered: { label: "Delivered", color: "text-green-400", icon: CheckCircle, bgColor: "bg-green-400/20" },
  cancelled: { label: "Cancelled", color: "text-red-400", icon: Clock, bgColor: "bg-red-400/20" },
};

export default function OrderHistory() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter orders based on status and search
  const filteredOrders = mockOrders.filter(order => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0318] via-[#1a0a2e] to-[#0a0318] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#c8ff00] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0318] via-[#1a0a2e] to-[#0a0318] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#c8ff00]/20 flex items-center justify-center">
            <Package className="w-10 h-10 text-[#c8ff00]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Sign In to View Orders</h1>
          <p className="text-white/60 mb-6">Please sign in to view your order history and track shipments.</p>
          <Link href="/join">
            <Button className="bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold">
              Sign In / Create Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0318] via-[#1a0a2e] to-[#0a0318] pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-[#c8ff00]/20 flex items-center justify-center">
              <Package className="w-6 h-6 text-[#c8ff00]" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Order History</h1>
              <p className="text-white/60">Track and manage your NEON orders</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search orders by ID or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#c8ff00]/50"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === "all"
                  ? "bg-[#c8ff00] text-black"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              All
            </button>
            {(Object.keys(statusConfig) as OrderStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  statusFilter === status
                    ? `${statusConfig[status].bgColor} ${statusConfig[status].color}`
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                {statusConfig[status].label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <Package className="w-10 h-10 text-white/30" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No Orders Found</h2>
            <p className="text-white/60 mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "You haven't placed any orders yet"}
            </p>
            <Link href="/shop">
              <Button className="bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold">
                <Zap className="w-4 h-4 mr-2" />
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon;
              const isExpanded = expandedOrder === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                >
                  {/* Order Header */}
                  <div
                    className="p-4 md:p-6 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${statusConfig[order.status].bgColor} flex items-center justify-center`}>
                          <StatusIcon className={`w-6 h-6 ${statusConfig[order.status].color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-white">{order.id}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig[order.status].bgColor} ${statusConfig[order.status].color}`}>
                              {statusConfig[order.status].label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-white/60">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(order.date, "MMM d, yyyy")}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              ${order.total.toFixed(2)}
                            </span>
                            <span>{order.items.length} item{order.items.length > 1 ? "s" : ""}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {order.trackingNumber && (
                          <a
                            href={`https://www.ups.com/track?tracknum=${order.trackingNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-4 py-2 bg-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors flex items-center gap-2"
                          >
                            <Truck className="w-4 h-4" />
                            Track Package
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <button className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-white" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-white/10 p-4 md:p-6 bg-white/[0.02]">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Items */}
                        <div>
                          <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Package className="w-4 h-4 text-[#c8ff00]" />
                            Order Items
                          </h4>
                          <div className="space-y-3">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#c8ff00]/20 to-[#00ffff]/20 flex items-center justify-center">
                                  <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-white">{item.name}</p>
                                  <p className="text-sm text-white/60">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-bold text-[#c8ff00]">${item.price.toFixed(2)}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping Info */}
                        <div>
                          <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#c8ff00]" />
                            Shipping Address
                          </h4>
                          <div className="p-4 bg-white/5 rounded-xl">
                            <p className="font-medium text-white">{order.shippingAddress.name}</p>
                            <p className="text-white/60">{order.shippingAddress.street}</p>
                            <p className="text-white/60">
                              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                            </p>
                            <p className="text-white/60">{order.shippingAddress.country}</p>
                          </div>

                          {order.trackingNumber && (
                            <div className="mt-4 p-4 bg-white/5 rounded-xl">
                              <p className="text-sm text-white/60 mb-1">Tracking Number</p>
                              <p className="font-mono text-white">{order.trackingNumber}</p>
                              <p className="text-sm text-white/60 mt-1">Carrier: {order.carrier}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="mt-6 pt-6 border-t border-white/10">
                        <div className="flex justify-between items-center">
                          <div className="text-white/60">
                            <p>Subtotal: ${order.total.toFixed(2)}</p>
                            <p>Shipping: Free</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white/60 text-sm">Order Total</p>
                            <p className="text-2xl font-black text-[#c8ff00]">${order.total.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 p-6 bg-gradient-to-r from-[#c8ff00]/10 to-[#00ffff]/10 rounded-2xl border border-[#c8ff00]/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-lg">Need Help with an Order?</h3>
              <p className="text-white/60">Our support team is here to assist you 24/7</p>
            </div>
            <Link href="/faq">
              <Button variant="outline" className="border-[#c8ff00] text-[#c8ff00] hover:bg-[#c8ff00]/10">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
