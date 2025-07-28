/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'stack-blue': '#1e3a8a',
        'stack-pink': '#ec4899',
        'stack-yellow': '#fbbf24',
        'seal-gray': '#6b7280'
      },
      fontFamily: {
        'display': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}