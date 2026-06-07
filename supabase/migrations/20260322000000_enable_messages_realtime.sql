-- Enable Supabase Realtime for chat messages so participants receive new
-- messages live (the sender already appends optimistically client-side).
-- Idempotent: only adds the table to the publication if not already present.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;
