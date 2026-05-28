import React from 'react';
import { BellOff } from 'lucide-react-native';
import { Screen, EmptyState } from '../../src/components/ui';

export default function NotificationsScreen() {
  return (
    <Screen title="Thông báo" contentClassName="px-6 pt-4 pb-32">
      <EmptyState
        icon={BellOff}
        title="Không có thông báo"
        description="Bạn sẽ nhận được thông báo khi có chi tiêu mới hoặc lời mời tham gia nhóm."
      />
    </Screen>
  );
}
