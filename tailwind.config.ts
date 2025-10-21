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
          '50%': { transform: 'translateY(-8px)' }
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(14, 165, 233, 0.45)' },
          '70%': { boxShadow: '0 0 0 18px rgba(14, 165, 233, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(14, 165, 233, 0)' }
        },
        glint: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        }
      },
      animation: {
        'aurora-slow': 'aurora 22s ease-in-out infinite',
        'aurora-reverse': 'aurora-reverse 28s ease-in-out infinite',
        'float-slow': 'float 14s ease-in-out infinite',
        'float-delay': 'float 16s ease-in-out infinite 1.2s',
        'pulse-ring': 'pulse-ring 3.6s ease-out infinite',
        'glint-slow': 'glint 18s linear infinite'
      }
    }
  },
  plugins: []
};

export default config;
