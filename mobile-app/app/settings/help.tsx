import React, { useState } from 'react';
import { View, TouchableOpacity, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
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

/** FAQ entries are keyed; question/answer text lives in the `help.*` locale files. */
const FAQ_KEYS = ['faq1', 'faq2', 'faq3', 'faq4'];

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
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => setOpenIndex((prev) => (prev === index ? null : index));

  return (
    <Screen title={t('help.title')} showBack contentClassName="px-6 pt-4 pb-32">
      <GlassText variant="caption" className="mb-3 ml-1">
        {t('help.faqSection')}
      </GlassText>
      <GlassCard intensity={20} className="mb-8" padding="px-5">
        {FAQ_KEYS.map((faqKey, index) => {
          const open = openIndex === index;
          return (
            <View key={faqKey}>
              {index > 0 ? <Divider /> : null}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => toggle(index)}
                className="flex-row items-center justify-between py-4"
              >
                <GlassText className="mr-3 flex-1 font-outfit-medium text-base">
                  {t(`help.${faqKey}q`)}
                </GlassText>
                <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
                  <ChevronDown size={18} color={colors.contentFaint} />
                </View>
              </TouchableOpacity>
              {open ? (
                <GlassText variant="body" className="pb-4 leading-6 text-content-muted">
                  {t(`help.${faqKey}a`)}
                </GlassText>
              ) : null}
            </View>
          );
        })}
      </GlassCard>

      <GlassText variant="caption" className="mb-3 ml-1">
        {t('help.contactSection')}
      </GlassText>
      <GlassCard intensity={20} className="mb-8" padding="px-5">
        <ContactRow
          icon={Mail}
          label={t('help.emailSupport')}
          value="support@easysplit.app"
          onPress={() => Linking.openURL('mailto:support@easysplit.app')}
        />
        <Divider />
        <ContactRow
          icon={MessageCircle}
          label={t('help.sendFeedback')}
          onPress={() =>
            Linking.openURL(
              `mailto:support@easysplit.app?subject=${encodeURIComponent(t('help.feedbackSubject'))}`
            )
          }
        />
        <Divider />
        <ContactRow icon={Star} label={t('help.rateApp')} onPress={() => {}} />
        <Divider />
        <ContactRow icon={FileText} label={t('help.terms')} onPress={() => {}} />
      </GlassCard>

      <View className="items-center">
        <GlassText variant="caption" className="text-[10px] opacity-40">
          EASY SPLIT V1.0.0
        </GlassText>
      </View>
    </Screen>
  );
}
