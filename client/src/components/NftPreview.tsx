import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { 
  Sparkles, 
  Clock, 
  AlertCircle, 
  Download, 
  ExternalLink,
  Share2,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface NftPreviewProps {
  orderId: number;
  nftId?: string;
  showMintingNotice?: boolean;
}

// Social media share URLs
const getTwitterShareUrl = (nftId: string, imageUrl: string) => {
  const text = `🎉 Just secured my exclusive NEON Energy NFT #${nftId}! 🔋⚡\n\nJoin the energy revolution and get your own unique collectible during the pre-launch!\n\n#NEONEnergy #NFT #EnergyDrink #Crypto`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.origin)}`;
};

const getFacebookShareUrl = () => {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`;
};

const getLinkedInShareUrl = (nftId: string) => {
  const title = `NEON Energy NFT #${nftId}`;
  const summary = "Just secured my exclusive NEON Energy NFT! Join the energy revolution and get your own unique collectible during the pre-launch.";
  return `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.origin)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`;
};

const getWhatsAppShareUrl = (nftId: string) => {
  const text = `🎉 Just secured my exclusive NEON Energy NFT #${nftId}! 🔋⚡ Join the energy revolution: ${window.location.origin}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
};

const getTelegramShareUrl = (nftId: string) => {
  const text = `🎉 Just secured my exclusive NEON Energy NFT #${nftId}! 🔋⚡ Join the energy revolution!`;
  return `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(text)}`;
};

export function NftPreview({ orderId, nftId, showMintingNotice = true }: NftPreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);
  
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
  const displayNftId = nftId || nft?.nftId || `NEON-NFT-${orderId.toString().padStart(5, '0')}`;
  const formattedOrderNum = orderId.toString().padStart(5, '0');

  // Handle copy link
  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/nft/${formattedOrderNum}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle download image
  const handleDownloadImage = async () => {
    if (!nft?.nftImageUrl) return;
    
    setDownloadingImage(true);
    try {
      const response = await fetch(nft.nftImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NEON-NFT-${formattedOrderNum}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download:', err);
      // Fallback: open in new tab
      window.open(nft.nftImageUrl, '_blank');
    }
    setDownloadingImage(false);
  };

  // Handle share to social media
  const handleShare = (platform: string) => {
    let url = '';
    switch (platform) {
      case 'twitter':
        url = getTwitterShareUrl(formattedOrderNum, nft?.nftImageUrl || '');
        break;
      case 'facebook':
        url = getFacebookShareUrl();
        break;
      case 'linkedin':
        url = getLinkedInShareUrl(formattedOrderNum);
        break;
      case 'whatsapp':
        url = getWhatsAppShareUrl(formattedOrderNum);
        break;
      case 'telegram':
        url = getTelegramShareUrl(formattedOrderNum);
        break;
    }
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

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
          {displayNftId}
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
                Generating your unique NEON NFT artwork...
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
                    View
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

        {/* Social Share Buttons - Only show when NFT is ready */}
        {nft?.nftImageUrl && imageLoaded && (
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white flex items-center gap-2">
                <Share2 className="h-4 w-4 text-[#c8ff00]" />
                Share Your NFT
              </p>
            </div>
            
            {/* Social Media Buttons */}
            <div className="flex flex-wrap gap-2">
              {/* Twitter/X */}
              <Button
                size="sm"
                variant="outline"
                className="bg-black hover:bg-gray-900 border-gray-700 text-white"
                onClick={() => handleShare('twitter')}
              >
                <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X
              </Button>

              {/* Facebook */}
              <Button
                size="sm"
                variant="outline"
                className="bg-[#1877F2] hover:bg-[#166FE5] border-[#1877F2] text-white"
                onClick={() => handleShare('facebook')}
              >
                <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>

              {/* WhatsApp */}
              <Button
                size="sm"
                variant="outline"
                className="bg-[#25D366] hover:bg-[#20BD5A] border-[#25D366] text-white"
                onClick={() => handleShare('whatsapp')}
              >
                <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </Button>

              {/* Telegram */}
              <Button
                size="sm"
                variant="outline"
                className="bg-[#0088CC] hover:bg-[#007AB8] border-[#0088CC] text-white"
                onClick={() => handleShare('telegram')}
              >
                <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Telegram
              </Button>

              {/* LinkedIn */}
              <Button
                size="sm"
                variant="outline"
                className="bg-[#0A66C2] hover:bg-[#095196] border-[#0A66C2] text-white"
                onClick={() => handleShare('linkedin')}
              >
                <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </Button>
            </div>

            {/* Action Buttons Row */}
            <div className="flex gap-2 pt-2 border-t border-gray-700">
              {/* Copy Link */}
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-gray-900 hover:bg-gray-800 border-gray-700 text-white"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1.5 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1.5" />
                    Copy Link
                  </>
                )}
              </Button>

              {/* Download */}
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-[#c8ff00]/10 hover:bg-[#c8ff00]/20 border-[#c8ff00]/30 text-[#c8ff00]"
                onClick={handleDownloadImage}
                disabled={downloadingImage}
              >
                <Download className="h-4 w-4 mr-1.5" />
                {downloadingImage ? 'Downloading...' : 'Download NFT'}
              </Button>
            </div>
          </div>
        )}

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
                  Your unique NEON Energy NFT artwork has been generated and reserved for you. 
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
            <p className="text-white font-mono">#{formattedOrderNum}</p>
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
            <p className="text-gray-500 text-xs mb-1">Theme</p>
            <p className="text-purple-400">Cyberpunk Neon</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default NftPreview;
