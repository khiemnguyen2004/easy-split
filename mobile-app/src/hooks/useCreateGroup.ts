import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { groupService } from '../services/group.service';

export const useCreateGroup = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const createGroup = async (groupName: string, description: string, budgetAmount: string) => {
    if (!groupName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên nhóm.');
      return;
    }

    if (!user) {
      Alert.alert('Lỗi', 'Bạn cần đăng nhập để tạo nhóm.');
      return;
    }

    setLoading(true);
    const code = generateInviteCode();

    console.log('--- Creating Group Debug ---');
    console.log('User ID:', user.id);
    console.log('Group Name:', groupName.trim());
    console.log('Invite Code:', code);

    try {
      await groupService.createGroupWithAdmin({
        group_name: groupName.trim(),
        description: description.trim(),
        invite_code: code,
        created_by: user.id,
        budget_amount: budgetAmount ? parseFloat(budgetAmount) : undefined,
      });

      setInviteCode(code);
      return { success: true, code };
    } catch (error: any) {
      console.error('Error creating group:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tạo nhóm. Vui lòng thử lại.');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    createGroup,
    loading,
    inviteCode,
  };
};
