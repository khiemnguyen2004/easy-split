import React from 'react';
import { View, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { UserPlus, Hash } from 'lucide-react-native';
import { useJoinGroup } from '../src/hooks/useJoinGroup';
import { useThemeColors } from '../src/theme';
import { Screen, GlassCard, GlassText, Button } from '../src/components/ui';

export default function JoinGroupScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { inviteCode, setInviteCode, joinGroup, loading } = useJoinGroup();

  return (
    <Screen title={t('joinGroup.title')} showBack contentClassName="px-6 pt-4 pb-32">
      <View className="mb-12 items-center">
        <View className="h-24 w-24 items-center justify-center rounded-[32px] border border-success/20 bg-success/10 shadow-lg shadow-success/10">
          <UserPlus size={40} color={colors.success} />
        </View>
      </View>

      <GlassCard intensity={20} className="mb-8" padding="p-6">
        <GlassText variant="body" className="text-center text-content-muted">
          {t('joinGroup.instruction')}
        </GlassText>
      </GlassCard>

      <GlassCard intensity={30} className="mb-10" padding="p-8">
        <GlassText variant="caption" className="mb-4 text-center tracking-[2px]">
          {t('joinGroup.yourInviteCode')}
        </GlassText>

        <View className="mb-2 flex-row items-center rounded-2xl border border-surface-line bg-surface-fill px-6 py-5 shadow-sm">
          <View className="mr-4">
            <Hash size={24} color={colors.contentFaint} />
          </View>
          <TextInput
            placeholder={t('joinGroup.codePlaceholder')}
            value={inviteCode}
            onChangeText={(text) => setInviteCode(text.toUpperCase())}
            autoCapitalize="characters"
            maxLength={6}
            className="flex-1 font-outfit-bold text-3xl tracking-[6px] text-content"
            placeholderTextColor={colors.placeholder}
          />
        </View>

        <GlassText variant="caption" className="mt-4 text-center opacity-60">
          {t('joinGroup.caseHint')}
        </GlassText>
      </GlassCard>

      <Button
        title={loading ? t('common.processing') : t('joinGroup.submit')}
        onPress={joinGroup}
        loading={loading}
        disabled={inviteCode.length < 6}
        className="w-full"
      />
    </Screen>
  );
}
