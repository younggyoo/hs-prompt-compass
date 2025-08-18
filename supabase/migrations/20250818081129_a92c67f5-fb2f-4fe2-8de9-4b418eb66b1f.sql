-- Strengthen password hashing: Update to use bcrypt cost factor 12 instead of 6
CREATE OR REPLACE FUNCTION public.hash_password(password_text text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF password_text IS NULL OR password_text = '' THEN
    RETURN NULL;
  END IF;
  -- Use cost factor 12 for stronger security (was using default 6)
  RETURN crypt(password_text, gen_salt('bf', 12));
END;
$function$;

-- Remove the public data views that bypass RLS policies
DROP VIEW IF EXISTS public.prompts_public;
DROP VIEW IF EXISTS public.comments_public;

-- Create admin_users table for proper admin authentication
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_users
CREATE POLICY "Users can view their own admin status"
ON public.admin_users
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only authenticated users can insert admin records"
ON public.admin_users
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.admin_users WHERE user_id = user_uuid),
    false
  );
$$;

-- Trigger for updated_at on admin_users
CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();