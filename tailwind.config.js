/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#faf4fb',
        blush: '#f472b6',
        rose: '#ec4899',
        lavender: '#a855f7',
        pink: '#f472b6',
        espresso: '#2e1f3b',
        plum: '#2e1f3b',
        lightbg: '#faf4fb',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(168, 85, 247, 0.08)',
        glass: '0 8px 32px 0 rgba(168, 85, 247, 0.06)',
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};



