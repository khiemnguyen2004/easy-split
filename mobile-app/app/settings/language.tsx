import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react-native';
import { useThemeColors } from '../../src/theme';
import { useLanguageStore } from '../../src/store/useLanguageStore';
import { Language, LANGUAGES } from '../../src/i18n';
import { Screen, GlassCard, GlassText } from '../../src/components/ui';

interface LanguageOption {
  code: Language;
  /** Endonym (always shown in its own language). */
  label: string;
  flag: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
];

export default function LanguageScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { language, setLanguage } = useLanguageStore();

  return (
    <Screen title={t('language.title')} showBack contentClassName="px-6 pt-4 pb-32">
      <GlassText variant="caption" className="mb-3 ml-1">
        {t('language.section')}
      </GlassText>
      <GlassCard intensity={20} className="mb-8" padding="p-3">
        {LANGUAGE_OPTIONS.filter((option) => LANGUAGES.includes(option.code)).map((option) => {
          const selected = language === option.code;
          return (
            <TouchableOpacity
              key={option.code}
              activeOpacity={0.7}
              onPress={() => setLanguage(option.code)}
              className={`mb-1 flex-row items-center rounded-2xl border p-4 ${
                selected ? 'border-accent/30 bg-accent/20' : 'border-transparent'
              }`}
            >
              <View
                className={`mr-4 h-11 w-11 items-center justify-center rounded-xl ${
                  selected ? 'bg-accent/20' : 'border border-surface-line bg-surface-fill'
                }`}
              >
                <GlassText className="text-xl">{option.flag}</GlassText>
              </View>
              <View className="flex-1">
                <GlassText
                  className={`font-outfit-medium text-base ${selected ? 'text-accent' : ''}`}
                >
                  {option.label}
                </GlassText>
              </View>
              {selected ? (
                <View className="h-6 w-6 items-center justify-center rounded-full bg-accent">
                  <Check size={14} color={colors.white} />
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </GlassCard>

      <GlassCard intensity={15} padding="p-6">
        <GlassText variant="caption" className="normal-case leading-5">
          {t('language.note')}
        </GlassText>
      </GlassCard>
    </Screen>
  );
}
