/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3f2ff',
          100: '#dedaff',
          200: '#bbb3ff',
          300: '#998eff',
          400: '#8172ff',
          500: '#6c5ce7', // Royal Violet
          600: '#5b4cd8',
          700: '#4839bd',
          800: '#35279e',
          900: '#21187d',
        },
        accent: {
          pink: '#ff007f',
          magenta: '#ff0055',
          purple: '#bc00dd',
          yellow: '#ffe600',
          blue: '#00d2ff',
          green: '#20c997',
          orange: '#fd7e14',
        },
        dark: {
          bg: '#060608', // Framer space dark
          card: '#0f0f14', // Framer slate card
          border: 'rgba(255, 255, 255, 0.08)', // Ultra thin silver-white borders
          text: '#ffffff',
          muted: '#888899',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6c5ce7 0%, #00d2ff 100%)', // Violet to Cyan
        'gradient-purple': 'linear-gradient(135deg, #8a2be2 0%, #6c5ce7 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0f0f14 0%, #060608 100%)',
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
        'glow': '0 0 20px rgba(108, 92, 231, 0.4)',
        'framer-shadow': '0 0 0 1px rgba(255, 255, 255, 0.08), 0 8px 30px rgba(0, 0, 0, 0.5)',
        'framer-shadow-hover': '0 0 0 1px rgba(255, 255, 255, 0.16), 0 0 25px rgba(108, 92, 231, 0.15), 0 12px 40px rgba(0, 0, 0, 0.7)',
        'card': '0 0 0 1px rgba(255, 255, 255, 0.08), 0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-dark': '0 0 0 1px rgba(255, 255, 255, 0.12), 0 8px 30px rgba(0, 0, 0, 0.7)',
        'border-glow': '0 0 0 1px rgba(108, 92, 231, 0.3), 0 0 12px rgba(108, 92, 231, 0.1)',
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
