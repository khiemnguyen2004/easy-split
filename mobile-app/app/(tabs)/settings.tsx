import React from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Bell,
  Lock,
  CircleHelp,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Smartphone,
} from 'lucide-react-native';
import { useHomeDashboard } from '../../src/hooks/useHomeDashboard';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { GlassText } from '../../src/components/ui/GlassText';
import { GlassHeader } from '../../src/components/ui/GlassHeader';

export default function SettingsScreen() {
  const { user, signOut } = useHomeDashboard();

  const handleSignOut = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất không?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: signOut },
    ]);
  };

  const SettingItem = ({ icon: Icon, label, value, onPress, isDestructive = false }: any) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center justify-between py-4"
    >
      <View className="flex-row items-center">
        <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${isDestructive ? 'bg-rose-400/10' : 'bg-indigo-950/5 border border-indigo-950/10'}`}>
          <Icon size={20} color={isDestructive ? '#FB7185' : '#1E1B4B'} />
        </View>
        <GlassText className={`text-base font-outfit-medium ${isDestructive ? 'text-rose-400' : ''}`}>
          {label}
        </GlassText>
      </View>
      <View className="flex-row items-center">
        {value && (
          <GlassText variant="caption" className="mr-3 opacity-40">
            {value}
          </GlassText>
        )}
        <ChevronRight size={18} color="rgba(30, 27, 75, 0.3)" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <GlassHeader title="Cài đặt" />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="pt-2 pb-32">
          {/* Profile Header */}
          <GlassCard intensity={30} className="mb-8 p-6 flex-row items-center border-indigo-950/10">
            <View className="w-16 h-16 rounded-full bg-sunrise-orange/20 items-center justify-center mr-5 border-2 border-sunrise-orange/30">
              <User size={32} color="#FF512F" />
            </View>
            <View className="flex-1">
              <GlassText variant="h3">{user?.user_metadata?.full_name || 'Người dùng'}</GlassText>
              <GlassText variant="caption" className="opacity-50 mt-0.5">
                {user?.email}
              </GlassText>
            </View>
          </GlassCard>

          {/* Account Section */}
          <GlassText variant="caption" className="mb-3 ml-1 uppercase tracking-widest opacity-40">Tài khoản</GlassText>
          <GlassCard intensity={20} className="mb-8 p-0 px-5 border-indigo-950/10">
            <SettingItem icon={User} label="Thông tin cá nhân" />
            <View className="h-[1px] bg-indigo-950/5" />
            <SettingItem icon={ShieldCheck} label="Bảo mật & Quyền riêng tư" />
            <View className="h-[1px] bg-indigo-950/5" />
            <SettingItem icon={Bell} label="Thông báo" value="Đang bật" />
          </GlassCard>

          {/* App Section */}
          <GlassText variant="caption" className="mb-3 ml-1 uppercase tracking-widest opacity-40">Ứng dụng</GlassText>
          <GlassCard intensity={20} className="mb-8 p-0 px-5 border-indigo-950/10">
            <SettingItem icon={Smartphone} label="Giao diện" value="Tối" />
            <View className="h-[1px] bg-indigo-950/5" />
            <SettingItem icon={CircleHelp} label="Hỗ trợ & Trợ giúp" />
          </GlassCard>

          {/* Danger Zone */}
          <GlassCard intensity={15} className="mb-6 p-0 px-5 border-rose-400/20">
            <SettingItem icon={LogOut} label="Đăng xuất" onPress={handleSignOut} isDestructive />
          </GlassCard>
          
          <View className="items-center mt-4">
            <GlassText variant="caption" className="opacity-20 text-[10px]">EASY SPLIT V1.0.0</GlassText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
