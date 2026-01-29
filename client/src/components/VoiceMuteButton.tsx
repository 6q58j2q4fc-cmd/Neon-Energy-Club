import { useSoundEffects } from "@/hooks/useSoundEffects";
import { Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

const COLLAPSED_STORAGE_KEY = "neon-voice-collapsed";

export default function VoiceMuteButton() {
  const { isMuted, toggleMute } = useSoundEffects();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(COLLAPSED_STORAGE_KEY) === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem(COLLAPSED_STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  return (
    <div 
      className={`fixed bottom-24 z-40 transition-all duration-300 ease-in-out ${
        isCollapsed ? "right-0" : "right-4"
      }`}
    >
      <div className="flex items-center">
        {/* Collapse/Expand toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`h-8 w-5 bg-black/60 backdrop-blur-sm border border-[#c8ff00]/20 flex items-center justify-center hover:bg-black/80 transition-all duration-200 ${
            isCollapsed ? "rounded-l-lg border-r-0" : "rounded-l-lg"
          }`}
          title={isCollapsed ? "Show sound controls" : "Hide sound controls"}
        >
          {isCollapsed ? (
            <ChevronLeft className="w-3 h-3 text-white/50" />
          ) : (
            <ChevronRight className="w-3 h-3 text-white/50" />
          )}
        </button>

        {/* Main mute button - slides in/out */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isCollapsed ? "w-0 opacity-0" : "w-10 opacity-100"
          }`}
        >
          <button
            onClick={toggleMute}
            className="w-10 h-10 rounded-r-full bg-black/60 backdrop-blur-sm border border-[#c8ff00]/20 border-l-0 flex items-center justify-center hover:bg-black/80 hover:border-[#c8ff00]/40 transition-all duration-200 group"
            title={isMuted ? "Unmute sounds" : "Mute sounds"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#c8ff00]/70 group-hover:text-[#c8ff00] transition-colors" />
            )}
          </button>
        </div>

        {/* Collapsed indicator - small dot showing sound state */}
        {isCollapsed && (
          <button
            onClick={toggleMute}
            className="w-6 h-8 bg-black/60 backdrop-blur-sm border border-[#c8ff00]/20 border-l-0 rounded-r-lg flex items-center justify-center hover:bg-black/80 transition-all"
            title={isMuted ? "Unmute sounds" : "Mute sounds"}
          >
            <div
              className={`w-2 h-2 rounded-full transition-colors ${
                isMuted ? "bg-white/30" : "bg-[#c8ff00]/70"
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
}
