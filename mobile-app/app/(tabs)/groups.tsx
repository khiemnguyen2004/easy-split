import React, { useCallback } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Plus, UserPlus, Users, Search, Users2 } from 'lucide-react-native';
import { useGroupList } from '../../src/hooks/useGroupList';
import { useThemeColors } from '../../src/theme';
import {
  GlassText,
  GlassHeader,
  Input,
  Button,
  IconButton,
  EmptyState,
  ListItem,
  Badge,
  Loader,
} from '../../src/components/ui';

export default function GroupsScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
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
        title={t('groups.title')}
        rightElement={
          <View className="flex-row gap-3">
            <IconButton icon={UserPlus} onPress={() => router.push('/join-group')} />
            <IconButton icon={Plus} onPress={() => router.push('/create-group')} />
          </View>
        }
      />

      <View className="mb-6 px-6">
        <Input
          icon={Search}
          placeholder={t('groups.searchPlaceholder')}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
      >
        {loading ? (
          <Loader className="mt-10" />
        ) : filteredGroups.length === 0 ? (
          <EmptyState
            icon={Users2}
            title={searchQuery ? t('groups.noResultsTitle') : t('groups.emptyTitle')}
            description={searchQuery ? t('groups.noResultsDesc') : t('groups.emptyDesc')}
            className="mt-4"
            action={
              searchQuery ? undefined : (
                <View className="flex-row gap-4">
                  <Button
                    title={t('groups.create')}
                    className="flex-1"
                    onPress={() => router.push('/create-group')}
                  />
                  <Button
                    title={t('groups.join')}
                    variant="secondary"
                    className="flex-1"
                    onPress={() => router.push('/join-group')}
                  />
                </View>
              )
            }
          />
        ) : (
          <View className="pb-32">
            {filteredGroups.map((item) => (
              <ListItem
                key={item.group_id}
                icon={Users}
                title={item.group_name}
                onPress={() => router.push(`/group/${item.group_id}`)}
                className="mb-4"
                subtitle={
                  <View className="mt-1 flex-row items-center">
                    <Badge
                      label={t('common.memberCount', { count: item.member_count })}
                      tone="accent"
                    />
                    {item.description ? (
                      <GlassText variant="caption" className="ml-3 flex-1" numberOfLines={1}>
                        {item.description}
                      </GlassText>
                    ) : null}
                  </View>
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
