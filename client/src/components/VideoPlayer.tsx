import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Maximize2, Minimize2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface Video {
  src: string;
  title: string;
  poster?: string;
}

interface VideoPlayerProps {
  videos: Video[];
  className?: string;
  autoPlay?: boolean;
  initialMuted?: boolean;
}

export function VideoPlayer({ 
  videos, 
  className, 
  autoPlay = true, 
  initialMuted = true 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [volume, setVolume] = useState(initialMuted ? 0 : 0.7);
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentVideo = videos[currentIndex];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      // Auto-advance to next video
      if (currentIndex < videos.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0); // Loop back to first video
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, [currentIndex, videos.length]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = volume;
    video.muted = isMuted;

    if (isPlaying) {
      video.play().catch(() => {
        // Autoplay was prevented, keep muted
        video.muted = true;
        setIsMuted(true);
        video.play();
      });
    }
  }, [currentIndex]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        await video.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Video play error:', error);
      // If autoplay fails, try with muted
      if (!isPlaying) {
        video.muted = true;
        setIsMuted(true);
        try {
          await video.play();
          setIsPlaying(true);
        } catch (e) {
          console.error('Muted play also failed:', e);
        }
      }
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
      if (volume === 0) {
        setVolume(0.7);
        video.volume = 0.7;
      }
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0];
    setVolume(newVolume);
    video.volume = newVolume;
    
    if (newVolume === 0) {
      setIsMuted(true);
      video.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      video.muted = false;
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    video.currentTime = percentage * video.duration;
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(videos.length - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const toggleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (!isFullscreen) {
        // Try webkit fullscreen first (iOS)
        if ((video as any).webkitEnterFullscreen) {
          (video as any).webkitEnterFullscreen();
        } else if (video.requestFullscreen) {
          await video.requestFullscreen();
        } else if ((video as any).webkitRequestFullscreen) {
          (video as any).webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative group rounded-2xl overflow-hidden bg-black",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={currentVideo.src}
        poster={currentVideo.poster}
        autoPlay={autoPlay}
        muted={isMuted}
        playsInline
        webkit-playsinline="true"
        x-webkit-airplay="allow"
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
      />

      {/* Video Title Overlay */}
      <div className={cn(
        "absolute top-4 left-4 right-4 transition-opacity duration-300",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg inline-block">
          <p className="text-white text-sm font-medium">{currentVideo.title}</p>
          <p className="text-gray-400 text-xs">
            {currentIndex + 1} / {videos.length}
          </p>
        </div>
      </div>

      {/* Play/Pause Center Indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="p-6 bg-black/60 rounded-full">
            <Play className="w-12 h-12 text-[#c8ff00]" />
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300",
        showControls || !isPlaying ? "opacity-100" : "opacity-0"
      )}>
        {/* Progress Bar */}
        <div 
          className="w-full h-1 bg-white/30 rounded-full mb-4 cursor-pointer"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-[#c8ff00] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevious}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Previous video"
            >
              <SkipBack className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={togglePlay}
              className="p-3 bg-[#c8ff00] hover:bg-[#d4ff33] rounded-full transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-black" />
              ) : (
                <Play className="w-5 h-5 text-black" />
              )}
            </button>

            <button
              onClick={goToNext}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Next video"
            >
              <SkipForward className="w-5 h-5 text-white" />
            </button>

            <span className="text-white text-sm ml-2">
              {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Volume Control */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
              <div className="w-0 group-hover/volume:w-24 overflow-hidden transition-all duration-300">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-24"
                />
              </div>
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-white" />
              ) : (
                <Maximize2 className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Video Thumbnails */}
        {videos.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {videos.map((video, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden border-2 transition-all",
                  index === currentIndex
                    ? "border-[#c8ff00] scale-105"
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <span className="text-xs text-white">{index + 1}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoPlayer;
