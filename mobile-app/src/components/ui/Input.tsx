import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { LucideIcon, Eye, EyeOff } from 'lucide-react-native';
import { useThemeColors } from '../../theme';
import { GlassText } from './GlassText';

interface InputProps extends TextInputProps {
  label?: string;
  /** Optional node rendered next to the label (e.g. a "Forgot?" link). */
  labelAccessory?: React.ReactNode;
  error?: string;
  icon?: LucideIcon;
  /** Renders an eye toggle and manages password visibility internally. */
  secureToggle?: boolean;
  /** Custom trailing content (e.g. a "VNĐ" chip). */
  trailing?: React.ReactNode;
  /** `amount` renders a large, centered number field with an optional suffix. */
  variant?: 'default' | 'amount';
  suffix?: string;
  containerClassName?: string;
}

export const Input = ({
  label,
  labelAccessory,
  error,
  icon: Icon,
  secureToggle = false,
  trailing,
  variant = 'default',
  suffix,
  containerClassName = '',
  className = '',
  ...props
}: InputProps) => {
  const colors = useThemeColors();
  const [hidden, setHidden] = useState(true);

  if (variant === 'amount') {
    return (
      <View className={`flex-row items-center justify-center ${containerClassName}`}>
        <TextInput
          keyboardType="numeric"
          placeholderTextColor={colors.placeholder}
          className={`text-center font-outfit-bold text-5xl text-content ${className}`}
          {...props}
        />
        {suffix ? (
          <GlassText className="mb-1 ml-3 font-outfit-bold text-2xl text-accent">
            {suffix}
          </GlassText>
        ) : null}
      </View>
    );
  }

  return (
    <View className={containerClassName}>
      {label || labelAccessory ? (
        <View className="mb-2 ml-1 flex-row items-center justify-between">
          {label ? <GlassText variant="caption">{label}</GlassText> : <View />}
          {labelAccessory}
        </View>
      ) : null}
      <View
        className={`flex-row rounded-2xl border bg-surface-fill px-4 py-4 shadow-sm ${
          props.multiline ? 'items-start' : 'items-center'
        } ${error ? 'border-danger' : 'border-surface-line'}`}
      >
        {Icon ? (
          <View className={`mr-3 opacity-60 ${props.multiline ? 'mt-1' : ''}`}>
            <Icon size={18} color={colors.content} />
          </View>
        ) : null}
        <TextInput
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureToggle ? hidden : props.secureTextEntry}
          className={`flex-1 font-outfit-medium text-base text-content ${className}`}
          {...props}
        />
        {secureToggle ? (
          <TouchableOpacity onPress={() => setHidden((v) => !v)} className="ml-2 opacity-60">
            {hidden ? (
              <Eye size={18} color={colors.content} />
            ) : (
              <EyeOff size={18} color={colors.content} />
            )}
          </TouchableOpacity>
        ) : trailing ? (
          <View className="ml-2">{trailing}</View>
        ) : null}
      </View>
      {error ? <GlassText className="ml-1 mt-1 text-xs text-danger">{error}</GlassText> : null}
    </View>
  );
};
