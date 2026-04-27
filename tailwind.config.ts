import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        'space-grotesk': ['var(--font-space-grotesk)'],
        manrope: ['var(--font-manrope)'],
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
        glitch: {
          '0%, 100%': { transform: 'translate(0)', clipPath: 'none' },
          '20%': { transform: 'translate(-2px, 2px)', clipPath: 'inset(20% 0 40% 0)' },
          '40%': { transform: 'translate(2px, -2px)', clipPath: 'inset(60% 0 10% 0)' },
          '60%': { transform: 'translate(-1px, 1px)', clipPath: 'none' },
          '80%': { transform: 'translate(1px, -1px)', clipPath: 'inset(40% 0 30% 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'neon-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 20px currentColor',
          },
          '50%': {
            boxShadow: '0 0 10px currentColor, 0 0 30px currentColor, 0 0 60px currentColor',
          },
        },
        'border-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(80px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(80px) rotate(-360deg)' },
        },
        'orbit-reverse': {
          '0%': { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg) translateX(120px) rotate(360deg)' },
        },
        'text-flicker': {
          '0%, 100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '0' },
          '94%': { opacity: '1' },
          '96%': { opacity: '0' },
          '97%': { opacity: '1' },
        },
        'matrix-fall': {
          '0%': { transform: 'translateY(-100%)', opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
        'tilt-3d': {
          '0%, 100%': { transform: 'perspective(600px) rotateX(0deg) rotateY(0deg)' },
          '25%': { transform: 'perspective(600px) rotateX(5deg) rotateY(5deg)' },
          '75%': { transform: 'perspective(600px) rotateX(-5deg) rotateY(-5deg)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'count-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
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
        glitch: 'glitch 0.3s ease-in-out',
        shimmer: 'shimmer 3s linear infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'border-spin': 'border-spin 4s linear infinite',
        'scan-line': 'scan-line 8s linear infinite',
        orbit: 'orbit 8s linear infinite',
        'orbit-reverse': 'orbit-reverse 12s linear infinite',
        'text-flicker': 'text-flicker 5s linear infinite',
        'gradient-shift': 'gradient-shift 6s ease infinite',
        'count-up': 'count-up 0.5s ease-out',
        'spin-slow': 'spin-slow 20s linear infinite',
        'tilt-3d': 'tilt-3d 6s ease-in-out infinite',
      },
    },
  },
};

export default config;
