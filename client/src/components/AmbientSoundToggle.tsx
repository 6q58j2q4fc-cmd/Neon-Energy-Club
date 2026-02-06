import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AmbientSoundToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create audio element on mount
    audioRef.current = new Audio("https://files.manuscdn.com/user_upload_by_module/session_file/310519663234433834/RuVzsuSkJvAbHtJf.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    // Check localStorage for saved preferences
    const savedVolume = localStorage.getItem("neon-ambient-volume");
    const savedHidden = localStorage.getItem("neon-ambient-hidden");
    
    if (savedVolume) {
      const vol = parseFloat(savedVolume);
      setVolume(vol);
      if (audioRef.current) {
        audioRef.current.volume = vol;
      }
    }
    
    if (savedHidden === "true") {
      setIsHidden(true);
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

  const toggleHidden = () => {
    const newHidden = !isHidden;
    setIsHidden(newHidden);
    localStorage.setItem("neon-ambient-hidden", newHidden.toString());
    if (newHidden) {
      setShowVolumeSlider(false);
    }
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    
    // Handle both mouse and touch events
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const y = clientY - rect.top;
    const height = rect.height;
    
    // Invert because slider goes from bottom (0%) to top (100%)
    const newVolume = Math.max(0, Math.min(1, 1 - (y / height)));
    setVolume(newVolume);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault(); // Prevent scrolling while dragging
    handleVolumeChange(e);
  };

  // If hidden, show only a small reveal button
  if (isHidden) {
    return (
      <button
        onClick={toggleHidden}
        className="fixed bottom-4 left-4 z-40 w-8 h-8 rounded-full bg-black/50 border border-white/20 flex items-center justify-center hover:bg-black/70 hover:border-[#c8ff00]/50 transition-all"
        title="Show sound controls"
      >
        <ChevronUp className="w-4 h-4 text-white/60" />
      </button>
    );
  }

  return (
    <div 
      className="fixed bottom-4 left-4 z-40 flex flex-col items-center"
      onMouseEnter={() => setShowVolumeSlider(true)}
      onMouseLeave={() => setShowVolumeSlider(false)}
    >
      {/* Vertical Volume Slider - appears above the button on hover */}
      <div 
        className={`
          mb-2 flex flex-col items-center gap-2 px-3 py-3 rounded-xl
          bg-black/90 backdrop-blur-sm border border-white/20
          transition-all duration-300
          ${showVolumeSlider ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
        `}
      >
        {/* Hide button */}
        <button
          onClick={toggleHidden}
          className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
          title="Hide sound controls"
        >
          <ChevronDown className="w-3 h-3 text-white/60" />
        </button>
        
        {/* Volume percentage */}
        <span className="text-xs text-[#c8ff00] font-bold">{Math.round(volume * 100)}%</span>
        
        {/* Vertical Slider Track */}
        <div 
          ref={sliderRef}
          className="relative w-8 h-40 bg-white/10 rounded-full cursor-pointer overflow-hidden touch-none"
          onClick={handleVolumeChange}
          onMouseMove={(e) => e.buttons === 1 && handleVolumeChange(e)}
          onTouchStart={handleVolumeChange}
          onTouchMove={handleTouchMove}
        >
          {/* Filled portion */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#c8ff00] to-[#00ffff] rounded-full transition-all duration-100"
            style={{ height: `${volume * 100}%` }}
          />
          {/* Thumb indicator - larger for mobile */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 w-7 h-7 bg-[#c8ff00] rounded-full shadow-lg border-2 border-white transition-all duration-100 pointer-events-none"
            style={{ bottom: `calc(${volume * 100}% - 14px)` }}
          />
          {/* Larger invisible touch target */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full pointer-events-none"
            style={{ bottom: `calc(${volume * 100}% - 24px)` }}
          />
        </div>
        
        {/* Label */}
        <span className="text-[10px] text-white/60 whitespace-nowrap">Jungle</span>
      </div>

      {/* Sound Toggle Button */}
      <Button
        onClick={toggleSound}
        size="icon"
        variant="outline"
        className={`
          w-12 h-12 rounded-full border-2 transition-all duration-300
          ${isPlaying 
            ? "bg-[#c8ff00]/20 border-[#c8ff00] text-[#c8ff00] shadow-[0_0_20px_rgba(200,255,0,0.3)]" 
            : "bg-black/50 border-white/30 text-white/60 hover:border-[#c8ff00]/50 hover:text-[#c8ff00]"
          }
          backdrop-blur-sm
        `}
        title={isPlaying ? "Mute jungle sounds" : "Play jungle ambient sounds"}
      >
        {isPlaying ? (
          <Volume2 className="w-6 h-6" />
        ) : (
          <VolumeX className="w-6 h-6" />
        )}
      </Button>
    </div>
  );
}

export default AmbientSoundToggle;
