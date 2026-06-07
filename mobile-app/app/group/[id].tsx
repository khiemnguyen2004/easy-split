import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, RefreshControl, Clipboard } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { getGroupBgImage } from '../../src/utils/image';
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

  const { group, members, expenses, netBalances, loading, refreshing, fetchData, onRefresh } =
    useGroupDetails(id);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const formatCurrency = (amount: number) => amount.toLocaleString('vi-VN') + 'đ';
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

  const copyInviteCode = () => {
    if (group?.invite_code) {
      Clipboard.setString(group.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  return (
    <Screen
      title={group.group_name}
      showBack
      headerRight={
        <View className="flex-row items-center gap-2">
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
                title={expense.description}
                subtitle={t('groupDetail.expenseBy', {
                  name: expense.profiles?.full_name?.split(' ')[0],
                  date: formatDate(expense.created_at),
                })}
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
          <EmptyState
            icon={PiggyBank}
            title={t('groupDetail.fundComingSoon')}
            description={t('groupDetail.fundComingSoonDesc')}
          />
        </View>
      ) : null}
    </Screen>
  );
}
