import React, { useState } from 'react';
import { View, Switch } from 'react-native';
import { Bell, Receipt, Wallet, MessageCircle, Clock, Mail, LucideIcon } from 'lucide-react-native';
import { useThemeColors } from '../../src/theme';
import { Screen, GlassCard, GlassText } from '../../src/components/ui';

interface ToggleRowProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}

const ToggleRow = ({ icon: Icon, label, description, value, onValueChange }: ToggleRowProps) => {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center justify-between py-4">
      <View className="mr-4 flex-1 flex-row items-center">
        <View className="mr-4 h-10 w-10 items-center justify-center rounded-xl border border-surface-line bg-surface-fill">
          <Icon size={20} color={colors.content} />
        </View>
        <View className="flex-1">
          <GlassText className="font-outfit-medium text-base">{label}</GlassText>
          {description ? (
            <GlassText variant="caption" className="mt-0.5 normal-case">
              {description}
            </GlassText>
          ) : null}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.surfaceLine, true: colors.accent }}
        thumbColor={colors.white}
      />
    </View>
  );
};

const Divider = () => <View className="h-px bg-surface-line" />;

export default function NotificationsSettingsScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [expenseAdded, setExpenseAdded] = useState(true);
  const [settlement, setSettlement] = useState(true);
  const [chat, setChat] = useState(true);
  const [reminders, setReminders] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);

  return (
    <Screen title="Thông báo" showBack contentClassName="px-6 pt-4 pb-32">
      <GlassText variant="caption" className="mb-3 ml-1">
        Chung
      </GlassText>
      <GlassCard intensity={20} className="mb-8" padding="px-5">
        <ToggleRow
          icon={Bell}
          label="Thông báo đẩy"
          description="Bật/tắt toàn bộ thông báo trên thiết bị"
          value={pushEnabled}
          onValueChange={setPushEnabled}
        />
        <Divider />
        <ToggleRow
          icon={Mail}
          label="Thông báo qua email"
          description="Nhận tóm tắt hoạt động qua email"
          value={emailEnabled}
          onValueChange={setEmailEnabled}
        />
      </GlassCard>

      <GlassText variant="caption" className="mb-3 ml-1">
        Hoạt động nhóm
      </GlassText>
      <GlassCard intensity={20} className="mb-8" padding="px-5">
        <ToggleRow
          icon={Receipt}
          label="Chi tiêu mới"
          description="Khi có người thêm chi tiêu vào nhóm"
          value={expenseAdded}
          onValueChange={setExpenseAdded}
        />
        <Divider />
        <ToggleRow
          icon={Wallet}
          label="Thanh toán & Quyết toán"
          description="Khi có khoản nợ được thanh toán"
          value={settlement}
          onValueChange={setSettlement}
        />
        <Divider />
        <ToggleRow
          icon={MessageCircle}
          label="Tin nhắn nhóm"
          description="Khi có tin nhắn mới trong nhóm"
          value={chat}
          onValueChange={setChat}
        />
        <Divider />
        <ToggleRow
          icon={Clock}
          label="Nhắc nhở nợ"
          description="Nhắc bạn về các khoản nợ chưa thanh toán"
          value={reminders}
          onValueChange={setReminders}
        />
      </GlassCard>
    </Screen>
  );
}
