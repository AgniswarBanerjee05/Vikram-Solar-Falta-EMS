import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e'
        }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(56, 189, 248, 0.25)'
      },
      keyframes: {
        aurora: {
          '0%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(8%, -6%, 0) scale(1.08)' },
          '100%': { transform: 'translate3d(0, 0, 0) scale(1)' }
        },
        'aurora-reverse': {
          '0%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(-6%, 6%, 0) scale(1.04)' },
          '100%': { transform: 'translate3d(0, 0, 0) scale(1)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        'pulse-ring': {
          '0%': { 
            transform: 'scale(0.8)',
            opacity: '1'
          },
          '50%': {
            transform: 'scale(1.2)',
            opacity: '0.5'
          },
          '100%': { 
            transform: 'scale(1.5)',
            opacity: '0'
          }
        },
        glint: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        shine: {
          '0%': { transform: 'translateX(-100%) translateY(-100%) rotate(30deg)' },
          '100%': { transform: 'translateX(100%) translateY(100%) rotate(30deg)' }
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '0.9' }
        },
        'grid-flow': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(4rem)' }
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' }
        }
      },
      animation: {
        'aurora-slow': 'aurora 22s ease-in-out infinite',
        'aurora-reverse': 'aurora-reverse 28s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 14s ease-in-out infinite',
        'float-delay': 'float 16s ease-in-out infinite 1.2s',
        'pulse-ring': 'pulse-ring 3.6s ease-out infinite',
        'glint-slow': 'glint 18s linear infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'shine': 'shine 8s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out'
      }
    }
  },
  plugins: []
};

export default config;
