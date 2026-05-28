import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { LucideIcon, ChevronRight } from 'lucide-react-native';
import { colors } from '../../theme';
import { GlassCard } from './GlassCard';
import { GlassText } from './GlassText';

interface ListItemProps {
  icon?: LucideIcon;
  /** Replaces the default icon badge (e.g. an Avatar). */
  leading?: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  /** Custom trailing element; defaults to a chevron when `onPress` is set. */
  trailing?: React.ReactNode;
  onPress?: () => void;
  intensity?: number;
  className?: string;
}

export const ListItem = ({
  icon: Icon,
  leading,
  title,
  subtitle,
  trailing,
  onPress,
  intensity = 25,
  className = '',
}: ListItemProps) => {
  const trailingNode =
    trailing !== undefined ? (
      trailing
    ) : onPress ? (
      <ChevronRight size={18} color={colors.contentFaint} />
    ) : null;

  const body = (
    <GlassCard intensity={intensity} padding="p-5" className={`flex-row items-center ${className}`}>
      {leading ??
        (Icon ? (
          <View className="mr-4 h-14 w-14 items-center justify-center rounded-2xl border border-surface-line bg-surface-fill">
            <Icon size={24} color={colors.content} />
          </View>
        ) : null)}
      <View className="flex-1">
        <GlassText className="font-outfit-bold text-lg">{title}</GlassText>
        {typeof subtitle === 'string' ? (
          <GlassText variant="caption" className="mt-0.5">
            {subtitle}
          </GlassText>
        ) : (
          subtitle
        )}
      </View>
      {trailingNode ? <View className="ml-3">{trailingNode}</View> : null}
    </GlassCard>
  );

  if (!onPress) return body;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      {body}
    </TouchableOpacity>
  );
};
