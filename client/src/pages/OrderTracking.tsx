import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ExternalLink,
  Share2,
  Download,
  AlertCircle,
  Sparkles,
  ArrowLeft
} from "lucide-react";

// Social share icons
const TwitterIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState("");
  const [searchedOrderNumber, setSearchedOrderNumber] = useState("");
  
  const { data, isLoading, error } = trpc.preorder.track.useQuery(
    { orderNumber: searchedOrderNumber },
    { enabled: !!searchedOrderNumber }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      setSearchedOrderNumber(orderNumber.trim());
    }
  };

  const handleShare = (platform: string) => {
    if (!data?.order) return;
    
    const shareUrl = `${window.location.origin}/track-order?order=${data.order.orderNumber}`;
    const shareText = `Check out my NEON Energy NFT #${data.order.orderNumber}! 🔥⚡`;
    
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
    };
    
    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleDownloadNft = async () => {
    if (!data?.order?.nft?.imageUrl) return;
    
    try {
      const response = await fetch(data.order.nft.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NEON-NFT-${data.order.orderNumber}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download NFT:', err);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black';
      case 'Epic': return 'bg-gradient-to-r from-purple-500 to-violet-600 text-white';
      case 'Rare': return 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white';
      case 'Uncommon': return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
      default: return 'bg-zinc-600 text-white';
    }
  };

  const getStatusIcon = (status: string, completed: boolean) => {
    if (completed) {
      return <CheckCircle2 className="w-5 h-5 text-[#c8ff00]" />;
    }
    switch (status) {
      case 'confirmed': return <Package className="w-5 h-5 text-zinc-500" />;
      case 'processing': return <Clock className="w-5 h-5 text-zinc-500" />;
      case 'shipped': return <Truck className="w-5 h-5 text-zinc-500" />;
      case 'delivered': return <CheckCircle2 className="w-5 h-5 text-zinc-500" />;
      default: return <Clock className="w-5 h-5 text-zinc-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#c8ff00]/10 via-transparent to-transparent" />
        <div className="container py-16 relative">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#c8ff00] transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c8ff00]/10 border border-[#c8ff00]/20 mb-6">
              <Package className="w-4 h-4 text-[#c8ff00]" />
              <span className="text-[#c8ff00] text-sm font-medium">Order Tracking</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Track Your <span className="text-[#c8ff00]">Order</span>
            </h1>
            <p className="text-zinc-400 text-lg mb-8">
              Enter your order number to check shipping status and view your exclusive NFT artwork
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  type="text"
                  placeholder="Enter order number (e.g., NEON-00001)"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="pl-10 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 h-12"
                />
              </div>
              <Button 
                type="submit" 
                className="bg-[#c8ff00] text-black hover:bg-[#d4ff33] h-12 px-6"
                disabled={isLoading}
              >
                {isLoading ? "Searching..." : "Track"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container pb-16">
        {error && (
          <Card className="max-w-2xl mx-auto bg-red-950/20 border-red-900/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <p>An error occurred while searching. Please try again.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {searchedOrderNumber && data && !data.found && (
          <Card className="max-w-2xl mx-auto bg-zinc-900/50 border-zinc-800">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Package className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Order Not Found</h3>
                <p className="text-zinc-400">
                  We couldn't find an order with number "{searchedOrderNumber}". 
                  Please check the order number and try again.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {data?.found && data.order && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Order Status Card */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      Order #{data.order.orderNumber}
                      <Badge variant="outline" className="border-[#c8ff00]/50 text-[#c8ff00]">
                        {data.order.status.charAt(0).toUpperCase() + data.order.status.slice(1)}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                      Placed on {new Date(data.order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-400">Total</p>
                    <p className="text-2xl font-bold text-[#c8ff00]">${data.order.total.toFixed(2)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Status Timeline */}
                <div className="mb-8">
                  <h4 className="text-sm font-medium text-zinc-400 mb-4">Order Status</h4>
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-zinc-800" />
                    <div 
                      className="absolute left-[22px] top-0 w-0.5 bg-[#c8ff00] transition-all duration-500"
                      style={{ 
                        height: `${(data.order.statusTimeline.filter((s: { completed: boolean }) => s.completed).length / data.order.statusTimeline.length) * 100}%` 
                      }}
                    />
                    
                    <div className="space-y-6">
                      {data.order.statusTimeline.map((step: { status: string; label: string; completed: boolean; date: Date | string | null }, index: number) => (
                        <div key={step.status} className="flex items-start gap-4 relative">
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center z-10 ${
                            step.completed ? 'bg-[#c8ff00]/20 border-2 border-[#c8ff00]' : 'bg-zinc-800 border-2 border-zinc-700'
                          }`}>
                            {getStatusIcon(step.status, step.completed)}
                          </div>
                          <div className="flex-1 pt-2">
                            <p className={`font-medium ${step.completed ? 'text-white' : 'text-zinc-500'}`}>
                              {step.label}
                            </p>
                            {step.date && (
                              <p className="text-sm text-zinc-500">
                                {new Date(step.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pre-order Notice */}
                <div className="bg-[#c8ff00]/5 border border-[#c8ff00]/20 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#c8ff00] mt-0.5" />
                    <div>
                      <p className="text-[#c8ff00] font-medium">Pre-Order Status</p>
                      <p className="text-zinc-400 text-sm mt-1">
                        {data.order.estimatedDelivery}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tracking Info */}
                {data.order.trackingNumber && (
                  <div className="bg-zinc-800/50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-[#c8ff00]" />
                        <div>
                          <p className="text-sm text-zinc-400">Tracking Number</p>
                          <p className="text-white font-mono">{data.order.trackingNumber}</p>
                        </div>
                      </div>
                      {data.order.trackingUrl && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-[#c8ff00]/50 text-[#c8ff00] hover:bg-[#c8ff00]/10"
                          onClick={() => data.order.trackingUrl && window.open(data.order.trackingUrl, '_blank')}
                        >
                          Track Package
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Shipping Address */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Shipping Address
                    </h4>
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                      <p className="text-white">{data.order.customerName}</p>
                      <p className="text-zinc-400 text-sm mt-1">
                        {data.order.shippingAddress.address}<br />
                        {data.order.shippingAddress.city}, {data.order.shippingAddress.state} {data.order.shippingAddress.postalCode}<br />
                        {data.order.shippingAddress.country}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Order Details
                    </h4>
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">NEON Energy Drink</span>
                        <span className="text-white">x{data.order.quantity}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-700">
                        <span className="text-zinc-400">Total</span>
                        <span className="text-[#c8ff00] font-bold">${data.order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* NFT Card */}
            {data.order.nft && (
              <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#c8ff00]" />
                    Your Exclusive NFT
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    A unique digital collectible generated just for your order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* NFT Image */}
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-800">
                      {data.order.nft.imageUrl ? (
                        <img 
                          src={data.order.nft.imageUrl} 
                          alt={`NEON NFT #${data.order.orderNumber}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <Sparkles className="w-12 h-12 text-[#c8ff00] mx-auto mb-3 animate-pulse" />
                            <p className="text-zinc-400">Generating your NFT...</p>
                          </div>
                        </div>
                      )}
                      {/* Rarity Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge className={`${getRarityColor(data.order.nft.rarity)} font-bold`}>
                          {data.order.nft.rarity}
                        </Badge>
                      </div>
                    </div>

                    {/* NFT Details */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          NEON NFT #{data.order.nft.orderNumber}
                        </h3>
                        <p className="text-zinc-400 mt-1">
                          Exclusive digital collectible from the NEON Energy pre-launch
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-zinc-800">
                          <span className="text-zinc-400">Rarity</span>
                          <Badge className={getRarityColor(data.order.nft.rarity)}>
                            {data.order.nft.rarity}
                          </Badge>
                        </div>
                        <div className="flex justify-between py-2 border-b border-zinc-800">
                          <span className="text-zinc-400">Minting Status</span>
                          <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                            {data.order.nft.mintingStatus === 'pending' ? 'Pending' : data.order.nft.mintingStatus}
                          </Badge>
                        </div>
                        <div className="flex justify-between py-2 border-b border-zinc-800">
                          <span className="text-zinc-400">Order Number</span>
                          <span className="text-white font-mono">{data.order.orderNumber}</span>
                        </div>
                      </div>

                      {/* Minting Notice */}
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                        <p className="text-yellow-500 text-sm">
                          {data.order.nft.mintingNotice}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="outline"
                          className="flex-1 border-zinc-700 text-white hover:bg-zinc-800"
                          onClick={() => handleShare('twitter')}
                        >
                          <TwitterIcon />
                          <span className="ml-2">Share</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-zinc-700 text-white hover:bg-zinc-800"
                          onClick={() => handleShare('facebook')}
                        >
                          <FacebookIcon />
                          <span className="ml-2">Share</span>
                        </Button>
                        {data.order.nft.imageUrl && (
                          <Button
                            className="flex-1 bg-[#c8ff00] text-black hover:bg-[#d4ff33]"
                            onClick={handleDownloadNft}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SEC Disclaimer */}
                  <div className="mt-6 pt-6 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      <strong>Legal Notice:</strong> This NFT is provided as a complimentary gift with your purchase and is not sold separately. 
                      It does not represent an investment, security, or financial instrument. NEON Energy makes no guarantees regarding 
                      future value. By accepting this NFT, you acknowledge that it is a promotional item with no guaranteed monetary worth. 
                      <Link href="/nft-disclosure" className="text-[#c8ff00] hover:underline ml-1">
                        View full NFT disclosure →
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Help Section */}
        {!searchedOrderNumber && (
          <div className="max-w-2xl mx-auto mt-12">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Need Help Finding Your Order?</h3>
                <ul className="space-y-3 text-zinc-400">
                  <li className="flex items-start gap-3">
                    <span className="text-[#c8ff00]">1.</span>
                    Check your email for the order confirmation from NEON Energy
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#c8ff00]">2.</span>
                    Your order number starts with "NEON-" followed by 5 digits (e.g., NEON-00001)
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#c8ff00]">3.</span>
                    You can also enter just the number without the prefix (e.g., 00001 or 1)
                  </li>
                </ul>
                <div className="mt-6 pt-6 border-t border-zinc-800">
                  <p className="text-zinc-400 text-sm">
                    Still can't find your order? Contact us at{" "}
                    <a href="mailto:support@neonenergy.com" className="text-[#c8ff00] hover:underline">
                      support@neonenergy.com
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
