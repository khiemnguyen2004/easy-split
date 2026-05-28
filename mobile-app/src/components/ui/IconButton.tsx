import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon } from 'lucide-react-native';
import { colors, accentGradient } from '../../theme';

type Variant = 'glass' | 'fab';

interface IconButtonProps extends TouchableOpacityProps {
  icon: LucideIcon;
  variant?: Variant;
  iconSize?: number;
  className?: string;
}

/**
 * `glass` — 40×40 frosted square (headers, secondary actions).
 * `fab`   — 64×64 sunrise-gradient round floating action button.
 */
export const IconButton = ({
  icon: Icon,
  variant = 'glass',
  iconSize,
  className = '',
  ...props
}: IconButtonProps) => {
  if (variant === 'fab') {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        className={`h-16 w-16 overflow-hidden rounded-[22px] shadow-2xl shadow-accent/40 ${className}`}
        {...props}
      >
        <LinearGradient
          colors={accentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1 items-center justify-center"
        >
          <Icon size={iconSize ?? 30} color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className={`h-10 w-10 items-center justify-center rounded-xl border border-surface-line bg-surface-fill shadow-sm ${className}`}
      {...props}
    >
      <Icon size={iconSize ?? 18} color={colors.content} />
    </TouchableOpacity>
  );
};
