-- Allow the group owner (the group creator) to remove members. Without a DELETE
-- policy, RLS blocks removing members from a group. The owner cannot remove
-- themselves through this policy.

DROP POLICY IF EXISTS "Group owner can remove members" ON public.group_members;
CREATE POLICY "Group owner can remove members" ON public.group_members
FOR DELETE USING (
    user_id <> auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.groups g
        WHERE g.group_id = group_members.group_id
        AND g.created_by = auth.uid()
    )
);
