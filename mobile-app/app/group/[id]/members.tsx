import React from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserPlus, UserMinus, Shield, ShieldCheck, User } from 'lucide-react-native';
import { useGroupDetails } from '../../../src/hooks/useGroupDetails';
import { GlassCard } from '../../../src/components/ui/GlassCard';
import { GlassText } from '../../../src/components/ui/GlassText';
import { SunriseButton } from '../../../src/components/ui/SunriseButton';
import { GlassHeader } from '../../../src/components/ui/GlassHeader';

export default function MembersScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { group, members, loading } = useGroupDetails(id);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator color="#FF512F" />
      </View>
    );
  }

  const handleRemoveMember = (memberName: string) => {
    Alert.alert(
      'Xóa thành viên',
      `Bạn có chắc muốn xóa ${memberName} khỏi nhóm không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => console.log('Remove member') },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <GlassHeader 
        title="Thành viên" 
        subtitle={group?.group_name}
        showBack 
        rightElement={
          <TouchableOpacity
            onPress={() => {}}
            className="w-10 h-10 items-center justify-center rounded-xl bg-indigo-950/5 border border-indigo-950/10 shadow-sm"
          >
            <UserPlus size={18} color="#1E1B4B" />
          </TouchableOpacity>
        }
      />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="pt-4 pb-32">
          {/* Member List */}
          <GlassText variant="caption" className="mb-4 ml-1 uppercase tracking-widest opacity-40">
            Danh sách ({members.length})
          </GlassText>

          {members.map((member) => (
            <GlassCard
              key={member.user_id}
              intensity={20}
              className="mb-4 p-5 flex-row items-center border-indigo-950/10"
            >
              <View className="w-12 h-12 rounded-full bg-indigo-950/5 border-2 border-indigo-950/10 items-center justify-center mr-4">
                <User size={24} color="#1E1B4B" className="opacity-70" />
              </View>
              
              <View className="flex-1">
                <View className="flex-row items-center">
                  <GlassText className="text-base font-outfit-bold mr-2">
                    {member.full_name}
                  </GlassText>
                  {member.user_id === group?.created_by && (
                    <View className="bg-sunrise-orange/20 px-1.5 py-0.5 rounded-md border border-sunrise-orange/30">
                      <Shield size={10} color="#FF512F" />
                    </View>
                  )}
                </View>
                <GlassText variant="caption" className="opacity-40">
                  {member.user_id === group?.created_by ? 'Trưởng nhóm' : 'Thành viên'}
                </GlassText>
              </View>

              {member.user_id !== group?.created_by && (
                <TouchableOpacity
                  onPress={() => handleRemoveMember(member.full_name)}
                  className="w-10 h-10 items-center justify-center rounded-xl bg-rose-400/10 border border-rose-400/20"
                >
                  <UserMinus size={18} color="#FB7185" />
                </TouchableOpacity>
              )}
            </GlassCard>
          ))}

          {/* Group Rules Notice */}
          <GlassCard intensity={15} className="mt-6 p-6 border-white/5">
            <View className="flex-row items-center mb-3">
              <ShieldCheck size={20} color="#34D399" />
              <GlassText className="ml-2 font-outfit-bold text-sm text-emerald-400">Quy định nhóm</GlassText>
            </View>
            <GlassText variant="caption" className="opacity-50 leading-5">
              Chỉ trưởng nhóm mới có quyền xóa thành viên hoặc thay đổi các thiết lập quan trọng của nhóm. Tất cả thành viên đều có thể thêm chi tiêu mới.
            </GlassText>
          </GlassCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
