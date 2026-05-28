import { useState, useCallback, useEffect } from 'react';
import { groupService } from '../services/group.service';

export interface Expense {
  expense_id: string;
  amount: number;
  description: string;
  title: string | null;
  category_id: string | null;
  created_at: string;
  payer_id: string;
  profiles: {
    full_name: string;
  };
}

export interface NetBalance {
  user_id: string;
  full_name: string;
  amount: number; // positive = they are owed, negative = they owe
}

export const useGroupDetails = (id: string | string[] | undefined) => {
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [netBalances, setNetBalances] = useState<NetBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      if (!id) {
        setLoading(false);
        return;
      }
      const groupId = Array.isArray(id) ? id[0] : id;

      const data = await groupService.getGroupDashboardData(groupId);

      setGroup(data.group);
      setMembers(data.members || []);
      setExpenses((data.expenses as any) || []);
      setNetBalances(data.netBalances || []);
    } catch (error) {
      console.error('Error fetching group details:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return {
    group,
    members,
    expenses,
    netBalances,
    loading,
    refreshing,
    fetchData,
    onRefresh,
  };
};
