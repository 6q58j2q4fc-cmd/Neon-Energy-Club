import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  ArrowLeft,
  Image as ImageIcon,
  Download,
  Share2,
  ExternalLink,
  Sparkles,
  Calendar,
  MapPin
} from "lucide-react";
import { getLoginUrl } from "@/const";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: CheckCircle },
  processing: { label: "Processing", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: Package },
  shipped: { label: "Shipped", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle },
};

export default function MyOrders() {
  const { user, loading } = useAuth();
  const [selectedNft, setSelectedNft] = useState<{
    imageUrl: string;
    nftId: string;
    orderNumber: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState("orders");

  const { data: ordersData, isLoading } = trpc.preorder.getMyOrders.useQuery(
    undefined,
    { enabled: !!user }
  );

  const orders = ordersData?.orders || [];
  const nfts = orders.filter(o => o.nftImageUrl).map(o => ({
    imageUrl: o.nftImageUrl!,
    nftId: o.nftId || `NEON-NFT-${String(o.id).padStart(5, '0')}`,
    orderNumber: `NEON-${String(o.id).padStart(5, '0')}`,
    createdAt: o.createdAt,
    status: o.status,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1a1a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#c8ff00] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a1a1a] flex items-center justify-center">
        <Card className="bg-zinc-900/50 border-zinc-800 max-w-md">
          <CardContent className="pt-6 text-center">
            <Package className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Sign In Required</h2>
            <p className="text-zinc-400 mb-6">Please sign in to view your orders and NFT collection.</p>
            <a href={getLoginUrl()}>
              <Button className="bg-[#c8ff00] text-black hover:bg-[#b8ef00]">
                Sign In
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1a1a]">
      {/* Header */}
      <div className="bg-zinc-900/50 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Package className="w-6 h-6 text-[#c8ff00]" />
                  My Orders & NFTs
                </h1>
                <p className="text-zinc-400 text-sm">View your order history and NFT collection</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1">
            <TabsTrigger 
              value="orders" 
              className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black"
            >
              <Package className="w-4 h-4 mr-2" />
              Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger 
              value="nfts" 
              className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              NFT Gallery ({nfts.length})
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-[#c8ff00] border-t-transparent rounded-full" />
              </div>
            ) : orders.length === 0 ? (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="pt-12 pb-12 text-center">
                  <Package className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Orders Yet</h3>
                  <p className="text-zinc-400 mb-6">You haven't placed any orders yet. Start your NEON journey today!</p>
                  <Link href="/products">
                    <Button className="bg-[#c8ff00] text-black hover:bg-[#b8ef00]">
                      Browse Products
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                  const StatusIcon = statusConfig.icon;
                  const orderNumber = `NEON-${String(order.id).padStart(5, '0')}`;
                  
                  return (
                    <Card key={order.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* NFT Preview */}
                          {order.nftImageUrl && (
                            <div 
                              className="w-full lg:w-32 h-32 rounded-lg overflow-hidden bg-zinc-800 cursor-pointer group relative"
                              onClick={() => setSelectedNft({
                                imageUrl: order.nftImageUrl!,
                                nftId: order.nftId || `NEON-NFT-${String(order.id).padStart(5, '0')}`,
                                orderNumber,
                              })}
                            >
                              <img 
                                src={order.nftImageUrl} 
                                alt="Order NFT" 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          )}

                          {/* Order Details */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-white">{orderNumber}</h3>
                                <p className="text-zinc-400 text-sm flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                              <Badge className={`${statusConfig.color} border`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-zinc-500">Quantity</p>
                                <p className="text-white font-medium">{order.quantity} case{order.quantity > 1 ? 's' : ''}</p>
                              </div>
                              <div>
                                <p className="text-zinc-500">Total</p>
                                <p className="text-[#c8ff00] font-bold">${(order.quantity * 30).toFixed(2)}</p>
                              </div>
                              {order.trackingNumber && (
                                <div className="col-span-2">
                                  <p className="text-zinc-500">Tracking</p>
                                  <p className="text-white font-mono text-xs">{order.trackingNumber}</p>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                              <MapPin className="w-3 h-3" />
                              {order.city}, {order.state} {order.postalCode}
                            </div>

                            <div className="flex gap-2 pt-2">
                              <Link href={`/track-order?order=${orderNumber}`}>
                                <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:text-white">
                                  <Truck className="w-4 h-4 mr-2" />
                                  Track Order
                                </Button>
                              </Link>
                              {order.nftImageUrl && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10"
                                  onClick={() => setSelectedNft({
                                    imageUrl: order.nftImageUrl!,
                                    nftId: order.nftId || `NEON-NFT-${String(order.id).padStart(5, '0')}`,
                                    orderNumber,
                                  })}
                                >
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  View NFT
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* NFT Gallery Tab */}
          <TabsContent value="nfts" className="space-y-6">
            {nfts.length === 0 ? (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="pt-12 pb-12 text-center">
                  <Sparkles className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No NFTs Yet</h3>
                  <p className="text-zinc-400 mb-6">Place an order to receive your exclusive NEON NFT artwork!</p>
                  <Link href="/products">
                    <Button className="bg-[#c8ff00] text-black hover:bg-[#b8ef00]">
                      Shop Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="bg-gradient-to-r from-[#c8ff00]/10 to-purple-500/10 border border-[#c8ff00]/20 rounded-lg p-4">
                  <p className="text-zinc-300 text-sm">
                    <Sparkles className="w-4 h-4 inline mr-2 text-[#c8ff00]" />
                    Your NFT collection will be minted on the blockchain after the 90-day pre-launch period ends and crowdfunding goals are met.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {nfts.map((nft, index) => (
                    <Card 
                      key={index}
                      className="bg-zinc-900/50 border-zinc-800 overflow-hidden cursor-pointer group hover:border-[#c8ff00]/50 transition-all"
                      onClick={() => setSelectedNft({
                        imageUrl: nft.imageUrl,
                        nftId: nft.nftId,
                        orderNumber: nft.orderNumber,
                      })}
                    >
                      <div className="aspect-square relative overflow-hidden">
                        <img 
                          src={nft.imageUrl} 
                          alt={nft.nftId}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                          <p className="text-white font-mono text-xs">{nft.nftId}</p>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <p className="text-zinc-400 text-xs">{nft.orderNumber}</p>
                        <p className="text-zinc-500 text-xs">
                          {new Date(nft.createdAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* NFT Detail Modal */}
      <Dialog open={!!selectedNft} onOpenChange={() => setSelectedNft(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#c8ff00]" />
              {selectedNft?.nftId}
            </DialogTitle>
          </DialogHeader>
          
          {selectedNft && (
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-zinc-800">
                <img 
                  src={selectedNft.imageUrl} 
                  alt={selectedNft.nftId}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:text-white"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = selectedNft.imageUrl;
                    a.download = `${selectedNft.nftId}.png`;
                    a.click();
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                  onClick={() => {
                    const text = `Check out my exclusive NEON Energy NFT! ${selectedNft.nftId} 🔋⚡ #NEONEnergy #NFT`;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(selectedNft.imageUrl)}`, '_blank');
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share on X
                </Button>
                <Link href={`/track-order?order=${selectedNft.orderNumber}`}>
                  <Button
                    variant="outline"
                    className="border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Order
                  </Button>
                </Link>
              </div>

              <div className="bg-zinc-800/50 rounded-lg p-4 text-sm text-zinc-400">
                <p className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#c8ff00]" />
                  <span className="text-white font-medium">Minting Status: Pending</span>
                </p>
                <p>
                  This NFT will be minted on the blockchain after the 90-day pre-launch period ends 
                  and crowdfunding goals are met. You will receive notification when minting is complete.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
