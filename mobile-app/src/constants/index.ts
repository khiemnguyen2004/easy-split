export const Constants = {
  APP_NAME: 'EasySplit',
  API: {
    TABLES: {
      GROUPS: 'groups',
      PROFILES: 'profiles',
      GROUP_MEMBERS: 'group_members',
      EXPENSES: 'expenses',
      EXPENSE_SPLITS: 'expense_splits',
      DEBT_SETTLEMENTS: 'debt_settlements',
    },
  },
};

/**
 * Expense category ids. Each id has a localized label under `category.<id>` and
 * (in the add-expense screen) an icon. Single source of truth for valid
 * categories.
 */
export const EXPENSE_CATEGORY_IDS = ['food', 'coffee', 'transport', 'shopping', 'others'] as const;
export type ExpenseCategoryId = (typeof EXPENSE_CATEGORY_IDS)[number];

/** Default category used when none is selected. */
export const DEFAULT_EXPENSE_CATEGORY: ExpenseCategoryId = 'others';
