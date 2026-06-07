import React, { useCallback } from 'react';
import { View, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Receipt } from 'lucide-react-native';
import { useExpensesFeed } from '../../src/hooks/useExpensesFeed';
import { useThemeColors } from '../../src/theme';
import { formatCurrency, formatDate } from '../../src/utils/format';
import { Screen, GlassText, EmptyState, ListItem, Loader } from '../../src/components/ui';

export default function ExpensesScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const router = useRouter();
  const { expenses, loading, refreshing, fetchData, onRefresh } = useExpensesFeed();

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  return (
    <Screen
      title={t('expenses.title')}
      contentClassName="px-6 pt-4 pb-32"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }
    >
      {loading ? (
        <Loader className="mt-10" />
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={t('expenses.emptyTitle')}
          description={t('expenses.emptyDesc')}
        />
      ) : (
        <View>
          {expenses.map((exp) => (
            <ListItem
              key={exp.expense_id}
              icon={Receipt}
              title={exp.description || t('expenses.untitled')}
              subtitle={`${exp.group_name} • ${formatDate(exp.created_at)}`}
              onPress={() => router.push(`/group/${exp.group_id}`)}
              className="mb-4"
              trailing={
                <GlassText variant="h3" className="text-lg">
                  {formatCurrency(exp.amount)}
                </GlassText>
              }
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
