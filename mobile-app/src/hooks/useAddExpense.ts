import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import i18n from '../i18n';
import { supabase } from '../api/supabase';
import { groupService } from '../services/group.service';
import { useRouter } from 'expo-router';

export const useAddExpense = (groupId: string) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitPlayers, setSplitPlayers] = useState<string[]>([]);
  const [activeMembers, setActiveMembers] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from('group_members')
          .select(
            `
            user_id,
            profiles:profiles (
              full_name
            )
          `
          )
          .eq('group_id', groupId);

        if (cancelled) return;
        if (error) throw error;

        const formattedMembers = data.map((m) => ({
          user_id: m.user_id,
          full_name: m.profiles?.full_name || i18n.t('common.user'),
        }));

        setMembers(formattedMembers);
        if (formattedMembers.length > 0) {
          setPaidBy(formattedMembers[0].user_id);
          setSplitPlayers(formattedMembers.map((m) => m.user_id));
        }
      } catch (error) {
        if (!cancelled) console.error('Error fetching members:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [groupId]);

  const togglePlayer = (userId: string) => {
    setSplitPlayers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const selectAll = () => setSplitPlayers(members.map((m) => m.user_id));
  const deselectAll = () => setSplitPlayers([]);

  const addExpense = async (category: string = 'others') => {
    if (!description || !amount || !paidBy || splitPlayers.length === 0) {
      Alert.alert(i18n.t('common.error'), i18n.t('addExpense.errIncomplete'));
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert(i18n.t('common.error'), i18n.t('addExpense.errInvalidAmount'));
      return;
    }

    setLoading(true);

    try {
      // 1. Create expense
      const { data: expense, error: expError } = await supabase
        .from('expenses')
        .insert([
          {
            group_id: groupId,
            amount: amountValue,
            description,
            payer_id: paidBy,
            category,
          },
        ])
        .select()
        .single();

      if (expError) throw expError;

      // 2. Create splits
      const shareAmount = amountValue / splitPlayers.length;
      const splits = splitPlayers.map((userId) => ({
        expense_id: expense.expense_id,
        user_id: userId,
        share_amount: shareAmount,
      }));

      const { error: splitError } = await supabase.from('expense_splits').insert(splits);

      if (splitError) throw splitError;

      Alert.alert(i18n.t('common.success'), i18n.t('addExpense.success'));
      router.back();
    } catch (error: any) {
      console.error('Error adding expense:', error);
      Alert.alert(i18n.t('common.error'), error.message || i18n.t('addExpense.errFailed'));
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    members,
    description,
    setDescription,
    amount,
    setAmount,
    paidBy,
    setPaidBy,
    splitPlayers,
    togglePlayer,
    selectAll,
    deselectAll,
    addExpense,
  };
};
