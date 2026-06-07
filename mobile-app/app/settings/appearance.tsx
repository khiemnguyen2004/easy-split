import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Sun, Moon, Smartphone, Check, LucideIcon } from 'lucide-react-native';
import { useThemeColors } from '../../src/theme';
import { useThemeStore, ThemeMode } from '../../src/store/useThemeStore';
import { Screen, GlassCard, GlassText } from '../../src/components/ui';

interface ThemeOption {
  mode: ThemeMode;
  icon: LucideIcon;
  label: string;
  description: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  { mode: 'light', icon: Sun, label: 'Sáng', description: 'Giao diện nền sáng' },
  { mode: 'dark', icon: Moon, label: 'Tối', description: 'Giao diện nền tối' },
  {
    mode: 'system',
    icon: Smartphone,
    label: 'Theo hệ thống',
    description: 'Tự động theo thiết bị',
  },
];

export default function AppearanceScreen() {
  const colors = useThemeColors();
  const { mode: theme, setMode: setTheme } = useThemeStore();

  return (
    <Screen title="Giao diện" showBack contentClassName="px-6 pt-4 pb-32">
      <GlassText variant="caption" className="mb-3 ml-1">
        Chủ đề
      </GlassText>
      <GlassCard intensity={20} className="mb-8" padding="p-3">
        {THEME_OPTIONS.map((option) => {
          const selected = theme === option.mode;
          const Icon = option.icon;
          return (
            <TouchableOpacity
              key={option.mode}
              activeOpacity={0.7}
              onPress={() => setTheme(option.mode)}
              className={`flex-row items-center rounded-2xl border p-4 ${
                selected ? 'border-accent/30 bg-accent/20' : 'border-transparent'
              } mb-1`}
            >
              <View
                className={`mr-4 h-11 w-11 items-center justify-center rounded-xl ${
                  selected ? 'bg-accent/20' : 'border border-surface-line bg-surface-fill'
                }`}
              >
                <Icon size={20} color={selected ? colors.accent : colors.content} />
              </View>
              <View className="flex-1">
                <GlassText
                  className={`font-outfit-medium text-base ${selected ? 'text-accent' : ''}`}
                >
                  {option.label}
                </GlassText>
                <GlassText variant="caption" className="mt-0.5 normal-case">
                  {option.description}
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
          Lựa chọn của bạn được lưu lại và áp dụng cho toàn bộ ứng dụng. Bảng màu tối hoàn chỉnh
          đang được hoàn thiện và sẽ sớm có mặt.
        </GlassText>
      </GlassCard>
    </Screen>
  );
}
