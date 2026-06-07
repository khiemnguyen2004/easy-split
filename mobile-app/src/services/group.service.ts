import i18n from '../i18n';
import { supabase } from '../api/supabase';

export interface CreateGroupPayload {
  group_name: string;
  description?: string;
  invite_code: string;
  created_by: string;
  budget_amount?: number;
}

export const groupService = {
  /**
   * Create a new group and assign the creator as admin.
   */
  async createGroupWithAdmin(payload: CreateGroupPayload) {
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .insert([payload])
      .select()
      .single();

    if (groupError) throw groupError;

    if (groupData) {
      const { error: memberError } = await supabase.from('group_members').insert([
        {
          group_id: groupData.group_id,
          user_id: payload.created_by,
          role: 'admin',
        },
      ]);

      if (memberError) throw memberError;
    }

    return groupData;
  },

  /**
   * Join a group using an invite code via RPC.
   */
  async joinGroupByCode(code: string) {
    // @ts-ignore - Supabase type gen doesn't always pick up RPC endpoints
    const { data: groupId, error: joinError } = await supabase.rpc('join_group_by_code', {
      i_code: code,
    });

    if (joinError) throw joinError;

    return groupId;
  },

  /**
   * Get all groups a user belongs to, including member count.
   */
  async getUserGroups(userId: string) {
    // 1. Get all group IDs the user belongs to
    const { data: memberOf, error: memberError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);

    if (memberError) throw memberError;

    if (!memberOf || memberOf.length === 0) {
      return [];
    }

    const groupIds = memberOf.map((m) => m.group_id);

    // 2. Fetch group details
    const { data: groupsData, error: groupsError } = await supabase
      .from('groups')
      .select('group_id, group_name, description')
      .in('group_id', groupIds);

    if (groupsError) throw groupsError;

    // 3. Get member counts for these groups
    const { data: counts, error: countsError } = await supabase
      .from('group_members')
      .select('group_id')
      .in('group_id', groupIds);

    if (countsError) throw countsError;

    const groupCounts = (counts || []).reduce((acc: any, curr) => {
      acc[curr.group_id] = (acc[curr.group_id] || 0) + 1;
      return acc;
    }, {});

    const finalGroups = groupsData.map((g) => ({
      ...g,
      member_count: groupCounts[g.group_id] || 0,
    }));

    return finalGroups;
  },

  /**
   * Fetch full group details including members, expenses, and net balances.
   */
  async getGroupDashboardData(groupId: string) {
    // 1. Fetch group basic info
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('group_id', groupId)
      .single();

    if (groupError) throw groupError;

    // 2. Fetch members info
    const { data: membersData, error: membersError } = await supabase
      .from('group_members')
      .select(
        `
        user_id,
        role,
        profiles:profiles (
          full_name,
          avatar_url
        )
      `
      )
      .eq('group_id', groupId);

    if (membersError) throw membersError;

    // 3. Fetch expenses
    const { data: expensesData, error: expensesError } = await supabase
      .from('expenses')
      .select(
        `
        expense_id,
        amount,
        description,
        category,
        created_at,
        payer_id,
        profiles:profiles (
          full_name
        )
      `
      )
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (expensesError) throw expensesError;

    // 4. Calculate Net Balances
    const { data: splitsData, error: splitsError } = await supabase
      .from('expense_splits')
      .select('*, expenses!inner(group_id)')
      .eq('expenses.group_id', groupId);

    if (splitsError) throw splitsError;

    const userBalances: Record<string, number> = {};
    membersData?.forEach((m) => {
      userBalances[m.user_id] = 0;
    });

    expensesData?.forEach((exp) => {
      if (exp.payer_id) {
        userBalances[exp.payer_id] = (userBalances[exp.payer_id] || 0) + exp.amount;
      }
    });

    splitsData?.forEach((split) => {
      if (split.user_id) {
        userBalances[split.user_id] = (userBalances[split.user_id] || 0) - split.share_amount;
      }
    });

    const exactBalances =
      membersData?.map((m) => ({
        user_id: m.user_id,
        // @ts-ignore
        full_name: m.profiles?.full_name || i18n.t('common.user'),
        exact: userBalances[m.user_id] || 0,
      })) || [];

    const finalNetBalances = exactBalances.map((b) => ({
      user_id: b.user_id,
      full_name: b.full_name,
      amount: Math.round(b.exact),
    }));

    // Reconcile rounding drift so balances sum to zero (apply to entry with
    // largest absolute exact balance — least visible per-user error).
    const drift = finalNetBalances.reduce((s, r) => s + r.amount, 0);
    if (drift !== 0 && finalNetBalances.length > 0) {
      let idx = 0;
      for (let i = 1; i < exactBalances.length; i++) {
        if (Math.abs(exactBalances[i].exact) > Math.abs(exactBalances[idx].exact)) idx = i;
      }
      finalNetBalances[idx].amount -= drift;
    }

    finalNetBalances.sort((a, b) => b.amount - a.amount);

    // 5. Fetch group funds (for the group dashboard "Funds" tab preview)
    const { data: fundingsData } = await supabase
      .from('fundings')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    // Flatten the joined profile so every consumer can read `member.full_name`
    // / `member.avatar_url` directly (the raw row nests them under `profiles`).
    const members = (membersData || []).map((m) => ({
      user_id: m.user_id,
      role: m.role,
      // @ts-ignore - `profiles` is a joined relation object
      full_name: m.profiles?.full_name ?? null,
      // @ts-ignore
      avatar_url: m.profiles?.avatar_url ?? null,
    }));

    return {
      group: groupData,
      members,
      expenses: expensesData,
      netBalances: finalNetBalances,
      fundings: fundingsData || [],
    };
  },

  /**
   * Fetch global total balance details for a specific user across all groups.
   */
  async getUserDashboardBalances(userId: string) {
    // 1. Fetch all expenses paid by user
    const { data: userPaid, error: paidError } = await supabase
      .from('expenses')
      .select(
        `
        expense_id,
        amount,
        expense_splits (
          user_id,
          share_amount
        )
      `
      )
      .eq('payer_id', userId);

    if (paidError) throw paidError;

    // 2. Fetch all splits where user is a participant but NOT the payer
    const { data: userOwesSplits, error: owesError } = await supabase
      .from('expense_splits')
      .select(
        `
        share_amount,
        expenses!inner (
          payer_id
        )
      `
      )
      .eq('user_id', userId)
      .neq('expenses.payer_id', userId);

    if (owesError) throw owesError;

    // 3. Fetch paid settlements
    const { data: settlements, error: settlementsError } = await supabase
      .from('debt_settlements')
      .select('debtor_id, creditor_id, amount')
      .eq('status', 'confirmed')
      .or(`debtor_id.eq.${userId},creditor_id.eq.${userId}`);

    if (settlementsError) throw settlementsError;

    // Calculate "Owed to user"
    // = Sum of shares of OTHER people in expenses paid by user
    let owed = 0;
    userPaid?.forEach((exp) => {
      exp.expense_splits?.forEach((split: any) => {
        if (split.user_id !== userId) {
          owed += split.share_amount;
        }
      });
    });

    // Calculate "User owes"
    // = Sum of user's shares in expenses paid by others
    let owes = 0;
    userOwesSplits?.forEach((split) => {
      owes += split.share_amount;
    });

    // Adjust with settlements
    settlements?.forEach((s) => {
      if (s.creditor_id === userId) {
        // User received money, reduces what's owed to them
        owed -= s.amount;
      } else if (s.debtor_id === userId) {
        // User paid money, reduces what they owe
        owes -= s.amount;
      }
    });

    return {
      owedToUser: Math.max(0, owed),
      userOwes: Math.max(0, owes),
      totalBalance: owed - owes,
    };
  },

  /** The user's in-app notifications (RLS-scoped to the signed-in user). */
  async getNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return data || [];
  },

  /** Count of unread notifications for the signed-in user. */
  async getUnreadNotificationCount() {
    const { count, error } = await supabase
      .from('notifications')
      .select('notification_id', { count: 'exact', head: true })
      .eq('is_read', false);
    if (error) throw error;
    return count || 0;
  },

  /** Mark all of the user's unread notifications as read. */
  async markNotificationsRead() {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);
    if (error) throw error;
  },

  /**
   * Global expense feed across every group the user belongs to (RLS scopes the
   * rows to the user's groups). Newest first.
   */
  async getUserExpensesFeed() {
    const { data, error } = await supabase
      .from('expenses')
      .select(
        `
        expense_id,
        amount,
        description,
        category,
        created_at,
        group_id,
        groups ( group_name ),
        profiles ( full_name )
      `
      )
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return (data || []).map((e: any) => ({
      expense_id: e.expense_id,
      amount: e.amount,
      description: e.description,
      category: e.category,
      created_at: e.created_at,
      group_id: e.group_id,
      group_name: e.groups?.group_name ?? '',
      payer_name: e.profiles?.full_name ?? null,
    }));
  },

  /**
   * The user's net balance broken down per group (positive = owed to the user,
   * negative = the user owes). Reuses the same expense/split/settlement math as
   * the per-group dashboard.
   */
  async getUserDebtsByGroup(userId: string) {
    // Groups the user is a member of.
    const { data: memberships, error: mErr } = await supabase
      .from('group_members')
      .select('group_id, groups ( group_name )')
      .eq('user_id', userId);
    if (mErr) throw mErr;

    const groups = (memberships || []).map((m: any) => ({
      group_id: m.group_id as string,
      group_name: m.groups?.group_name ?? '',
    }));
    if (groups.length === 0) return [];

    const groupIds = groups.map((g) => g.group_id);

    // Expenses the user paid (with splits), scoped to those groups.
    const { data: paid } = await supabase
      .from('expenses')
      .select('group_id, amount, expense_splits ( user_id, share_amount )')
      .eq('payer_id', userId)
      .in('group_id', groupIds);

    // Splits the user owes in expenses paid by others.
    const { data: owesSplits } = await supabase
      .from('expense_splits')
      .select('share_amount, expenses!inner ( group_id, payer_id )')
      .eq('user_id', userId)
      .neq('expenses.payer_id', userId)
      .in('expenses.group_id', groupIds);

    // Confirmed settlements involving the user.
    const { data: settlements } = await supabase
      .from('debt_settlements')
      .select('group_id, debtor_id, creditor_id, amount, status')
      .in('group_id', groupIds)
      .eq('status', 'confirmed')
      .or(`debtor_id.eq.${userId},creditor_id.eq.${userId}`);

    const net: Record<string, number> = {};
    groupIds.forEach((g) => (net[g] = 0));

    paid?.forEach((exp: any) => {
      exp.expense_splits?.forEach((s: any) => {
        if (s.user_id !== userId) net[exp.group_id] = (net[exp.group_id] || 0) + s.share_amount;
      });
    });
    owesSplits?.forEach((s: any) => {
      const gid = s.expenses?.group_id;
      if (gid) net[gid] = (net[gid] || 0) - s.share_amount;
    });
    settlements?.forEach((s: any) => {
      if (s.creditor_id === userId) net[s.group_id] = (net[s.group_id] || 0) - s.amount;
      else if (s.debtor_id === userId) net[s.group_id] = (net[s.group_id] || 0) + s.amount;
    });

    return groups
      .map((g) => ({ ...g, net: Math.round(net[g.group_id] || 0) }))
      .filter((g) => g.net !== 0)
      .sort((a, b) => b.net - a.net);
  },
};
