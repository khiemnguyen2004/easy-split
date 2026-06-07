import { useState } from 'react';
import { Alert } from 'react-native';
import i18n from '../i18n';
import { useAuthStore } from '../store/useAuthStore';
import { groupService } from '../services/group.service';
import { useRouter } from 'expo-router';

export const useJoinGroup = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const joinGroup = async () => {
    const code = inviteCode.trim().toUpperCase();
    if (!code) {
      Alert.alert(i18n.t('common.error'), i18n.t('joinGroup.errNoCode'));
      return;
    }

    if (code.length < 6) {
      Alert.alert(i18n.t('common.error'), i18n.t('joinGroup.errCodeLength'));
      return;
    }

    if (!user) {
      Alert.alert(i18n.t('common.error'), i18n.t('joinGroup.errNotLoggedIn'));
      return;
    }

    setLoading(true);

    try {
      const groupId = await groupService.joinGroupByCode(code);
      if (groupId) {
        Alert.alert(i18n.t('common.success'), i18n.t('joinGroup.success'));
        router.push(`/(tabs)/groups`);
      }
    } catch (error: any) {
      console.error('Error joining group:', error);
      Alert.alert(i18n.t('common.error'), error.message || i18n.t('joinGroup.errFailed'));
    } finally {
      setLoading(false);
    }
  };

  return {
    inviteCode,
    setInviteCode,
    joinGroup,
    loading,
  };
};
