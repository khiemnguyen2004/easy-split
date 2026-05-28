-- 1. Create Categories table
CREATE TABLE IF NOT EXISTS public.categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon TEXT,
    group_id UUID REFERENCES public.groups(group_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by group members" ON public.categories
FOR SELECT USING (
    group_id IS NULL OR public.is_member_of(group_id)
);

-- 2. Update existing Groups table
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS budget_amount NUMERIC(15,2);
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS group_avatar TEXT;

-- 3. Update existing Expenses table
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(category_id) ON DELETE SET NULL;

-- 4. Create Fundings table
CREATE TABLE IF NOT EXISTS public.fundings (
    funding_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(group_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC(15,2) NOT NULL,
    current_amount NUMERIC(15,2) DEFAULT 0,
    status TEXT DEFAULT 'active', -- 'active', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.fundings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fundings viewable by group members" ON public.fundings
FOR SELECT USING (public.is_member_of(group_id));

-- 5. Create Fund Contributions table
CREATE TABLE IF NOT EXISTS public.fund_contributions (
    contribution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    funding_id UUID NOT NULL REFERENCES public.fundings(funding_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id),
    amount NUMERIC(15,2) NOT NULL,
    proof_img TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'confirmed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.fund_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contributions viewable by group members" ON public.fund_contributions
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.fundings f 
        WHERE f.funding_id = fund_contributions.funding_id 
        AND public.is_member_of(f.group_id)
    )
);

-- 6. Create Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(group_id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(user_id),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Messages viewable by group members" ON public.messages
FOR SELECT USING (public.is_member_of(group_id));

CREATE POLICY "Members can send messages" ON public.messages
FOR INSERT WITH CHECK (
    public.is_member_of(group_id) AND auth.uid() = sender_id
);

-- 7. Create Media table
CREATE TABLE IF NOT EXISTS public.media (
    media_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES public.messages(message_id) ON DELETE CASCADE,
    expense_id UUID REFERENCES public.expenses(expense_id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    type TEXT DEFAULT 'image',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media viewable by group members" ON public.media
FOR SELECT USING (
    (message_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.messages m WHERE m.message_id = media.message_id AND public.is_member_of(m.group_id)))
    OR
    (expense_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.expenses e WHERE e.expense_id = media.expense_id AND public.is_member_of(e.group_id)))
);

-- 8. Create Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

-- 9. Insert default categories
INSERT INTO public.categories (name, icon) VALUES 
('Ăn uống', '🍔'),
('Di chuyển', '🚗'),
('Mua sắm', '🛍️'),
('Giải trí', '🎮'),
('Khác', '📦')
ON CONFLICT DO NOTHING;
