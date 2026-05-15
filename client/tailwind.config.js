/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff5f5',
          100: '#ffe0e0',
          200: '#ffc5c5',
          300: '#ff9999',
          400: '#ff6b6b',
          500: '#ff4444',
          600: '#e63030',
          700: '#c42020',
          800: '#a01818',
          900: '#7d1212',
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
        'gradient-primary': 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
        'gradient-purple': 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1c1c1e 0%, #000000 100%)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
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
        'glow': '0 0 30px rgba(255, 107, 107, 0.3)',
        'glow-yellow': '0 0 30px rgba(255, 230, 109, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.08)',
        'card-dark': '0 4px 24px rgba(0, 0, 0, 0.4)',
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
