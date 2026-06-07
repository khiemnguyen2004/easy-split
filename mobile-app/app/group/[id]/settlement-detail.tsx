import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { CheckCircle2, Clock, Camera, ChevronRight, AlertCircle } from 'lucide-react-native';
import { supabase } from '../../../src/api/supabase';
import { useAuthStore } from '../../../src/store/useAuthStore';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { useThemeColors } from '../../../src/theme';
import { Screen, GlassCard, GlassText, Button, Loader } from '../../../src/components/ui';

interface SimplifiedDebt {
  from_id: string;
  from_name: string;
  to_id: string;
  to_name: string;
  amount: number;
}

export default function SettlementDetailScreen() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [debts, setDebts] = useState<SimplifiedDebt[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const groupId = Array.isArray(id) ? id[0] : id;

      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('user_id, profiles(full_name)')
        .eq('group_id', groupId);

      if (membersError) throw membersError;

      const { data: splits, error: splitsError } = await supabase
        .from('expense_splits')
        .select('*, expenses!inner(group_id, payer_id)')
        .eq('expenses.group_id', groupId);

      if (splitsError) throw splitsError;

      const balances: Record<string, number> = {};
      members.forEach((m) => {
        balances[m.user_id] = 0;
      });

      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('group_id', groupId);
      expenses?.forEach((exp) => {
        if (exp.payer_id) balances[exp.payer_id] = (balances[exp.payer_id] || 0) + exp.amount;
      });

      splits.forEach((s) => {
        if (s.user_id) balances[s.user_id] = (balances[s.user_id] || 0) - s.share_amount;
      });

      const { data: existingSettlements } = await supabase
        .from('debt_settlements')
        .select('*')
        .eq('group_id', groupId)
        .eq('status', 'confirmed');

      existingSettlements?.forEach((s) => {
        if (s.debtor_id) balances[s.debtor_id] = (balances[s.debtor_id] || 0) + s.amount;
        if (s.creditor_id) balances[s.creditor_id] = (balances[s.creditor_id] || 0) - s.amount;
      });

      const creditors = members
        .filter((m) => balances[m.user_id] > 1)
        .map((m) => ({ id: m.user_id, name: m.profiles?.full_name, balance: balances[m.user_id] }))
        .sort((a, b) => b.balance - a.balance);

      const debtors = members
        .filter((m) => balances[m.user_id] < -1)
        .map((m) => ({ id: m.user_id, name: m.profiles?.full_name, balance: -balances[m.user_id] }))
        .sort((a, b) => b.balance - a.balance);

      const simplified: SimplifiedDebt[] = [];
      let c = 0,
        d = 0;
      while (c < creditors.length && d < debtors.length) {
        const amount = Math.min(creditors[c].balance, debtors[d].balance);
        simplified.push({
          from_id: debtors[d].id,
          from_name: debtors[d].name || 'User',
          to_id: creditors[c].id,
          to_name: creditors[c].name || 'User',
          amount: Math.round(amount),
        });
        creditors[c].balance -= amount;
        debtors[d].balance -= amount;
        if (creditors[c].balance < 1) c++;
        if (debtors[d].balance < 1) d++;
      }
      setDebts(simplified);

      const { data: pending } = await supabase
        .from('debt_settlements')
        .select(
          '*, profiles!debt_settlements_creditor_id_fkey(full_name), debtor:profiles!debt_settlements_debtor_id_fkey(full_name)'
        )
        .eq('group_id', groupId)
        .neq('status', 'confirmed');

      setSettlements(pending || []);
    } catch (error) {
      console.error('Error fetching settlements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProof = async (debt: SimplifiedDebt) => {
    if (debt.from_id !== user?.id) {
      Alert.alert('Thông báo', 'Bạn không phải là người nợ trong giao dịch này.');
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
      const groupId = Array.isArray(id) ? id[0] : id;
      const fileExt = result.assets[0].uri.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `settlements/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, decode(result.assets[0].base64), { contentType: `image/${fileExt}` });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('attachments').getPublicUrl(filePath);

      const { error: settlementError } = await supabase.from('debt_settlements').insert({
        group_id: groupId,
        debtor_id: user.id,
        creditor_id: debt.to_id,
        amount: debt.amount,
        status: 'pending',
        proof_image_url: publicUrl,
      });

      if (settlementError) throw settlementError;

      Alert.alert('Thành công', 'Đã tải lên minh chứng. Chờ người nhận xác nhận.');
      fetchData();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPay = async (settlementId: string) => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('debt_settlements')
        .update({ status: 'confirmed' })
        .eq('settlement_id', settlementId);

      if (error) throw error;
      Alert.alert('Thành công', 'Đã xác nhận thanh toán.');
      fetchData();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullscreen />;

  const pendingSettlements = settlements.filter((s) => s.status === 'pending');

  return (
    <Screen title="Quyết toán nợ" showBack contentClassName="px-6 pt-4 pb-32">
      <GlassText variant="caption" className="mb-4 ml-1 tracking-widest">
        Các khoản nợ thu gọn
      </GlassText>

      {debts.length === 0 ? (
        <GlassCard intensity={20} className="mb-8 items-center border-success/20" padding="p-6">
          <CheckCircle2 size={32} color={colors.success} />
          <GlassText className="mt-2 font-outfit-bold text-success">Mọi người đã hết nợ!</GlassText>
        </GlassCard>
      ) : (
        <View className="mb-8">
          {debts.map((debt, index) => {
            const isMyDebt = debt.from_id === user?.id;
            return (
              <GlassCard key={index} intensity={20} className="mb-3" padding="p-5">
                <View className="mb-4 flex-row items-center justify-between">
                  <View className="flex-1 flex-row items-center">
                    <GlassText className="font-outfit-bold">{debt.from_name}</GlassText>
                    <View className="mx-2">
                      <ChevronRight size={14} color={colors.contentFaint} />
                    </View>
                    <GlassText className="font-outfit-bold">{debt.to_name}</GlassText>
                  </View>
                  <GlassText variant="h3" className="text-lg text-danger">
                    {debt.amount.toLocaleString('vi-VN')}đ
                  </GlassText>
                </View>

                {isMyDebt ? (
                  <Button
                    title="Gửi bằng chứng trả nợ"
                    icon={Camera}
                    onPress={() => handleUploadProof(debt)}
                    disabled={submitting}
                    className="py-3"
                  />
                ) : null}
              </GlassCard>
            );
          })}
        </View>
      )}

      {pendingSettlements.length > 0 ? (
        <View className="mb-10">
          <GlassText variant="caption" className="mb-4 ml-1 tracking-widest">
            Chờ xác nhận
          </GlassText>
          {pendingSettlements.map((s) => {
            const iAmCreditor = s.creditor_id === user?.id;
            return (
              <GlassCard
                key={s.settlement_id}
                intensity={20}
                className="mb-4 border-accent/20"
                padding="p-5"
              >
                <View className="mb-4 flex-row items-start justify-between">
                  <View className="flex-1">
                    <GlassText className="font-outfit-bold text-base text-accent">
                      {s.debtor?.full_name} đã trả
                    </GlassText>
                    <GlassText className="font-outfit text-xs text-content-muted">
                      {s.profiles?.full_name} nhận tiền
                    </GlassText>
                  </View>
                  <GlassText variant="h3" className="text-lg text-accent">
                    {s.amount.toLocaleString('vi-VN')}đ
                  </GlassText>
                </View>

                {iAmCreditor ? (
                  <Button
                    title="Xác nhận đã nhận tiền"
                    icon={CheckCircle2}
                    onPress={() => handleConfirmPay(s.settlement_id)}
                    disabled={submitting}
                    className="py-3"
                  />
                ) : (
                  <View className="flex-row items-center rounded-2xl bg-surface-fill p-3">
                    <Clock size={16} color={colors.accent} />
                    <GlassText className="ml-2 font-outfit-medium text-xs text-content-muted">
                      Chờ {s.profiles?.full_name} xác nhận...
                    </GlassText>
                  </View>
                )}
              </GlassCard>
            );
          })}
        </View>
      ) : null}

      <GlassCard intensity={15} className="flex-row items-start" padding="p-5">
        <AlertCircle size={18} color={colors.contentFaint} />
        <GlassText className="ml-3 flex-1 text-xs leading-5 text-content-muted">
          Hệ thống sử dụng thuật toán bù trừ nợ tự động (Netting) để tối thiểu hóa số lần chuyển
          khoản giữa các thành viên.
        </GlassText>
      </GlassCard>
    </Screen>
  );
}
