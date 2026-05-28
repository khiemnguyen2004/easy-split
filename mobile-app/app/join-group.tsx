import React from 'react';
import { View, TextInput, ScrollView, View as RNView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserPlus, Hash, Search } from 'lucide-react-native';
import { useJoinGroup } from '../src/hooks/useJoinGroup';
import { GlassCard } from '../src/components/ui/GlassCard';
import { GlassText } from '../src/components/ui/GlassText';
import { SunriseButton } from '../src/components/ui/SunriseButton';
import { GlassHeader } from '../src/components/ui/GlassHeader';

export default function JoinGroupScreen() {
  const router = useRouter();
  const { inviteCode, setInviteCode, joinGroup, loading } = useJoinGroup();

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <GlassHeader title="Tham gia nhóm" showBack />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="pt-4 pb-32">
          {/* Icon Section */}
          <View className="items-center mb-12">
            <RNView className="w-24 h-24 rounded-[32px] bg-emerald-400/10 items-center justify-center border border-emerald-400/20 shadow-lg shadow-emerald-400/10">
              <UserPlus size={40} color="#34D399" />
            </RNView>
          </View>

          {/* Info Card */}
          <GlassCard intensity={20} className="mb-8 p-6 border-indigo-950/10">
            <GlassText variant="body" className="text-center opacity-60">
              Nhập mã gồm 6 ký tự được bạn bè chia sẻ để tham gia vào nhóm của họ.
            </GlassText>
          </GlassCard>

          {/* Input Area */}
          <GlassCard intensity={30} className="mb-10 p-8 border-indigo-950/10">
            <GlassText variant="caption" className="mb-4 text-center uppercase tracking-[2px] opacity-40">Mã mời của bạn</GlassText>
            
            <RNView className="flex-row items-center bg-indigo-950/5 border border-indigo-950/10 rounded-2xl px-6 py-5 shadow-sm mb-2">
              <Hash size={24} color="rgba(30, 27, 75, 0.4)" className="mr-4" />
              <TextInput
                placeholder="Ví dụ: AB12CD"
                value={inviteCode}
                onChangeText={(text) => setInviteCode(text.toUpperCase())}
                autoCapitalize="characters"
                maxLength={6}
                className="flex-1 text-indigo-950 text-3xl font-outfit-bold tracking-[6px]"
                placeholderTextColor="rgba(30, 27, 75, 0.2)"
              />
            </RNView>
            
            <GlassText variant="caption" className="text-center opacity-30 mt-4">
              Mã mời không phân biệt chữ hoa, chữ thường
            </GlassText>
          </GlassCard>

          <SunriseButton
            title={loading ? "Đang xử lý..." : "Tham gia ngay"}
            onPress={joinGroup}
            disabled={loading || inviteCode.length < 6}
            className="w-full"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
