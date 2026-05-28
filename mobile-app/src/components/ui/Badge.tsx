import React from 'react';
import { View } from 'react-native';
import { GlassText } from './GlassText';

type Tone = 'neutral' | 'success' | 'danger' | 'accent';

interface BadgeProps {
  label: string;
  tone?: Tone;
  className?: string;
}

const TONE: Record<Tone, { bg: string; text: string }> = {
  neutral: { bg: 'bg-surface-fill border-surface-line', text: 'text-content' },
  success: { bg: 'bg-success/15 border-success/20', text: 'text-success' },
  danger: { bg: 'bg-danger/15 border-danger/20', text: 'text-danger' },
  accent: { bg: 'bg-accent/15 border-accent/30', text: 'text-accent' },
};

export const Badge = ({ label, tone = 'neutral', className = '' }: BadgeProps) => {
  const t = TONE[tone];
  return (
    <View className={`self-start rounded-full border px-3 py-1 ${t.bg} ${className}`}>
      <GlassText className={`font-outfit-bold text-[10px] uppercase tracking-wider ${t.text}`}>
        {label}
      </GlassText>
    </View>
  );
};
