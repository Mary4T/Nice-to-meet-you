/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        soul: {
          950: '#07050F',
          900: '#0D0A1A',
          800: '#171230',
          700: '#201A42',
          600: '#2C2358',
          400: '#5A4E8A',
          300: '#9080B8',
          200: '#C4B8E0',
        },
        gold: {
          700: '#8B6A15',
          600: '#A67C1E',
          500: '#C49325',
          400: '#D4A843',
          300: '#E8C96A',
          200: '#F2DFA0',
        },
      },
    },
  },
  plugins: [],
}
