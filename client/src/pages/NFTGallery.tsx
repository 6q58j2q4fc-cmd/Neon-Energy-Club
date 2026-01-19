import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Gem, Crown, Star, Sparkles, Trophy, ArrowLeft, ExternalLink, Info, Share2, Twitter } from "lucide-react";
import Header from "@/components/Header";
import { trpc } from "@/lib/trpc";
import { SEO } from "@/components/SEO";

// Rarity colors and icons
const rarityConfig = {
  legendary: { color: "#FFD700", bgColor: "from-yellow-500/20 to-orange-500/20", icon: Crown, label: "LEGENDARY" },
  epic: { color: "#A855F7", bgColor: "from-purple-500/20 to-pink-500/20", icon: Gem, label: "EPIC" },
  rare: { color: "#3B82F6", bgColor: "from-blue-500/20 to-cyan-500/20", icon: Star, label: "RARE" },
  uncommon: { color: "#22C55E", bgColor: "from-green-500/20 to-emerald-500/20", icon: Sparkles, label: "UNCOMMON" },
  common: { color: "#94A3B8", bgColor: "from-slate-500/20 to-gray-500/20", icon: Trophy, label: "COMMON" },
};

export default function NFTGallery() {
  const [, setLocation] = useLocation();
  const nftsQuery = trpc.nft.gallery.useQuery({ limit: 100 });
  const statsQuery = trpc.nft.stats.useQuery();

  const nfts = nftsQuery.data || [];
  const stats = statsQuery.data || { totalMinted: 0, legendaryCount: 0, epicCount: 0, rareCount: 0, uncommonCount: 0, commonCount: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0620] via-[#1a0a2e] to-[#0d0620] text-white">
      <SEO 
        title="NEON Genesis NFT Gallery - Limited Edition Relaunch Collection"
        description="Explore the NEON Genesis NFT Collection. Each order receives a unique limited edition NFT with rarity based on order number. Earlier orders = more rare and valuable NFTs."
        keywords="NEON NFT, energy drink NFT, limited edition NFT, genesis collection, rare NFT, crypto collectibles"
        url="/nft-gallery"
      />
      
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <button 
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c8ff00]/10 border border-[#c8ff00]/30 mb-6">
              <Gem className="w-4 h-4 text-[#c8ff00]" />
              <span className="text-[#c8ff00] text-sm font-semibold">LIMITED EDITION COLLECTION</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black mb-4">
              <span className="text-white">NEON</span>{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c8ff00] via-[#00ffff] to-[#ff0080]">
                GENESIS
              </span>{" "}
              <span className="text-white">NFTs</span>
            </h1>
            
            <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
              Every order receives a unique limited edition NFT. The earlier you order, the more rare and valuable your NFT becomes. Token #1 is the rarest of all.
            </p>
          </div>

          {/* Rarity System Explanation */}
          <Card className="bg-gradient-to-br from-[#1a0a2e]/80 to-[#0d0620]/80 border border-[#c8ff00]/20 mb-12">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-[#c8ff00]" />
                <h2 className="text-xl font-bold text-white">How Rarity Works</h2>
              </div>
              
              <p className="text-white/70 mb-6">
                NFT rarity is determined by your order number. Lower order numbers = higher rarity = greater estimated value. 
                This creates a first-mover advantage where early supporters receive the most valuable collectibles.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { tier: "legendary", range: "#1 - #10", value: "$5,000 - $10,000" },
                  { tier: "epic", range: "#11 - #50", value: "$1,000 - $5,000" },
                  { tier: "rare", range: "#51 - #200", value: "$250 - $1,000" },
                  { tier: "uncommon", range: "#201 - #500", value: "$100 - $250" },
                  { tier: "common", range: "#501+", value: "$50 - $100" },
                ].map((item) => {
                  const config = rarityConfig[item.tier as keyof typeof rarityConfig];
                  const Icon = config.icon;
                  return (
                    <div 
                      key={item.tier}
                      className={`p-4 rounded-xl bg-gradient-to-br ${config.bgColor} border border-white/10`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-5 h-5" style={{ color: config.color }} />
                        <span className="text-sm font-bold" style={{ color: config.color }}>{config.label}</span>
                      </div>
                      <p className="text-white/80 text-sm">{item.range}</p>
                      <p className="text-white/60 text-xs mt-1">{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-12">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-3xl font-black text-[#c8ff00]">{stats.totalMinted}</p>
              <p className="text-sm text-white/60">Total Minted</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 text-center">
              <p className="text-3xl font-black text-yellow-400">{stats.legendaryCount}/10</p>
              <p className="text-sm text-white/60">Legendary</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-center">
              <p className="text-3xl font-black text-purple-400">{stats.epicCount}/40</p>
              <p className="text-sm text-white/60">Epic</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-center">
              <p className="text-3xl font-black text-blue-400">{stats.rareCount}/150</p>
              <p className="text-sm text-white/60">Rare</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 text-center">
              <p className="text-3xl font-black text-green-400">{stats.uncommonCount}/300</p>
              <p className="text-sm text-white/60">Uncommon</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-500/10 to-gray-500/10 border border-slate-500/20 text-center">
              <p className="text-3xl font-black text-slate-400">{stats.commonCount}</p>
              <p className="text-sm text-white/60">Common</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mb-12">
            <p className="text-white/70 mb-4">
              Want your own NEON Genesis NFT? Place an order now to secure your spot in the collection!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => setLocation("/shop")}
                className="bg-[#c8ff00] text-black hover:bg-[#a8d500] font-bold px-8"
              >
                Pre-Order Now
              </Button>
              <Button 
                onClick={() => setLocation("/crowdfund")}
                variant="outline"
                className="border-[#ff0080] text-[#ff0080] hover:bg-[#ff0080]/10 font-bold px-8"
              >
                Back the Relaunch
              </Button>
            </div>
          </div>

          {/* NFT Gallery Grid */}
          <h2 className="text-2xl font-bold text-white mb-6">
            {nfts.length > 0 ? "Minted NFTs" : "No NFTs Minted Yet"}
          </h2>

          {nfts.length === 0 ? (
            <Card className="bg-white/5 border border-white/10">
              <CardContent className="p-12 text-center">
                <Gem className="w-16 h-16 text-[#c8ff00]/50 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Be the First!</h3>
                <p className="text-white/60 mb-6">
                  No NFTs have been minted yet. Place an order now to receive the legendary Token #1 - 
                  the rarest and most valuable NFT in the entire collection!
                </p>
                <Button 
                  onClick={() => setLocation("/shop")}
                  className="bg-gradient-to-r from-[#c8ff00] to-[#00ffff] text-black font-bold"
                >
                  Claim Token #1
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {nfts.map((nft) => {
                const config = rarityConfig[nft.rarity as keyof typeof rarityConfig];
                const Icon = config.icon;
                return (
                  <Card 
                    key={nft.tokenId}
                    className={`bg-gradient-to-br ${config.bgColor} border-2 overflow-hidden transition-transform hover:scale-105`}
                    style={{ borderColor: config.color + "40" }}
                  >
                    <CardContent className="p-0">
                      {/* NFT Image Placeholder */}
                      <div 
                        className="aspect-square flex items-center justify-center relative"
                        style={{ 
                          background: `linear-gradient(135deg, ${config.color}20, ${config.color}05)`,
                        }}
                      >
                        <div className="text-center">
                          <Icon 
                            className="w-24 h-24 mx-auto mb-2" 
                            style={{ color: config.color }}
                          />
                          <span 
                            className="text-6xl font-black"
                            style={{ color: config.color }}
                          >
                            #{nft.tokenId}
                          </span>
                        </div>
                        
                        {/* Rarity Badge */}
                        <div 
                          className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold"
                          style={{ 
                            backgroundColor: config.color + "30",
                            color: config.color,
                            border: `1px solid ${config.color}50`
                          }}
                        >
                          {config.label}
                        </div>
                      </div>

                      {/* NFT Image - Show AI generated artwork if available */}
                      {nft.imageUrl && (
                        <div className="aspect-square overflow-hidden">
                          <img 
                            src={nft.imageUrl} 
                            alt={nft.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* NFT Details */}
                      <div className="p-4 bg-black/30">
                        <h3 className="font-bold text-white mb-1">{nft.name}</h3>
                        <p className="text-sm text-white/60 mb-2">
                          Owned by {nft.ownerName || "Anonymous"}
                        </p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-xs text-white/40">Est. Value</p>
                            <p className="text-lg font-bold" style={{ color: config.color }}>
                              ${Number(nft.estimatedValue || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-white/40">Status</p>
                            <p className="text-sm text-white/80 capitalize">
                              {nft.blockchainStatus}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setLocation(`/nft/${nft.tokenId}`)}
                            className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              const shareUrl = `${window.location.origin}/nft/${nft.tokenId}`;
                              const shareText = `Check out this ${nft.rarity.toUpperCase()} NEON Genesis NFT #${nft.tokenId}! Est. value: $${Number(nft.estimatedValue || 0).toLocaleString()}`;
                              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
                            }}
                            className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white text-xs"
                          >
                            <Twitter className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              const shareUrl = `${window.location.origin}/nft/${nft.tokenId}`;
                              navigator.clipboard.writeText(shareUrl);
                              alert('Link copied!');
                            }}
                            className="bg-white/10 hover:bg-white/20 text-white text-xs"
                          >
                            <Share2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/40 text-sm">
            NEON Genesis NFTs are digital collectibles tied to your order. 
            Future blockchain integration will enable trading and verification.
          </p>
        </div>
      </footer>
    </div>
  );
}
