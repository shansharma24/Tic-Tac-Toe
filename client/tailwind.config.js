/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#070913',
          darker: '#04060b',
          card: 'rgba(15, 23, 42, 0.65)',
          panel: 'rgba(13, 17, 39, 0.75)',
        },
        brand: {
          cyan: '#00f0ff',
          violet: '#8b5cf6',
          purple: '#7c3aed',
          pink: '#ec4899',
        },
        playerX: {
          DEFAULT: '#00f0ff',
          glow: 'rgba(0, 240, 255, 0.35)',
          subtle: 'rgba(0, 240, 255, 0.12)',
        },
        playerO: {
          DEFAULT: '#f43f5e',
          glow: 'rgba(244, 63, 94, 0.35)',
          subtle: 'rgba(244, 63, 94, 0.12)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-glow-cyan': '0 0 25px -5px rgba(0, 240, 255, 0.3)',
        'glass-glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.3)',
        'glass-glow-pink': '0 0 25px -5px rgba(244, 63, 94, 0.3)',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glowPulse: {
          'from': { filter: 'drop-shadow(0 0 4px currentColor)' },
          'to': { filter: 'drop-shadow(0 0 16px currentColor)' }
        }
      }
    },
  },
  plugins: [],
}
