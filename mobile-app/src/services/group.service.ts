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

    return {
      group: groupData,
      members: membersData,
      expenses: expensesData,
      netBalances: finalNetBalances,
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
      .eq('status', 'paid')
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
};
