import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, QrCode, Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface QRCodeGeneratorProps {
  url: string;
  distributorCode: string;
  displayName?: string;
  size?: number;
  showDownload?: boolean;
  showShare?: boolean;
}

export default function QRCodeGenerator({
  url,
  distributorCode,
  displayName,
  size = 200,
  showDownload = true,
  showShare = true,
}: QRCodeGeneratorProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQRCode();
  }, [url, size]);

  const generateQRCode = async () => {
    setIsLoading(true);
    try {
      // Use dynamic import for QRCode library
      const QRCode = await import("qrcode");
      
      // Generate QR code as data URL with NEON branding colors
      const dataUrl = await QRCode.toDataURL(url, {
        width: size,
        margin: 2,
        color: {
          dark: "#c8ff00", // NEON green
          light: "#000000", // Black background
        },
        errorCorrectionLevel: "H", // High error correction for logo overlay
      });
      
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
      toast.error("Failed to generate QR code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    
    // Create a canvas with branding
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const padding = 40;
    const textHeight = 60;
    canvas.width = size + padding * 2;
    canvas.height = size + padding * 2 + textHeight;

    // Background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = "#c8ff00";
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // QR Code
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, padding, padding, size, size);

      // NEON branding text
      ctx.fillStyle = "#c8ff00";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.fillText("NEON ENERGY", canvas.width / 2, size + padding + 25);
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.fillText(displayName || distributorCode, canvas.width / 2, size + padding + 45);

      // Download
      const link = document.createElement("a");
      link.download = `neon-qr-${distributorCode}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast.success("QR code downloaded!");
    };
    img.src = qrDataUrl;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy URL");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayName || "NEON Distributor"}'s Website`,
          text: "Check out my NEON Energy distributor website!",
          url: url,
        });
      } catch (error) {
        // User cancelled or share failed
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-black/50 border-[#c8ff00]/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-[#c8ff00] text-lg">
            <QrCode className="w-5 h-5" />
            Your QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div 
            className="bg-[#0a0a0a] rounded-lg animate-pulse"
            style={{ width: size, height: size }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/50 border-[#c8ff00]/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-[#c8ff00] text-lg">
          <QrCode className="w-5 h-5" />
          Your QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {/* QR Code Display */}
        <div className="relative p-4 bg-black rounded-xl border-2 border-[#c8ff00]/50">
          {qrDataUrl && (
            <img 
              src={qrDataUrl} 
              alt="QR Code" 
              width={size}
              height={size}
              className="rounded"
            />
          )}
          {/* Center logo overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center border border-[#c8ff00]">
              <span className="text-[#c8ff00] font-black text-xs">NEON</span>
            </div>
          </div>
        </div>

        {/* URL Display */}
        <div className="w-full">
          <p className="text-xs text-gray-500 text-center mb-2">Scan to visit your website</p>
          <div className="flex items-center gap-2 bg-[#0a0a0a] rounded-lg p-2 border border-[#c8ff00]/20">
            <input
              type="text"
              value={url}
              readOnly
              className="flex-1 bg-transparent text-sm text-gray-300 outline-none truncate"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-[#c8ff00] hover:bg-[#c8ff00]/10"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full">
          {showDownload && (
            <Button
              onClick={handleDownload}
              className="flex-1 bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
          {showShare && (
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex-1 border-[#c8ff00]/50 text-[#c8ff00] hover:bg-[#c8ff00]/10"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}
        </div>

        {/* Usage Tips */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>Print on business cards, flyers, or marketing materials</p>
          <p>Customers can scan to instantly visit your website</p>
        </div>
      </CardContent>
    </Card>
  );
}
