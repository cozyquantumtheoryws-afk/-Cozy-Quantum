/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        magical: {
          50: '#f4f6f8',
          100: '#e4e7eb', 
          200: '#c5ccd6',
          300: '#a3b0c0',
          400: '#7f93a9',
          500: '#5c7490', // Twilight Blue
          600: '#465b75',
          700: '#34455b',
          800: '#263346',
          900: '#1a2230',
          950: '#10161f',
        },
        mystic: {
          teal: '#2dd4bf', // Bioluminescent
          amber: '#f59e0b', // Warm light
          purple: '#a855f7', // Arcane
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        serif: ['Merriweather', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': "url('/hero-bg.png')",
      }
    },
  },
  plugins: [],
}
