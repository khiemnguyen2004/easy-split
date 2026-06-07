import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Users, FileText, Copy, Check, Wallet } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useCreateGroup } from '../src/hooks/useCreateGroup';
import { useThemeColors } from '../src/theme';
import { GlassCard, GlassText, GlassHeader, Input, Button } from '../src/components/ui';

export default function CreateGroupScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [copied, setCopied] = useState(false);

  const { createGroup, loading, inviteCode } = useCreateGroup();

  const handleCreateGroup = async () => {
    await createGroup(groupName, description, budgetAmount);
  };

  const copyToClipboard = async () => {
    if (inviteCode) {
      await Clipboard.setStringAsync(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (inviteCode) {
    return (
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-8 h-24 w-24 items-center justify-center rounded-[32px] border border-success/30 bg-success/20 shadow-lg shadow-success/20">
            <Check size={48} color={colors.success} />
          </View>

          <GlassText variant="h1" className="mb-3 text-center">
            {t('createGroup.successTitle')}
          </GlassText>
          <GlassText variant="body" className="mb-12 px-6 text-center text-content-muted">
            {t('createGroup.successDesc')}
          </GlassText>

          <GlassCard
            intensity={45}
            className="mb-12 w-full items-center border-success/20"
            padding="p-10"
          >
            <GlassText variant="caption" className="mb-6 tracking-[4px]">
              {t('createGroup.yourInviteCode')}
            </GlassText>
            <GlassText className="mb-10 font-outfit-bold text-6xl tracking-tighter text-accent">
              {inviteCode}
            </GlassText>

            <TouchableOpacity
              onPress={copyToClipboard}
              className={`flex-row items-center rounded-2xl border px-6 py-3 ${
                copied ? 'border-success/30 bg-success/20' : 'border-surface-line bg-surface-fill'
              }`}
            >
              {copied ? (
                <>
                  <Check size={18} color={colors.success} style={{ marginRight: 8 }} />
                  <GlassText className="font-outfit-bold text-success">
                    {t('createGroup.copied')}
                  </GlassText>
                </>
              ) : (
                <>
                  <Copy size={18} color={colors.content} style={{ marginRight: 8 }} />
                  <GlassText className="font-outfit-bold">{t('createGroup.copyCode')}</GlassText>
                </>
              )}
            </TouchableOpacity>
          </GlassCard>

          <Button
            title={t('createGroup.backHome')}
            variant="secondary"
            onPress={() => router.push('/(tabs)')}
            className="w-full"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <GlassHeader title={t('createGroup.title')} showBack />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          className="px-6"
        >
          <View className="pb-32 pt-4">
            <View className="mb-10 items-center">
              <View className="h-24 w-24 items-center justify-center rounded-[32px] border border-accent/20 bg-accent/10 shadow-lg shadow-accent/10">
                <Users size={40} color={colors.accent} />
              </View>
            </View>

            <GlassCard intensity={30} className="mb-10" padding="p-6">
              <View className="gap-8">
                <Input
                  label={t('createGroup.nameLabel')}
                  icon={Users}
                  placeholder={t('createGroup.namePlaceholder')}
                  value={groupName}
                  onChangeText={setGroupName}
                />
                <Input
                  label={t('createGroup.budgetLabel')}
                  icon={Wallet}
                  placeholder={t('createGroup.budgetPlaceholder')}
                  value={budgetAmount}
                  onChangeText={setBudgetAmount}
                  keyboardType="numeric"
                  trailing={
                    <View className="rounded-md border border-surface-line bg-surface-fill px-2 py-1">
                      <GlassText className="font-outfit-bold text-[10px] text-content-muted">
                        {t('common.vnd')}
                      </GlassText>
                    </View>
                  }
                />
                <Input
                  label={t('createGroup.descLabel')}
                  icon={FileText}
                  placeholder={t('createGroup.descPlaceholder')}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  textAlignVertical="top"
                  className="min-h-[100px]"
                />
              </View>
            </GlassCard>

            <Button
              title={loading ? t('common.processing') : t('createGroup.submit')}
              onPress={handleCreateGroup}
              loading={loading}
              disabled={!groupName}
              className="w-full"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
