import React, { useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plus,
  UserPlus,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  ChevronRight,
  LogOut,
} from 'lucide-react-native';
import { useHomeDashboard } from '../../src/hooks/useHomeDashboard';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { GlassText } from '../../src/components/ui/GlassText';
import { SunriseButton } from '../../src/components/ui/SunriseButton';
import { GlassHeader } from '../../src/components/ui/GlassHeader';

export default function HomeScreen() {
  const router = useRouter();

  const {
    user,
    signOut,
    groups,
    totalBalance,
    owedToUser,
    userOwes,
    loading,
    refreshing,
    fetchData,
    onRefresh,
  } = useHomeDashboard();

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleSignOut = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: signOut },
      ],
      { cancelable: true }
    );
  };

  const formatCurrency = (amount: number) => {
    return Math.abs(amount).toLocaleString('vi-VN') + 'đ';
  };

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <GlassHeader
        title={user?.user_metadata?.full_name || 'Người dùng'}
        subtitle="Chào buổi sáng,"
        rightElement={
          <TouchableOpacity
            onPress={handleSignOut}
            className="w-10 h-10 rounded-xl bg-indigo-950/5 items-center justify-center border border-indigo-950/10 shadow-sm"
          >
            <LogOut size={18} color="#1E1B4B" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF512F" />
        }
      >
        <View className="pt-2 pb-32">
          {/* Balance Card */}
          <GlassCard intensity={45} className="mb-8 border-indigo-950/10">
            <View className="flex-row justify-between items-start mb-8">
              <View>
                <GlassText variant="caption" className="mb-1 uppercase tracking-widest opacity-60">
                  Tổng dư nợ
                </GlassText>
                <GlassText className="text-4xl font-outfit-bold">
                  {totalBalance < 0 ? '-' : ''}
                  {formatCurrency(totalBalance)}
                </GlassText>
              </View>
              <View className="bg-sunrise-orange/20 p-4 rounded-2xl border border-sunrise-orange/30">
                <Wallet size={24} color="#FF512F" />
              </View>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1 bg-indigo-950/5 rounded-2xl p-4 border border-indigo-950/10">
                <View className="bg-emerald-400/20 w-8 h-8 rounded-lg items-center justify-center mb-3">
                  <ArrowDownLeft size={16} color="#059669" />
                </View>
                <GlassText variant="caption" className="text-[10px] lowercase mb-1">
                  Bạn được trả
                </GlassText>
                <GlassText className="font-outfit-bold text-base">
                  {formatCurrency(owedToUser)}
                </GlassText>
              </View>

              <View className="flex-1 bg-indigo-950/5 rounded-2xl p-4 border border-indigo-950/10">
                <View className="bg-rose-400/20 w-8 h-8 rounded-lg items-center justify-center mb-3">
                  <ArrowUpRight size={16} color="#E11D48" />
                </View>
                <GlassText variant="caption" className="text-[10px] lowercase mb-1">
                  Bạn cần trả
                </GlassText>
                <GlassText className="font-outfit-bold text-base">
                  {formatCurrency(userOwes)}
                </GlassText>
              </View>
            </View>
          </GlassCard>

          {/* Groups Section Header */}
          <View className="mb-6 flex-row justify-between items-center">
            <GlassText variant="h3">Nhóm của bạn</GlassText>
            {groups.length > 0 && (
              <View className="bg-indigo-950/5 px-3 py-1.5 rounded-full border border-indigo-950/10">
                <GlassText className="text-[10px] font-outfit-bold uppercase tracking-tighter opacity-70">
                  {groups.length} nhóm hoạt động
                </GlassText>
              </View>
            )}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#FF512F" className="mt-10" />
          ) : groups.length === 0 ? (
            <GlassCard intensity={20} className="items-center justify-center py-12 border-dashed border-indigo-950/10">
              <View className="w-16 h-16 bg-indigo-950/5 rounded-3xl items-center justify-center mb-6 border border-indigo-950/10">
                <Users size={32} color="rgba(30, 27, 75, 0.4)" />
              </View>
              <GlassText variant="h3" className="mb-2">Chưa có nhóm nào</GlassText>
              <GlassText variant="body" className="text-center opacity-40 px-8">
                Quản lý các khoản chi tiêu chung chưa bao giờ dễ dàng hơn.
              </GlassText>
              <SunriseButton
                title="Tạo nhóm ngay"
                className="mt-10 w-full"
                onPress={() => router.push('/create-group')}
              />
            </GlassCard>
          ) : (
            <View>
              {groups.map((item) => (
                <TouchableOpacity
                  key={item.group_id}
                  onPress={() => router.push(`/group/${item.group_id}`)}
                  activeOpacity={0.8}
                >
                  <GlassCard
                    intensity={25}
                    className="mb-4 p-5 flex-row items-center border-indigo-950/10"
                  >
                    <View className="w-14 h-14 bg-indigo-950/5 rounded-2xl items-center justify-center mr-4 border border-indigo-950/10">
                      <Users size={24} color="#1E1B4B" />
                    </View>
                    <View className="flex-1">
                      <GlassText className="text-lg font-outfit-bold mb-0.5">
                        {item.group_name}
                      </GlassText>
                      <View className="flex-row items-center opacity-40">
                        <Users size={12} color="#1E1B4B" />
                        <GlassText variant="caption" className="ml-1.5 text-[10px] uppercase font-outfit-bold">
                          {item.member_count} thành viên
                        </GlassText>
                      </View>
                    </View>
                    <ChevronRight size={18} color="rgba(30, 27, 75, 0.3)" />
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Primary Floating Action Button */}
      <View className="absolute bottom-28 right-6 flex-col gap-4">
          <TouchableOpacity
            onPress={() => router.push('/join-group')}
            activeOpacity={0.9}
            className="bg-indigo-950/5 w-14 h-14 rounded-2xl items-center justify-center border border-indigo-950/10 shadow-xl"
          >
            <UserPlus size={24} color="#1E1B4B" />
          </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/create-group')} activeOpacity={0.9}>
          <View className="w-16 h-16 rounded-[22px] overflow-hidden shadow-2xl shadow-sunrise-orange/40">
            <SunriseButton
              title=""
              onPress={() => router.push('/create-group')}
              style={{ width: 64, height: 64, borderRadius: 0 }}
            >
              <Plus size={30} color="white" />
            </SunriseButton>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
