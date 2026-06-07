import React, { useState } from 'react';
import { View, Switch, Alert } from 'react-native';
import { Lock, KeyRound, Fingerprint, ShieldCheck, LucideIcon } from 'lucide-react-native';
import { useThemeColors } from '../../src/theme';
import { accountService } from '../../src/services/account.service';
import { Screen, GlassCard, GlassText, Input, Button } from '../../src/components/ui';

interface ToggleRowProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}

const ToggleRow = ({ icon: Icon, label, description, value, onValueChange }: ToggleRowProps) => {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center justify-between py-4">
      <View className="mr-4 flex-1 flex-row items-center">
        <View className="mr-4 h-10 w-10 items-center justify-center rounded-xl border border-surface-line bg-surface-fill">
          <Icon size={20} color={colors.content} />
        </View>
        <View className="flex-1">
          <GlassText className="font-outfit-medium text-base">{label}</GlassText>
          {description ? (
            <GlassText variant="caption" className="mt-0.5 normal-case">
              {description}
            </GlassText>
          ) : null}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.surfaceLine, true: colors.accent }}
        thumbColor={colors.white}
      />
    </View>
  );
};

const Divider = () => <View className="h-px bg-surface-line" />;

export default function SecurityScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const [biometric, setBiometric] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ các trường mật khẩu.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Mật khẩu quá ngắn', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Không khớp', 'Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }
    if (newPassword === currentPassword) {
      Alert.alert('Trùng mật khẩu', 'Mật khẩu mới phải khác mật khẩu hiện tại.');
      return;
    }
    setSaving(true);
    try {
      await accountService.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Thành công', 'Mật khẩu của bạn đã được cập nhật.');
    } catch (error: any) {
      Alert.alert('Đổi mật khẩu thất bại', error.message ?? 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      title="Bảo mật & Quyền riêng tư"
      showBack
      keyboardAvoiding
      contentClassName="px-6 pt-4 pb-32"
    >
      <GlassText variant="caption" className="mb-3 ml-1">
        Đổi mật khẩu
      </GlassText>
      <GlassCard intensity={20} className="mb-8" padding="p-5">
        <Input
          label="Mật khẩu hiện tại"
          icon={Lock}
          secureToggle
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="••••••••"
          containerClassName="mb-5"
        />
        <Input
          label="Mật khẩu mới"
          icon={KeyRound}
          secureToggle
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Ít nhất 6 ký tự"
          containerClassName="mb-5"
        />
        <Input
          label="Xác nhận mật khẩu mới"
          icon={KeyRound}
          secureToggle
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Nhập lại mật khẩu mới"
          containerClassName="mb-6"
        />
        <Button title="Cập nhật mật khẩu" onPress={handleChangePassword} loading={saving} />
      </GlassCard>

      <GlassText variant="caption" className="mb-3 ml-1">
        Đăng nhập & Xác thực
      </GlassText>
      <GlassCard intensity={20} className="mb-8" padding="px-5">
        <ToggleRow
          icon={Fingerprint}
          label="Đăng nhập sinh trắc học"
          description="Dùng Face ID / vân tay để mở ứng dụng"
          value={biometric}
          onValueChange={setBiometric}
        />
        <Divider />
        <ToggleRow
          icon={ShieldCheck}
          label="Xác thực 2 lớp"
          description="Yêu cầu mã xác nhận khi đăng nhập"
          value={twoFactor}
          onValueChange={setTwoFactor}
        />
      </GlassCard>
    </Screen>
  );
}
