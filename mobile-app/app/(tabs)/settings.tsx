import React from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  Bell,
  CircleHelp,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  LucideIcon,
} from 'lucide-react-native';
import { useHomeDashboard } from '../../src/hooks/useHomeDashboard';
import { useThemeStore, themeLabel } from '../../src/store/useThemeStore';
import { useThemeColors } from '../../src/theme';
import { Screen, GlassCard, GlassText } from '../../src/components/ui';

interface SettingRowProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}

const SettingRow = ({
  icon: Icon,
  label,
  value,
  onPress,
  destructive = false,
}: SettingRowProps) => {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center justify-between py-4"
    >
      <View className="flex-row items-center">
        <View
          className={`mr-4 h-10 w-10 items-center justify-center rounded-xl ${
            destructive ? 'bg-danger/10' : 'border border-surface-line bg-surface-fill'
          }`}
        >
          <Icon size={20} color={destructive ? colors.danger : colors.content} />
        </View>
        <GlassText className={`font-outfit-medium text-base ${destructive ? 'text-danger' : ''}`}>
          {label}
        </GlassText>
      </View>
      <View className="flex-row items-center">
        {value ? (
          <GlassText variant="caption" className="mr-3">
            {value}
          </GlassText>
        ) : null}
        <ChevronRight size={18} color={colors.contentFaint} />
      </View>
    </TouchableOpacity>
  );
};

const Divider = () => <View className="h-px bg-surface-line" />;

export default function SettingsScreen() {
  const colors = useThemeColors();
  const { user, signOut } = useHomeDashboard();
  const themeMode = useThemeStore((s) => s.mode);
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất không?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <Screen title="Cài đặt">
      <GlassCard intensity={30} className="mb-8 flex-row items-center" padding="p-6">
        <View className="mr-5 h-16 w-16 items-center justify-center rounded-full border-2 border-accent/30 bg-accent/20">
          <User size={32} color={colors.accent} />
        </View>
        <View className="flex-1">
          <GlassText variant="h3">{user?.user_metadata?.full_name || 'Người dùng'}</GlassText>
          <GlassText variant="caption" className="mt-0.5">
            {user?.email}
          </GlassText>
        </View>
      </GlassCard>

      <GlassText variant="caption" className="mb-3 ml-1">
        Tài khoản
      </GlassText>
      <GlassCard intensity={20} className="mb-8" padding="px-5">
        <SettingRow
          icon={User}
          label="Thông tin cá nhân"
          onPress={() => router.push('/settings/profile')}
        />
        <Divider />
        <SettingRow
          icon={ShieldCheck}
          label="Bảo mật & Quyền riêng tư"
          onPress={() => router.push('/settings/security')}
        />
        <Divider />
        <SettingRow
          icon={Bell}
          label="Thông báo"
          value="Đang bật"
          onPress={() => router.push('/settings/notifications')}
        />
      </GlassCard>

      <GlassText variant="caption" className="mb-3 ml-1">
        Ứng dụng
      </GlassText>
      <GlassCard intensity={20} className="mb-8" padding="px-5">
        <SettingRow
          icon={Smartphone}
          label="Giao diện"
          value={themeLabel(themeMode)}
          onPress={() => router.push('/settings/appearance')}
        />
        <Divider />
        <SettingRow
          icon={CircleHelp}
          label="Hỗ trợ & Trợ giúp"
          onPress={() => router.push('/settings/help')}
        />
      </GlassCard>

      <GlassCard intensity={15} className="mb-6 border-danger/20" padding="px-5">
        <SettingRow icon={LogOut} label="Đăng xuất" onPress={handleSignOut} destructive />
      </GlassCard>

      <View className="mt-4 items-center">
        <GlassText variant="caption" className="text-[10px] opacity-40">
          EASY SPLIT V1.0.0
        </GlassText>
      </View>
    </Screen>
  );
}
