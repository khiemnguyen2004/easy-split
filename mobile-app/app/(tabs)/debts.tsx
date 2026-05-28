import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet } from 'lucide-react-native';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { GlassText } from '../../src/components/ui/GlassText';

export default function DebtsScreen() {
  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <GlassText variant="h1" className="mb-8">Khoản nợ</GlassText>

        <GlassCard intensity={20} className="py-12 items-center justify-center border-indigo-950/10">
          <View className="w-20 h-20 bg-indigo-950/5 rounded-full items-center justify-center mb-6 border border-indigo-950/10">
            <Wallet size={40} color="#1E1B4B" />
          </View>
          <GlassText variant="h3" className="mb-2">Bạn đang rất cân bằng!</GlassText>
          <GlassText variant="body" className="text-center opacity-60 px-8">
            Hiện tại bạn không có khoản nợ hay khoản thu nào chờ xử lý.
          </GlassText>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}
