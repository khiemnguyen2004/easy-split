import React from 'react';
import { View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useThemeColors } from '../../theme';
import { GlassText } from './GlassText';

type Tone = 'neutral' | 'success' | 'danger' | 'accent';

interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: Tone;
  className?: string;
}

export const StatTile = ({
  icon: Icon,
  label,
  value,
  tone = 'neutral',
  className = '',
}: StatTileProps) => {
  const colors = useThemeColors();
  const TONE: Record<Tone, { badge: string; icon: string }> = {
    neutral: { badge: 'bg-surface-fill', icon: colors.content },
    success: { badge: 'bg-success/20', icon: colors.success },
    danger: { badge: 'bg-danger/20', icon: colors.danger },
    accent: { badge: 'bg-accent/20', icon: colors.accent },
  };
  const t = TONE[tone];
  return (
    <View
      className={`flex-1 rounded-2xl border border-surface-line bg-surface-fill p-4 ${className}`}
    >
      <View className={`mb-3 h-8 w-8 items-center justify-center rounded-lg ${t.badge}`}>
        <Icon size={16} color={t.icon} />
      </View>
      <GlassText
        variant="caption"
        className="mb-1 text-[10px] lowercase"
        style={{ color: colors.contentMuted }}
      >
        {label}
      </GlassText>
      <GlassText className="font-outfit-bold text-base" style={{ color: colors.content }}>
        {value}
      </GlassText>
    </View>
  );
};
