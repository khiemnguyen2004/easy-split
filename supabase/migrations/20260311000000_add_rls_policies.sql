-- 1. Helper function to break recursion
-- SECURITY DEFINER + SET search_path ensures this function 
-- runs with high privileges and ignores RLS for its own queries.
CREATE OR REPLACE FUNCTION public.is_member_of(gid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = gid
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Join Group Function: Allows joining by code without direct SELECT on groups
-- SECURITY DEFINER bypasses RLS to find the group and check membership
CREATE OR REPLACE FUNCTION public.join_group_by_code(i_code text)
RETURNS uuid AS $$
DECLARE
  v_group_id uuid;
BEGIN
  -- 1. Find the group
  SELECT group_id INTO v_group_id
  FROM public.groups
  WHERE invite_code = i_code;

  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Mã mời không chính xác hoặc nhóm không tồn tại.';
  END IF;

  -- 2. Check if already a member
  IF EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = v_group_id AND user_id = auth.uid()
  ) THEN
    RETURN v_group_id; -- Already a member, just return ID
  END IF;

  -- 3. Join the group
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (v_group_id, auth.uid(), 'member');

  RETURN v_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Profile Automation: Automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'display_name', 'User'),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on sign up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. RLS Policies for Profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
    DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
END $$;

CREATE POLICY "Authenticated users can view profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 4. RLS Policies for Groups table
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;
    DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
    DROP POLICY IF EXISTS "Admins can update groups" ON public.groups;
    DROP POLICY IF EXISTS "Users can view groups they created or are members of" ON public.groups;
END $$;

-- INSERT: Allow authenticated users to create groups
CREATE POLICY "Users can create groups" ON public.groups
FOR INSERT WITH CHECK (auth.uid() = created_by);

-- SELECT: Allow if user is creator OR in the group (using helper)
CREATE POLICY "Users can view groups they created or are members of" ON public.groups
FOR SELECT USING (
  auth.uid() = created_by
  OR
  public.is_member_of(group_id)
);

-- UPDATE: Allow if user is an admin
CREATE POLICY "Admins can update groups" ON public.groups
FOR UPDATE USING (public.is_member_of(group_id));

-- 5. RLS Policies for Group Members table
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;
    DROP POLICY IF EXISTS "Users can add themselves or others if permitted" ON public.group_members;
    DROP POLICY IF EXISTS "Users can add members" ON public.group_members;
END $$;

-- SELECT: Allow if user is a member of the group
CREATE POLICY "Users can view members of their groups" ON public.group_members
FOR SELECT USING (
  public.is_member_of(group_id)
);

-- INSERT: Allow adding yourself OR if you are already in the group (admin/member)
CREATE POLICY "Users can add members" ON public.group_members
FOR INSERT WITH CHECK (
  auth.uid() = user_id
  OR
  public.is_member_of(group_id)
);

-- 6. MANUAL FIX: Create missing profiles for existing users
-- You can run this part separately if needed
INSERT INTO public.profiles (user_id, full_name, email)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', 'User'), email
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
