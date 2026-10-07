/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 18px 45px rgba(48, 71, 255, 0.25)',
      },
      colors: {
        brand: {
          blue: '#3047FF',
          navy: '#07152F',
        },
      },
    },
  },
  plugins: [],
}

