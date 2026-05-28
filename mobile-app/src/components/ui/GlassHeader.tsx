import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { GlassText } from './GlassText';

interface GlassHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  subtitle?: string;
}

export const GlassHeader = ({
  title,
  showBack = false,
  onBack,
  rightElement,
  subtitle,
}: GlassHeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View className="px-6 py-4 flex-row items-center justify-between">
      <View className="flex-row items-center flex-1">
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 items-center justify-center rounded-xl bg-white/40 border border-indigo-950/10 mr-4 shadow-sm"
          >
            <ArrowLeft size={20} color="#1E1B4B" />
          </TouchableOpacity>
        )}
        <View className="flex-1">
          {subtitle && (
            <GlassText variant="caption" className="mb-0.5 opacity-60">
              {subtitle}
            </GlassText>
          )}
          <GlassText variant="h3" numberOfLines={1}>
            {title}
          </GlassText>
        </View>
      </View>
      {rightElement && <View className="ml-4">{rightElement}</View>}
    </View>
  );
};
