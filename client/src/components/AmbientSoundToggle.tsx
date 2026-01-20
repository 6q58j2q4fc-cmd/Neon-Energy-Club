import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export function AmbientSoundToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element on mount
    audioRef.current = new Audio("/jungle-ambient.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    // Check localStorage for saved preference
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

  return (
    <div 
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2"
      onMouseEnter={() => setShowVolumeSlider(true)}
      onMouseLeave={() => setShowVolumeSlider(false)}
    >
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
          <Volume2 className="w-5 h-5" />
        ) : (
          <VolumeX className="w-5 h-5" />
        )}
      </Button>

      {/* Volume slider - appears on hover */}
      <div 
        className={`
          flex items-center gap-2 px-3 py-2 rounded-full 
          bg-black/80 backdrop-blur-sm border border-white/20
          transition-all duration-300
          ${showVolumeSlider ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"}
        `}
      >
        <span className="text-xs text-white/60 whitespace-nowrap">Jungle Sounds</span>
        <Slider
          value={[volume * 100]}
          onValueChange={(value) => setVolume(value[0] / 100)}
          max={100}
          step={1}
          className="w-24"
        />
        <span className="text-xs text-[#c8ff00] w-8">{Math.round(volume * 100)}%</span>
      </div>
    </div>
  );
}

export default AmbientSoundToggle;
