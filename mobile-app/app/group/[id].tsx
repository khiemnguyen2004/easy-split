import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, RefreshControl, Clipboard, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../src/api/supabase';
import { getGroupBgImage } from '../../src/utils/image';
import { formatCurrency, formatDate, formatNumber, parseAmount } from '../../src/utils/format';
import { getErrorMessage } from '../../src/utils/error';
import { EXPENSE_CATEGORY_IDS } from '../../src/constants';
import {
  Settings,
  Receipt,
  TrendingUp,
  Plus,
  Copy,
  PiggyBank,
  MessageCircle,
  Wallet,
  ShieldCheck,
  Check,
  BarChart3,
} from 'lucide-react-native';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useGroupDetails } from '../../src/hooks/useGroupDetails';
import { useThemeColors } from '../../src/theme';
import {
  Screen,
  GlassCard,
  GlassText,
  Button,
  IconButton,
  ListItem,
  EmptyState,
  Avatar,
  Loader,
  ProgressBar,
} from '../../src/components/ui';

const TABS = [
  { id: 'expenses', labelKey: 'tabExpenses', icon: Receipt },
  { id: 'settlements', labelKey: 'tabSettlements', icon: TrendingUp },
  { id: 'funds', labelKey: 'tabFunds', icon: PiggyBank },
] as const;

const BALANCE_TONE = {
  positive: {
    badge: 'bg-success/20 border-success/20',
    text: 'text-success',
    labelKey: 'balanceOwed',
  },
  negative: { badge: 'bg-danger/20 border-danger/20', text: 'text-danger', labelKey: 'balanceOwe' },
  zero: {
    badge: 'bg-surface-fill border-surface-line',
    text: 'text-content-faint',
    labelKey: 'balanceEven',
  },
};

export default function GroupDetailsScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'expenses' | 'settlements' | 'funds'>('expenses');
  const [copied, setCopied] = useState(false);

  const {
    group,
    members,
    expenses,
    netBalances,
    funds,
    loading,
    refreshing,
    fetchData,
    onRefresh,
  } = useGroupDetails(id);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const copyInviteCode = () => {
    if (group?.invite_code) {
      Clipboard.setString(group.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const saveBudget = async (value?: string) => {
    const groupId = Array.isArray(id) ? id[0] : id;
    const parsed = value ? parseAmount(value) : 0;
    try {
      const { error } = await supabase
        .from('groups')
        .update({ budget_amount: parsed > 0 ? parsed : null })
        .eq('group_id', groupId);
      if (error) throw error;
      fetchData();
    } catch (error) {
      Alert.alert(t('common.error'), getErrorMessage(error) || t('common.somethingWrong'));
    }
  };

  const promptSetBudget = () =>
    Alert.prompt(
      t('groupDetail.setBudget'),
      t('groupDetail.budgetPrompt'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.save'), onPress: saveBudget },
      ],
      'plain-text',
      group?.budget_amount ? String(group.budget_amount) : '',
      'numeric'
    );

  if (loading) return <Loader fullscreen />;

  if (!group) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-6">
        <GlassText variant="body" className="mb-6 text-content-muted">
          {t('groupDetail.notFound')}
        </GlassText>
        <Button title={t('common.goBack')} onPress={() => router.back()} className="w-40" />
      </SafeAreaView>
    );
  }

  const totalGroupExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const budgetAmount = Number(group.budget_amount ?? 0);
  const budgetProgress = budgetAmount > 0 ? totalGroupExpense / budgetAmount : 0;

  return (
    <Screen
      title={group.group_name}
      showBack
      headerRight={
        <View className="flex-row items-center gap-2">
          <IconButton icon={BarChart3} onPress={() => router.push(`/group/${id}/stats`)} />
          <IconButton icon={MessageCircle} onPress={() => router.push(`/group/${id}/chat`)} />
          <IconButton icon={Settings} onPress={() => router.push(`/group/${id}/members`)} />
        </View>
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }
      overlay={
        <View className="absolute bottom-12 right-6">
          <IconButton
            icon={Plus}
            variant="fab"
            iconSize={32}
            onPress={() => router.push(`/group/${id}/add-expense`)}
          />
        </View>
      }
    >
      <GlassCard intensity={45} className="mb-8" backgroundImageUri={getGroupBgImage(id as string)}>
        <View className="mb-6 flex-row items-start justify-between">
          <View>
            <GlassText variant="caption" className="mb-2">
              {t('groupDetail.totalGroupExpense')}
            </GlassText>
            <GlassText className="font-outfit-bold text-4xl">
              {formatCurrency(totalGroupExpense)}
            </GlassText>
          </View>
          <View className="rounded-2xl border border-accent/30 bg-accent/20 p-4">
            <Wallet size={24} color={colors.accent} />
          </View>
        </View>

        {budgetAmount > 0 ? (
          <TouchableOpacity activeOpacity={0.7} onPress={promptSetBudget} className="mb-6">
            <View className="mb-1.5 flex-row items-center justify-between">
              <GlassText variant="caption" className="text-[10px]">
                {t('groupDetail.budget')}
              </GlassText>
              <GlassText className="font-outfit-bold text-[10px] text-content-muted">
                {formatCurrency(totalGroupExpense)} / {formatCurrency(budgetAmount)}
              </GlassText>
            </View>
            <ProgressBar
              progress={budgetProgress}
              tone={budgetProgress >= 1 ? 'danger' : 'accent'}
              className="h-2"
            />
            {budgetProgress >= 1 ? (
              <GlassText className="mt-1.5 font-outfit-bold text-[10px] text-danger">
                {t('groupDetail.budgetExceeded')}
              </GlassText>
            ) : null}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={promptSetBudget}
            className="mb-6 flex-row items-center justify-between rounded-2xl border border-dashed border-surface-line bg-surface-fill px-4 py-3"
          >
            <View className="flex-row items-center">
              <Wallet size={14} color={colors.contentFaint} />
              <GlassText variant="caption" className="ml-2 normal-case">
                {t('groupDetail.setBudget')}
              </GlassText>
            </View>
            <Plus size={16} color={colors.contentFaint} />
          </TouchableOpacity>
        )}

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="mr-3 flex-row -space-x-3">
              {members.slice(0, 3).map((m, i) => (
                <Avatar key={m.user_id} name={m.full_name} size="sm" style={{ zIndex: 10 - i }} />
              ))}
              {members.length > 3 ? (
                <View className="h-8 w-8 items-center justify-center rounded-full border border-surface-line bg-surface-fill">
                  <GlassText className="font-outfit-bold text-[8px]">
                    +{members.length - 3}
                  </GlassText>
                </View>
              ) : null}
            </View>
            <GlassText variant="caption" className="text-[10px]">
              {t('common.memberCount', { count: members.length })}
            </GlassText>
          </View>

          <TouchableOpacity
            onPress={copyInviteCode}
            className={`flex-row items-center rounded-lg border px-3 py-1.5 ${
              copied ? 'border-success/30 bg-success/20' : 'border-surface-line bg-surface-fill'
            }`}
          >
            <GlassText
              className={`mr-1.5 font-outfit-bold text-[9px] uppercase tracking-tight ${
                copied ? 'text-success' : 'text-content-muted'
              }`}
            >
              {copied ? t('groupDetail.copied') : group.invite_code}
            </GlassText>
            {copied ? (
              <Check size={10} color={colors.success} />
            ) : (
              <Copy size={10} color={colors.content} />
            )}
          </TouchableOpacity>
        </View>
      </GlassCard>

      <View className="mb-8 flex-row rounded-2xl border border-surface-line bg-surface-fill p-1">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className={`flex-1 flex-row items-center justify-center rounded-xl py-3 ${
                active ? 'border border-surface-line bg-surface-glass' : ''
              }`}
            >
              <tab.icon size={16} color={active ? colors.content : colors.contentFaint} />
              <GlassText
                className={`ml-2 font-outfit-bold text-[11px] uppercase tracking-tight ${
                  active ? 'text-content' : 'text-content-faint'
                }`}
              >
                {t(`groupDetail.${tab.labelKey}`)}
              </GlassText>
            </TouchableOpacity>
          );
        })}
      </View>

      {activeTab === 'expenses' ? (
        <View>
          <GlassText variant="h3" className="mb-6">
            {t('groupDetail.transactionHistory')}
          </GlassText>
          {expenses.length === 0 ? (
            <EmptyState icon={Receipt} title={t('groupDetail.noExpenses')} />
          ) : (
            expenses.map((expense) => (
              <ListItem
                key={expense.expense_id}
                icon={Receipt}
                title={expense.description || t('expenses.untitled')}
                subtitle={
                  t('groupDetail.expenseBy', {
                    name: expense.profiles?.full_name?.split(' ')[0],
                    date: formatDate(expense.created_at),
                  }) +
                  (expense.category
                    ? ` • ${
                        (EXPENSE_CATEGORY_IDS as readonly string[]).includes(expense.category)
                          ? t(`category.${expense.category}`)
                          : expense.category
                      }`
                    : '')
                }
                className="mb-4"
                trailing={
                  <GlassText variant="h3" className="text-lg">
                    {formatCurrency(expense.amount)}
                  </GlassText>
                }
              />
            ))
          )}
        </View>
      ) : null}

      {activeTab === 'settlements' ? (
        <View>
          <View className="mb-6 flex-row items-center justify-between">
            <GlassText variant="h3">{t('groupDetail.financialStatus')}</GlassText>
            <View className="flex-row items-center rounded-full border border-success/20 bg-success/10 px-3 py-1.5">
              <ShieldCheck size={14} color={colors.success} />
              <GlassText className="ml-1.5 font-outfit-bold text-[10px] uppercase tracking-tighter text-success">
                {t('groupDetail.debtSecured')}
              </GlassText>
            </View>
          </View>

          <GlassCard intensity={25} className="mb-8" padding="p-0">
            {netBalances.map((item, index) => {
              const tone =
                item.amount === 0
                  ? BALANCE_TONE.zero
                  : item.amount > 0
                    ? BALANCE_TONE.positive
                    : BALANCE_TONE.negative;
              return (
                <View
                  key={item.user_id}
                  className={`flex-row items-center p-5 ${
                    index !== netBalances.length - 1 ? 'border-b border-surface-line' : ''
                  }`}
                >
                  <View
                    className={`mr-4 h-12 w-12 items-center justify-center rounded-2xl border ${tone.badge}`}
                  >
                    <GlassText className={`font-outfit-bold text-lg ${tone.text}`}>
                      {item.full_name?.charAt(0)}
                    </GlassText>
                  </View>
                  <View className="flex-1">
                    <GlassText className="mb-0.5 font-outfit-bold text-base">
                      {item.full_name} {item.user_id === user?.id ? t('common.you') : ''}
                    </GlassText>
                    <GlassText
                      className={`font-outfit-bold text-[10px] uppercase tracking-widest ${tone.text}`}
                    >
                      {t(`groupDetail.${tone.labelKey}`)}
                    </GlassText>
                  </View>
                  <GlassText variant="h3" className={`text-lg ${tone.text}`}>
                    {item.amount > 0 ? '+' : ''}
                    {formatCurrency(item.amount)}
                  </GlassText>
                </View>
              );
            })}
          </GlassCard>

          <Button
            title={t('groupDetail.settleNow')}
            onPress={() => router.push(`/group/${id}/settlement-detail`)}
            className="w-full"
          />
        </View>
      ) : null}

      {activeTab === 'funds' ? (
        <View>
          <GlassText variant="h3" className="mb-6">
            {t('groupDetail.groupFund')}
          </GlassText>

          {funds.length === 0 ? (
            <GlassCard intensity={25} className="items-center" padding="p-8">
              <View className="mb-5 h-20 w-20 items-center justify-center rounded-[28px] border border-accent/20 bg-accent/10">
                <PiggyBank size={40} color={colors.accent} />
              </View>
              <GlassText variant="caption" className="mb-6 px-4 text-center normal-case leading-5">
                {t('groupDetail.fundSectionDesc')}
              </GlassText>
              <Button
                title={t('groupDetail.openFunds')}
                onPress={() => router.push(`/group/${id}/fund-management`)}
                className="w-full"
              />
            </GlassCard>
          ) : (
            <View>
              {funds.slice(0, 2).map((fund) => {
                const current = Number(fund.current_amount ?? 0);
                const target = Number(fund.target_amount ?? 0);
                const progress = target ? current / target : 0;
                return (
                  <GlassCard key={fund.funding_id} intensity={25} className="mb-4" padding="p-5">
                    <View className="mb-3 flex-row items-center justify-between">
                      <View className="mr-3 flex-1 flex-row items-center">
                        <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl border border-surface-line bg-surface-fill">
                          <PiggyBank size={16} color={colors.accent} />
                        </View>
                        <GlassText className="flex-1 font-outfit-bold" numberOfLines={1}>
                          {fund.name}
                        </GlassText>
                      </View>
                      <GlassText className="font-outfit-bold text-xs text-content-muted">
                        {Math.round(progress * 100)}%
                      </GlassText>
                    </View>
                    <ProgressBar progress={progress} tone="success" className="mb-2 h-2" />
                    <View className="flex-row justify-between">
                      <GlassText className="font-outfit-bold text-xs text-success">
                        {formatCurrency(current)}
                      </GlassText>
                      <GlassText variant="caption" className="text-[10px]">
                        {t('fund.target', { amount: formatNumber(target) })}
                      </GlassText>
                    </View>
                  </GlassCard>
                );
              })}
              <Button
                title={t('groupDetail.openFunds')}
                variant="secondary"
                onPress={() => router.push(`/group/${id}/fund-management`)}
                className="mt-2 w-full"
              />
            </View>
          )}
        </View>
      ) : null}
    </Screen>
  );
}
