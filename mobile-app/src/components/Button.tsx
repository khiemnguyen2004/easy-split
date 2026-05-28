import React from 'react';
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon } from 'lucide-react-native';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
  icon?: LucideIcon;
  iconSize?: number;
  iconColor?: string;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  loading = false,
  icon: Icon,
  iconSize = 20,
  iconColor,
  className = '',
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const getContainerStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-indigo-50 border border-indigo-100';
      case 'outline':
        return 'bg-transparent border border-gray-200';
      case 'ghost':
        return 'bg-transparent';
      default:
        return ''; // primary uses LinearGradient
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'text-indigo-600';
      case 'outline':
        return 'text-gray-700';
      case 'ghost':
        return 'text-gray-500';
      default:
        return 'text-white';
    }
  };

  const defaultIconColor = iconColor || (variant === 'primary' ? 'white' : '#4F46E5');

  const content = (
    <View className="flex-row items-center justify-center py-4 px-6 rounded-2xl">
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : '#4F46E5'} size="small" />
      ) : (
        <>
          {Icon && <Icon size={iconSize} color={defaultIconColor} style={{ marginRight: 8 }} />}
          <Text className={`text-center font-bold text-base ${getTextStyles()}`}>{label}</Text>
        </>
      )}
    </View>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        {...props}
        disabled={isDisabled}
        className={`overflow-hidden rounded-2xl shadow-lg shadow-indigo-100 ${className}`}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#4F46E5', '#3730A3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ opacity: isDisabled ? 0.6 : 1 }}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      {...props}
      disabled={isDisabled}
      className={`rounded-2xl ${getContainerStyles()} ${className}`}
      style={{ opacity: isDisabled ? 0.6 : 1 }}
      activeOpacity={0.7}
    >
      {content}
    </TouchableOpacity>
  );
};
