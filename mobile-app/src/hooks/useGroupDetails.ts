import { useState, useCallback, useEffect } from 'react';
import { groupService } from '../services/group.service';
import type { Group, GroupMember, GroupExpense, NetBalance, Fund } from '../types/models';

export const useGroupDetails = (id: string | string[] | undefined) => {
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [netBalances, setNetBalances] = useState<NetBalance[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
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
      setMembers(data.members);
      setExpenses(data.expenses);
      setNetBalances(data.netBalances);
      setFunds(data.fundings);
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
    funds,
    loading,
    refreshing,
    fetchData,
    onRefresh,
  };
};
