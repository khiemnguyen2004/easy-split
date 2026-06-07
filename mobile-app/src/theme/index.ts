/**
 * Color palettes for the two themes.
 *
 * Two consumers exist:
 *  1. Tailwind/NativeWind classes (`text-content`, `bg-surface-fill`, …) — these
 *     resolve through CSS variables defined in `global.css`, so they theme
 *     automatically with the active color scheme. Don't read these values here.
 *  2. Plain JS props that can't take a className — lucide `color=`,
 *     LinearGradient `colors`, ActivityIndicator `color`, `placeholderTextColor`,
 *     RefreshControl `tintColor`. For those, call `useThemeColors()` inside a
 *     component so the value follows light/dark.
 */
import { vars } from 'nativewind';
import { useThemeStore } from '../store/useThemeStore';

export const lightColors = {
  content: '#1E1B4B',
  contentMuted: 'rgba(30, 27, 75, 0.55)',
  contentFaint: 'rgba(30, 27, 75, 0.4)',
  placeholder: 'rgba(30, 27, 75, 0.4)',

  surfaceGlass: 'rgba(255, 255, 255, 0.4)',
  surfaceFill: 'rgba(30, 27, 75, 0.05)',
  surfaceLine: 'rgba(30, 27, 75, 0.1)',

  accent: '#FF512F',
  accentAlt: '#DD2476',

  success: '#10B981',
  danger: '#FB7185',

  white: '#FFFFFF',
} as const;

export const darkColors = {
  content: '#ECECF5',
  contentMuted: 'rgba(236, 236, 245, 0.7)',
  contentFaint: 'rgba(236, 236, 245, 0.5)',
  placeholder: 'rgba(236, 236, 245, 0.4)',

  surfaceGlass: 'rgba(255, 255, 255, 0.06)',
  surfaceFill: 'rgba(255, 255, 255, 0.06)',
  surfaceLine: 'rgba(255, 255, 255, 0.12)',

  accent: '#FF512F',
  accentAlt: '#DD2476',

  success: '#34D399',
  danger: '#FB7185',

  white: '#FFFFFF',
} as const;

export type ThemeColors = Record<keyof typeof lightColors, string>;

/**
 * Static light palette. Kept for the few non-reactive spots (the brand gradient,
 * module-scope defaults). Prefer `useThemeColors()` in components.
 */
export const colors = lightColors;

/** Reactive palette — returns the right colors for the active scheme. */
export function useThemeColors(): ThemeColors {
  const scheme = useThemeStore((s) => s.scheme);
  return scheme === 'dark' ? darkColors : lightColors;
}

/**
 * CSS-variable styles consumed by the Tailwind semantic tokens (see
 * tailwind.config.js / global.css). Apply `themeVars[scheme]` to a root View;
 * NativeWind shares the variables via context to every descendant, so all
 * `className` colors follow the active scheme — no NativeWind dark-class needed.
 */
export const themeVars = {
  light: vars({
    '--c-content': '30 27 75',
    '--c-content-muted': 'rgba(30, 27, 75, 0.55)',
    '--c-content-faint': 'rgba(30, 27, 75, 0.4)',
    '--c-surface-glass': 'rgba(255, 255, 255, 0.4)',
    '--c-accent': '255 81 47',
    '--c-accent-alt': '221 36 118',
    '--c-success': '16 185 129',
    '--c-danger': '251 113 133',
  }),
  dark: vars({
    '--c-content': '236 236 245',
    // Brighter than light's 0.55/0.4 so small captions/labels stay legible on dark.
    '--c-content-muted': 'rgba(236, 236, 245, 0.7)',
    '--c-content-faint': 'rgba(236, 236, 245, 0.5)',
    '--c-surface-glass': 'rgba(255, 255, 255, 0.06)',
    '--c-accent': '255 81 47',
    '--c-accent-alt': '221 36 118',
    '--c-success': '52 211 153',
    '--c-danger': '251 113 133',
  }),
};

/** Sunrise gradient used by primary buttons / FAB / brand surfaces (theme-agnostic). */
export const accentGradient = [lightColors.accent, lightColors.accentAlt] as const;

/** Animated mesh background gradient + blob tints, per theme. */
export const lightBackgroundGradient = ['#FDFCFB', '#E5E5BE'] as const;
export const darkBackgroundGradient = ['#1B1838', '#0B0A18'] as const;

/** Light background gradient. Use `useBackgroundGradient()` for theme-aware. */
export const backgroundGradient = lightBackgroundGradient;

/** Reactive background gradient for the mesh background. */
export function useBackgroundGradient(): readonly [string, string] {
  const scheme = useThemeStore((s) => s.scheme);
  return scheme === 'dark' ? darkBackgroundGradient : lightBackgroundGradient;
}
