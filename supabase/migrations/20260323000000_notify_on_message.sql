-- Create an in-app notification when a chat message is sent, for every group
-- member except the sender. Powers the Home bell count and the per-group chat
-- badge (counted via unread `message_received` notifications — server truth, no
-- client-clock dependency).
CREATE OR REPLACE FUNCTION public.notify_on_message() RETURNS trigger AS $$
DECLARE
  g_name text;
  actor_name text;
BEGIN
  SELECT group_name INTO g_name FROM public.groups WHERE group_id = NEW.group_id;
  SELECT full_name INTO actor_name FROM public.profiles WHERE user_id = NEW.sender_id;

  INSERT INTO public.notifications (user_id, title, message, data)
  SELECT
    gm.user_id,
    'Tin nhắn mới',
    COALESCE(actor_name, 'Ai đó') || ' đã nhắn trong ' || COALESCE(g_name, 'nhóm'),
    jsonb_build_object(
      'type', 'message_received',
      'group_id', NEW.group_id,
      'group_name', g_name,
      'actor', actor_name
    )
  FROM public.group_members gm
  WHERE gm.group_id = NEW.group_id
    AND gm.user_id <> NEW.sender_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_notify_on_message ON public.messages;
CREATE TRIGGER trg_notify_on_message
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.notify_on_message();
