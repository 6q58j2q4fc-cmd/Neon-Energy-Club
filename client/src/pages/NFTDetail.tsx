import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Twitter, Facebook, Linkedin, Link2, Share2, Gem, Crown, Star, Sparkles, Circle } from "lucide-react";

import Header from "@/components/Header";


const rarityConfig: Record<string, { color: string; bgColor: string; icon: React.ElementType; gradient: string }> = {
  legendary: { color: "text-yellow-400", bgColor: "bg-yellow-500/20", icon: Crown, gradient: "from-yellow-500 via-orange-500 to-red-500" },
  epic: { color: "text-purple-400", bgColor: "bg-purple-500/20", icon: Gem, gradient: "from-purple-500 via-pink-500 to-purple-500" },
  rare: { color: "text-blue-400", bgColor: "bg-blue-500/20", icon: Star, gradient: "from-blue-500 via-cyan-500 to-blue-500" },
  uncommon: { color: "text-green-400", bgColor: "bg-green-500/20", icon: Sparkles, gradient: "from-green-500 via-emerald-500 to-green-500" },
  common: { color: "text-gray-400", bgColor: "bg-gray-500/20", icon: Circle, gradient: "from-gray-500 via-gray-400 to-gray-500" },
};

export default function NFTDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/nft/:tokenId");

  
  const tokenId = params?.tokenId ? parseInt(params.tokenId) : 0;
  
  const { data: nft, isLoading } = trpc.nft.getByTokenId.useQuery(
    { tokenId },
    { enabled: !!tokenId }
  );

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = nft ? `Check out my ${nft.rarity.toUpperCase()} NEON Genesis NFT #${nft.tokenId}!` : "NEON Genesis NFT";
  const shareDescription = nft ? `I own ${nft.name} - a limited edition NFT from the NEON Energy Drink Relaunch Collection. Estimated value: $${Number(nft.estimatedValue).toLocaleString()}` : "";

  const handleShare = (platform: string) => {
    let url = "";
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);
    const encodedDesc = encodeURIComponent(shareDescription);

    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
    }

    if (url) {
      window.open(url, "_blank", "width=600,height=400");
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    } catch {
      alert("Failed to copy. Please copy the URL manually.");
    }
  };

  if (!match) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Header />
        <div className="pt-24 flex items-center justify-center">
          <div className="animate-pulse text-[#c8ff00]">Loading NFT...</div>
        </div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Header />
        <div className="pt-24 container mx-auto px-4">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-white mb-4">NFT Not Found</h1>
            <p className="text-white/60 mb-8">This NFT doesn't exist or hasn't been minted yet.</p>
            <Button onClick={() => setLocation("/nft-gallery")} className="bg-[#c8ff00] text-black hover:bg-[#a8d500]">
              View Gallery
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const config = rarityConfig[nft.rarity] || rarityConfig.common;
  const RarityIcon = config.icon;

  // Set document title
  if (typeof document !== "undefined") {
    document.title = `${nft.name} | NEON Genesis NFT Collection`;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={() => setLocation("/nft-gallery")}
            className="flex items-center gap-2 text-white/60 hover:text-[#c8ff00] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Gallery
          </button>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* NFT Image */}
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-20 blur-3xl`} />
              <Card className="relative bg-black/40 border-white/10 overflow-hidden">
                <CardContent className="p-0">
                  {nft.imageUrl ? (
                    <img
                      src={nft.imageUrl}
                      alt={nft.name}
                      className="w-full aspect-square object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a] flex items-center justify-center">
                      <div className="text-center">
                        <RarityIcon className={`w-24 h-24 mx-auto mb-4 ${config.color}`} />
                        <p className="text-6xl font-black text-[#c8ff00]">#{nft.tokenId}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* NFT Details */}
            <div className="space-y-6">
              {/* Rarity Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.bgColor} border border-white/10`}>
                <RarityIcon className={`w-5 h-5 ${config.color}`} />
                <span className={`font-bold uppercase tracking-wider ${config.color}`}>
                  {nft.rarity}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl lg:text-5xl font-black text-white">
                {nft.name}
              </h1>

              {/* Description */}
              <p className="text-lg text-white/70 leading-relaxed">
                {nft.description}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-black/40 border-white/10">
                  <CardContent className="p-4">
                    <p className="text-sm text-white/50 mb-1">Token ID</p>
                    <p className="text-2xl font-bold text-[#c8ff00]">#{nft.tokenId}</p>
                  </CardContent>
                </Card>
                <Card className="bg-black/40 border-white/10">
                  <CardContent className="p-4">
                    <p className="text-sm text-white/50 mb-1">Estimated Value</p>
                    <p className="text-2xl font-bold text-[#00ffff]">
                      ${Number(nft.estimatedValue).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-black/40 border-white/10">
                  <CardContent className="p-4">
                    <p className="text-sm text-white/50 mb-1">Owner</p>
                    <p className="text-lg font-semibold text-white truncate">
                      {nft.ownerName || "Anonymous"}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-black/40 border-white/10">
                  <CardContent className="p-4">
                    <p className="text-sm text-white/50 mb-1">Minted</p>
                    <p className="text-lg font-semibold text-white">
                      {new Date(nft.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Share Section */}
              <Card className="bg-black/40 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Share2 className="w-5 h-5 text-[#c8ff00]" />
                    <h3 className="text-lg font-bold text-white">Share This NFT</h3>
                  </div>
                  <p className="text-white/60 text-sm mb-4">
                    Show off your rare collectible to friends and followers!
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => handleShare("twitter")}
                      className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
                    >
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </Button>
                    <Button
                      onClick={() => handleShare("facebook")}
                      className="bg-[#4267B2] hover:bg-[#365899] text-white"
                    >
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </Button>
                    <Button
                      onClick={() => handleShare("linkedin")}
                      className="bg-[#0077B5] hover:bg-[#006097] text-white"
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Button>
                    <Button
                      onClick={copyLink}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Link2 className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => setLocation("/shop")}
                  className="bg-[#c8ff00] text-black hover:bg-[#a8d500] font-bold"
                >
                  Get Your Own NFT
                </Button>
                <Button
                  onClick={() => setLocation("/nft-gallery")}
                  variant="outline"
                  className="border-[#c8ff00]/50 text-[#c8ff00] hover:bg-[#c8ff00]/10"
                >
                  View Full Gallery
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
