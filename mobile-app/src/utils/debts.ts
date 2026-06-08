import type { NetBalance, SimplifiedDebt } from '../types/models';

/**
 * Turn per-member net balances (positive = owed to them, negative = they owe)
 * into the minimal set of pairwise "who pays whom" transfers (greedy netting).
 */
export const simplifyDebts = (balances: NetBalance[]): SimplifiedDebt[] => {
  const creditors = balances
    .filter((b) => b.amount > 0)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.amount - a.amount);
  const debtors = balances
    .filter((b) => b.amount < 0)
    .map((b) => ({ ...b, amount: -b.amount }))
    .sort((a, b) => b.amount - a.amount);

  const result: SimplifiedDebt[] = [];
  let c = 0;
  let d = 0;
  while (c < creditors.length && d < debtors.length) {
    const amount = Math.min(creditors[c].amount, debtors[d].amount);
    if (amount > 0) {
      result.push({
        from_id: debtors[d].user_id,
        from_name: debtors[d].full_name ?? '',
        to_id: creditors[c].user_id,
        to_name: creditors[c].full_name ?? '',
        amount: Math.round(amount),
      });
    }
    creditors[c].amount -= amount;
    debtors[d].amount -= amount;
    if (creditors[c].amount < 1) c++;
    if (debtors[d].amount < 1) d++;
  }
  return result;
};
