import React from 'react';
import { useSound } from '../../context/SoundContext.jsx';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass'
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  loading = false,
  onClick,
  className = '',
  type = 'button',
  ...props
}) => {
  const { playClick } = useSound();

  const handleClick = (e) => {
    if (disabled || loading) return;
    playClick();
    if (onClick) onClick(e);
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.45)] border border-cyan-300/30 active:scale-[0.98]',
    secondary:
      'bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white font-semibold shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-violet-400/30 active:scale-[0.98]',
    danger:
      'bg-rose-600/80 hover:bg-rose-600 text-white font-semibold border border-rose-400/30 shadow-[0_0_15px_rgba(244,63,94,0.3)] active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-white/10 text-slate-300 hover:text-white border border-transparent active:scale-[0.98]',
    glass:
      'bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 backdrop-blur-md active:scale-[0.98]',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-7 py-3.5 text-base rounded-xl font-bold tracking-wide gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      className={`inline-flex items-center justify-center transition-all duration-200 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 ${
        variantStyles[variant] || variantStyles.primary
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};
