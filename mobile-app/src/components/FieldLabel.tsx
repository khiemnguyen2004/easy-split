import React from 'react';
import { Text, TextProps } from 'react-native';

interface FieldLabelProps extends TextProps {
  children: string;
  className?: string;
}

export const FieldLabel: React.FC<FieldLabelProps> = ({ children, className = '', ...props }) => {
  return (
    <Text
      {...props}
      className={`text-gray-500 font-bold text-xs uppercase mb-3 tracking-widest pl-1 ${className}`}
    >
      {children}
    </Text>
  );
};
