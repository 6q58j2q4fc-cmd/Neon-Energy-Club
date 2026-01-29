import { useSoundEffects } from "@/hooks/useSoundEffects";
import { Volume2, VolumeX } from "lucide-react";

export default function VoiceMuteButton() {
  const { isMuted, toggleMute } = useSoundEffects();

  return (
    <button
      onClick={toggleMute}
      className="fixed top-32 right-4 z-40 w-10 h-10 rounded-full bg-black/80 backdrop-blur-sm border border-[#c8ff00]/30 flex items-center justify-center hover:bg-black/90 hover:border-[#c8ff00]/50 transition-all duration-200 group"
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
