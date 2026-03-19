"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { initAudio, isAudioReady } from "@/lib/audio/synth";

interface AudioContextValue {
  readonly ready: boolean;
  readonly initialize: () => Promise<void>;
}

const AudioCtx = createContext<AudioContextValue>({
  ready: false,
  initialize: async () => {},
});

export function useAudio(): AudioContextValue {
  return useContext(AudioCtx);
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const initializing = useRef(false);

  const initialize = async () => {
    if (initializing.current || isAudioReady()) return;
    initializing.current = true;
    try {
      await initAudio();
      setReady(true);
    } catch (err) {
      console.error("Audio initialization failed:", err);
    } finally {
      initializing.current = false;
    }
  };

  // Auto-initialize on first user interaction
  useEffect(() => {
    const handler = () => {
      if (!isAudioReady()) {
        initialize();
      }
    };
    window.addEventListener("click", handler, { once: true });
    window.addEventListener("keydown", handler, { once: true });
    return () => {
      window.removeEventListener("click", handler);
      window.removeEventListener("keydown", handler);
    };
  }, []);

  return (
    <AudioCtx.Provider value={{ ready, initialize }}>
      {children}
    </AudioCtx.Provider>
  );
}
