import React from 'react';
import { Text, TextProps } from 'react-native';

type Variant = 'h1' | 'h2' | 'h3' | 'body' | 'caption';

interface GlassTextProps extends TextProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

const VARIANT_STYLES: Record<Variant, { color: string; rest: string }> = {
  h1: { color: 'text-content', rest: 'font-outfit-bold text-3xl leading-tight' },
  h2: { color: 'text-content', rest: 'font-outfit-bold text-2xl leading-snug' },
  h3: { color: 'text-content', rest: 'font-outfit-medium text-xl' },
  body: { color: 'text-content', rest: 'font-outfit text-base leading-relaxed' },
  caption: { color: 'text-content-muted', rest: 'font-outfit text-xs tracking-wider uppercase' },
};

const SIZE_SUFFIXES = [
  '-xs',
  '-sm',
  '-base',
  '-lg',
  '-xl',
  '-2xl',
  '-3xl',
  '-4xl',
  '-5xl',
  '-6xl',
  '-7xl',
  '-8xl',
  '-9xl',
];
const ALIGN_SUFFIXES = ['-center', '-left', '-right', '-justify'];

/** True when the caller passed an explicit `text-<color>` class. */
const hasExplicitColor = (className: string) =>
  className
    .split(' ')
    .some(
      (c) =>
        c.startsWith('text-') &&
        !ALIGN_SUFFIXES.some((a) => c.includes(a)) &&
        !SIZE_SUFFIXES.some((s) => c.endsWith(s))
    );

export const GlassText = ({
  children,
  variant = 'body',
  className = '',
  ...props
}: GlassTextProps) => {
  const { color, rest } = VARIANT_STYLES[variant];
  const colorClass = hasExplicitColor(className) ? '' : color;

  return (
    <Text className={`${colorClass} ${rest} ${className}`} {...props}>
      {children}
    </Text>
  );
};
