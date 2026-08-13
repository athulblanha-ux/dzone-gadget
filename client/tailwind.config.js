/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef7ff',
          100: '#d8edff',
          200: '#b3dbff',
          300: '#75c1ff',
          400: '#339dff',
          500: '#007aff', // Vivid Electric Blue
          600: '#005bdf',
          700: '#0045b5',
          800: '#003893',
          900: '#002360',
          950: '#001238',
        },
        accent: {
          cyan: '#00f0ff',
          neon: '#00f5d4',
          violet: '#8b5cf6',
          pink: '#ff007f',
          yellow: '#ffe600',
          green: '#10b981',
          orange: '#f97316',
        },
        dark: {
          bg: '#080b11', // Deep Space Slate
          card: '#101522', // Obsidian Glass Slate
          cardHover: '#161c2e',
          border: 'rgba(255, 255, 255, 0.08)',
          glowBorder: 'rgba(0, 240, 255, 0.25)',
          text: '#f8fafc',
          muted: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #00f0ff 0%, #007aff 50%, #7000ff 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #00f0ff 0%, #007aff 100%)',
        'gradient-dark': 'linear-gradient(180deg, #101522 0%, #080b11 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-glow': 'pulseGlow 2.5s infinite',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 15px rgba(0, 240, 255, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 25px rgba(0, 240, 255, 0.8))' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow': '0 0 25px rgba(0, 122, 255, 0.4)',
        'glow-cyan': '0 0 25px rgba(0, 240, 255, 0.4)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        'card-hover': '0 12px 40px -10px rgba(0, 122, 255, 0.3), 0 0 0 1px rgba(0, 240, 255, 0.3)',
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
