import React from 'react';

export const GlassCard = ({
  children,
  className = '',
  glow = 'none', // 'cyan' | 'violet' | 'pink' | 'none'
  hoverEffect = false,
  ...props
}) => {
  const glowClasses = {
    cyan: 'shadow-glass-glow-cyan border-cyan-500/20',
    violet: 'shadow-glass-glow-violet border-violet-500/20',
    pink: 'shadow-glass-glow-pink border-pink-500/20',
    none: 'shadow-glass border-white/[0.08]',
  };

  const hoverClasses = hoverEffect
    ? 'hover:border-cyan-400/40 hover:-translate-y-0.5 transition-all duration-300'
    : '';

  return (
    <div
      className={`glass-card rounded-2xl p-5 sm:p-6 text-slate-100 ${glowClasses[glow] || glowClasses.none} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
