import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
  /** Tailwind padding applied to the inner content. Set '' to opt out. */
  padding?: string;
  className?: string;
}

export const GlassCard = ({
  children,
  intensity = 20,
  padding = 'p-6',
  className = '',
  style,
  ...props
}: GlassCardProps) => {
  return (
    <View
      className={`overflow-hidden rounded-[32px] border border-surface-line ${className}`}
      style={style}
      {...props}
    >
      <BlurView intensity={intensity} tint="light" style={StyleSheet.absoluteFill} />
      <View className={`bg-surface-glass ${padding}`}>{children}</View>
    </View>
  );
};
