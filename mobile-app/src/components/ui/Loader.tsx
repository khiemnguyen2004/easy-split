import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useThemeColors } from '../../theme';

interface LoaderProps {
  /** Fill the screen and center vertically. */
  fullscreen?: boolean;
  size?: 'small' | 'large';
  className?: string;
}

export const Loader = ({ fullscreen = false, size = 'large', className = '' }: LoaderProps) => {
  const colors = useThemeColors();
  if (fullscreen) {
    return (
      <View className={`flex-1 items-center justify-center ${className}`}>
        <ActivityIndicator size={size} color={colors.accent} />
      </View>
    );
  }
  return <ActivityIndicator size={size} color={colors.accent} className={className} />;
};
