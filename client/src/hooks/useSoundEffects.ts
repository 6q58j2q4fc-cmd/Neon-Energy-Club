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
const SPEED_STORAGE_KEY = "neon-voice-speed";

export function useSoundEffects() {
  const audioRefs = useRef<Map<SoundType, HTMLAudioElement>>(new Map());
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(MUTE_STORAGE_KEY) === "true";
    }
    return false;
  });
  const [playbackRate, setPlaybackRateState] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(SPEED_STORAGE_KEY);
      return stored ? parseFloat(stored) : 1;
    }
    return 1;
  });

  useEffect(() => {
    Object.entries(SOUND_FILES).forEach(([type, src]) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.volume = 0.7;
      audio.playbackRate = playbackRate;
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

  // Update playback rate on all audio elements when it changes
  useEffect(() => {
    audioRefs.current.forEach((audio) => {
      audio.playbackRate = playbackRate;
    });
    localStorage.setItem(SPEED_STORAGE_KEY, String(playbackRate));
  }, [playbackRate]);

  useEffect(() => {
    localStorage.setItem(MUTE_STORAGE_KEY, String(isMuted));
  }, [isMuted]);

  const playSound = useCallback(
    (type: SoundType) => {
      if (isMuted) return;
      const audio = audioRefs.current.get(type);
      if (audio) {
        audio.currentTime = 0;
        audio.playbackRate = playbackRate;
        audio.play().catch(() => {});
      }
    },
    [isMuted, playbackRate]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
  }, []);

  return { playSound, isMuted, toggleMute, playbackRate, setPlaybackRate };
}
