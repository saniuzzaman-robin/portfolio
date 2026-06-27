import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['var(--font-poppins)', 'sans-serif'],
        'fira-code': ['var(--font-fira-code)', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-left': {
          '0%': { transform: 'translateX(30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-right': {
          '0%': { transform: 'translateX(-30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-12px) rotate(2deg)' },
          '66%': { transform: 'translateY(-6px) rotate(-1deg)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.85', filter: 'brightness(1.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'neon-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 20px currentColor' },
          '50%': { boxShadow: '0 0 10px currentColor, 0 0 30px currentColor, 0 0 60px currentColor' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'dropdown-open': {
          '0%': { opacity: '0', transform: 'translateY(-6px) scaleY(0.92)', transformOrigin: 'top center' },
          '100%': { opacity: '1', transform: 'translateY(0) scaleY(1)', transformOrigin: 'top center' },
        },
        'dropdown-item': {
          '0%': { opacity: '0', transform: 'translateX(-6px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.75' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'float-sm': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in',
        'slide-up': 'slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slide-down 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-left': 'slide-left 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-right': 'slide-right 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        float: 'float 4s ease-in-out infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        glow: 'glow 3s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 6s ease infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        'dropdown-open': 'dropdown-open 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'dropdown-item': 'dropdown-item 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        ticker: 'ticker 28s linear infinite',
        'float-sm': 'float-sm 3s ease-in-out infinite',
      },
    },
  },
};

export default config;
