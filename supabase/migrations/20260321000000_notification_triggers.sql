-- In-app notifications: database triggers that write rows into `notifications`
-- when group events happen. The app reads/render these (push-to-device can be
-- layered on later). Functions are SECURITY DEFINER so they can insert
-- notification rows for other users (bypassing the per-user RLS).
--
-- The user-facing text is rendered in the app from `data.type` + params (so it
-- follows the reader's language); the stored title/message are Vietnamese
-- fallbacks.

-- 1. New expense → notify every group member except the payer.
CREATE OR REPLACE FUNCTION public.notify_on_expense() RETURNS trigger AS $$
DECLARE
  g_name text;
  actor_name text;
BEGIN
  SELECT group_name INTO g_name FROM public.groups WHERE group_id = NEW.group_id;
  SELECT full_name INTO actor_name FROM public.profiles WHERE user_id = NEW.payer_id;

  INSERT INTO public.notifications (user_id, title, message, data)
  SELECT
    gm.user_id,
    'Chi tiêu mới',
    COALESCE(actor_name, 'Ai đó') || ' đã thêm chi tiêu vào ' || COALESCE(g_name, 'nhóm'),
    jsonb_build_object(
      'type', 'expense_added',
      'group_id', NEW.group_id,
      'group_name', g_name,
      'actor', actor_name,
      'amount', NEW.amount,
      'description', NEW.description
    )
  FROM public.group_members gm
  WHERE gm.group_id = NEW.group_id
    AND gm.user_id <> NEW.payer_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_notify_on_expense ON public.expenses;
CREATE TRIGGER trg_notify_on_expense
AFTER INSERT ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.notify_on_expense();

-- 2. Debt settlement: notify the creditor on submission, the debtor on confirm.
CREATE OR REPLACE FUNCTION public.notify_on_settlement() RETURNS trigger AS $$
DECLARE
  debtor_name text;
  g_name text;
BEGIN
  SELECT group_name INTO g_name FROM public.groups WHERE group_id = NEW.group_id;

  IF (TG_OP = 'INSERT') THEN
    SELECT full_name INTO debtor_name FROM public.profiles WHERE user_id = NEW.debtor_id;
    IF NEW.creditor_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, data)
      VALUES (
        NEW.creditor_id,
        'Có người trả nợ',
        COALESCE(debtor_name, 'Ai đó') || ' đã gửi minh chứng thanh toán',
        jsonb_build_object(
          'type', 'settlement_submitted',
          'group_id', NEW.group_id,
          'group_name', g_name,
          'actor', debtor_name,
          'amount', NEW.amount
        )
      );
    END IF;
  ELSIF (TG_OP = 'UPDATE' AND NEW.status = 'confirmed' AND COALESCE(OLD.status, '') <> 'confirmed') THEN
    IF NEW.debtor_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, data)
      VALUES (
        NEW.debtor_id,
        'Thanh toán đã xác nhận',
        'Khoản thanh toán của bạn đã được xác nhận',
        jsonb_build_object(
          'type', 'settlement_confirmed',
          'group_id', NEW.group_id,
          'group_name', g_name,
          'amount', NEW.amount
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_notify_on_settlement ON public.debt_settlements;
CREATE TRIGGER trg_notify_on_settlement
AFTER INSERT OR UPDATE ON public.debt_settlements
FOR EACH ROW EXECUTE FUNCTION public.notify_on_settlement();

-- Allow a user to mark their own notifications read (UPDATE policy).
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);
