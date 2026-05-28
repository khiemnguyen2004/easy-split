import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { LucideIcon, Check } from 'lucide-react-native';
import { colors } from '../../theme';
import { GlassText } from './GlassText';

interface OptionPillProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: LucideIcon;
  /** Show a leading check circle (used by single/multi selectors). */
  showCheck?: boolean;
  className?: string;
}

export const OptionPill = ({
  label,
  selected,
  onPress,
  icon: Icon,
  showCheck = false,
  className = '',
}: OptionPillProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center rounded-2xl border px-5 py-3 ${
        selected ? 'border-accent/30 bg-accent/20' : 'border-surface-line bg-surface-fill'
      } ${className}`}
    >
      {showCheck ? (
        <View
          className={`mr-2 h-6 w-6 items-center justify-center rounded-full ${
            selected ? 'bg-accent' : 'border border-surface-line bg-surface-fill'
          }`}
        >
          {selected ? <Check size={14} color={colors.white} /> : null}
        </View>
      ) : null}
      {Icon ? (
        <View className="mr-2">
          <Icon size={16} color={selected ? colors.accent : colors.content} />
        </View>
      ) : null}
      <GlassText
        className={`font-outfit-bold text-sm ${selected ? 'text-accent' : 'text-content-muted'}`}
      >
        {label}
      </GlassText>
    </TouchableOpacity>
  );
};
