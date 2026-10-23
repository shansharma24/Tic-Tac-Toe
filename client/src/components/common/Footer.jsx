import React from 'react';
import { Logo } from './Logo.jsx';
import { ShieldCheck, Zap, Activity } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full glass-panel border-t border-white/[0.08] mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo showSubtitle={false} />

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Socket.IO</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Server-Authoritative Anti-Cheat</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-violet-400" />
              <span>Persistent MongoDB Atlas</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 font-mono">
            &copy; {new Date().getFullYear()} Floyd Technology Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
