/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'igreja': {
          'roxo': '#6B1D96',
          'ouro': '#FFD700',
          'verde': '#2E7D32',
        }
      },
    },
  },
  plugins: [],
}