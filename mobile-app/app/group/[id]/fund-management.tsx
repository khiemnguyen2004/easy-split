import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Plus, PiggyBank, Target, CheckCircle2 } from 'lucide-react-native';
import { supabase } from '../../../src/api/supabase';
import { useAuthStore } from '../../../src/store/useAuthStore';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { colors } from '../../../src/theme';
import {
  Screen,
  GlassCard,
  GlassText,
  Input,
  Button,
  ListItem,
  EmptyState,
  Badge,
  Avatar,
  ProgressBar,
  Loader,
} from '../../../src/components/ui';

const VndChip = () => (
  <View className="rounded-md border border-surface-line bg-surface-fill px-2.5 py-1">
    <GlassText className="font-outfit-bold text-[10px] text-content-muted">VNĐ</GlassText>
  </View>
);

export default function FundManagementScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [funds, setFunds] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [fundName, setFundName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const groupId = Array.isArray(id) ? id[0] : id;

      const { data: fundsData, error: fundsError } = await supabase
        .from('fundings')
        .select('*')
        .eq('group_id', groupId);

      if (fundsError) throw fundsError;
      setFunds(fundsData || []);

      const fundIds = fundsData?.map((f) => f.funding_id) || [];
      if (fundIds.length > 0) {
        const { data: contribs, error: contribsError } = await supabase
          .from('fund_contributions')
          .select('*, profiles(full_name)')
          .in('funding_id', fundIds);

        if (contribsError) throw contribsError;
        setContributions(contribs || []);
      }
    } catch (error) {
      console.error('Error fetching funds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFund = async () => {
    if (!fundName.trim() || !targetAmount) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên quỹ và số tiền mục tiêu.');
      return;
    }

    setSubmitting(true);
    try {
      const groupId = Array.isArray(id) ? id[0] : id;
      const { error } = await supabase.from('fundings').insert({
        group_id: groupId,
        name: fundName.trim(),
        target_amount: parseFloat(targetAmount),
        current_amount: 0,
        status: 'active',
      });

      if (error) throw error;
      Alert.alert('Thành công', 'Đã tạo quỹ mới.');
      setIsCreating(false);
      setFundName('');
      setTargetAmount('');
      fetchData();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleContribute = async (fundingId: string, amount: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền đóng góp.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (result.canceled || !result.assets[0].base64) return;

    setSubmitting(true);
    try {
      if (!user?.id) throw new Error('User not found');
      const fileExt = result.assets[0].uri.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `funds/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, decode(result.assets[0].base64), { contentType: `image/${fileExt}` });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('attachments').getPublicUrl(filePath);

      const { error } = await supabase.from('fund_contributions').insert({
        funding_id: fundingId,
        user_id: user.id,
        amount: parseFloat(amount),
        proof_img: publicUrl,
        status: 'pending',
      });

      if (error) throw error;
      Alert.alert('Thành công', 'Đã gửi đóng góp. Chờ Admin xác nhận.');
      fetchData();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const promptContribute = (fundingId: string) =>
    Alert.prompt(
      'Đóng góp quỹ',
      'Nhập số tiền bạn muốn đóng góp',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đóng góp', onPress: (val?: string) => handleContribute(fundingId, val || '0') },
      ],
      'plain-text',
      '',
      'numeric'
    );

  if (loading) return <Loader fullscreen />;

  return (
    <Screen title="Quỹ nhóm" showBack contentClassName="px-6 pt-4 pb-32">
      {isCreating ? (
        <GlassCard intensity={30} className="mb-8" padding="p-6">
          <GlassText variant="h3" className="mb-6">
            Tạo quỹ mới
          </GlassText>

          <View className="mb-6 gap-6">
            <Input
              label="Tên quỹ"
              placeholder="Ví dụ: Quỹ ăn chơi Đà Lạt"
              value={fundName}
              onChangeText={setFundName}
            />
            <Input
              label="Số tiền mục tiêu"
              placeholder="Ví dụ: 5.000.000"
              keyboardType="numeric"
              value={targetAmount}
              onChangeText={setTargetAmount}
              trailing={<VndChip />}
            />
          </View>

          <View className="flex-row gap-4">
            <Button
              title="Hủy"
              variant="secondary"
              onPress={() => setIsCreating(false)}
              className="flex-1"
            />
            <Button
              title="Tạo quỹ"
              onPress={handleCreateFund}
              loading={submitting}
              className="flex-[2]"
            />
          </View>
        </GlassCard>
      ) : (
        <ListItem
          title="Tạo quỹ mới"
          subtitle="Gom tiền cho mục tiêu chung"
          onPress={() => setIsCreating(true)}
          className="mb-8"
          leading={
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-content shadow-sm">
              <Plus size={24} color={colors.white} />
            </View>
          }
        />
      )}

      <GlassText variant="caption" className="mb-4 ml-1 tracking-widest">
        Các quỹ hiện có
      </GlassText>

      {funds.length === 0 ? (
        <EmptyState icon={PiggyBank} title="Chưa có quỹ nào trong nhóm" />
      ) : (
        funds.map((fund) => {
          const fundContribs = contributions.filter((c) => c.funding_id === fund.funding_id);
          const progress = fund.current_amount / fund.target_amount;

          return (
            <GlassCard key={fund.funding_id} intensity={25} className="mb-6" padding="p-6">
              <View className="mb-4 flex-row items-start justify-between">
                <View className="flex-1">
                  <GlassText className="mb-0.5 font-outfit-bold text-lg">{fund.name}</GlassText>
                  <View className="flex-row items-center">
                    <Target size={12} color={colors.contentFaint} />
                    <GlassText variant="caption" className="ml-1 text-[10px]">
                      Mục tiêu: {fund.target_amount.toLocaleString()}đ
                    </GlassText>
                  </View>
                </View>
                <Badge label={fund.status} tone="success" />
              </View>

              <ProgressBar progress={progress} tone="success" className="mb-2 h-2.5" />
              <View className="mb-6 flex-row justify-between">
                <GlassText className="font-outfit-bold text-xs text-success">
                  {fund.current_amount.toLocaleString()}đ
                </GlassText>
                <GlassText className="font-outfit-bold text-xs text-content-muted">
                  {Math.round(progress * 100)}%
                </GlassText>
              </View>

              <View className="mb-6 flex-row items-center">
                <View className="mr-3 flex-row -space-x-3">
                  {fundContribs.slice(0, 3).map((c, i) => (
                    <Avatar
                      key={i}
                      name={c.profiles?.full_name}
                      size="sm"
                      style={{ zIndex: 10 - i }}
                    />
                  ))}
                  {fundContribs.length > 3 ? (
                    <View className="h-8 w-8 items-center justify-center rounded-full border border-surface-line bg-surface-fill">
                      <GlassText className="font-outfit-bold text-[10px] text-content-muted">
                        +{fundContribs.length - 3}
                      </GlassText>
                    </View>
                  ) : null}
                </View>
                <GlassText variant="caption" className="text-[10px] normal-case">
                  {fundContribs.length} người đã đóng góp
                </GlassText>
              </View>

              <Button
                title="Gửi tiền vào quỹ"
                icon={CheckCircle2}
                onPress={() => promptContribute(fund.funding_id)}
                className="w-full"
              />
            </GlassCard>
          );
        })
      )}
    </Screen>
  );
}
