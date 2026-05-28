import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  Clock,
  Camera,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react-native';
import { supabase } from '../../../src/api/supabase';
import { useAuthStore } from '../../../src/store/useAuthStore';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { GlassCard } from '../../../src/components/ui/GlassCard';
import { GlassText } from '../../../src/components/ui/GlassText';
import { SunriseButton } from '../../../src/components/ui/SunriseButton';
import { GlassHeader } from '../../../src/components/ui/GlassHeader';

interface SimplifiedDebt {
  from_id: string;
  from_name: string;
  to_id: string;
  to_name: string;
  amount: number;
}

export default function SettlementDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
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

      // 1. Fetch group members
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('user_id, profiles(full_name)')
        .eq('group_id', groupId);

      if (membersError) throw membersError;

      // 2. Fetch all splits for this group
      const { data: splits, error: splitsError } = await supabase
        .from('expense_splits')
        .select('*, expenses!inner(group_id, payer_id)')
        .eq('expenses.group_id', groupId);

      if (splitsError) throw splitsError;

      // 3. Calculate Net Balances
      const balances: Record<string, number> = {};
      members.forEach((m) => {
        balances[m.user_id] = 0;
      });

      // What they paid
      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('group_id', groupId);
      expenses?.forEach((exp) => {
        if (exp.payer_id) balances[exp.payer_id] = (balances[exp.payer_id] || 0) + exp.amount;
      });

      // What they owe
      splits.forEach((s) => {
        if (s.user_id) balances[s.user_id] = (balances[s.user_id] || 0) - s.share_amount;
      });

      // 4. Fetch existing settlements to subtract already paid amounts
      const { data: existingSettlements } = await supabase
        .from('debt_settlements')
        .select('*')
        .eq('group_id', groupId)
        .eq('status', 'confirmed');

      existingSettlements?.forEach((s) => {
        if (s.debtor_id) balances[s.debtor_id] = (balances[s.debtor_id] || 0) + s.amount;
        if (s.creditor_id) balances[s.creditor_id] = (balances[s.creditor_id] || 0) - s.amount;
      });

      // 5. Simplify Debts Algorithm
      const creditors = members
        .filter((m) => balances[m.user_id] > 1) // Ignore small rounding errors
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

      // 6. Fetch pending settlements
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
        .upload(filePath, decode(result.assets[0].base64), {
          contentType: `image/${fileExt}`,
        });

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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator color="#FF512F" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <GlassHeader title="Quyết toán nợ" showBack />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="pt-4 pb-32">
          {/* Summary Debts */}
          <GlassText variant="caption" className="mb-4 ml-1 uppercase tracking-widest opacity-40">
            Các khoản nợ thu gọn
          </GlassText>

          {debts.length === 0 ? (
            <GlassCard intensity={20} className="p-6 items-center mb-8 border-emerald-400/20">
              <CheckCircle2 size={32} color="#34D399" />
              <GlassText className="text-emerald-400 font-outfit-bold mt-2">Mọi người đã hết nợ!</GlassText>
            </GlassCard>
          ) : (
            <View className="mb-8">
              {debts.map((debt, index) => {
                const isMyDebt = debt.from_id === user?.id;
                return (
                  <GlassCard
                    key={index}
                    intensity={20}
                    className="mb-3 p-5 border-indigo-950/10"
                  >
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-row items-center flex-1">
                        <GlassText className="font-outfit-bold text-gray-900">{debt.from_name}</GlassText>
                        <View className="mx-2">
                          <ChevronRight size={14} color="rgba(30, 27, 75, 0.4)" />
                        </View>
                        <GlassText className="font-outfit-bold text-gray-900">{debt.to_name}</GlassText>
                      </View>
                      <GlassText variant="h3" className="text-rose-500 text-lg">
                        {debt.amount.toLocaleString('vi-VN')}đ
                      </GlassText>
                    </View>

                    {isMyDebt && (
                      <TouchableOpacity
                        onPress={() => handleUploadProof(debt)}
                        disabled={submitting}
                        className="bg-indigo-600 py-3.5 rounded-2xl items-center flex-row justify-center shadow-lg shadow-indigo-600/10"
                      >
                        <Camera size={18} color="white" />
                        <GlassText className="text-white font-outfit-bold ml-2">Gửi bằng chứng trả nợ</GlassText>
                      </TouchableOpacity>
                    )}
                  </GlassCard>
                );
              })}
            </View>
          )}

          {/* Pending Confirmations */}
          {settlements.filter((s) => s.status === 'pending').length > 0 && (
            <View className="mb-10">
              <GlassText variant="caption" className="mb-4 ml-1 uppercase tracking-widest opacity-40">
                Chờ xác nhận
              </GlassText>
              {settlements
                .filter((s) => s.status === 'pending')
                .map((s) => {
                  const IAmCreditor = s.creditor_id === user?.id;
                  return (
                    <View
                      key={s.settlement_id}
                      className="bg-amber-500/10 rounded-3xl p-5 mb-4 border border-amber-500/20"
                    >
                      <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1">
                          <GlassText className="text-amber-800 font-outfit-bold text-base">
                            {s.debtor?.full_name} đã trả
                          </GlassText>
                          <GlassText className="text-amber-600 text-xs font-outfit">
                            {s.profiles?.full_name} nhận tiền
                          </GlassText>
                        </View>
                        <GlassText variant="h3" className="text-amber-800 text-lg">
                          {s.amount.toLocaleString('vi-VN')}đ
                        </GlassText>
                      </View>

                      {IAmCreditor ? (
                        <TouchableOpacity
                          onPress={() => handleConfirmPay(s.settlement_id)}
                          disabled={submitting}
                          className="bg-amber-500 py-3.5 rounded-2xl items-center flex-row justify-center shadow-lg shadow-amber-500/10"
                        >
                          <CheckCircle2 size={18} color="white" />
                          <GlassText className="text-white font-outfit-bold ml-2">Xác nhận đã nhận tiền</GlassText>
                        </TouchableOpacity>
                      ) : (
                        <View className="flex-row items-center bg-white/50 p-3 rounded-2xl">
                          <Clock size={16} color="#B45309" />
                          <GlassText className="text-amber-700 text-xs font-outfit-medium ml-2">
                            Chờ {s.profiles?.full_name} xác nhận...
                          </GlassText>
                        </View>
                      )}
                    </View>
                  );
                })}
            </View>
          )}

          <GlassCard intensity={15} className="p-5 flex-row items-start border-indigo-950/5">
            <AlertCircle size={18} color="rgba(30, 27, 75, 0.4)" />
            <GlassText className="text-indigo-950/60 text-xs ml-3 flex-1 leading-5">
              Hệ thống sử dụng thuật toán bù trừ nợ tự động (Netting) để tối thiểu hóa số lần chuyển khoản giữa các thành viên.
            </GlassText>
          </GlassCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
