import { useState } from 'react';
import { Alert } from 'react-native';
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
      Alert.alert('Lỗi', 'Vui lòng nhập mã mời.');
      return;
    }

    if (code.length < 6) {
      Alert.alert('Lỗi', 'Mã mời phải có đúng 6 ký tự.');
      return;
    }

    if (!user) {
      Alert.alert('Lỗi', 'Bạn cần đăng nhập để tham gia nhóm.');
      return;
    }

    setLoading(true);

    try {
      const groupId = await groupService.joinGroupByCode(code);
      if (groupId) {
        Alert.alert('Thành công', 'Bạn đã tham gia nhóm thành công!');
        router.push(`/(tabs)/groups`);
      }
    } catch (error: any) {
      console.error('Error joining group:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tham gia nhóm. Vui lòng thử lại.');
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
