import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  X,
  SkipBack,
  SkipForward,
  Download,
  Share2,
  Copy,
  Mail,
  MessageCircle,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

// Social media icons as SVG components
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
}

interface MobileVideoPlayerProps {
  videos: Video[];
  autoPlay?: boolean;
}

export default function MobileVideoPlayer({ videos, autoPlay = false }: MobileVideoPlayerProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showControls, setShowControls] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const expandedVideoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentVideo = videos[currentVideoIndex];

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const video = isExpanded ? expandedVideoRef.current : videoRef.current;
    if (video) {
      if (isPlaying) {
        video.play().catch(() => {
          if (video) {
            video.muted = true;
            setIsMuted(true);
            video.play();
          }
        });
      } else {
        video.pause();
      }
    }
  }, [isPlaying, currentVideoIndex, isExpanded]);

  useEffect(() => {
    const video = isExpanded ? expandedVideoRef.current : videoRef.current;
    if (video) {
      video.volume = volume;
      video.muted = isMuted;
    }
  }, [volume, isMuted, isExpanded]);

  // Sync video time when expanding/minimizing
  useEffect(() => {
    if (isExpanded && expandedVideoRef.current && videoRef.current) {
      expandedVideoRef.current.currentTime = videoRef.current.currentTime;
      if (isPlaying) expandedVideoRef.current.play();
    } else if (!isExpanded && videoRef.current && expandedVideoRef.current) {
      videoRef.current.currentTime = progress;
      if (isPlaying) videoRef.current.play();
    }
  }, [isExpanded]);

  const handleTimeUpdate = () => {
    const video = isExpanded ? expandedVideoRef.current : videoRef.current;
    if (video) {
      setProgress(video.currentTime);
      setDuration(video.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    const video = isExpanded ? expandedVideoRef.current : videoRef.current;
    if (video) {
      video.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const togglePlay = (e?: React.MouseEvent | React.TouchEvent) => {
    // Prevent event bubbling for better mobile touch handling
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const video = isExpanded ? expandedVideoRef.current : videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        // For iOS, we need to call play directly on user interaction
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((error) => {
              // Auto-play was prevented, try muted
              console.log('Playback failed, trying muted:', error);
              video.muted = true;
              setIsMuted(true);
              video.play().then(() => setIsPlaying(true));
            });
        } else {
          setIsPlaying(true);
        }
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleExpand = (e?: React.MouseEvent | React.TouchEvent) => {
    // Prevent event bubbling for better mobile touch handling
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isExpanded) {
      // Try native fullscreen first on mobile
      const video = videoRef.current;
      if (video) {
        try {
          // iOS Safari specific fullscreen
          if ((video as any).webkitEnterFullscreen) {
            (video as any).webkitEnterFullscreen();
            return;
          }
          // Standard Fullscreen API
          if (video.requestFullscreen) {
            video.requestFullscreen().catch(() => {
              // Fallback to expanded mode if fullscreen fails
              setIsExpanded(true);
            });
            return;
          }
          // Webkit prefix for older browsers
          if ((video as any).webkitRequestFullscreen) {
            (video as any).webkitRequestFullscreen();
            return;
          }
          // MS prefix for IE/Edge
          if ((video as any).msRequestFullscreen) {
            (video as any).msRequestFullscreen();
            return;
          }
        } catch (e) {
          console.log('Fullscreen failed, using expanded mode:', e);
        }
      }
    } else {
      // Exit fullscreen
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if ((document as any).webkitFullscreenElement) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msFullscreenElement) {
          (document as any).msExitFullscreen();
        }
      } catch (e) {
        console.log('Exit fullscreen failed:', e);
      }
    }
    setIsExpanded(!isExpanded);
    setShowShareMenu(false);
  };

  const nextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
  };

  const prevVideo = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleVideoEnd = () => {
    if (currentVideoIndex < videos.length - 1) {
      nextVideo();
    } else {
      setIsPlaying(false);
    }
  };

  // Share functions
  const getShareUrl = () => {
    return `${window.location.origin}?video=${currentVideo?.id}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setLinkCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(getShareUrl());
    const title = encodeURIComponent(`Check out ${currentVideo?.title} - NEON Energy Drink`);
    const text = encodeURIComponent("Experience the energy revolution with NEON! 🔋⚡");
    
    let shareUrl = "";
    
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case "instagram":
        // Instagram doesn't have a direct share URL, copy link instead
        handleCopyLink();
        toast.info("Link copied! Paste it in your Instagram story or post.");
        return;
      case "tiktok":
        // TikTok doesn't have a direct share URL, copy link instead
        handleCopyLink();
        toast.info("Link copied! Paste it in your TikTok video description.");
        return;
      case "sms":
        shareUrl = `sms:?body=${text}%20${url}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${title}&body=${text}%0A%0A${url}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, "_blank", "noopener,noreferrer");
    setShowShareMenu(false);
  };

  const handleDownload = async () => {
    if (!currentVideo?.videoUrl) return;
    
    try {
      toast.info("Starting download...");
      const response = await fetch(currentVideo.videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentVideo.title.replace(/[^a-z0-9]/gi, "_")}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Download started!");
    } catch (err) {
      // Fallback: open video in new tab
      window.open(currentVideo.videoUrl, "_blank");
      toast.info("Video opened in new tab - right-click to save");
    }
  };

  // Share menu component
  const ShareMenu = ({ className = "" }: { className?: string }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`bg-black/95 backdrop-blur-xl rounded-2xl border border-[#c8ff00]/30 p-4 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-sm">Share Video</h3>
        <button
          onClick={() => setShowShareMenu(false)}
          className="text-white/60 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-3 mb-4">
        <button
          onClick={() => handleShare("facebook")}
          className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white">
            <FacebookIcon />
          </div>
          <span className="text-white/70 text-[10px]">Facebook</span>
        </button>
        
        <button
          onClick={() => handleShare("twitter")}
          className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white border border-white/20">
            <TwitterIcon />
          </div>
          <span className="text-white/70 text-[10px]">X</span>
        </button>
        
        <button
          onClick={() => handleShare("instagram")}
          className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center text-white">
            <InstagramIcon />
          </div>
          <span className="text-white/70 text-[10px]">Instagram</span>
        </button>
        
        <button
          onClick={() => handleShare("tiktok")}
          className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white border border-white/20">
            <TikTokIcon />
          </div>
          <span className="text-white/70 text-[10px]">TikTok</span>
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        <button
          onClick={() => handleShare("sms")}
          className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white">
            <MessageCircle className="w-5 h-5" />
          </div>
          <span className="text-white/70 text-[10px]">SMS</span>
        </button>
        
        <button
          onClick={() => handleShare("email")}
          className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-[#EA4335] flex items-center justify-center text-white">
            <Mail className="w-5 h-5" />
          </div>
          <span className="text-white/70 text-[10px]">Email</span>
        </button>
        
        <button
          onClick={handleCopyLink}
          className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors ${
            linkCopied ? "bg-[#c8ff00]" : "bg-white/20"
          }`}>
            {linkCopied ? <Check className="w-5 h-5 text-black" /> : <Copy className="w-5 h-5" />}
          </div>
          <span className="text-white/70 text-[10px]">{linkCopied ? "Copied!" : "Copy Link"}</span>
        </button>
      </div>
      
      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-2 py-3 bg-[#c8ff00] hover:bg-[#d9ff33] text-black font-bold rounded-xl transition-colors"
      >
        <Download className="w-5 h-5" />
        Download Video
      </button>
    </motion.div>
  );

  // Minimized player component
  const MinimizedPlayer = () => (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group" style={{ touchAction: 'manipulation' }}>
      <video
        ref={videoRef}
        src={currentVideo?.videoUrl}
        poster={currentVideo?.thumbnail}
        className="w-full h-full object-cover"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnd}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePlay(); }}
        onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); togglePlay(); }}
        playsInline
        webkit-playsinline="true"
        muted={isMuted}
        style={{ touchAction: 'manipulation' }}
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 group-hover:opacity-100 md:transition-opacity pointer-events-none" />
      
      {/* Top bar with share button */}
      <div className={`absolute top-0 left-0 right-0 p-2 md:p-4 flex items-center justify-between z-10 transition-opacity ${
        isMobile || showControls ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      }`}>
        <div className="flex items-center gap-2">
          {videos.length > 1 && (
            <span className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs">
              {currentVideoIndex + 1}/{videos.length}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="text-white bg-black/50 hover:bg-black/70 rounded-full w-9 h-9"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleExpand(); }}
            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); toggleExpand(); }}
            className="text-white bg-black/50 hover:bg-black/70 rounded-full w-9 h-9"
            style={{ touchAction: 'manipulation' }}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Share menu popup */}
      <AnimatePresence>
        {showShareMenu && (
          <div className="absolute top-12 right-2 z-20">
            <ShareMenu />
          </div>
        )}
      </AnimatePresence>
      
      {/* Play/Pause overlay button - always visible on mobile */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePlay(); }}
        onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); togglePlay(); }}
        className={`absolute inset-0 flex items-center justify-center transition-opacity ${
          isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        style={{ touchAction: 'manipulation' }}
      >
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#c8ff00]/90 flex items-center justify-center shadow-lg shadow-[#c8ff00]/30 hover:scale-110 transition-transform">
          {isPlaying ? (
            <Pause className="w-8 h-8 md:w-10 md:h-10 text-black" />
          ) : (
            <Play className="w-8 h-8 md:w-10 md:h-10 text-black ml-1" />
          )}
        </div>
      </button>
      
      {/* Bottom controls - simplified for mobile */}
      <div className={`absolute bottom-0 left-0 right-0 p-2 md:p-4 transition-opacity ${
        isMobile ? "opacity-100 bg-gradient-to-t from-black/90 to-transparent" : "opacity-0 group-hover:opacity-100"
      }`}>
        {/* Progress bar */}
        <Slider
          value={[progress]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="mb-2 md:mb-3"
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 md:gap-2">
            {videos.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={prevVideo}
                className="text-white hover:bg-white/20 w-8 h-8"
              >
                <SkipBack className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white hover:bg-white/20 w-8 h-8 md:w-10 md:h-10"
            >
              {isPlaying ? <Pause className="w-4 h-4 md:w-5 md:h-5" /> : <Play className="w-4 h-4 md:w-5 md:h-5" />}
            </Button>
            
            {videos.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={nextVideo}
                className="text-white hover:bg-white/20 w-8 h-8"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-white hover:bg-white/20 w-8 h-8 md:w-10 md:h-10"
            >
              {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
            </Button>
            
            <span className="text-white text-xs md:text-sm ml-1">
              {formatTime(progress)} / {formatTime(duration)}
            </span>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-white/70 text-xs md:text-sm mr-1 md:mr-2 hidden sm:inline truncate max-w-[100px] md:max-w-none">
              {currentVideo?.title}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleExpand}
              className="text-white hover:bg-white/20 w-8 h-8 md:w-10 md:h-10"
            >
              <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Expanded fullscreen player
  const ExpandedPlayer = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black"
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseMove}
    >
      <video
        ref={expandedVideoRef}
        src={currentVideo?.videoUrl}
        poster={currentVideo?.thumbnail}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnd}
        playsInline
        webkit-playsinline="true"
        muted={isMuted}
        onClick={togglePlay}
      />
      
      {/* Top bar */}
      <div className={`absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent transition-opacity ${
        showControls ? "opacity-100" : "opacity-0"
      }`}>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleExpand}
            className="text-white bg-black/50 hover:bg-black/70 rounded-full"
          >
            <X className="w-6 h-6" />
          </Button>
          <div>
            <p className="text-white font-bold text-sm md:text-base">{currentVideo?.title}</p>
            {videos.length > 1 && (
              <p className="text-white/60 text-xs">{currentVideoIndex + 1} of {videos.length}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="text-white bg-black/50 hover:bg-black/70 rounded-full"
          >
            <Share2 className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            className="text-white bg-black/50 hover:bg-black/70 rounded-full"
          >
            <Download className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {/* Share menu in expanded mode */}
      <AnimatePresence>
        {showShareMenu && (
          <div className="absolute top-20 right-4 z-30">
            <ShareMenu />
          </div>
        )}
      </AnimatePresence>
      
      {/* Center play/pause */}
      <AnimatePresence>
        {showControls && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#c8ff00]/90 flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-[#c8ff00]/30">
              {isPlaying ? (
                <Pause className="w-10 h-10 md:w-12 md:h-12 text-black" />
              ) : (
                <Play className="w-10 h-10 md:w-12 md:h-12 text-black ml-1" />
              )}
            </div>
          </motion.button>
        )}
      </AnimatePresence>
      
      {/* Bottom controls */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 to-transparent transition-opacity ${
        showControls ? "opacity-100" : "opacity-0"
      }`}>
        {/* Progress bar */}
        <Slider
          value={[progress]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="mb-4"
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            {videos.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={prevVideo}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <SkipBack className="w-6 h-6" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white hover:bg-white/20 rounded-full w-12 h-12"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
            
            {videos.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={nextVideo}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <SkipForward className="w-6 h-6" />
              </Button>
            )}
            
            <span className="text-white text-sm md:text-base ml-2">
              {formatTime(progress)} / {formatTime(duration)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-white/20 rounded-full"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-24"
              />
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="md:hidden text-white hover:bg-white/20 rounded-full"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleExpand}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <Minimize2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      <MinimizedPlayer />
      <AnimatePresence>
        {isExpanded && <ExpandedPlayer />}
      </AnimatePresence>
    </>
  );
}
