import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { User, Mail, Phone, AtSign } from 'lucide-react-native';
import { useAuthStore } from '../../src/store/useAuthStore';
import { accountService } from '../../src/services/account.service';
import { supabase } from '../../src/api/supabase';
import { useThemeColors } from '../../src/theme';
import { Screen, GlassCard, GlassText, Input, Button } from '../../src/components/ui';

export default function ProfileScreen() {
  const colors = useThemeColors();
  const { user, setUser } = useAuthStore();

  const [fullName, setFullName] = useState(user?.user_metadata?.full_name ?? '');
  const [phone, setPhone] = useState(user?.user_metadata?.phone ?? '');
  const [saving, setSaving] = useState(false);

  // Phone lives in the `profiles` table (registration only sets full_name in
  // metadata), so load the canonical row on mount.
  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    supabase
      .from('profiles')
      .select('full_name, phone_number')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (!active || !data) return;
        if (data.full_name) setFullName(data.full_name);
        if (data.phone_number) setPhone(data.phone_number);
      });
    return () => {
      active = false;
    };
  }, [user?.id]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ và tên của bạn.');
      return;
    }
    setSaving(true);
    try {
      const updatedUser = await accountService.updateProfile({
        full_name: fullName,
        phone_number: phone,
      });
      setUser(updatedUser);
      Alert.alert('Đã lưu', 'Thông tin cá nhân của bạn đã được cập nhật.');
    } catch (error: any) {
      Alert.alert('Cập nhật thất bại', error.message ?? 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen title="Thông tin cá nhân" showBack keyboardAvoiding contentClassName="px-6 pt-4 pb-32">
      <View className="mb-8 items-center">
        <View className="h-24 w-24 items-center justify-center rounded-full border-2 border-accent/30 bg-accent/20">
          <User size={44} color={colors.accent} />
        </View>
        <GlassText variant="h3" className="mt-4">
          {fullName || 'Người dùng'}
        </GlassText>
        <GlassText variant="caption" className="mt-1">
          {user?.email}
        </GlassText>
      </View>

      <GlassText variant="caption" className="mb-3 ml-1">
        Chi tiết
      </GlassText>
      <GlassCard intensity={20} className="mb-8" padding="p-5">
        <Input
          label="Họ và tên"
          icon={User}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Nhập họ và tên"
          containerClassName="mb-5"
        />
        <Input
          label="Số điện thoại"
          icon={Phone}
          value={phone}
          onChangeText={setPhone}
          placeholder="Chưa cập nhật"
          keyboardType="phone-pad"
          containerClassName="mb-5"
        />
        <Input
          label="Email"
          icon={Mail}
          value={user?.email ?? ''}
          editable={false}
          trailing={<AtSign size={16} color={colors.contentFaint} />}
        />
        <GlassText variant="caption" className="ml-1 mt-2 normal-case opacity-60">
          Email dùng để đăng nhập và không thể thay đổi.
        </GlassText>
      </GlassCard>

      <Button title="Lưu thay đổi" onPress={handleSave} loading={saving} />
    </Screen>
  );
}
