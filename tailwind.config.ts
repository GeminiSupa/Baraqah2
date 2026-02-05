import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette inspired by Pure Matrimony
        primary: {
          50: '#e4f6ff',
          100: '#c6ebff',
          200: '#8fd5ff',
          300: '#56bfff',
          400: '#23a8f0',
          500: '#0095e0', // main brand blue
          600: '#0077b6',
          700: '#005c8b',
          800: '#004161',
          900: '#002637',
        },
        // Brand Blue
        iosBlue: {
          DEFAULT: '#0095E0',
          light: '#4CC6FF',
          dark: '#0077B6',
        },
        // Accent Green (kept close to original, used less often)
        iosGreen: {
          DEFAULT: '#28C267',
          light: '#4AD98A',
          dark: '#1FA157',
        },
        // Brand Red (for CTAs & accents)
        iosRed: {
          DEFAULT: '#E91B4B',
          light: '#FF4C72',
          dark: '#C3153C',
        },
        // Warm accent now aligned with brand red family
        iosOrange: {
          DEFAULT: '#FF2E5F',
          light: '#FF6B8A',
          dark: '#CC244B',
        },
        // iOS System Gray
        iosGray: {
          1: '#8E8E93',
          2: '#AEAEB2',
          3: '#C7C7CC',
          4: '#D1D1D6',
          5: '#E5E5EA',
          6: '#F2F2F7',
        },
        // iOS Background Colors
        iosBg: {
          primary: '#FFFFFF',
          secondary: '#F2F2F7',
          tertiary: '#FFFFFF',
        },
      },
      borderRadius: {
        'ios': '10px',
        'ios-lg': '14px',
        'ios-xl': '20px',
        'ios-full': '9999px',
      },
      boxShadow: {
        'ios': '0 2px 8px rgba(0, 0, 0, 0.15)',
        'ios-lg': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'ios-xl': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'ios-inset': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        'ios-large': ['34px', { lineHeight: '41px', fontWeight: '700' }],
        'ios-title1': ['28px', { lineHeight: '34px', fontWeight: '700' }],
        'ios-title2': ['22px', { lineHeight: '28px', fontWeight: '700' }],
        'ios-title3': ['20px', { lineHeight: '25px', fontWeight: '600' }],
        'ios-headline': ['17px', { lineHeight: '22px', fontWeight: '600' }],
        'ios-body': ['17px', { lineHeight: '22px', fontWeight: '400' }],
        'ios-callout': ['16px', { lineHeight: '21px', fontWeight: '400' }],
        'ios-subhead': ['15px', { lineHeight: '20px', fontWeight: '400' }],
        'ios-footnote': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'ios-caption1': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'ios-caption2': ['11px', { lineHeight: '13px', fontWeight: '400' }],
      },
      spacing: {
        'ios-safe-top': 'env(safe-area-inset-top)',
        'ios-safe-bottom': 'env(safe-area-inset-bottom)',
        'ios-safe-left': 'env(safe-area-inset-left)',
        'ios-safe-right': 'env(safe-area-inset-right)',
      },
      backdropBlur: {
        'ios': '20px',
        'ios-lg': '40px',
      },
      transitionTimingFunction: {
        'ios': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        'ios-in': 'cubic-bezier(0.4, 0.0, 1, 1)',
        'ios-out': 'cubic-bezier(0.0, 0.0, 0.2, 1)',
      },
      animation: {
        'ios-bounce': 'bounce 0.3s ease-in-out',
        'ios-fade-in': 'fadeIn 0.2s ease-out',
        'ios-slide-up': 'slideUp 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
        'ios-slide-down': 'slideDown 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
        'ios-spring': 'spring 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'ios-pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ios-glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        spring: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 122, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 122, 255, 0.8), 0 0 30px rgba(0, 122, 255, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
export default config