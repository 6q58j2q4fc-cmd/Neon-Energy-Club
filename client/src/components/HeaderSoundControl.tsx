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

export function HeaderSoundControl({ accentColor = "#c8ff00" }: HeaderSoundControlProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1.0); // Start at full volume
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [hasAutoReduced, setHasAutoReduced] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const volumeReductionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Create audio element on mount
    audioRef.current = new Audio("https://files.manuscdn.com/user_upload_by_module/session_file/310519663234433834/wUAXKFjPJqRxCuoX.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 1.0; // Start at full volume

    // Check localStorage for saved preferences
    const savedVolume = localStorage.getItem("neon-ambient-volume");
    const savedState = localStorage.getItem("neon-ambient-sound");
    const hasReducedVolume = localStorage.getItem("neon-ambient-reduced");
    
    if (savedVolume && hasReducedVolume) {
      const vol = parseFloat(savedVolume);
      setVolume(vol);
      if (audioRef.current) {
        audioRef.current.volume = vol;
      }
      setHasAutoReduced(true);
    }

    // Auto-play function - tries to play immediately
    const attemptAutoPlay = async () => {
      if (!audioRef.current) return;
      
      // Only auto-play if previously enabled
      if (savedState === "disabled") return;
      
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setHasUserInteracted(true);
        localStorage.setItem("neon-ambient-sound", "enabled");
        
        // Start volume reduction timer after successful play
        if (!hasReducedVolume) {
          startVolumeReduction();
        }
      } catch (error) {
        // Auto-play was blocked - wait for user interaction
        console.log("Auto-play blocked, waiting for user interaction");
        
        // Set up one-time click listener to enable audio
        const enableAudio = async () => {
          if (audioRef.current && !hasUserInteracted && savedState !== "disabled") {
            try {
              await audioRef.current.play();
              setIsPlaying(true);
              setHasUserInteracted(true);
              localStorage.setItem("neon-ambient-sound", "enabled");
              
              // Start volume reduction timer after successful play
              if (!hasReducedVolume) {
                startVolumeReduction();
              }
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

    // Function to smoothly reduce volume to 35% after 5 seconds
    const startVolumeReduction = () => {
      volumeReductionTimerRef.current = setTimeout(() => {
        if (audioRef.current && !hasAutoReduced) {
          const startVolume = audioRef.current.volume;
          const targetVolume = 0.35;
          const duration = 1500; // 1.5 seconds for smooth transition
          const steps = 30;
          const stepTime = duration / steps;
          const volumeStep = (startVolume - targetVolume) / steps;
          let currentStep = 0;
          
          const reduceInterval = setInterval(() => {
            currentStep++;
            if (audioRef.current) {
              const newVolume = Math.max(targetVolume, startVolume - (volumeStep * currentStep));
              audioRef.current.volume = newVolume;
              setVolume(newVolume);
            }
            if (currentStep >= steps) {
              clearInterval(reduceInterval);
              setHasAutoReduced(true);
              localStorage.setItem("neon-ambient-reduced", "true");
              localStorage.setItem("neon-ambient-volume", "0.35");
            }
          }, stepTime);
        }
      }, 5000); // Wait 5 seconds before reducing
    };

    // Attempt auto-play after a short delay
    const timer = setTimeout(attemptAutoPlay, 500);

    return () => {
      clearTimeout(timer);
      if (volumeReductionTimerRef.current) {
        clearTimeout(volumeReductionTimerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

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

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const newVolume = Math.max(0, Math.min(1, x / width));
    setVolume(newVolume);
    setHasAutoReduced(true); // User manually adjusted, don't auto-reduce anymore
    localStorage.setItem("neon-ambient-reduced", "true");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
            isPlaying 
              ? "bg-[#c8ff00]/20 border-2 border-[#c8ff00] shadow-[0_0_15px_rgba(200,255,0,0.3)]" 
              : "bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/30"
          }`}
          aria-label={isPlaying ? "Mute jungle sounds" : "Play jungle sounds"}
        >
          {isPlaying ? (
            <Volume2 className="w-6 h-6" strokeWidth={2.5} style={{ color: accentColor }} />
          ) : (
            <VolumeX className="w-6 h-6" strokeWidth={2.5} style={{ color: 'rgba(255,255,255,0.6)' }} />
          )}
          {/* Playing indicator pulse */}
          {isPlaying && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#c8ff00] rounded-full animate-pulse" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-4 bg-black/95 backdrop-blur-xl border border-[#c8ff00]/30 rounded-xl"
        align="end"
        sideOffset={8}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#c8ff00]/20 flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-[#c8ff00]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Jungle Ambience</p>
                <p className="text-xs text-white/50">Immersive sound effects</p>
              </div>
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={toggleSound}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
              isPlaying 
                ? "bg-[#c8ff00] text-black hover:bg-[#d4ff33]" 
                : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
            }`}
          >
            {isPlaying ? "🔊 Sound On" : "🔇 Sound Off"}
          </button>

          {/* Volume Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/50">Volume</span>
              <span className="text-[#c8ff00] font-bold">{Math.round(volume * 100)}%</span>
            </div>
            <div 
              ref={sliderRef}
              className="relative h-2 bg-white/10 rounded-full cursor-pointer overflow-hidden"
              onClick={handleVolumeChange}
              onMouseMove={(e) => e.buttons === 1 && handleVolumeChange(e)}
            >
              {/* Filled portion */}
              <div 
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#c8ff00] to-[#00ffff] rounded-full transition-all duration-100"
                style={{ width: `${volume * 100}%` }}
              />
              {/* Thumb indicator */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#c8ff00] rounded-full shadow-lg border-2 border-white transition-all duration-100"
                style={{ left: `calc(${volume * 100}% - 8px)` }}
              />
            </div>
          </div>

          {/* Info */}
          <p className="text-[10px] text-white/40 text-center">
            Experience the immersive jungle atmosphere
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default HeaderSoundControl;
