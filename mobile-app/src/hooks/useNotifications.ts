import { useState, useCallback } from 'react';
import { groupService } from '../services/group.service';
import type { AppNotification } from '../types/models';

export type { AppNotification } from '../types/models';

/** In-app notifications list with refresh + mark-all-read. */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const data = await groupService.getNotifications();
      setNotifications(data as AppNotification[]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  /** Persist "all read" in the DB (called when leaving the screen). */
  const markAllRead = useCallback(async () => {
    try {
      await groupService.markNotificationsRead();
    } catch (error) {
      console.error('Error marking notifications read:', error);
    }
  }, []);

  return { notifications, loading, refreshing, fetchData, onRefresh, markAllRead };
};
