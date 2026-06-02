/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0feff',
          100: '#e0fdff',
          200: '#bdfaff',
          300: '#80f5ff',
          400: '#33f2ff',
          500: '#00f0ff', // Neon Cyan
          600: '#00b8d4',
          700: '#008b9c',
          800: '#005f6b',
          900: '#00363d',
        },
        accent: {
          pink: '#ff007f',
          magenta: '#ff0055',
          purple: '#bc00dd',
          yellow: '#ffe600',
          blue: '#00f0ff',
          green: '#39ff14', // Neon Green
          orange: '#ff5e00',
        },
        dark: {
          bg: '#050508', // Pure dark cyber black
          card: '#0f1016', // Slate dark card
          border: '#1b1d28', // Glowing cyber border reference
          text: '#f0f1f7',
          muted: '#7b7e8f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #00f0ff 0%, #ff007f 100%)', // Cyan to Pink
        'gradient-purple': 'linear-gradient(135deg, #bc00dd 0%, #00f0ff 100%)', // Violet to Cyan
        'gradient-dark': 'linear-gradient(135deg, #0f1016 0%, #050508 100%)',
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
        'glow': '0 0 20px rgba(0, 240, 255, 0.45)',
        'glow-cyan': '0 0 15px rgba(0, 240, 255, 0.45)',
        'glow-pink': '0 0 15px rgba(255, 0, 127, 0.45)',
        'glow-yellow': '0 0 20px rgba(255, 230, 0, 0.25)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-dark': '0 4px 24px rgba(0, 0, 0, 0.7)',
        'border-glow': '0 0 8px rgba(0, 240, 255, 0.2)',
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
