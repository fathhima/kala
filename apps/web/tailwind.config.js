/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        kala: {
          cream: '#FFFBF5',
          amber: '#F59E0B',
          terracotta: '#C2410C',
          rose: '#F43F5E',
          sage: '#84A98C',
          brown: '#78350F',
          muted: '#A8A29E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
