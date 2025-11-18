/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // QuickMed Theme Colors
        'med-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Primary medical green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        'med-blue': {
          400: '#60a5fa', // Light blue accent (from parent QuickClinic)
          500: '#3b82f6', // Blue accent
        },
        'med-black': '#1a1a1a',
        'med-white': '#ffffff',
      },
    },
  },
  plugins: [],
};
