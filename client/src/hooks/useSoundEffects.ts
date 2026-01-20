import { useCallback, useRef, useEffect, useState } from "react";

export type SoundType = "click" | "preorder" | "back" | "join" | "territory" | "apply";

const SOUND_FILES: Record<SoundType, string> = {
  click: "/sounds/voice-click.wav",
  preorder: "/sounds/voice-preorder.wav",
  back: "/sounds/voice-back.wav",
  join: "/sounds/voice-join.wav",
  territory: "/sounds/voice-territory.wav",
  apply: "/sounds/voice-apply.wav",
};

const MUTE_STORAGE_KEY = "neon-voice-muted";

export function useSoundEffects() {
  const audioRefs = useRef<Map<SoundType, HTMLAudioElement>>(new Map());
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(MUTE_STORAGE_KEY) === "true";
    }
    return false;
  });

  useEffect(() => {
    Object.entries(SOUND_FILES).forEach(([type, src]) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.volume = 0.7;
      audioRefs.current.set(type as SoundType, audio);
    });

    return () => {
      audioRefs.current.forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
      audioRefs.current.clear();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(MUTE_STORAGE_KEY, String(isMuted));
  }, [isMuted]);

  const playSound = useCallback(
    (type: SoundType) => {
      if (isMuted) return;
      const audio = audioRefs.current.get(type);
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    },
    [isMuted]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  return { playSound, isMuted, toggleMute };
}
