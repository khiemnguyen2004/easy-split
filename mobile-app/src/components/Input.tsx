import React from 'react';
import { View, Text, TextInput, TextInputProps, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  containerStyle?: ViewStyle;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon: Icon,
  containerStyle,
  className = '',
  ...props
}) => {
  return (
    <View className={`mb-4 ${className}`} style={containerStyle}>
      {label && (
        <Text className="text-gray-500 font-bold text-xs uppercase mb-2 tracking-widest pl-1">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center bg-gray-50 rounded-2xl px-4 py-1 border ${error ? 'border-rose-400' : 'border-gray-100'}`}
      >
        {Icon && <Icon size={20} color="#9CA3AF" style={{ marginRight: 8 }} />}
        <TextInput
          {...props}
          className="flex-1 py-3 text-gray-900 text-base"
          placeholderTextColor="#9CA3AF"
        />
      </View>
      {error && <Text className="text-rose-500 text-[10px] mt-1 font-medium pl-1">{error}</Text>}
    </View>
  );
};
