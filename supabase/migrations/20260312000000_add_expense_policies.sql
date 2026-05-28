-- Add RLS Policies for Expenses and Splits

-- 1. Expenses Table
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Members can view group expenses" ON public.expenses;
    DROP POLICY IF EXISTS "Members can create group expenses" ON public.expenses;
    DROP POLICY IF EXISTS "Payers can update their expenses" ON public.expenses;
    DROP POLICY IF EXISTS "Payers can delete their expenses" ON public.expenses;
END $$;

-- SELECT: Members of the group can view expenses
CREATE POLICY "Members can view group expenses" ON public.expenses
FOR SELECT USING (public.is_member_of(group_id));

-- INSERT: Members can create expenses where they are the payer
CREATE POLICY "Members can create group expenses" ON public.expenses
FOR INSERT WITH CHECK (
  public.is_member_of(group_id)
  AND
  auth.uid() = payer_id
);

-- UPDATE: Only the payer can update their expense
CREATE POLICY "Payers can update their expenses" ON public.expenses
FOR UPDATE USING (auth.uid() = payer_id);

-- DELETE: Only the payer can delete their expense
CREATE POLICY "Payers can delete their expenses" ON public.expenses
FOR DELETE USING (auth.uid() = payer_id);


-- 2. Expense Splits Table
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Members can view group splits" ON public.expense_splits;
    DROP POLICY IF EXISTS "Payers can create splits" ON public.expense_splits;
    DROP POLICY IF EXISTS "Payers can update their splits" ON public.expense_splits;
    DROP POLICY IF EXISTS "Payers can delete their splits" ON public.expense_splits;
END $$;

-- SELECT: Members of the group can view splits
CREATE POLICY "Members can view group splits" ON public.expense_splits
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.expenses
    WHERE expense_id = expense_splits.expense_id
    AND public.is_member_of(group_id)
  )
);

-- INSERT: Only the payer of the associated expense can create splits
CREATE POLICY "Payers can create splits" ON public.expense_splits
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.expenses
    WHERE expense_id = expense_splits.expense_id
    AND payer_id = auth.uid()
  )
);

-- UPDATE: Only the payer of the associated expense can update splits
CREATE POLICY "Payers can update their splits" ON public.expense_splits
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.expenses
    WHERE expense_id = expense_splits.expense_id
    AND payer_id = auth.uid()
  )
);

-- DELETE: Only the payer of the associated expense can delete splits
CREATE POLICY "Payers can delete their splits" ON public.expense_splits
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.expenses
    WHERE expense_id = expense_splits.expense_id
    AND payer_id = auth.uid()
  )
);


-- 3. Debt Settlements Table (Proactive Fix)
ALTER TABLE public.debt_settlements ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Members can view group settlements" ON public.debt_settlements;
    DROP POLICY IF EXISTS "Members can create settlements" ON public.debt_settlements;
END $$;

CREATE POLICY "Members can view group settlements" ON public.debt_settlements
FOR SELECT USING (public.is_member_of(group_id));

CREATE POLICY "Members can create settlements" ON public.debt_settlements
FOR INSERT WITH CHECK (
  public.is_member_of(group_id)
  AND (auth.uid() = debtor_id OR auth.uid() = creditor_id)
);
