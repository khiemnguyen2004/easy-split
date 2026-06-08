import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../src/store/useLanguageStore';
import { getLegalContent } from '../../src/content/legal';
import { Screen, GlassCard, GlassText } from '../../src/components/ui';

type Doc = 'terms' | 'privacy';

export default function LegalScreen() {
  const { t } = useTranslation();
  const language = useLanguageStore((s) => s.language);
  const [active, setActive] = useState<Doc>('terms');

  const content = getLegalContent(language);
  const doc = content[active];

  const TABS: { key: Doc; label: string }[] = [
    { key: 'terms', label: t('legal.termsTab') },
    { key: 'privacy', label: t('legal.privacyTab') },
  ];

  return (
    <Screen title={t('help.terms')} showBack contentClassName="px-6 pt-4 pb-32">
      <View className="mb-6 flex-row rounded-2xl border border-surface-line bg-surface-fill p-1">
        {TABS.map((tab) => {
          const selected = active === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActive(tab.key)}
              className={`flex-1 items-center rounded-xl py-3 ${
                selected ? 'border border-surface-line bg-surface-glass' : ''
              }`}
            >
              <GlassText
                className={`font-outfit-bold text-[11px] uppercase tracking-tight ${
                  selected ? 'text-content' : 'text-content-faint'
                }`}
              >
                {tab.label}
              </GlassText>
            </TouchableOpacity>
          );
        })}
      </View>

      <GlassText variant="h3" className="mb-1">
        {doc.title}
      </GlassText>
      <GlassText variant="caption" className="mb-6 normal-case opacity-60">
        {doc.updated}
      </GlassText>

      {doc.sections.map((section) => (
        <GlassCard key={section.heading} intensity={15} className="mb-4" padding="p-5">
          <GlassText className="mb-2 font-outfit-bold text-base">{section.heading}</GlassText>
          <GlassText variant="body" className="leading-6 text-content-muted">
            {section.body}
          </GlassText>
        </GlassCard>
      ))}
    </Screen>
  );
}
