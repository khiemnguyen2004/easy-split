import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon } from 'lucide-react-native';
import { colors, accentGradient } from '../../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  variant?: Variant;
  loading?: boolean;
  icon?: LucideIcon;
  iconSize?: number;
  className?: string;
  textClassName?: string;
  /** Custom content; overrides title when provided. */
  children?: React.ReactNode;
}

const TEXT_COLOR: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-content',
  ghost: 'text-content',
  danger: 'text-white',
};

const ICON_COLOR: Record<Variant, string> = {
  primary: colors.white,
  secondary: colors.content,
  ghost: colors.content,
  danger: colors.white,
};

export const Button = ({
  title,
  variant = 'primary',
  loading = false,
  icon: Icon,
  iconSize = 20,
  className = '',
  textClassName = '',
  children,
  disabled,
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  const content = children ?? (
    <View className="flex-row items-center justify-center">
      {loading ? (
        <ActivityIndicator color={ICON_COLOR[variant]} size="small" />
      ) : (
        <>
          {Icon && (
            <Icon
              size={iconSize}
              color={ICON_COLOR[variant]}
              style={{ marginRight: title ? 8 : 0 }}
            />
          )}
          {title ? (
            <Text
              className={`font-outfit-bold text-lg tracking-wide ${TEXT_COLOR[variant]} ${textClassName}`}
            >
              {title}
            </Text>
          ) : null}
        </>
      )}
    </View>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={isDisabled}
        className={`overflow-hidden rounded-2xl shadow-lg shadow-accent/30 ${className}`}
        style={{ opacity: isDisabled ? 0.5 : 1 }}
        {...props}
      >
        <LinearGradient
          colors={accentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="items-center justify-center px-6 py-4"
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const surface =
    variant === 'danger'
      ? 'bg-danger'
      : variant === 'secondary'
        ? 'bg-surface-fill border border-surface-line'
        : 'bg-transparent';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={isDisabled}
      className={`items-center justify-center rounded-2xl px-6 py-4 ${surface} ${className}`}
      style={{ opacity: isDisabled ? 0.5 : 1 }}
      {...props}
    >
      {content}
    </TouchableOpacity>
  );
};
