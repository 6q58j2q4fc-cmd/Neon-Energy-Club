import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Download,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  X,
  Loader2,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface OptimizedVideoPlayerProps {
  src: string;
  mobileSrc?: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
}

export default function OptimizedVideoPlayer({
  src,
  mobileSrc,
  poster,
  title = "NEON Energy Drink Promo",
  autoPlay = true,
  loop = true,
  muted = true,
  className = "",
}: OptimizedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasError, setHasError] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get the appropriate video source
  const videoSrc = isMobile && mobileSrc ? mobileSrc : src;

  // Video event handlers
  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay was prevented, user needs to interact
        setIsPlaying(false);
      });
    }
  };

  const handleWaiting = () => {
    setIsBuffering(true);
  };

  const handlePlaying = () => {
    setIsBuffering(false);
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  // Control handlers
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
          toast.error("Unable to play video");
        });
      }
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    
    // Check if already in fullscreen
    const isCurrentlyFullscreen = document.fullscreenElement || 
      (document as any).webkitFullscreenElement || 
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement;
    
    if (isCurrentlyFullscreen) {
      // Exit fullscreen
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      } catch (e) {
        console.log('Exit fullscreen failed:', e);
      }
      return;
    }
    
    // Enter fullscreen - try iOS video-specific method first
    if (video) {
      try {
        // iOS Safari specific - works on iPhone/iPad
        if ((video as any).webkitEnterFullscreen) {
          (video as any).webkitEnterFullscreen();
          return;
        }
        // iOS Safari alternative
        if ((video as any).webkitSupportsFullscreen && (video as any).webkitEnterFullScreen) {
          (video as any).webkitEnterFullScreen();
          return;
        }
      } catch (e) {
        console.log('iOS fullscreen failed, trying standard:', e);
      }
    }
    
    // Standard fullscreen API for container (works on desktop and Android)
    if (container) {
      try {
        if (container.requestFullscreen) {
          container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          (container as any).webkitRequestFullscreen();
        } else if ((container as any).mozRequestFullScreen) {
          (container as any).mozRequestFullScreen();
        } else if ((container as any).msRequestFullscreen) {
          (container as any).msRequestFullscreen();
        } else {
          toast.error("Fullscreen not supported on this device");
        }
      } catch (e) {
        console.log('Container fullscreen failed:', e);
        toast.error("Fullscreen not supported");
      }
    }
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  }, []);

  const retryLoad = useCallback(() => {
    if (videoRef.current) {
      setHasError(false);
      setIsLoading(true);
      videoRef.current.load();
    }
  }, []);

  // Download video
  const handleDownload = useCallback(async () => {
    try {
      toast.info("Starting download...");
      const response = await fetch(videoSrc);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Download started!");
    } catch (error) {
      // Fallback: open in new tab
      window.open(videoSrc, '_blank');
      toast.info("Opening video in new tab for download");
    }
  }, [videoSrc, title]);

  // Share handlers
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Check out ${title}!`;

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success("Link copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
    setShowShareMenu(false);
  };

  // Auto-hide controls
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative group rounded-xl overflow-hidden bg-black ${className}`}
      onMouseMove={showControlsTemporarily}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onTouchStart={showControlsTemporarily}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoSrc}
        poster={poster}
        loop={loop}
        muted={isMuted}
        playsInline
        webkit-playsinline="true"
        preload="metadata"
        className="w-full h-full object-cover"
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onPause={handlePause}
        onError={handleError}
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
      />

      {/* Loading Spinner */}
      {(isLoading || isBuffering) && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 text-[#c8ff00] animate-spin" />
            <span className="text-white text-sm">
              {isLoading ? "Loading video..." : "Buffering..."}
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="flex flex-col items-center gap-4 text-center p-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-white">Failed to load video</p>
            <Button onClick={retryLoad} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Top Bar - Title & Share */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm md:text-base truncate pr-4">
              {title}
            </h3>
            <div className="flex items-center gap-2">
              {/* Download Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                className="text-white hover:bg-white/20 h-10 w-10"
                title="Download Video"
              >
                <Download className="w-5 h-5" />
              </Button>
              
              {/* Share Button */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="text-white hover:bg-white/20 h-10 w-10"
                  title="Share Video"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
                
                {/* Share Menu Dropdown */}
                {showShareMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-black/90 backdrop-blur-sm rounded-lg p-2 min-w-[160px] border border-white/20 z-50">
                    <button
                      onClick={shareToFacebook}
                      className="flex items-center gap-3 w-full px-3 py-2 text-white hover:bg-white/10 rounded-md transition-colors"
                    >
                      <Facebook className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Facebook</span>
                    </button>
                    <button
                      onClick={shareToTwitter}
                      className="flex items-center gap-3 w-full px-3 py-2 text-white hover:bg-white/10 rounded-md transition-colors"
                    >
                      <Twitter className="w-4 h-4 text-sky-400" />
                      <span className="text-sm">Twitter</span>
                    </button>
                    <button
                      onClick={shareToLinkedIn}
                      className="flex items-center gap-3 w-full px-3 py-2 text-white hover:bg-white/10 rounded-md transition-colors"
                    >
                      <Linkedin className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">LinkedIn</span>
                    </button>
                    <div className="border-t border-white/10 my-1" />
                    <button
                      onClick={copyLink}
                      className="flex items-center gap-3 w-full px-3 py-2 text-white hover:bg-white/10 rounded-md transition-colors"
                    >
                      <Link2 className="w-4 h-4 text-[#c8ff00]" />
                      <span className="text-sm">Copy Link</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Center Play Button */}
        {!isPlaying && !isLoading && !hasError && (
          <button
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-[#c8ff00]/90 hover:bg-[#c8ff00] flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-[#c8ff00]/30"
          >
            <Play className="w-10 h-10 text-black ml-1" fill="black" />
          </button>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          {/* Progress Bar */}
          <div 
            className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-3 group/progress"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-[#c8ff00] rounded-full relative transition-all"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#c8ff00] rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-white hover:bg-white/20 h-10 w-10"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" fill="white" />
                ) : (
                  <Play className="w-5 h-5" fill="white" />
                )}
              </Button>

              {/* Mute/Unmute */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-white/20 h-10 w-10"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20 h-10 w-10"
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Social Share Buttons - Always Visible on Side (Desktop) */}
      <div className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          onClick={shareToFacebook}
          className="bg-blue-600/80 hover:bg-blue-600 text-white h-10 w-10 rounded-full"
          title="Share on Facebook"
        >
          <Facebook className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={shareToTwitter}
          className="bg-sky-500/80 hover:bg-sky-500 text-white h-10 w-10 rounded-full"
          title="Share on Twitter"
        >
          <Twitter className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={shareToLinkedIn}
          className="bg-blue-700/80 hover:bg-blue-700 text-white h-10 w-10 rounded-full"
          title="Share on LinkedIn"
        >
          <Linkedin className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
