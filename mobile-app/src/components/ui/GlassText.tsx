import React from 'react';
import { Text, TextProps } from 'react-native';

interface GlassTextProps extends TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  className?: string;
}

export const GlassText = ({
  children,
  variant = 'body',
  className = '',
  ...props
}: GlassTextProps) => {
  let defaultStyle = '';

  switch (variant) {
    case 'h1':
      defaultStyle = 'text-indigo-950 font-outfit-bold text-3xl leading-tight';
      break;
    case 'h2':
      defaultStyle = 'text-indigo-950 font-outfit-bold text-2xl leading-snug';
      break;
    case 'h3':
      defaultStyle = 'text-indigo-950 font-outfit-medium text-xl';
      break;
    case 'body':
      defaultStyle = 'text-indigo-950/80 font-outfit text-base leading-relaxed';
      break;
    case 'caption':
      defaultStyle = 'text-indigo-950/60 font-outfit text-xs tracking-wider uppercase';
      break;
  }

  return (
    <Text className={`${defaultStyle} ${className}`} {...props}>
      {children}
    </Text>
  );
};
