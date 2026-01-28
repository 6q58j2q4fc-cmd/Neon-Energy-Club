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
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentVideo = videos[currentVideoIndex];

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          // Autoplay was prevented, mute and try again
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play();
          }
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, currentVideoIndex]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
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
        muted={isMuted}
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Play/Pause overlay button */}
      <button
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div className="w-20 h-20 rounded-full bg-[#c8ff00]/90 flex items-center justify-center">
          {isPlaying ? (
            <Pause className="w-10 h-10 text-black" />
          ) : (
            <Play className="w-10 h-10 text-black ml-1" />
          )}
        </div>
      </button>
      
      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress bar */}
        <Slider
          value={[progress]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="mb-3"
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            
            <span className="text-white text-sm">
              {formatTime(progress)} / {formatTime(duration)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-white/70 text-sm mr-2">{currentVideo?.title}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleExpand}
              className="text-white hover:bg-white/20"
            >
              <Maximize2 className="w-5 h-5" />
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
      className="fixed inset-0 z-50 bg-black"
      onMouseMove={handleMouseMove}
    >
      <video
        ref={videoRef}
        src={currentVideo?.videoUrl}
        poster={currentVideo?.thumbnail}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnd}
        playsInline
        muted={isMuted}
        onClick={togglePlay}
      />
      
      {/* Close button */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleExpand}
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            >
              <X className="w-8 h-8" />
            </Button>
            
            {/* Center play/pause */}
            <button
              onClick={togglePlay}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="w-24 h-24 rounded-full bg-[#c8ff00]/90 flex items-center justify-center hover:scale-110 transition-transform">
                {isPlaying ? (
                  <Pause className="w-12 h-12 text-black" />
                ) : (
                  <Play className="w-12 h-12 text-black ml-1" />
                )}
              </div>
            </button>
            
            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
              {/* Progress bar */}
              <Slider
                value={[progress]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="mb-4"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevVideo}
                    className="text-white hover:bg-white/20"
                    disabled={videos.length <= 1}
                  >
                    <SkipBack className="w-6 h-6" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextVideo}
                    className="text-white hover:bg-white/20"
                    disabled={videos.length <= 1}
                  >
                    <SkipForward className="w-6 h-6" />
                  </Button>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                      className="w-24"
                    />
                  </div>
                  
                  <span className="text-white text-sm ml-4">
                    {formatTime(progress)} / {formatTime(duration)}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-white font-medium">{currentVideo?.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleExpand}
                    className="text-white hover:bg-white/20"
                  >
                    <Minimize2 className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Video list sidebar */}
            {videos.length > 1 && (
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
