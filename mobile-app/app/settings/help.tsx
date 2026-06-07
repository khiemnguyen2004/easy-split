import React, { useState } from 'react';
import { View, TouchableOpacity, Linking } from 'react-native';
import {
  ChevronDown,
  Mail,
  MessageCircle,
  FileText,
  Star,
  ChevronRight,
  LucideIcon,
} from 'lucide-react-native';
import { useThemeColors } from '../../src/theme';
import { Screen, GlassCard, GlassText } from '../../src/components/ui';

const FAQS = [
  {
    q: 'Làm sao để chia tiền trong nhóm?',
    a: 'Vào nhóm bạn muốn, nhấn nút thêm chi tiêu, nhập số tiền và chọn những người tham gia. EasySplit sẽ tự động tính phần của mỗi người.',
  },
  {
    q: 'Làm sao để mời thành viên vào nhóm?',
    a: 'Mở nhóm, vào phần Thành viên và chia sẻ mã mời. Người được mời nhập mã ở màn hình "Tham gia nhóm" để vào nhóm.',
  },
  {
    q: 'Quyết toán nợ hoạt động như thế nào?',
    a: 'EasySplit tự động tối ưu số giao dịch cần thiết để mọi người trả nợ cho nhau ít bước nhất. Bạn xem chi tiết ở mục Quyết toán của nhóm.',
  },
  {
    q: 'Dữ liệu của tôi có an toàn không?',
    a: 'Dữ liệu được lưu trữ an toàn và chỉ những thành viên trong nhóm mới xem được thông tin chi tiêu của nhóm đó.',
  },
];

interface ContactRowProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  onPress: () => void;
}

const ContactRow = ({ icon: Icon, label, value, onPress }: ContactRowProps) => {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-row items-center justify-between py-4"
    >
      <View className="flex-row items-center">
        <View className="mr-4 h-10 w-10 items-center justify-center rounded-xl border border-surface-line bg-surface-fill">
          <Icon size={20} color={colors.content} />
        </View>
        <GlassText className="font-outfit-medium text-base">{label}</GlassText>
      </View>
      <View className="flex-row items-center">
        {value ? (
          <GlassText variant="caption" className="mr-3 normal-case">
            {value}
          </GlassText>
        ) : null}
        <ChevronRight size={18} color={colors.contentFaint} />
      </View>
    </TouchableOpacity>
  );
};

const Divider = () => <View className="h-px bg-surface-line" />;

export default function HelpScreen() {
  const colors = useThemeColors();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => setOpenIndex((prev) => (prev === index ? null : index));

  return (
    <Screen title="Hỗ trợ & Trợ giúp" showBack contentClassName="px-6 pt-4 pb-32">
      <GlassText variant="caption" className="mb-3 ml-1">
        Câu hỏi thường gặp
      </GlassText>
      <GlassCard intensity={20} className="mb-8" padding="px-5">
        {FAQS.map((faq, index) => {
          const open = openIndex === index;
          return (
            <View key={faq.q}>
              {index > 0 ? <Divider /> : null}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => toggle(index)}
                className="flex-row items-center justify-between py-4"
              >
                <GlassText className="mr-3 flex-1 font-outfit-medium text-base">{faq.q}</GlassText>
                <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
                  <ChevronDown size={18} color={colors.contentFaint} />
                </View>
              </TouchableOpacity>
              {open ? (
                <GlassText variant="body" className="pb-4 leading-6 text-content-muted">
                  {faq.a}
                </GlassText>
              ) : null}
            </View>
          );
        })}
      </GlassCard>

      <GlassText variant="caption" className="mb-3 ml-1">
        Liên hệ
      </GlassText>
      <GlassCard intensity={20} className="mb-8" padding="px-5">
        <ContactRow
          icon={Mail}
          label="Gửi email hỗ trợ"
          value="support@easysplit.app"
          onPress={() => Linking.openURL('mailto:support@easysplit.app')}
        />
        <Divider />
        <ContactRow
          icon={MessageCircle}
          label="Gửi phản hồi"
          onPress={() => Linking.openURL('mailto:support@easysplit.app?subject=Phản hồi EasySplit')}
        />
        <Divider />
        <ContactRow icon={Star} label="Đánh giá ứng dụng" onPress={() => {}} />
        <Divider />
        <ContactRow icon={FileText} label="Điều khoản & Chính sách" onPress={() => {}} />
      </GlassCard>

      <View className="items-center">
        <GlassText variant="caption" className="text-[10px] opacity-40">
          EASY SPLIT V1.0.0
        </GlassText>
      </View>
    </Screen>
  );
}
