/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brightpoint: {
          blue: '#0066CC',
          green: '#00A651',
          orange: '#FF6B35',
        },
      },
    },
  },
  plugins: [],
}
