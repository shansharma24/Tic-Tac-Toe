import React, { createContext, useContext, useState } from 'react';
import { sound } from '../services/sound.js';

const SoundContext = createContext(null);

export const SoundProvider = ({ children }) => {
  const [muted, setMutedState] = useState(() => sound.isMuted());

  const toggleMute = () => {
    const isNowMuted = sound.toggleMute();
    setMutedState(isNowMuted);
    if (!isNowMuted) {
      sound.playClick();
    }
  };

  return (
    <SoundContext.Provider
      value={{
        muted,
        toggleMute,
        playClick: () => sound.playClick(),
        playMove: (mark) => sound.playMove(mark),
        playGameStart: () => sound.playGameStart(),
        playVictory: () => sound.playVictory(),
        playDefeat: () => sound.playDefeat(),
        playDraw: () => sound.playDraw(),
        playChat: () => sound.playChat(),
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound must be used within a SoundProvider');
  return ctx;
};
