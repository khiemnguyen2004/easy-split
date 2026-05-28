import React from 'react';
import { View } from 'react-native';

interface ProgressBarProps {
  /** 0–1. */
  progress: number;
  tone?: 'accent' | 'success';
  className?: string;
}

export const ProgressBar = ({ progress, tone = 'accent', className = '' }: ProgressBarProps) => {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <View className={`h-2 overflow-hidden rounded-full bg-surface-fill ${className}`}>
      <View
        className={`h-full rounded-full ${tone === 'success' ? 'bg-success' : 'bg-accent'}`}
        style={{ width: `${pct}%` }}
      />
    </View>
  );
};
