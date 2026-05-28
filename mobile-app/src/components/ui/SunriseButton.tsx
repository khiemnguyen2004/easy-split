import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SunriseButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
  className?: string;
  textClassName?: string;
}

export const SunriseButton = ({
  title,
  variant = 'primary',
  className = '',
  textClassName = '',
  ...props
}: SunriseButtonProps) => {
  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        className={`rounded-2xl border border-white/30 bg-white/10 px-6 py-4 items-center justify-center ${className}`}
        activeOpacity={0.7}
        {...props}
      >
        <Text className={`text-white font-outfit-medium text-lg ${textClassName}`}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className={`rounded-2xl overflow-hidden shadow-lg shadow-sunrise-orange/30 ${className}`}
      {...props}
    >
      <LinearGradient
        colors={['#FF512F', '#DD2476']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 py-4 items-center justify-center"
      >
        <View className="absolute inset-0 bg-white/10 opacity-50" />
        <Text className={`text-white font-outfit-bold text-lg tracking-wide ${textClassName}`}>
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};
