import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
  className?: string;
}

export const GlassCard = ({
  children,
  intensity = 20,
  className = '',
  style,
  ...props
}: GlassCardProps) => {
  return (
    <View
      className={`overflow-hidden rounded-[32px] border border-indigo-950/10 ${className}`}
      style={style}
      {...props}
    >
      <BlurView intensity={intensity} tint="light" style={StyleSheet.absoluteFill} />
      <View className="bg-white/40 p-6">{children}</View>
    </View>
  );
};
