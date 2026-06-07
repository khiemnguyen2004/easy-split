import React from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { UserPlus, UserMinus, Shield, ShieldCheck } from 'lucide-react-native';
import { useGroupDetails } from '../../../src/hooks/useGroupDetails';
import { useThemeColors } from '../../../src/theme';
import {
  Screen,
  GlassCard,
  GlassText,
  IconButton,
  Avatar,
  Loader,
} from '../../../src/components/ui';

export default function MembersScreen() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams();
  const { group, members, loading } = useGroupDetails(id);

  if (loading) return <Loader fullscreen />;

  const handleRemoveMember = (memberName: string) => {
    Alert.alert('Xóa thành viên', `Bạn có chắc muốn xóa ${memberName} khỏi nhóm không?`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => console.log('Remove member') },
    ]);
  };

  return (
    <Screen
      title="Thành viên"
      subtitle={group?.group_name}
      showBack
      headerRight={<IconButton icon={UserPlus} onPress={() => {}} />}
      contentClassName="px-6 pt-4 pb-32"
    >
      <GlassText variant="caption" className="mb-4 ml-1 tracking-widest">
        Danh sách ({members.length})
      </GlassText>

      {members.map((member) => {
        const isOwner = member.user_id === group?.created_by;
        return (
          <GlassCard
            key={member.user_id}
            intensity={20}
            className="mb-4 flex-row items-center"
            padding="p-5"
          >
            <Avatar name={member.full_name} size="lg" className="mr-4" />

            <View className="flex-1">
              <View className="flex-row items-center">
                <GlassText className="mr-2 font-outfit-bold text-base">
                  {member.full_name}
                </GlassText>
                {isOwner ? (
                  <View className="rounded-md border border-accent/30 bg-accent/20 px-1.5 py-0.5">
                    <Shield size={10} color={colors.accent} />
                  </View>
                ) : null}
              </View>
              <GlassText variant="caption">{isOwner ? 'Trưởng nhóm' : 'Thành viên'}</GlassText>
            </View>

            {!isOwner ? (
              <TouchableOpacity
                onPress={() => handleRemoveMember(member.full_name)}
                className="h-10 w-10 items-center justify-center rounded-xl border border-danger/20 bg-danger/10"
              >
                <UserMinus size={18} color={colors.danger} />
              </TouchableOpacity>
            ) : null}
          </GlassCard>
        );
      })}

      <GlassCard intensity={15} className="mt-6" padding="p-6">
        <View className="mb-3 flex-row items-center">
          <ShieldCheck size={20} color={colors.success} />
          <GlassText className="ml-2 font-outfit-bold text-sm text-success">
            Quy định nhóm
          </GlassText>
        </View>
        <GlassText variant="caption" className="leading-5">
          Chỉ trưởng nhóm mới có quyền xóa thành viên hoặc thay đổi các thiết lập quan trọng của
          nhóm. Tất cả thành viên đều có thể thêm chi tiêu mới.
        </GlassText>
      </GlassCard>
    </Screen>
  );
}
