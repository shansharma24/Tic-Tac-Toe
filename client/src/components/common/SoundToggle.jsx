import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useSound } from '../../context/SoundContext.jsx';

export const SoundToggle = ({ className = '' }) => {
  const { muted, toggleMute } = useSound();

  return (
    <button
      onClick={toggleMute}
      aria-label={muted ? 'Unmute game audio' : 'Mute game audio'}
      title={muted ? 'Audio is Muted (Click to Unmute)' : 'Audio is Enabled (Click to Mute)'}
      className={`relative p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-slate-300 hover:text-white flex items-center justify-center cursor-pointer ${className}`}
    >
      {muted ? (
        <VolumeX className="w-5 h-5 text-rose-400" />
      ) : (
        <Volume2 className="w-5 h-5 text-cyan-400" />
      )}
      <span className="sr-only">{muted ? 'Unmute' : 'Mute'}</span>
    </button>
  );
};
