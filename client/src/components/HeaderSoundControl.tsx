import { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HeaderSoundControlProps {
  accentColor?: string;
}

// The exact jungle audio URL that was on the site
const JUNGLE_AUDIO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663234433834/RuVzsuSkJvAbHtJf.mp3";

export function HeaderSoundControl({ accentColor = "#c8ff00" }: HeaderSoundControlProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const hasAttemptedAutoPlay = useRef(false);

  // Initialize audio and attempt auto-play immediately
  useEffect(() => {
    const audio = new Audio();
    audio.src = JUNGLE_AUDIO_URL;
    audio.loop = true;
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    
    // iOS Safari specific
    (audio as any).playsInline = true;
    (audio as any).webkitPlaysInline = true;
    
    // Get saved volume
    const savedVolume = localStorage.getItem("neon-ambient-volume");
    if (savedVolume) {
      const vol = parseFloat(savedVolume);
      setVolume(vol);
      audio.volume = vol;
    } else {
      audio.volume = 0.35;
    }
    
    audioRef.current = audio;

    // Auto-play immediately when audio is ready
    const handleCanPlay = async () => {
      if (hasAttemptedAutoPlay.current) return;
      hasAttemptedAutoPlay.current = true;
      
      try {
        await audio.play();
        setIsPlaying(true);
        localStorage.setItem("neon-ambient-sound", "enabled");
      } catch (error) {
        // Auto-play blocked by browser - this is expected
        // We'll play on first user interaction
        console.log("Auto-play blocked, will play on user interaction");
      }
    };

    audio.addEventListener('canplaythrough', handleCanPlay);
    
    // Also try to play immediately
    audio.load();

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  // Play audio on ANY user interaction with the page
  const playOnInteraction = useCallback(async () => {
    if (!audioRef.current || isPlaying) return;
    
    try {
      await audioRef.current.play();
      setIsPlaying(true);
      localStorage.setItem("neon-ambient-sound", "enabled");
    } catch (e) {
      // Still blocked
    }
  }, [isPlaying]);

  // Listen for user interactions to unlock audio
  useEffect(() => {
    const events = ['touchstart', 'touchend', 'click', 'keydown', 'mousedown'];
    
    events.forEach(event => {
      document.addEventListener(event, playOnInteraction, { once: false, passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, playOnInteraction);
      });
    };
  }, [playOnInteraction]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      localStorage.setItem("neon-ambient-volume", volume.toString());
    }
  }, [volume]);

  const toggleSound = async () => {
    if (!audioRef.current) return;
    
    setIsLoading(true);

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        localStorage.setItem("neon-ambient-sound", "disabled");
      } else {
        audioRef.current.load();
        await new Promise(resolve => setTimeout(resolve, 100));
        await audioRef.current.play();
        setIsPlaying(true);
        localStorage.setItem("neon-ambient-sound", "enabled");
      }
    } catch (error) {
      console.error("Audio playback failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    let clientX: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    
    const x = clientX - rect.left;
    const width = rect.width;
    const newVolume = Math.max(0, Math.min(1, x / width));
    setVolume(newVolume);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`relative flex items-center justify-center rounded-xl transition-all duration-200 touch-manipulation ${
            isPlaying 
              ? "w-10 h-10 sm:w-12 sm:h-12 bg-[#c8ff00]/20 border-2 border-[#c8ff00] shadow-[0_0_15px_rgba(200,255,0,0.4)]" 
              : "w-10 h-10 sm:w-12 sm:h-12 bg-white/10 border-2 border-white/30 hover:bg-white/15"
          } ${isLoading ? "opacity-50" : ""}`}
          aria-label="Volume"
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            minWidth: '40px',
            minHeight: '40px'
          }}
        >
          {isPlaying ? (
            <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} style={{ color: accentColor }} />
          ) : (
            <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} style={{ color: 'rgba(255,255,255,0.7)' }} />
          )}
          {/* Playing indicator */}
          {isPlaying && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#c8ff00] rounded-full animate-pulse" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 p-4 bg-black/95 backdrop-blur-xl border-2 border-[#c8ff00]/40 rounded-2xl"
        align="end"
        sideOffset={8}
      >
        <div className="space-y-4">
          {/* Toggle Button */}
          <button
            onClick={toggleSound}
            disabled={isLoading}
            className={`w-full py-4 px-4 rounded-xl font-bold text-base transition-all duration-300 touch-manipulation active:scale-95 ${
              isPlaying 
                ? "bg-[#c8ff00] text-black" 
                : "bg-white/10 text-white border border-white/30"
            } ${isLoading ? "opacity-50" : ""}`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {isLoading ? "..." : isPlaying ? "🔊 Sound On" : "🔇 Sound Off"}
          </button>

          {/* Volume Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Volume</span>
              <span className="text-[#c8ff00] font-bold">{Math.round(volume * 100)}%</span>
            </div>
            <div 
              ref={sliderRef}
              className="relative h-8 bg-white/10 rounded-full cursor-pointer overflow-hidden touch-manipulation"
              onClick={handleVolumeChange}
              onTouchMove={handleVolumeChange}
              onMouseMove={(e) => e.buttons === 1 && handleVolumeChange(e)}
            >
              <div 
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#c8ff00] to-[#00ffff] rounded-full"
                style={{ width: `${volume * 100}%` }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-[#c8ff00] rounded-full shadow-lg border-2 border-white"
                style={{ left: `calc(${volume * 100}% - 12px)` }}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default HeaderSoundControl;
