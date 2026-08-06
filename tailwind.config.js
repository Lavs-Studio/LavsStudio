/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#f8efe9',
        blush: '#f2c9c8',
        rose: '#d78f8f',
        espresso: '#3d2b2b',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(61, 43, 43, 0.08)',
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
