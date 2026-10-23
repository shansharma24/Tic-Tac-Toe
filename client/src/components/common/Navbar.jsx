import React, { useState } from 'react';
import { Logo } from './Logo.jsx';
import { SoundToggle } from './SoundToggle.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { User, Trophy, History, HelpCircle, Gamepad2, Edit3, Menu, X } from 'lucide-react';

export const Navbar = ({ currentView, onViewChange, onOpenHowToPlay, onOpenNicknameModal }) => {
  const { player } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'lobby', label: 'Play Arena', icon: Gamepad2 },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'history', label: 'Match History', icon: History },
  ];

  const handleNavClick = (viewId) => {
    onViewChange(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/[0.08] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo onClick={() => handleNavClick('landing')} />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={onOpenHowToPlay}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-violet-400" />
            <span>Rules</span>
          </button>
        </nav>

        {/* Right Section: Sound Toggle & Guest Identity */}
        <div className="hidden md:flex items-center gap-3">
          <SoundToggle />

          {/* Guest Player Pill */}
          <div
            onClick={onOpenNicknameModal}
            role="button"
            tabIndex={0}
            title="Click to edit player nickname"
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:border-cyan-500/40 hover:bg-white/10 transition-all cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-xs font-black text-slate-950 shadow-sm">
              {player?.nickname ? player.nickname.charAt(0).toUpperCase() : 'G'}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors leading-tight">
                {player?.nickname || 'Guest Player'}
              </span>
              <span className="text-[10px] text-slate-400 leading-none">
                {player?.stats ? `${player.stats.wins}W - ${player.stats.losses}L` : 'Guest Mode'}
              </span>
            </div>
            <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors ml-1" />
          </div>
        </div>

        {/* Mobile Menu & Sound Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <SoundToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-white/10 px-4 pt-3 pb-5 space-y-3">
          {/* Guest Identity Card in Mobile */}
          <div
            onClick={() => {
              onOpenNicknameModal();
              setMobileMenuOpen(false);
            }}
            className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-sm font-bold text-slate-950">
                {player?.nickname ? player.nickname.charAt(0).toUpperCase() : 'G'}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{player?.nickname || 'Guest Player'}</p>
                <p className="text-xs text-slate-400">
                  {player?.stats ? `${player.stats.wins} Wins • ${player.stats.winRate}% Win Rate` : 'Tap to change name'}
                </p>
              </div>
            </div>
            <Edit3 className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors ${
                    isActive ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => {
                onOpenHowToPlay();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left text-slate-200 hover:bg-white/5"
            >
              <HelpCircle className="w-5 h-5 text-violet-400" />
              <span>How to Play</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
