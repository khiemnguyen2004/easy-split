-- Idempotent + additive schema update.
-- Safe to re-run against a database that already has some of these objects in
-- an older shape: tables are created only if missing, columns are added only if
-- missing, and every policy is dropped before being (re)created.

-- 1. Categories table
CREATE TABLE IF NOT EXISTS public.categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon TEXT,
    group_id UUID REFERENCES public.groups(group_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Patch older `categories` tables that predate some columns.
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(group_id) ON DELETE CASCADE;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by group members" ON public.categories;
CREATE POLICY "Categories are viewable by group members" ON public.categories
FOR SELECT USING (
    group_id IS NULL OR public.is_member_of(group_id)
);

-- 2. Groups table additions
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS budget_amount NUMERIC(15,2);
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS group_avatar TEXT;

-- 3. Expenses table additions
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(category_id) ON DELETE SET NULL;

-- 4. Fundings table
CREATE TABLE IF NOT EXISTS public.fundings (
    funding_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(group_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC(15,2) NOT NULL,
    current_amount NUMERIC(15,2) DEFAULT 0,
    status TEXT DEFAULT 'active', -- 'active', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Older `fundings` tables used `title` instead of `name`; rename to preserve
-- data (only when `title` exists and `name` does not).
DO $$
BEGIN
  IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'fundings' AND column_name = 'title'
     ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'fundings' AND column_name = 'name'
     ) THEN
    ALTER TABLE public.fundings RENAME COLUMN title TO name;
  END IF;
END $$;

-- Patch older `fundings` tables that predate some columns.
ALTER TABLE public.fundings ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(group_id) ON DELETE CASCADE;
ALTER TABLE public.fundings ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.fundings ADD COLUMN IF NOT EXISTS target_amount NUMERIC(15,2);
ALTER TABLE public.fundings ADD COLUMN IF NOT EXISTS current_amount NUMERIC(15,2) DEFAULT 0;
ALTER TABLE public.fundings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.fundings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

ALTER TABLE public.fundings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Fundings viewable by group members" ON public.fundings;
CREATE POLICY "Fundings viewable by group members" ON public.fundings
FOR SELECT USING (public.is_member_of(group_id));

-- 5. Fund Contributions table
CREATE TABLE IF NOT EXISTS public.fund_contributions (
    contribution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    funding_id UUID NOT NULL REFERENCES public.fundings(funding_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id),
    amount NUMERIC(15,2) NOT NULL,
    proof_img TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'confirmed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.fund_contributions ADD COLUMN IF NOT EXISTS funding_id UUID REFERENCES public.fundings(funding_id) ON DELETE CASCADE;
ALTER TABLE public.fund_contributions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(user_id);
ALTER TABLE public.fund_contributions ADD COLUMN IF NOT EXISTS amount NUMERIC(15,2);
ALTER TABLE public.fund_contributions ADD COLUMN IF NOT EXISTS proof_img TEXT;
ALTER TABLE public.fund_contributions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.fund_contributions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

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

-- 6. Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(group_id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(user_id),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(group_id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES public.profiles(user_id);
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Messages viewable by group members" ON public.messages;
CREATE POLICY "Messages viewable by group members" ON public.messages
FOR SELECT USING (public.is_member_of(group_id));

DROP POLICY IF EXISTS "Members can send messages" ON public.messages;
CREATE POLICY "Members can send messages" ON public.messages
FOR INSERT WITH CHECK (
    public.is_member_of(group_id) AND auth.uid() = sender_id
);

-- 7. Media table
CREATE TABLE IF NOT EXISTS public.media (
    media_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES public.messages(message_id) ON DELETE CASCADE,
    expense_id UUID REFERENCES public.expenses(expense_id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    type TEXT DEFAULT 'image',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.media ADD COLUMN IF NOT EXISTS message_id UUID REFERENCES public.messages(message_id) ON DELETE CASCADE;
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS expense_id UUID REFERENCES public.expenses(expense_id) ON DELETE CASCADE;
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'image';
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Media viewable by group members" ON public.media;
CREATE POLICY "Media viewable by group members" ON public.media
FOR SELECT USING (
    (message_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.messages m WHERE m.message_id = media.message_id AND public.is_member_of(m.group_id)))
    OR
    (expense_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.expenses e WHERE e.expense_id = media.expense_id AND public.is_member_of(e.group_id)))
);

-- 8. Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

-- 9. Seed default (global) categories — only when none exist yet, so re-running
--    the migration never creates duplicates (there is no unique key on `name`).
INSERT INTO public.categories (name, icon)
SELECT v.name, v.icon
FROM (VALUES
    ('Ăn uống', '🍔'),
    ('Di chuyển', '🚗'),
    ('Mua sắm', '🛍️'),
    ('Giải trí', '🎮'),
    ('Khác', '📦')
) AS v(name, icon)
WHERE NOT EXISTS (
    SELECT 1 FROM public.categories WHERE group_id IS NULL
);
