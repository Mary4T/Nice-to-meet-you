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
          950: '#080808',
          900: '#101010',
          800: '#1A1A1A',
          700: '#242424',
          600: '#363636',
          400: '#666666',
          300: '#999999',
          200: '#CCCCCC',
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
