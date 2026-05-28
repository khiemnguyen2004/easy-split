import React from 'react';
import { Receipt } from 'lucide-react-native';
import { Screen, EmptyState } from '../../src/components/ui';

export default function ExpensesScreen() {
  return (
    <Screen title="Chi tiêu" contentClassName="px-6 pt-4 pb-32">
      <EmptyState
        icon={Receipt}
        title="Chưa có chi tiêu"
        description="Các khoản chi tiêu của bạn sẽ xuất hiện ở đây sau khi bạn thêm chúng vào các nhóm."
      />
    </Screen>
  );
}
