import React from 'react';
import { useTranslation } from 'react-i18next';
import { Receipt } from 'lucide-react-native';
import { Screen, EmptyState } from '../../src/components/ui';

export default function ExpensesScreen() {
  const { t } = useTranslation();
  return (
    <Screen title={t('expenses.title')} contentClassName="px-6 pt-4 pb-32">
      <EmptyState
        icon={Receipt}
        title={t('expenses.emptyTitle')}
        description={t('expenses.emptyDesc')}
      />
    </Screen>
  );
}
