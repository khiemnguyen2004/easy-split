import React from 'react';
import { useTranslation } from 'react-i18next';
import { BellOff } from 'lucide-react-native';
import { Screen, EmptyState } from '../../src/components/ui';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  return (
    <Screen title={t('notifications.title')} contentClassName="px-6 pt-4 pb-32">
      <EmptyState
        icon={BellOff}
        title={t('notifications.emptyTitle')}
        description={t('notifications.emptyDesc')}
      />
    </Screen>
  );
}
