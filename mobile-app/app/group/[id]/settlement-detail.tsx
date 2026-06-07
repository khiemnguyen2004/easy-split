import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, Camera, ChevronRight, AlertCircle } from 'lucide-react-native';
import { supabase } from '../../../src/api/supabase';
import { useAuthStore } from '../../../src/store/useAuthStore';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { useThemeColors } from '../../../src/theme';
import { formatCurrency } from '../../../src/utils/format';
import { getErrorMessage } from '../../../src/utils/error';
import type { SimplifiedDebt } from '../../../src/types/models';
import { Screen, GlassCard, GlassText, Button, Loader } from '../../../src/components/ui';

/** A pending settlement with its joined creditor (`profiles`) and `debtor`. */
interface PendingSettlement {
  settlement_id: string;
  creditor_id: string | null;
  debtor_id: string | null;
  amount: number;
  status: string | null;
  profiles?: { full_name: string | null } | null;
  debtor?: { full_name: string | null } | null;
}

export default function SettlementDetailScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [debts, setDebts] = useState<SimplifiedDebt[]>([]);
  const [settlements, setSettlements] = useState<PendingSettlement[]>([]);
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
          from_name: debtors[d].name || t('common.user'),
          to_id: creditors[c].id,
          to_name: creditors[c].name || t('common.user'),
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

      setSettlements((pending ?? []) as unknown as PendingSettlement[]);
    } catch (error) {
      console.error('Error fetching settlements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProof = async (debt: SimplifiedDebt) => {
    if (debt.from_id !== user?.id) {
      Alert.alert(t('common.notice'), t('settlement.notDebtor'));
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

      Alert.alert(t('common.success'), t('settlement.proofUploaded'));
      fetchData();
    } catch (error) {
      Alert.alert(t('common.error'), getErrorMessage(error));
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
      Alert.alert(t('common.success'), t('settlement.confirmedPay'));
      fetchData();
    } catch (error) {
      Alert.alert(t('common.error'), getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullscreen />;

  const pendingSettlements = settlements.filter((s) => s.status === 'pending');

  return (
    <Screen title={t('settlement.title')} showBack contentClassName="px-6 pt-4 pb-32">
      <GlassText variant="caption" className="mb-4 ml-1 tracking-widest">
        {t('settlement.simplifiedDebts')}
      </GlassText>

      {debts.length === 0 ? (
        <GlassCard intensity={20} className="mb-8 items-center border-success/20" padding="p-6">
          <CheckCircle2 size={32} color={colors.success} />
          <GlassText className="mt-2 font-outfit-bold text-success">
            {t('settlement.allSettled')}
          </GlassText>
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
                    {formatCurrency(debt.amount)}
                  </GlassText>
                </View>

                {isMyDebt ? (
                  <Button
                    title={t('settlement.sendProof')}
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
            {t('settlement.pendingConfirm')}
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
                      {t('settlement.paidBy', { name: s.debtor?.full_name })}
                    </GlassText>
                    <GlassText className="font-outfit text-xs text-content-muted">
                      {t('settlement.receives', { name: s.profiles?.full_name })}
                    </GlassText>
                  </View>
                  <GlassText variant="h3" className="text-lg text-accent">
                    {formatCurrency(s.amount)}
                  </GlassText>
                </View>

                {iAmCreditor ? (
                  <Button
                    title={t('settlement.confirmReceived')}
                    icon={CheckCircle2}
                    onPress={() => handleConfirmPay(s.settlement_id)}
                    disabled={submitting}
                    className="py-3"
                  />
                ) : (
                  <View className="flex-row items-center rounded-2xl bg-surface-fill p-3">
                    <Clock size={16} color={colors.accent} />
                    <GlassText className="ml-2 font-outfit-medium text-xs text-content-muted">
                      {t('settlement.waitingConfirm', { name: s.profiles?.full_name })}
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
          {t('settlement.nettingInfo')}
        </GlassText>
      </GlassCard>
    </Screen>
  );
}
