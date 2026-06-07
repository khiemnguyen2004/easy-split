import React from 'react';
import { View, Pressable } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useThemeColors } from '../../theme';
import { GlassCard } from './GlassCard';
import { GlassText } from './GlassText';

interface ListItemProps {
  icon?: LucideIcon;
  /** Replaces the default icon badge (e.g. an Avatar). */
  leading?: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  /** Custom trailing element. */
  trailing?: React.ReactNode;
  onPress?: () => void;
  intensity?: number;
  className?: string;
  backgroundImageUri?: string;
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
  backgroundImageUri,
}: ListItemProps) => {
  const colors = useThemeColors();
  const scale = useSharedValue(1);

  const trailingNode = trailing !== undefined ? trailing : null;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 220 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 220 });
  };

  const body = (
    <GlassCard
      intensity={intensity}
      padding="p-5"
      backgroundImageUri={backgroundImageUri}
      className={`flex-row items-center ${className}`}
    >
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
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
    >
      <Animated.View style={animatedStyle}>{body}</Animated.View>
    </Pressable>
  );
};
