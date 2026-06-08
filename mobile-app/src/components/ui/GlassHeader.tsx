import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { GlassText } from './GlassText';
import { IconButton } from './IconButton';

interface GlassHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export const GlassHeader = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightElement,
}: GlassHeaderProps) => {
  const router = useRouter();
  const handleBack = () => (onBack ? onBack() : router.back());

  return (
    <View className="flex-row items-center justify-between px-6 py-4">
      <View className="flex-1 flex-row items-center">
        {showBack ? (
          <IconButton icon={ArrowLeft} onPress={handleBack} iconSize={20} className="mr-4" />
        ) : null}
        <View className="flex-1">
          {subtitle ? (
            <GlassText variant="caption" className="mb-0.5">
              {subtitle}
            </GlassText>
          ) : null}
          <GlassText variant="h3" numberOfLines={1}>
            {title}
          </GlassText>
        </View>
      </View>
      {rightElement ? <View className="ml-4">{rightElement}</View> : null}
    </View>
  );
};
