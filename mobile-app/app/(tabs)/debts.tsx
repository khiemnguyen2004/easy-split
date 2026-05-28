import React from 'react';
import { Wallet } from 'lucide-react-native';
import { Screen, GlassText, EmptyState } from '../../src/components/ui';

export default function DebtsScreen() {
  return (
    <Screen contentClassName="px-6 pt-6 pb-32">
      <GlassText variant="h1" className="mb-8">
        Khoản nợ
      </GlassText>
      <EmptyState
        icon={Wallet}
        title="Bạn đang rất cân bằng!"
        description="Hiện tại bạn không có khoản nợ hay khoản thu nào chờ xử lý."
      />
    </Screen>
  );
}
