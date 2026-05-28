import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, BellOff } from 'lucide-react-native';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { GlassText } from '../../src/components/ui/GlassText';
import { GlassHeader } from '../../src/components/ui/GlassHeader';

export default function NotificationsScreen() {
  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <GlassHeader title="Thông báo" />
      
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="pt-4 pb-32">
          <GlassCard intensity={20} className="items-center justify-center py-16 border-dashed border-indigo-950/10">
            <View className="w-20 h-20 bg-indigo-950/5 rounded-full items-center justify-center mb-6 border border-indigo-950/10">
              <BellOff size={36} color="rgba(30, 27, 75, 0.4)" />
            </View>
            <GlassText variant="h3" className="mb-2">Không có thông báo</GlassText>
            <GlassText variant="body" className="text-center opacity-40 px-10">
              Bạn sẽ nhận được thông báo khi có chi tiêu mới hoặc lời mời tham gia nhóm.
            </GlassText>
          </GlassCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
