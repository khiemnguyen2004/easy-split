/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Text + dark surfaces. Three shades only — keeps contrast predictable.
        content: {
          DEFAULT: '#1E1B4B',
          muted: 'rgba(30, 27, 75, 0.55)',
          faint: 'rgba(30, 27, 75, 0.4)',
        },
        // Glass surfaces. `fill` = subtle inline bg, `line` = hairline border.
        surface: {
          glass: 'rgba(255, 255, 255, 0.4)',
          fill: 'rgba(30, 27, 75, 0.05)',
          line: 'rgba(30, 27, 75, 0.1)',
        },
        // Brand accent (CTA gradient / active / pending).
        accent: {
          DEFAULT: '#FF512F',
          alt: '#DD2476',
        },
        // Semantic status.
        success: '#10B981',
        danger: '#FB7185',
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
