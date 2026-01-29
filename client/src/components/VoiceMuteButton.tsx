import { useSoundEffects } from "@/hooks/useSoundEffects";
import { Volume2, VolumeX, ChevronUp, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function VoiceMuteButton() {
  const { isMuted, toggleMute, playbackRate, setPlaybackRate } = useSoundEffects();
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowSpeedMenu(false);
      }
    };
    if (showSpeedMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSpeedMenu]);

  return (
    <div className="fixed top-32 right-4 z-40 flex flex-col items-end gap-2" ref={menuRef}>
      {/* Main mute button */}
      <button
        onClick={toggleMute}
        className="w-10 h-10 rounded-full bg-black/80 backdrop-blur-sm border border-[#c8ff00]/30 flex items-center justify-center hover:bg-black/90 hover:border-[#c8ff00]/50 transition-all duration-200 group"
        title={isMuted ? "Unmute voice" : "Mute voice"}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
        ) : (
          <Volume2 className="w-5 h-5 text-[#c8ff00] group-hover:text-[#d9ff33] transition-colors" />
        )}
      </button>

      {/* Speed control button */}
      {!isMuted && (
        <button
          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
          className="h-8 px-2 rounded-full bg-black/80 backdrop-blur-sm border border-[#c8ff00]/30 flex items-center justify-center hover:bg-black/90 hover:border-[#c8ff00]/50 transition-all duration-200 group text-xs font-bold"
          title="Playback speed"
        >
          <span className="text-[#c8ff00] mr-1">{playbackRate}x</span>
          {showSpeedMenu ? (
            <ChevronUp className="w-3 h-3 text-white/50" />
          ) : (
            <ChevronDown className="w-3 h-3 text-white/50" />
          )}
        </button>
      )}

      {/* Speed menu dropdown */}
      {showSpeedMenu && !isMuted && (
        <div className="absolute top-24 right-0 bg-black/95 backdrop-blur-xl border border-[#c8ff00]/30 rounded-xl overflow-hidden shadow-xl shadow-black/50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-white/10">
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Playback Speed</span>
          </div>
          <div className="py-1">
            {SPEED_OPTIONS.map((speed) => (
              <button
                key={speed}
                onClick={() => {
                  setPlaybackRate(speed);
                  setShowSpeedMenu(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-all ${
                  playbackRate === speed
                    ? "bg-[#c8ff00]/20 text-[#c8ff00] font-bold"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {speed}x
                {speed === 1 && <span className="text-white/40 ml-2 text-xs">(Normal)</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
