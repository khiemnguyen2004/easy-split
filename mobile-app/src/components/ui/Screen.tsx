import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassHeader } from './GlassHeader';

interface ScreenProps {
  children: React.ReactNode;
  /** When set, renders a GlassHeader at the top. */
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  headerRight?: React.ReactNode;
  /** Wrap content in a ScrollView (default). Set false for FlatList screens. */
  scroll?: boolean;
  keyboardAvoiding?: boolean;
  /** Padding for the scroll content. Clears the floating tab bar by default. */
  contentClassName?: string;
  refreshControl?: ScrollViewProps['refreshControl'];
  /** Extra content rendered outside the scroll area (e.g. floating buttons). */
  overlay?: React.ReactNode;
}

export const Screen = ({
  children,
  title,
  subtitle,
  showBack = false,
  onBack,
  headerRight,
  scroll = true,
  keyboardAvoiding = false,
  contentClassName = 'px-6 pt-2 pb-32',
  refreshControl,
  overlay,
}: ScreenProps) => {
  const header = title ? (
    <GlassHeader
      title={title}
      subtitle={subtitle}
      showBack={showBack}
      onBack={onBack}
      rightElement={headerRight}
    />
  ) : null;

  const body = scroll ? (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      <View className={contentClassName}>{children}</View>
    </ScrollView>
  ) : (
    <View className="flex-1">{children}</View>
  );

  const inner = keyboardAvoiding ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      {body}
    </KeyboardAvoidingView>
  ) : (
    body
  );

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      {header}
      {inner}
      {overlay}
    </SafeAreaView>
  );
};
