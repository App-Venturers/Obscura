// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        'door-open': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(90deg)' },
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(147, 51, 234, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(147, 51, 234, 0.8)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glitch': {
          '0%, 100%': { textShadow: '2px 2px 0 #ff00ff, -2px -2px 0 #00ffff' },
          '25%': { textShadow: '-2px 2px 0 #ff00ff, 2px -2px 0 #00ffff' },
          '50%': { textShadow: '2px -2px 0 #ff00ff, -2px 2px 0 #00ffff' },
          '75%': { textShadow: '-2px -2px 0 #ff00ff, 2px 2px 0 #00ffff' },
        },
        'pulse-neon': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
      animation: {
        'door-open': 'door-open 0.8s ease-in-out forwards',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glitch': 'glitch 1s linear infinite',
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      colors: {
        primary: "#7c3aed",
        dark: "#111827",
        neon: {
          purple: "#9333ea",
          pink: "#ec4899",
          cyan: "#06b6d4",
          blue: "#3b82f6",
          green: "#10b981",
        },
        gaming: {
          dark: "#0a0a0a",
          darker: "#050505",
          accent: "#7c3aed",
        },
      },
      fontFamily: {
        heading: ['"Oswald"', "sans-serif"],
        gaming: ['"Orbitron"', '"Rajdhani"', "sans-serif"],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'cyber-grid': 'linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px), linear-gradient(to right, rgba(147, 51, 234, 0.1) 1px, transparent 1px)',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(147, 51, 234, 0.5)',
        'neon-lg': '0 0 40px rgba(147, 51, 234, 0.8)',
        'neon-pink': '0 0 20px rgba(236, 72, 153, 0.5)',
        'neon-cyan': '0 0 20px rgba(6, 182, 212, 0.5)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
