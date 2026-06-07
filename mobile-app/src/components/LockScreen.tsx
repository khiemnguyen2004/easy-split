import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react-native';
import { useSecurityStore } from '../store/useSecurityStore';
import { useThemeColors } from '../theme';
import { GlassText, Button } from './ui';
import { MeshBackground } from './ui/MeshBackground';

/**
 * Full-screen overlay shown while the app is locked (biometric app-lock).
 * Prompts for Face ID / fingerprint on mount and via the unlock button.
 */
export const LockScreen = () => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const authenticate = useSecurityStore((s) => s.authenticate);

  useEffect(() => {
    authenticate();
  }, [authenticate]);

  return (
    <View className="absolute inset-0 z-50">
      <MeshBackground>
        <View className="flex-1 items-center justify-center px-10">
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-[28px] border border-surface-line bg-surface-fill">
            <Lock size={36} color={colors.content} />
          </View>
          <GlassText variant="h2" className="mb-2 text-center">
            {t('security.lockedTitle')}
          </GlassText>
          <GlassText variant="body" className="mb-8 text-center text-content-muted">
            {t('security.lockedDesc')}
          </GlassText>
          <Button title={t('security.unlock')} onPress={authenticate} className="w-full" />
        </View>
      </MeshBackground>
    </View>
  );
};
