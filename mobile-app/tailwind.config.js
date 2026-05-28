/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        sunrise: {
          orange: '#FF512F',
          pink: '#DD2476',
        },
        indigo: {
          deep: '#2E3192',
          dark: '#1B1464',
        },
      },
      fontFamily: {
        outfit: ['Outfit_400Regular'],
        'outfit-bold': ['Outfit_700Bold'],
        'outfit-medium': ['Outfit_500Medium'],
        'outfit-light': ['Outfit_300Light'],
      },
    },
  },
  plugins: [],
};
