import React, { useCallback } from 'react';
import { View, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getGroupBgImage } from '../../src/utils/image';
import {
  Plus,
  LogIn,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  LogOut,
} from 'lucide-react-native';
import { useHomeDashboard } from '../../src/hooks/useHomeDashboard';
import { useThemeColors, accentGradient } from '../../src/theme';
import {
  Screen,
  GlassCard,
  GlassText,
  StatTile,
  ListItem,
  EmptyState,
  Badge,
  IconButton,
  Loader,
} from '../../src/components/ui';

export default function HomeScreen() {
  const colors = useThemeColors();
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

  const formatCurrency = (amount: number) => Math.abs(amount).toLocaleString('vi-VN') + 'đ';

  return (
    <Screen
      title={user?.user_metadata?.full_name || 'Người dùng'}
      subtitle="Chào buổi sáng,"
      headerRight={<IconButton icon={LogOut} onPress={handleSignOut} />}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }
      overlay={
        <View className="absolute bottom-32 right-6 flex-col gap-4 items-end">
          <IconButton
            icon={LogIn}
            iconSize={24}
            onPress={() => router.push('/join-group')}
            className="h-14 w-14 rounded-2xl shadow-xl"
          />
          <TouchableOpacity
            onPress={() => router.push('/create-group')}
            activeOpacity={0.85}
            className="h-14 w-14 overflow-hidden rounded-2xl shadow-xl shadow-accent/30"
          >
            <LinearGradient
              colors={accentGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1 items-center justify-center"
            >
              <Plus size={24} color={colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      }
    >
      <GlassCard intensity={45} className="mb-8">
        <View className="mb-8 flex-row items-start justify-between">
          <View>
            <GlassText variant="caption" className="mb-1">
              Tổng dư nợ
            </GlassText>
            <GlassText className="font-outfit-bold text-4xl">
              {totalBalance < 0 ? '-' : ''}
              {formatCurrency(totalBalance)}
            </GlassText>
          </View>
          <View className="rounded-2xl border border-accent/30 bg-accent/20 p-4">
            <Wallet size={24} color={colors.accent} />
          </View>
        </View>

        <View className="flex-row gap-4">
          <StatTile
            icon={ArrowDownLeft}
            tone="success"
            label="bạn được trả"
            value={formatCurrency(owedToUser)}
          />
          <StatTile
            icon={ArrowUpRight}
            tone="danger"
            label="bạn cần trả"
            value={formatCurrency(userOwes)}
          />
        </View>
      </GlassCard>

      <View className="mb-6 flex-row items-center justify-between">
        <GlassText variant="h3">Nhóm của bạn</GlassText>
        {groups.length > 0 ? <Badge label={`${groups.length} nhóm hoạt động`} /> : null}
      </View>

      {loading ? (
        <Loader className="mt-10" />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Chưa có nhóm nào"
          description="Quản lý các khoản chi tiêu chung chưa bao giờ dễ dàng hơn."
          actionLabel="Tạo nhóm ngay"
          onAction={() => router.push('/create-group')}
        />
      ) : (
        groups.map((item) => (
          <ListItem
            key={item.group_id}
            icon={Users}
            title={item.group_name}
            backgroundImageUri={getGroupBgImage(item.group_id)}
            onPress={() => router.push(`/group/${item.group_id}`)}
            className="mb-4"
            subtitle={
              <View className="mt-0.5 flex-row items-center">
                <Users size={12} color={colors.content} />
                <GlassText variant="caption" className="ml-1.5">
                  {item.member_count} thành viên
                </GlassText>
              </View>
            }
          />
        ))
      )}
    </Screen>
  );
}
