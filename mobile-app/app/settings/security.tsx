import React, { useState } from 'react';
import { View, Switch, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Lock, KeyRound, Fingerprint, ShieldCheck, LucideIcon } from 'lucide-react-native';
import { useThemeColors } from '../../src/theme';
import { useSecurityStore } from '../../src/store/useSecurityStore';
import { accountService } from '../../src/services/account.service';
import { getErrorMessage } from '../../src/utils/error';
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
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const biometric = useSecurityStore((s) => s.biometricEnabled);
  const setBiometricEnabled = useSecurityStore((s) => s.setBiometricEnabled);
  const [twoFactor, setTwoFactor] = useState(false);

  const handleBiometricToggle = async (next: boolean) => {
    const ok = await setBiometricEnabled(next);
    if (next && !ok) {
      Alert.alert(t('security.biometricUnavailableTitle'), t('security.biometricUnavailableMsg'));
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('common.missingInfo'), t('security.missingFields'));
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert(t('security.tooShortTitle'), t('security.tooShortMsg'));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t('security.mismatchTitle'), t('security.mismatchMsg'));
      return;
    }
    if (newPassword === currentPassword) {
      Alert.alert(t('security.sameTitle'), t('security.sameMsg'));
      return;
    }
    setSaving(true);
    try {
      await accountService.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert(t('common.success'), t('security.successMsg'));
    } catch (error) {
      Alert.alert(t('security.failedTitle'), getErrorMessage(error) || t('common.tryAgainLater'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      title={t('security.title')}
      showBack
      keyboardAvoiding
      contentClassName="px-6 pt-4 pb-32"
    >
      <GlassText variant="caption" className="mb-3 ml-1">
        {t('security.changePassword')}
      </GlassText>
      <GlassCard intensity={20} className="mb-8" padding="p-5">
        <Input
          label={t('security.currentPassword')}
          icon={Lock}
          secureToggle
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="••••••••"
          containerClassName="mb-5"
        />
        <Input
          label={t('security.newPassword')}
          icon={KeyRound}
          secureToggle
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder={t('security.newPasswordPlaceholder')}
          containerClassName="mb-5"
        />
        <Input
          label={t('security.confirmPassword')}
          icon={KeyRound}
          secureToggle
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={t('security.confirmPasswordPlaceholder')}
          containerClassName="mb-6"
        />
        <Button
          title={t('security.updatePassword')}
          onPress={handleChangePassword}
          loading={saving}
        />
      </GlassCard>

      <GlassText variant="caption" className="mb-3 ml-1">
        {t('security.loginAuth')}
      </GlassText>
      <GlassCard intensity={20} className="mb-8" padding="px-5">
        <ToggleRow
          icon={Fingerprint}
          label={t('security.biometric')}
          description={t('security.biometricDesc')}
          value={biometric}
          onValueChange={handleBiometricToggle}
        />
        <Divider />
        <ToggleRow
          icon={ShieldCheck}
          label={t('security.twoFactor')}
          description={t('security.twoFactorDesc')}
          value={twoFactor}
          onValueChange={setTwoFactor}
        />
      </GlassCard>
    </Screen>
  );
}
