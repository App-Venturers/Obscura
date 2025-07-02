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
      },
      animation: {
        'door-open': 'door-open 0.8s ease-in-out forwards',
      },
    },
  },
  plugins: [],
};
