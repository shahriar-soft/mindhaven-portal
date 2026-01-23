-- Add foreign key constraint to pledges table to link user_id to profiles(id)
-- This enables Supabase to perform joins between pledges and profiles
ALTER TABLE public.pledges
DROP CONSTRAINT IF EXISTS pledges_user_id_fkey,
ADD CONSTRAINT pledges_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;
