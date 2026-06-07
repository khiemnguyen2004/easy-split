import { useState, useCallback } from 'react';
import { groupService } from '../services/group.service';
import type { FeedExpense } from '../types/models';

/** Global expense feed across all of the user's groups (RLS-scoped). */
export const useExpensesFeed = () => {
  const [expenses, setExpenses] = useState<FeedExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const data = await groupService.getUserExpensesFeed();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return { expenses, loading, refreshing, fetchData, onRefresh };
};
