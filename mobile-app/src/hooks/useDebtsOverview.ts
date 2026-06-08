import { useState, useCallback } from 'react';
import { groupService } from '../services/group.service';
import { useAuthStore } from '../store/useAuthStore';
import type { GroupDebt, DebtTotals } from '../types/models';

/** Global debt overview: per-group net balances + aggregated totals. */
export const useDebtsOverview = () => {
  const { user } = useAuthStore();
  const [byGroup, setByGroup] = useState<GroupDebt[]>([]);
  const [totals, setTotals] = useState<DebtTotals>({
    owedToUser: 0,
    userOwes: 0,
    totalBalance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const [groups, t] = await Promise.all([
        groupService.getUserDebtsByGroup(user.id),
        groupService.getUserDashboardBalances(user.id),
      ]);
      setByGroup(groups);
      setTotals(t);
    } catch (error) {
      console.error('Error fetching debts overview:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return { byGroup, totals, loading, refreshing, fetchData, onRefresh };
};
