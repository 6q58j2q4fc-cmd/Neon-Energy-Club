import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Copy, 
  Check, 
  Facebook, 
  Twitter, 
  MessageCircle,
  Share2,
  Mail
} from "lucide-react";

interface SocialShareButtonsProps {
  referralCode: string;
  referralLink: string;
  userName?: string;
}

export default function SocialShareButtons({ 
  referralCode, 
  referralLink, 
  userName = "Friend" 
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  // Pre-built share messages
  const shareTitle = "Get FREE NEON Energy Drinks! 🔋⚡";
  const shareMessage = `Hey! I've been drinking NEON Energy and it's amazing! Use my link to get started and we both win - I get free NEON when you order! ${referralLink}`;
  const shortMessage = `Try NEON Energy - the cleanest energy drink out there! Use my referral link: ${referralLink}`;
  const emailSubject = "You've got to try NEON Energy! 🔋";
  const emailBody = `Hey!

I wanted to share something awesome with you - NEON Energy drinks! They're made with natural ingredients, zero sugar, and give you clean energy without the crash.

I've been loving them and thought you might too. Plus, if you use my referral link below, we both benefit - I get credit toward free NEON!

${referralLink}

Let me know what you think!

- ${userName}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Link Copied!", {
      description: "Share this link with friends to earn free NEON!",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(shortMessage)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shortMessage)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  const shareViaEmail = () => {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shortMessage,
          url: referralLink,
        });
        toast.success("Shared successfully!");
      } catch (err) {
        // User cancelled or share failed
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      // Fallback to copy
      copyToClipboard();
    }
  };

  return (
    <div className="space-y-4">
      {/* Share Message Preview */}
      <div className="p-4 bg-black/30 rounded-xl border border-[#c8ff00]/20">
        <div className="text-xs text-white/40 mb-2 flex items-center gap-2">
          <Share2 className="w-3 h-3" />
          Your Referral Link
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 bg-black/40 border border-[#c8ff00]/30 rounded-lg px-3 py-2 text-white text-sm font-mono truncate"
          />
          <Button
            onClick={copyToClipboard}
            className="bg-[#c8ff00] hover:bg-[#d4ff33] text-black font-bold px-4"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Social Share Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Facebook */}
        <Button
          onClick={shareToFacebook}
          className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white font-semibold flex items-center justify-center gap-2"
        >
          <Facebook className="w-5 h-5" />
          <span className="hidden sm:inline">Facebook</span>
        </Button>

        {/* Twitter/X */}
        <Button
          onClick={shareToTwitter}
          className="bg-black hover:bg-black/90 text-white font-semibold flex items-center justify-center gap-2 border border-white/20"
        >
          <Twitter className="w-5 h-5" />
          <span className="hidden sm:inline">X / Twitter</span>
        </Button>

        {/* WhatsApp */}
        <Button
          onClick={shareToWhatsApp}
          className="bg-[#25D366] hover:bg-[#25D366]/90 text-white font-semibold flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline">WhatsApp</span>
        </Button>

        {/* Email */}
        <Button
          onClick={shareViaEmail}
          className="bg-[#EA4335] hover:bg-[#EA4335]/90 text-white font-semibold flex items-center justify-center gap-2"
        >
          <Mail className="w-5 h-5" />
          <span className="hidden sm:inline">Email</span>
        </Button>
      </div>

      {/* Native Share (Mobile) */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <Button
          onClick={shareNative}
          className="w-full bg-gradient-to-r from-[#c8ff00] to-[#00ff88] hover:opacity-90 text-black font-bold py-3"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share via Your Apps
        </Button>
      )}

      {/* Quick Copy Messages */}
      <div className="space-y-2">
        <div className="text-xs text-white/40 font-semibold uppercase tracking-wider">
          Quick Copy Messages
        </div>
        <div className="grid gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(shortMessage);
              toast.success("Message copied!");
            }}
            className="text-left p-3 bg-black/20 hover:bg-black/30 rounded-lg border border-white/10 transition-colors"
          >
            <div className="text-xs text-[#c8ff00] font-semibold mb-1">Short & Sweet</div>
            <div className="text-white/70 text-sm line-clamp-2">{shortMessage}</div>
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareMessage);
              toast.success("Message copied!");
            }}
            className="text-left p-3 bg-black/20 hover:bg-black/30 rounded-lg border border-white/10 transition-colors"
          >
            <div className="text-xs text-[#00ff88] font-semibold mb-1">Friendly Invite</div>
            <div className="text-white/70 text-sm line-clamp-2">{shareMessage}</div>
          </button>
        </div>
      </div>
    </div>
  );
}
