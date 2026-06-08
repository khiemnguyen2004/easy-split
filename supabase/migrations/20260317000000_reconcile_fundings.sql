-- Reconcile the funds feature schema.
--
-- Root cause: the `fundings` / `fund_contributions` tables were created outside
-- the migration history (manually) using a `title` column instead of `name`.
-- The previous migration used CREATE TABLE IF NOT EXISTS, so it skipped them and
-- never reconciled the shape; and since that migration is already applied,
-- editing it is a no-op on `db push`. This NEW migration recreates the two
-- tables to match the canonical schema. The funds feature has never produced
-- data (no fund can be created), so dropping is safe.

DROP TABLE IF EXISTS public.fund_contributions CASCADE;
DROP TABLE IF EXISTS public.fundings CASCADE;

-- Fundings
CREATE TABLE public.fundings (
    funding_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(group_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC(15,2) NOT NULL,
    current_amount NUMERIC(15,2) DEFAULT 0,
    status TEXT DEFAULT 'active', -- 'active', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.fundings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Fundings viewable by group members" ON public.fundings;
CREATE POLICY "Fundings viewable by group members" ON public.fundings
FOR SELECT USING (public.is_member_of(group_id));

DROP POLICY IF EXISTS "Members can create fundings" ON public.fundings;
CREATE POLICY "Members can create fundings" ON public.fundings
FOR INSERT WITH CHECK (public.is_member_of(group_id));

DROP POLICY IF EXISTS "Members can update fundings" ON public.fundings;
CREATE POLICY "Members can update fundings" ON public.fundings
FOR UPDATE USING (public.is_member_of(group_id));

-- Fund contributions
CREATE TABLE public.fund_contributions (
    contribution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    funding_id UUID NOT NULL REFERENCES public.fundings(funding_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id),
    amount NUMERIC(15,2) NOT NULL,
    proof_img TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'confirmed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.fund_contributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contributions viewable by group members" ON public.fund_contributions;
CREATE POLICY "Contributions viewable by group members" ON public.fund_contributions
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.fundings f
        WHERE f.funding_id = fund_contributions.funding_id
        AND public.is_member_of(f.group_id)
    )
);

DROP POLICY IF EXISTS "Members can contribute" ON public.fund_contributions;
CREATE POLICY "Members can contribute" ON public.fund_contributions
FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
        SELECT 1 FROM public.fundings f
        WHERE f.funding_id = fund_contributions.funding_id
        AND public.is_member_of(f.group_id)
    )
);
