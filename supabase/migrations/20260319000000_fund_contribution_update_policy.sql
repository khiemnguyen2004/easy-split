-- Allow the group admin (the group creator) to update fund contributions, e.g.
-- to confirm a pending contribution. Without this, RLS blocks the confirm flow.

DROP POLICY IF EXISTS "Group admin can update contributions" ON public.fund_contributions;
CREATE POLICY "Group admin can update contributions" ON public.fund_contributions
FOR UPDATE USING (
    EXISTS (
        SELECT 1
        FROM public.fundings f
        JOIN public.groups g ON g.group_id = f.group_id
        WHERE f.funding_id = fund_contributions.funding_id
        AND g.created_by = auth.uid()
    )
);
