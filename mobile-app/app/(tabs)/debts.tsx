import React from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet } from 'lucide-react-native';
import { Screen, GlassText, EmptyState } from '../../src/components/ui';

export default function DebtsScreen() {
  const { t } = useTranslation();
  return (
    <Screen contentClassName="px-6 pt-6 pb-32">
      <GlassText variant="h1" className="mb-8">
        {t('debts.title')}
      </GlassText>
      <EmptyState
        icon={Wallet}
        title={t('debts.balancedTitle')}
        description={t('debts.balancedDesc')}
      />
    </Screen>
  );
}
