import { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX, Music } from "lucide-react";
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
  const [volume, setVolume] = useState(0.35);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [showTapPrompt, setShowTapPrompt] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const audioUrlRef = useRef("https://files.manuscdn.com/user_upload_by_module/session_file/310519663234433834/wUAXKFjPJqRxCuoX.mp3");

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.src = audioUrlRef.current;
    audio.loop = true;
    audio.volume = 0.35;
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    
    // iOS Safari specific attributes
    (audio as any).playsInline = true;
    (audio as any).webkitPlaysInline = true;
    
    audioRef.current = audio;

    // Audio ready event
    const handleCanPlay = () => {
      setAudioReady(true);
    };

    audio.addEventListener('canplaythrough', handleCanPlay);

    // Check localStorage for saved preferences
    const savedVolume = localStorage.getItem("neon-ambient-volume");
    const savedState = localStorage.getItem("neon-ambient-sound");
    
    if (savedVolume) {
      const vol = parseFloat(savedVolume);
      setVolume(vol);
      audio.volume = vol;
    }

    // If user previously enabled sound, mark for auto-play attempt
    if (savedState === "enabled") {
      setShowTapPrompt(false);
    }

    // Hide tap prompt after 8 seconds
    const promptTimer = setTimeout(() => {
      setShowTapPrompt(false);
    }, 8000);

    return () => {
      clearTimeout(promptTimer);
      audio.removeEventListener('canplaythrough', handleCanPlay);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  // Attempt to play audio on any user interaction
  const attemptPlay = useCallback(async () => {
    if (!audioRef.current || isPlaying || hasUserInteracted) return;
    
    const savedState = localStorage.getItem("neon-ambient-sound");
    if (savedState !== "enabled") return;

    try {
      await audioRef.current.play();
      setIsPlaying(true);
      setHasUserInteracted(true);
      setShowTapPrompt(false);
    } catch (error) {
      // Auto-play blocked - expected on iOS
      console.log("Auto-play blocked, waiting for explicit user action");
    }
  }, [isPlaying, hasUserInteracted]);

  // Listen for any user interaction to unlock audio on iOS
  useEffect(() => {
    const events = ['touchstart', 'touchend', 'click', 'keydown', 'scroll'];
    
    const handleInteraction = () => {
      attemptPlay();
    };

    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: false, passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, [attemptPlay]);

  // Update volume when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      localStorage.setItem("neon-ambient-volume", volume.toString());
    }
  }, [volume]);

  const toggleSound = async () => {
    if (!audioRef.current) return;
    
    setIsLoading(true);
    setShowTapPrompt(false);

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        localStorage.setItem("neon-ambient-sound", "disabled");
      } else {
        // For iOS Safari, load and play in response to user gesture
        if (!hasUserInteracted) {
          audioRef.current.load();
          // Small delay for iOS
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        await audioRef.current.play();
        setIsPlaying(true);
        setHasUserInteracted(true);
        localStorage.setItem("neon-ambient-sound", "enabled");
      }
    } catch (error) {
      console.error("Audio playback failed:", error);
      // Retry with fresh load
      if (audioRef.current) {
        try {
          audioRef.current.src = audioUrlRef.current;
          audioRef.current.load();
          await new Promise(resolve => setTimeout(resolve, 200));
          await audioRef.current.play();
          setIsPlaying(true);
          setHasUserInteracted(true);
          localStorage.setItem("neon-ambient-sound", "enabled");
        } catch (e) {
          console.error("Retry failed:", e);
        }
      }
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
              ? "w-12 h-12 bg-[#c8ff00]/20 border-2 border-[#c8ff00] shadow-[0_0_20px_rgba(200,255,0,0.4)]" 
              : "w-12 h-12 bg-white/10 border-2 border-white/30 hover:bg-white/15 hover:border-white/40"
          } ${isLoading ? "opacity-50" : ""}`}
          aria-label={isPlaying ? "Mute jungle sounds" : "Play jungle sounds"}
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            minWidth: '48px',
            minHeight: '48px'
          }}
        >
          {isPlaying ? (
            <Volume2 className="w-7 h-7" strokeWidth={2.5} style={{ color: accentColor }} />
          ) : (
            <VolumeX className="w-7 h-7" strokeWidth={2.5} style={{ color: 'rgba(255,255,255,0.7)' }} />
          )}
          {/* Playing indicator pulse */}
          {isPlaying && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#c8ff00] rounded-full animate-pulse shadow-[0_0_10px_rgba(200,255,0,0.8)]" />
          )}
          {/* Tap to enable prompt - shows on first visit */}
          {showTapPrompt && !isPlaying && (
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#ff0080] rounded-full animate-bounce flex items-center justify-center shadow-[0_0_10px_rgba(255,0,128,0.8)]">
              <Music className="w-3 h-3 text-white" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-5 bg-black/95 backdrop-blur-xl border-2 border-[#c8ff00]/40 rounded-2xl shadow-[0_0_30px_rgba(200,255,0,0.2)]"
        align="end"
        sideOffset={12}
      >
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#c8ff00]/20 flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-[#c8ff00]" />
              </div>
              <div>
                <p className="text-base font-bold text-white">Jungle Ambience</p>
                <p className="text-sm text-white/50">Immersive rainforest sounds</p>
              </div>
            </div>
          </div>

          {/* Toggle Button - Large and touch-friendly for iOS */}
          <button
            onClick={toggleSound}
            disabled={isLoading}
            className={`w-full py-5 px-5 rounded-xl font-bold text-lg transition-all duration-300 touch-manipulation active:scale-95 ${
              isPlaying 
                ? "bg-[#c8ff00] text-black hover:bg-[#d4ff33] shadow-[0_0_20px_rgba(200,255,0,0.4)]" 
                : "bg-white/10 text-white hover:bg-white/20 border-2 border-white/30"
            } ${isLoading ? "opacity-50 cursor-wait" : ""}`}
            style={{ 
              WebkitTapHighlightColor: 'transparent', 
              minHeight: '64px',
              WebkitAppearance: 'none'
            }}
          >
            {isLoading ? "Loading..." : isPlaying ? "🔊 Sound On - Tap to Mute" : "🔇 Tap to Play Jungle Sounds"}
          </button>

          {/* Volume Slider - Touch-friendly for iOS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Volume</span>
              <span className="text-[#c8ff00] font-bold text-base">{Math.round(volume * 100)}%</span>
            </div>
            <div 
              ref={sliderRef}
              className="relative h-10 bg-white/10 rounded-full cursor-pointer overflow-hidden touch-manipulation"
              onClick={handleVolumeChange}
              onTouchMove={handleVolumeChange}
              onMouseMove={(e) => e.buttons === 1 && handleVolumeChange(e)}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Filled portion */}
              <div 
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#c8ff00] to-[#00ffff] rounded-full transition-all duration-100"
                style={{ width: `${volume * 100}%` }}
              />
              {/* Thumb indicator - larger for touch */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-[#c8ff00] rounded-full shadow-lg border-2 border-white transition-all duration-100"
                style={{ left: `calc(${volume * 100}% - 16px)` }}
              />
            </div>
          </div>

          {/* Info */}
          <p className="text-xs text-white/40 text-center">
            🌴 Experience the immersive jungle atmosphere
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default HeaderSoundControl;
