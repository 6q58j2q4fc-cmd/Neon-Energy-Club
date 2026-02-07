import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HeaderSoundControlProps {
  accentColor?: string;
}

// Working jungle audio URL from AmbientSoundToggle
const JUNGLE_AUDIO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663234433834/RuVzsuSkJvAbHtJf.mp3";

export function HeaderSoundControl({ accentColor = "#c8ff00" }: HeaderSoundControlProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Initialize audio with working logic from AmbientSoundToggle
  useEffect(() => {
    // Create audio element on mount
    audioRef.current = new Audio(JUNGLE_AUDIO_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    // Check localStorage for saved preferences
    const savedVolume = localStorage.getItem("neon-ambient-volume");
    
    if (savedVolume) {
      const vol = parseFloat(savedVolume);
      setVolume(vol);
      if (audioRef.current) {
        audioRef.current.volume = vol;
      }
    }

    // Auto-play function - tries to play immediately
    const attemptAutoPlay = async () => {
      if (!audioRef.current) return;
      
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setHasUserInteracted(true);
        localStorage.setItem("neon-ambient-sound", "enabled");
      } catch (error) {
        // Auto-play was blocked - wait for user interaction
        console.log("Auto-play blocked, waiting for user interaction");
        
        // Set up one-time click listener to enable audio
        const enableAudio = async () => {
          if (audioRef.current && !hasUserInteracted) {
            try {
              await audioRef.current.play();
              setIsPlaying(true);
              setHasUserInteracted(true);
              localStorage.setItem("neon-ambient-sound", "enabled");
            } catch (e) {
              console.error("Audio playback failed:", e);
            }
          }
          document.removeEventListener("click", enableAudio);
          document.removeEventListener("touchstart", enableAudio);
          document.removeEventListener("keydown", enableAudio);
        };
        
        document.addEventListener("click", enableAudio, { once: true });
        document.addEventListener("touchstart", enableAudio, { once: true });
        document.addEventListener("keydown", enableAudio, { once: true });
      }
    };

    // Attempt auto-play after a short delay
    const timer = setTimeout(attemptAutoPlay, 500);

    return () => {
      clearTimeout(timer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update volume when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      localStorage.setItem("neon-ambient-volume", volume.toString());
    }
  }, [volume]);

  const toggleSound = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        localStorage.setItem("neon-ambient-sound", "disabled");
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
        setHasUserInteracted(true);
        localStorage.setItem("neon-ambient-sound", "enabled");
      }
    } catch (error) {
      console.error("Audio playback failed:", error);
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
              ? "w-12 h-12 bg-[#c8ff00]/20 border-2 border-[#c8ff00] shadow-[0_0_15px_rgba(200,255,0,0.4)]" 
              : "w-12 h-12 bg-white/10 border-2 border-white/30 hover:bg-white/15"
          }`}
          aria-label="Volume"
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            minWidth: '40px',
            minHeight: '40px'
          }}
        >
          {isPlaying ? (
            <Volume2 className="w-6 h-6" strokeWidth={2.5} style={{ color: accentColor }} />
          ) : (
            <VolumeX className="w-6 h-6" strokeWidth={2.5} style={{ color: 'rgba(255,255,255,0.7)' }} />
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
            className={`w-full py-4 px-4 rounded-xl font-bold text-base transition-all duration-300 touch-manipulation active:scale-95 ${
              isPlaying 
                ? "bg-[#c8ff00] text-black" 
                : "bg-white/10 text-white border border-white/30"
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {isPlaying ? "🔊 Jungle Sounds On" : "🔇 Jungle Sounds Off"}
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
