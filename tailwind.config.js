/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"]
  ,
  theme: {
    extend: {
      animation: {
        'door-open': 'doorOpen 1s ease forwards',
        'fade-up': 'fadeUp 1s ease forwards',
      },
      keyframes: {
        doorOpen: {
          '0%': { transform: 'rotateY(0deg)', opacity: '1' },
          '100%': { transform: 'rotateY(90deg)', opacity: '0' },
        },
        fadeUp: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-50px)' },
        },
      },
    },
  },
  plugins: [],
}
