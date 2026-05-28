/**
 * Raw color values mirroring the semantic tokens in tailwind.config.js.
 * Use these only where Tailwind classes can't reach: lucide `color=` props,
 * LinearGradient `colors`, ActivityIndicator `color`, `placeholderTextColor`,
 * RefreshControl `tintColor`. Everywhere else prefer the Tailwind classes
 * (text-content, bg-surface-fill, text-accent, …).
 */
export const colors = {
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

/** Sunrise gradient used by primary buttons / FAB / brand surfaces. */
export const accentGradient = [colors.accent, colors.accentAlt] as const;

/** Animated mesh background gradient + blob tints. */
export const backgroundGradient = ['#FDFCFB', '#E5E5BE'] as const;
