import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Sparkles, Clock, AlertCircle, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NftPreviewProps {
  orderId: number;
  nftId?: string;
  showMintingNotice?: boolean;
}

export function NftPreview({ orderId, nftId, showMintingNotice = true }: NftPreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  
  // Poll for NFT data until it's available
  const { data, isLoading, refetch } = trpc.preorder.getNft.useQuery(
    { orderId },
    {
      enabled: !!orderId,
      refetchInterval: (query) => {
        // Stop polling once we have the NFT image
        const queryData = query.state.data;
        if (queryData?.nft?.nftImageUrl) return false;
        // Poll every 5 seconds for up to 2 minutes
        if (pollCount < 24) return 5000;
        return false;
      },
    }
  );

  useEffect(() => {
    if (!data?.nft?.nftImageUrl && pollCount < 24) {
      const timer = setTimeout(() => setPollCount(p => p + 1), 5000);
      return () => clearTimeout(timer);
    }
  }, [data, pollCount]);

  const nft = data?.nft;
  const isGenerating = !nft?.nftImageUrl && pollCount < 24;

  return (
    <Card className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border-[#c8ff00]/30 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Sparkles className="h-5 w-5 text-[#c8ff00]" />
            Your Exclusive NFT
          </CardTitle>
          <Badge 
            variant="outline" 
            className={`${
              nft?.nftMintStatus === 'minted' 
                ? 'border-green-500 text-green-400' 
                : nft?.nftMintStatus === 'ready'
                ? 'border-blue-500 text-blue-400'
                : 'border-[#c8ff00] text-[#c8ff00]'
            }`}
          >
            {nft?.nftMintStatus === 'minted' ? 'Minted' : 
             nft?.nftMintStatus === 'ready' ? 'Ready to Mint' : 
             'Pending Mint'}
          </Badge>
        </div>
        <p className="text-sm text-gray-400">
          {nftId || nft?.nftId || `NEON-NFT-${orderId.toString().padStart(5, '0')}`}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* NFT Image */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-800/50 border border-gray-700">
          {isGenerating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[#c8ff00]/30 border-t-[#c8ff00] rounded-full animate-spin" />
                <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-[#c8ff00] animate-pulse" />
              </div>
              <p className="text-sm text-gray-400 text-center px-4">
                Generating your unique NFT artwork...
              </p>
              <p className="text-xs text-gray-500">
                This may take up to 30 seconds
              </p>
            </div>
          ) : nft?.nftImageUrl ? (
            <>
              {!imageLoaded && (
                <Skeleton className="absolute inset-0 bg-gray-700" />
              )}
              <img
                src={nft.nftImageUrl}
                alt={`NFT ${nft.nftId}`}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              {imageLoaded && (
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-black/70 hover:bg-black/90 text-white"
                    onClick={() => window.open(nft.nftImageUrl!, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Full
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <AlertCircle className="h-8 w-8 text-gray-500" />
              <p className="text-sm text-gray-500">NFT generation in progress</p>
            </div>
          )}
        </div>

        {/* Minting Notice */}
        {showMintingNotice && (
          <div className="bg-gradient-to-r from-[#c8ff00]/10 to-purple-500/10 border border-[#c8ff00]/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-[#c8ff00] mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-white">
                  NFT Minting Coming Soon
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Your unique NFT artwork has been generated and reserved for you. 
                  NFT minting will begin once the <strong className="text-[#c8ff00]">90-day pre-launch period</strong> ends 
                  and <strong className="text-[#c8ff00]">crowdfunding goals</strong> have been reached.
                </p>
                <div className="flex items-center gap-4 pt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#c8ff00] animate-pulse" />
                    <span className="text-xs text-gray-400">Pre-launch: ~90 days</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-xs text-gray-400">Goal: In progress</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NFT Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">Edition</p>
            <p className="text-white font-mono">#{orderId.toString().padStart(5, '0')}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">Collection</p>
            <p className="text-white">NEON Founders</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">Rarity</p>
            <p className="text-[#c8ff00]">
              {orderId <= 100 ? 'Legendary' : 
               orderId <= 500 ? 'Epic' : 
               orderId <= 1000 ? 'Rare' : 
               orderId <= 2500 ? 'Uncommon' : 'Common'}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">Status</p>
            <p className="text-purple-400">Pre-Launch</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default NftPreview;
