/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f5f7',
          100: '#e8e8ed',
          200: '#d2d2d7',
          300: '#86868b',
          400: '#515154',
          500: '#0071e3', // Apple Blue
          600: '#005bbf',
          700: '#004488',
          800: '#002d5b',
          900: '#00172d',
        },
        accent: {
          yellow: '#FFE66D',
          purple: '#a855f7',
          blue: '#3b82f6',
          green: '#22c55e',
          orange: '#f97316',
        },
        dark: {
          bg: '#000000',
          card: '#1c1c1e',
          border: '#2c2c2e',
          text: '#f5f5f7',
          muted: '#86868b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0071e3 0%, #005bbf 100%)',
        'gradient-purple': 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1c1c1e 0%, #000000 100%)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 113, 227, 0.4)',
        'glow-yellow': '0 0 20px rgba(255, 255, 255, 0.2)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.04)',
        'card-dark': '0 4px 24px rgba(0, 0, 0, 0.6)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
