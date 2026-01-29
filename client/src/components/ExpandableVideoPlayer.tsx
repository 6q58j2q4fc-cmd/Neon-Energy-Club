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
  SkipForward
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
}

interface ExpandableVideoPlayerProps {
  videos: Video[];
  autoPlay?: boolean;
}

export default function ExpandableVideoPlayer({ videos, autoPlay = false }: ExpandableVideoPlayerProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showControls, setShowControls] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
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

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleExpand = () => {
    if (!isExpanded) {
      // Try native fullscreen first on mobile
      if (isMobile && videoRef.current) {
        try {
          if (videoRef.current.requestFullscreen) {
            videoRef.current.requestFullscreen();
            return;
          } else if ((videoRef.current as any).webkitEnterFullscreen) {
            (videoRef.current as any).webkitEnterFullscreen();
            return;
          }
        } catch (e) {
          // Fall back to expanded mode
        }
      }
    }
    setIsExpanded(!isExpanded);
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

  // Minimized player component
  const MinimizedPlayer = () => (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group">
      <video
        ref={videoRef}
        src={currentVideo?.videoUrl}
        poster={currentVideo?.thumbnail}
        className="w-full h-full object-cover"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnd}
        playsInline
        webkit-playsinline="true"
        muted={isMuted}
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 md:transition-opacity" />
      
      {/* Play/Pause overlay button - always visible on mobile */}
      <button
        onClick={togglePlay}
        className={`absolute inset-0 flex items-center justify-center transition-opacity ${
          isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#c8ff00]/90 flex items-center justify-center shadow-lg">
          {isPlaying ? (
            <Pause className="w-8 h-8 md:w-10 md:h-10 text-black" />
          ) : (
            <Play className="w-8 h-8 md:w-10 md:h-10 text-black ml-1" />
          )}
        </div>
      </button>
      
      {/* Expand button - always visible */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleExpand}
        className="absolute top-2 right-2 md:top-4 md:right-4 text-white bg-black/50 hover:bg-black/70 rounded-full z-10"
      >
        <Maximize2 className="w-5 h-5" />
      </Button>
      
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
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white hover:bg-white/20 w-8 h-8 md:w-10 md:h-10"
            >
              {isPlaying ? <Pause className="w-4 h-4 md:w-5 md:h-5" /> : <Play className="w-4 h-4 md:w-5 md:h-5" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-white hover:bg-white/20 w-8 h-8 md:w-10 md:h-10"
            >
              {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
            </Button>
            
            <span className="text-white text-xs md:text-sm">
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
      
      {/* Close button - always visible */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleExpand}
        className="absolute top-2 right-2 md:top-4 md:right-4 text-white bg-black/50 hover:bg-black/70 rounded-full z-20"
      >
        <X className="w-6 h-6 md:w-8 md:h-8" />
      </Button>
      
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Center play/pause */}
            <button
              onClick={togglePlay}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-[#c8ff00]/90 flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                {isPlaying ? (
                  <Pause className="w-8 h-8 md:w-12 md:h-12 text-black" />
                ) : (
                  <Play className="w-8 h-8 md:w-12 md:h-12 text-black ml-1" />
                )}
              </div>
            </button>
            
            {/* Bottom controls - responsive */}
            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 bg-gradient-to-t from-black/90 to-transparent">
              {/* Progress bar */}
              <Slider
                value={[progress]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="mb-2 md:mb-4"
              />
              
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 md:gap-4">
                  {videos.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={prevVideo}
                      className="text-white hover:bg-white/20 w-8 h-8 md:w-10 md:h-10"
                    >
                      <SkipBack className="w-4 h-4 md:w-6 md:h-6" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20 w-10 h-10 md:w-12 md:h-12"
                  >
                    {isPlaying ? <Pause className="w-6 h-6 md:w-8 md:h-8" /> : <Play className="w-6 h-6 md:w-8 md:h-8" />}
                  </Button>
                  
                  {videos.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={nextVideo}
                      className="text-white hover:bg-white/20 w-8 h-8 md:w-10 md:h-10"
                    >
                      <SkipForward className="w-4 h-4 md:w-6 md:h-6" />
                    </Button>
                  )}
                  
                  <div className="flex items-center gap-1 md:gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20 w-8 h-8 md:w-10 md:h-10"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 md:w-6 md:h-6" /> : <Volume2 className="w-4 h-4 md:w-6 md:h-6" />}
                    </Button>
                    {!isMobile && (
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        max={1}
                        step={0.01}
                        onValueChange={handleVolumeChange}
                        className="w-20 md:w-24"
                      />
                    )}
                  </div>
                  
                  <span className="text-white text-xs md:text-sm">
                    {formatTime(progress)} / {formatTime(duration)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 md:gap-4">
                  <span className="text-white font-medium text-sm md:text-base truncate max-w-[150px] md:max-w-none">
                    {currentVideo?.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleExpand}
                    className="text-white hover:bg-white/20 w-8 h-8 md:w-10 md:h-10"
                  >
                    <Minimize2 className="w-4 h-4 md:w-6 md:h-6" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Video list sidebar - hidden on mobile */}
            {videos.length > 1 && !isMobile && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-64 max-h-[60vh] overflow-y-auto bg-black/80 rounded-xl p-2">
                <h4 className="text-white font-semibold px-2 py-1 mb-2">Videos</h4>
                {videos.map((video, index) => (
                  <button
                    key={video.id}
                    onClick={() => setCurrentVideoIndex(index)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      index === currentVideoIndex
                        ? "bg-[#c8ff00]/20"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-20 h-12 object-cover rounded"
                    />
                    <div className="text-left flex-1">
                      <p className={`text-sm ${
                        index === currentVideoIndex ? "text-[#c8ff00]" : "text-white"
                      }`}>
                        {video.title}
                      </p>
                      <p className="text-xs text-white/50">{video.duration}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  if (!currentVideo) {
    return (
      <div className="w-full aspect-video bg-black/50 rounded-xl flex items-center justify-center">
        <p className="text-white/50">No videos available</p>
      </div>
    );
  }

  return (
    <>
      <MinimizedPlayer />
      <AnimatePresence>
        {isExpanded && <ExpandedPlayer />}
      </AnimatePresence>
    </>
  );
}
