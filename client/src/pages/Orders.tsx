import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HamburgerHeader from "@/components/HamburgerHeader";
import Footer from "@/components/Footer";
import { Package, Gem, ArrowLeft, Calendar, DollarSign, MapPin, Clock, CheckCircle, Truck, XCircle, AlertCircle, ExternalLink, Navigation, Twitter, Facebook, Share2 } from "lucide-react";
import { useEffect } from "react";
import { getLoginUrl } from "@/const";

const statusConfig = {
  pending: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10", label: "Pending", step: 1 },
  processing: { icon: Clock, color: "text-orange-400", bg: "bg-orange-400/10", label: "Processing", step: 2 },
  confirmed: { icon: CheckCircle, color: "text-blue-400", bg: "bg-blue-400/10", label: "Confirmed", step: 2 },
  shipped: { icon: Truck, color: "text-purple-400", bg: "bg-purple-400/10", label: "Shipped", step: 3 },
  in_transit: { icon: Truck, color: "text-[#00ffff]", bg: "bg-[#00ffff]/10", label: "In Transit", step: 3 },
  out_for_delivery: { icon: Truck, color: "text-[#c8ff00]", bg: "bg-[#c8ff00]/10", label: "Out for Delivery", step: 4 },
  delivered: { icon: CheckCircle, color: "text-[#c8ff00]", bg: "bg-[#c8ff00]/10", label: "Delivered", step: 5 },
  cancelled: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", label: "Cancelled", step: 0 },
  completed: { icon: CheckCircle, color: "text-[#c8ff00]", bg: "bg-[#c8ff00]/10", label: "Completed", step: 5 },
  refunded: { icon: AlertCircle, color: "text-orange-400", bg: "bg-orange-400/10", label: "Refunded", step: 0 },
};

// Simulated tracking data (in production, this would come from the API)
const getTrackingInfo = (orderId: number, status: string) => {
  const trackingNumbers: Record<number, string> = {};
  const carriers = ["UPS", "FedEx", "USPS", "DHL"];
  
  // Generate consistent tracking number based on order ID
  const trackingNumber = `NEON${String(orderId).padStart(8, '0')}${Math.abs(orderId * 17 % 10000).toString().padStart(4, '0')}`;
  const carrier = carriers[orderId % carriers.length];
  
  // Calculate estimated delivery based on order date
  const estimatedDays = status === 'shipped' || status === 'in_transit' ? 3 : status === 'out_for_delivery' ? 1 : 5;
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + estimatedDays);
  
  return {
    trackingNumber,
    carrier,
    estimatedDelivery,
    trackingUrl: carrier === 'UPS' ? `https://www.ups.com/track?tracknum=${trackingNumber}` :
                 carrier === 'FedEx' ? `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}` :
                 carrier === 'USPS' ? `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}` :
                 `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
  };
};

const TrackingTimeline = ({ status }: { status: string }) => {
  const currentStep = statusConfig[status as keyof typeof statusConfig]?.step || 1;
  const steps = [
    { label: "Order Placed", step: 1 },
    { label: "Processing", step: 2 },
    { label: "Shipped", step: 3 },
    { label: "Out for Delivery", step: 4 },
    { label: "Delivered", step: 5 },
  ];

  if (status === 'cancelled' || status === 'refunded') {
    return (
      <div className="flex items-center gap-2 text-red-400 text-sm">
        <XCircle className="w-4 h-4" />
        <span>Order {status}</span>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-white/10" />
        <div 
          className="absolute top-3 left-0 h-0.5 bg-[#c8ff00] transition-all duration-500"
          style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
        />
        
        {steps.map((s, idx) => (
          <div key={s.step} className="relative flex flex-col items-center z-10">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              s.step <= currentStep 
                ? 'bg-[#c8ff00] text-black' 
                : 'bg-white/10 text-white/40'
            }`}>
              {s.step <= currentStep ? <CheckCircle className="w-4 h-4" /> : s.step}
            </div>
            <span className={`text-[10px] mt-1 whitespace-nowrap ${
              s.step <= currentStep ? 'text-[#c8ff00]' : 'text-white/40'
            }`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: ordersData, isLoading: ordersLoading } = trpc.user.orders.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: nftsData, isLoading: nftsLoading } = trpc.user.nfts.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#c8ff00]/30 border-t-[#c8ff00] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const preorders = (ordersData && 'preorders' in ordersData ? ordersData.preorders : []) as Array<{
    id: number;
    name: string;
    email: string;
    phone: string | null;
    quantity: number;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    status: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
  const crowdfunding = (ordersData && 'crowdfunding' in ordersData ? ordersData.crowdfunding : []) as Array<{
    id: number;
    name: string;
    email: string;
    amount: number;
    rewardTier: string | null;
    status: string;
    message: string | null;
    createdAt: Date;
  }>;
  const nfts = nftsData || [];

  const totalOrders = preorders.length + crowdfunding.length;
  const isLoading = ordersLoading || nftsLoading;

  return (
    <div className="min-h-screen bg-black text-white">
      <HamburgerHeader variant="dark" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#c8ff00]/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#c8ff00]/10 rounded-full blur-[120px]" />
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-[#ff0080]/10 rounded-full blur-[100px]" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Back Button */}
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-white/60 hover:text-[#c8ff00] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </button>

          {/* Page Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My Orders</h1>
              <p className="text-white/60">Track your pre-orders, contributions, and NFTs</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setLocation("/shop")}
                className="bg-[#c8ff00] hover:bg-[#d4ff33] text-black"
              >
                <Package className="w-4 h-4 mr-2" />
                Shop Now
              </Button>
              <Button
                onClick={() => setLocation("/nft-gallery")}
                variant="outline"
                className="border-[#00ffff]/30 text-[#00ffff] hover:bg-[#00ffff]/10"
              >
                <Gem className="w-4 h-4 mr-2" />
                NFT Gallery
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-[#c8ff00]/10 to-transparent rounded-2xl p-5 border border-[#c8ff00]/20">
              <Package className="w-6 h-6 text-[#c8ff00] mb-2" />
              <p className="text-2xl font-bold text-white">{totalOrders}</p>
              <p className="text-sm text-white/60">Total Orders</p>
            </div>
            <div className="bg-gradient-to-br from-[#ff0080]/10 to-transparent rounded-2xl p-5 border border-[#ff0080]/20">
              <DollarSign className="w-6 h-6 text-[#ff0080] mb-2" />
              <p className="text-2xl font-bold text-white">{crowdfunding.length}</p>
              <p className="text-sm text-white/60">Contributions</p>
            </div>
            <div className="bg-gradient-to-br from-[#00ffff]/10 to-transparent rounded-2xl p-5 border border-[#00ffff]/20">
              <Gem className="w-6 h-6 text-[#00ffff] mb-2" />
              <p className="text-2xl font-bold text-white">{nfts.length}</p>
              <p className="text-sm text-white/60">NFTs Owned</p>
            </div>
            <div className="bg-gradient-to-br from-white/10 to-transparent rounded-2xl p-5 border border-white/20">
              <Calendar className="w-6 h-6 text-white/80 mb-2" />
              <p className="text-2xl font-bold text-white">{preorders.length}</p>
              <p className="text-sm text-white/60">Pre-Orders</p>
            </div>
          </div>
        </div>
      </section>

      {/* Orders Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-[#c8ff00]/30 border-t-[#c8ff00] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/60">Loading your orders...</p>
            </div>
          ) : totalOrders === 0 && nfts.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="py-16 text-center">
                <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Orders Yet</h3>
                <p className="text-white/60 mb-6">You haven't placed any orders or made any contributions yet.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => setLocation("/shop")}
                    className="bg-[#c8ff00] hover:bg-[#d4ff33] text-black"
                  >
                    Pre-Order Now
                  </Button>
                  <Button
                    onClick={() => setLocation("/crowdfund")}
                    variant="outline"
                    className="border-[#ff0080]/30 text-[#ff0080] hover:bg-[#ff0080]/10"
                  >
                    Back the Relaunch
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Pre-Orders Section */}
              {preorders.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#c8ff00]" />
                    Pre-Orders ({preorders.length})
                  </h2>
                  <div className="space-y-4">
                    {preorders.map((order) => {
                      const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
                      const StatusIcon = status.icon;
                      const tracking = getTrackingInfo(order.id, order.status);
                      const showTracking = ['shipped', 'in_transit', 'out_for_delivery', 'delivered'].includes(order.status);
                      
                      return (
                        <Card key={order.id} className="bg-white/5 border-white/10 hover:border-[#c8ff00]/30 transition-colors">
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-lg font-bold text-white">
                                    {order.quantity} Case{order.quantity > 1 ? "s" : ""} Pre-Order
                                  </span>
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                    <StatusIcon className="w-3 h-3" />
                                    {status.label}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-white/60">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(order.createdAt)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {order.city}, {order.state}
                                  </span>
                                </div>
                                
                                {/* Tracking Timeline */}
                                <TrackingTimeline status={order.status} />
                                
                                {/* Tracking Info */}
                                {showTracking && (
                                  <div className="mt-4 p-3 bg-black/30 rounded-lg border border-[#c8ff00]/20">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                      <div>
                                        <p className="text-xs text-white/40 mb-1">Tracking Number</p>
                                        <p className="text-sm font-mono text-[#00ffff]">{tracking.trackingNumber}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-white/40 mb-1">Carrier</p>
                                        <p className="text-sm text-white">{tracking.carrier}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-white/40 mb-1">Est. Delivery</p>
                                        <p className="text-sm text-[#c8ff00] font-semibold">{formatDate(tracking.estimatedDelivery)}</p>
                                      </div>
                                      <a
                                        href={tracking.trackingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-xs bg-[#c8ff00]/10 text-[#c8ff00] px-3 py-2 rounded-lg hover:bg-[#c8ff00]/20 transition-colors"
                                      >
                                        <Navigation className="w-3 h-3" />
                                        Track Package
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-[#c8ff00]">
                                  {formatCurrency(order.quantity * 49.99)}
                                </p>
                                <p className="text-sm text-white/40">
                                  {order.quantity * 24} cans total
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Crowdfunding Section */}
              {crowdfunding.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#ff0080]" />
                    Crowdfunding Contributions ({crowdfunding.length})
                  </h2>
                  <div className="space-y-4">
                    {crowdfunding.map((contribution) => {
                      const status = statusConfig[contribution.status as keyof typeof statusConfig] || statusConfig.pending;
                      const StatusIcon = status.icon;
                      return (
                        <Card key={contribution.id} className="bg-white/5 border-white/10 hover:border-[#ff0080]/30 transition-colors">
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-lg font-bold text-white">
                                    {contribution.rewardTier || "Contribution"}
                                  </span>
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                    <StatusIcon className="w-3 h-3" />
                                    {status.label}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-white/60">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(contribution.createdAt)}
                                  </span>
                                </div>
                                {contribution.message && (
                                  <p className="mt-2 text-sm text-white/40 italic">"{contribution.message}"</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-[#ff0080]">
                                  {formatCurrency(contribution.amount)}
                                </p>
                                <p className="text-sm text-white/40">Contribution</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* NFTs Section */}
              {nfts.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Gem className="w-5 h-5 text-[#00ffff]" />
                    My NFTs ({nfts.length})
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nfts.map((nft) => (
                      <Card 
                        key={nft.id} 
                        className="bg-white/5 border-white/10 hover:border-[#00ffff]/30 transition-colors cursor-pointer"
                        onClick={() => setLocation(`/nft/${nft.tokenId}`)}
                      >
                        <CardContent className="p-4">
                          {nft.imageUrl ? (
                            <img
                              src={nft.imageUrl}
                              alt={nft.name}
                              className="w-full aspect-square object-cover rounded-xl mb-4"
                            />
                          ) : (
                            <div className="w-full aspect-square bg-gradient-to-br from-[#c8ff00]/20 to-[#00ffff]/20 rounded-xl mb-4 flex items-center justify-center">
                              <Gem className="w-16 h-16 text-white/20" />
                            </div>
                          )}
                          <h3 className="font-bold text-white mb-1">{nft.name}</h3>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                              nft.rarity === "legendary" ? "bg-yellow-400/20 text-yellow-400" :
                              nft.rarity === "epic" ? "bg-purple-400/20 text-purple-400" :
                              nft.rarity === "rare" ? "bg-blue-400/20 text-blue-400" :
                              nft.rarity === "uncommon" ? "bg-green-400/20 text-green-400" :
                              "bg-gray-400/20 text-gray-400"
                            }`}>
                              {nft.rarity}
                            </span>
                            {nft.estimatedValue && (
                              <span className="text-sm text-[#c8ff00]">
                                ~{formatCurrency(Number(nft.estimatedValue))}
                              </span>
                            )}
                          </div>
                          {/* Share Buttons */}
                          <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                const shareUrl = `${window.location.origin}/nft/${nft.tokenId}`;
                                const shareText = `Check out my ${nft.rarity.toUpperCase()} NEON Genesis NFT #${nft.tokenId}! Est. value: ${formatCurrency(Number(nft.estimatedValue || 0))}`;
                                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
                              }}
                              className="flex-1 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white text-xs"
                            >
                              <Twitter className="w-3 h-3 mr-1" />
                              Tweet
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                const shareUrl = `${window.location.origin}/nft/${nft.tokenId}`;
                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
                              }}
                              className="flex-1 bg-[#4267B2] hover:bg-[#365899] text-white text-xs"
                            >
                              <Facebook className="w-3 h-3 mr-1" />
                              Share
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                const shareUrl = `${window.location.origin}/nft/${nft.tokenId}`;
                                navigator.clipboard.writeText(shareUrl);
                                alert('NFT link copied to clipboard!');
                              }}
                              className="bg-white/10 hover:bg-white/20 text-white text-xs"
                            >
                              <Share2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
