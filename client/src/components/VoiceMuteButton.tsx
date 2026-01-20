import { useSoundEffects } from "@/hooks/useSoundEffects";
import { Volume2, VolumeX } from "lucide-react";

export default function VoiceMuteButton() {
  const { isMuted, toggleMute } = useSoundEffects();

  return (
    <button
      onClick={toggleMute}
      className="fixed bottom-4 left-4 z-50 w-12 h-12 rounded-full bg-black/80 backdrop-blur-sm border border-[#c8ff00]/30 flex items-center justify-center hover:bg-black/90 hover:border-[#c8ff00]/50 transition-all duration-200 group"
      title={isMuted ? "Unmute voice" : "Mute voice"}
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
      ) : (
        <Volume2 className="w-5 h-5 text-[#c8ff00] group-hover:text-[#d9ff33] transition-colors" />
      )}
    </button>
  );
}
