import React, { useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, UserPlus, Users, ChevronRight, Search, Users2 } from 'lucide-react-native';
import { useGroupList } from '../../src/hooks/useGroupList';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { GlassText } from '../../src/components/ui/GlassText';
import { SunriseButton } from '../../src/components/ui/SunriseButton';
import { GlassHeader } from '../../src/components/ui/GlassHeader';

export default function GroupsScreen() {
  const router = useRouter();
  const { filteredGroups, loading, refreshing, searchQuery, fetchGroups, onRefresh, handleSearch } =
    useGroupList();

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [fetchGroups])
  );

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <GlassHeader
        title="Nhóm của bạn"
        rightElement={
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push('/join-group')}
              className="w-10 h-10 rounded-xl bg-indigo-950/5 items-center justify-center border border-indigo-950/10 shadow-sm"
            >
              <UserPlus size={18} color="#1E1B4B" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/create-group')}
              className="w-10 h-10 rounded-xl bg-indigo-950/5 items-center justify-center border border-indigo-950/10 shadow-sm"
            >
              <Plus size={18} color="#1E1B4B" />
            </TouchableOpacity>
          </View>
        }
      />

      <View className="flex-1">
        {/* Search Bar Container */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center bg-indigo-950/5 rounded-2xl px-5 py-3 border border-indigo-950/10 shadow-sm">
            <Search size={18} color="rgba(30, 27, 75, 0.4)" />
            <TextInput
              placeholder="Tìm kiếm nhóm của bạn..."
              value={searchQuery}
              onChangeText={handleSearch}
              className="flex-1 ml-3 text-indigo-950 font-outfit-medium text-sm"
              placeholderTextColor="rgba(30, 27, 75, 0.4)"
            />
          </View>
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF512F" />
          }
        >
          {loading ? (
            <ActivityIndicator size="large" color="#FF512F" className="mt-10" />
          ) : filteredGroups.length === 0 ? (
            <GlassCard intensity={20} className="mt-4 items-center justify-center py-12 border-dashed border-indigo-950/10">
              <View className="w-16 h-16 bg-indigo-950/5 rounded-full items-center justify-center mb-6 border border-indigo-950/10">
                <Users2 size={32} color="rgba(30, 27, 75, 0.4)" />
              </View>
              <GlassText variant="h3" className="mb-2 text-center">
                {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa tham gia nhóm'}
              </GlassText>
              <GlassText variant="body" className="text-center opacity-40 px-10">
                {searchQuery
                  ? 'Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.'
                  : 'Hãy tạo nhóm đầu tiên hoặc tham gia cùng bạn bè.'}
              </GlassText>

              {!searchQuery && (
                <View className="flex-row gap-4 mt-10 w-full px-4">
                  <SunriseButton
                    title="Tạo mới"
                    className="flex-1"
                    onPress={() => router.push('/create-group')}
                  />
                  <SunriseButton
                    title="Tham gia"
                    variant="secondary"
                    className="flex-1"
                    onPress={() => router.push('/join-group')}
                  />
                </View>
              )}
            </GlassCard>
          ) : (
            <View className="pb-32">
              {filteredGroups.map((item) => (
                <TouchableOpacity
                  key={item.group_id}
                  onPress={() => router.push(`/group/${item.group_id}`)}
                  activeOpacity={0.8}
                >
                  <GlassCard
                    intensity={25}
                    className="mb-4 p-5 flex-row items-center border-indigo-950/10"
                  >
                    <View className="w-14 h-14 bg-indigo-950/5 rounded-2xl items-center justify-center mr-4 border border-indigo-950/10">
                      <Users size={24} color="#1E1B4B" />
                    </View>

                    <View className="flex-1">
                      <GlassText className="text-lg font-outfit-bold mb-1" numberOfLines={1}>
                        {item.group_name}
                      </GlassText>
                      <View className="flex-row items-center">
                        <View className="bg-sunrise-orange/10 px-2 py-0.5 rounded-md mr-3 border border-sunrise-orange/20">
                          <GlassText className="text-[9px] uppercase font-outfit-bold tracking-tight text-sunrise-orange">
                            {item.member_count} thành viên
                          </GlassText>
                        </View>
                        {item.description && (
                          <GlassText variant="caption" className="opacity-40 flex-1" numberOfLines={1}>
                            {item.description}
                          </GlassText>
                        )}
                      </View>
                    </View>

                    <ChevronRight size={18} color="rgba(30, 27, 75, 0.3)" />
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
