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
      colors: {
        primary: "#7c3aed", // Optional
        dark: "#111827",    // Optional
      },
      fontFamily: {
        heading: ['"Oswald"', "sans-serif"], // Optional
      },
    },
  },
  plugins: [
  require('@tailwindcss/forms'),
  require('@tailwindcss/typography'),      // If you style long text/NDA sections
  require('@tailwindcss/aspect-ratio'),    // For embedded video/image control
],
};
