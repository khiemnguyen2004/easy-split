-- Allow the parties of a settlement to update it (the creditor confirming
-- receipt sets status = 'confirmed'). Without an UPDATE policy, RLS silently
-- blocks the confirm action: 0 rows change and the settlement stays 'pending'.

DROP POLICY IF EXISTS "Parties can update settlements" ON public.debt_settlements;
CREATE POLICY "Parties can update settlements" ON public.debt_settlements
FOR UPDATE
USING (
  public.is_member_of(group_id)
  AND (auth.uid() = creditor_id OR auth.uid() = debtor_id)
)
WITH CHECK (
  public.is_member_of(group_id)
  AND (auth.uid() = creditor_id OR auth.uid() = debtor_id)
);
