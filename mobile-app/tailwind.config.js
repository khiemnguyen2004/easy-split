/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Semantic tokens resolve through CSS variables (see global.css) so they
        // follow the active light/dark color scheme automatically.
        // Text + content shades. `fill`/`line` derive from the same base, so
        // they flip to a light tint in dark mode for free.
        content: {
          DEFAULT: 'rgb(var(--c-content) / <alpha-value>)',
          // Own per-theme vars (not a fixed alpha of content) so dark can be
          // brighter than light for legibility.
          muted: 'var(--c-content-muted)',
          faint: 'var(--c-content-faint)',
        },
        // Glass surfaces. `fill` = subtle inline bg, `line` = hairline border.
        surface: {
          glass: 'var(--c-surface-glass)',
          fill: 'rgb(var(--c-content) / 0.05)',
          line: 'rgb(var(--c-content) / 0.1)',
        },
        // Brand accent (CTA gradient / active / pending) — same in both themes.
        accent: {
          DEFAULT: 'rgb(var(--c-accent) / <alpha-value>)',
          alt: 'rgb(var(--c-accent-alt) / <alpha-value>)',
        },
        // Semantic status.
        success: 'rgb(var(--c-success) / <alpha-value>)',
        danger: 'rgb(var(--c-danger) / <alpha-value>)',
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
