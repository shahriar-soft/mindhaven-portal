-- Add emotions and tips columns to mood_logs
ALTER TABLE public.mood_logs
ADD COLUMN emotions TEXT[] DEFAULT '{}',
ADD COLUMN tips TEXT[] DEFAULT '{}';
