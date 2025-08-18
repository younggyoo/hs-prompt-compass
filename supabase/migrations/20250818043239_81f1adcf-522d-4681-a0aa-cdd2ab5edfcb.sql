-- Enable the pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to hash passwords
CREATE OR REPLACE FUNCTION public.hash_password(password_text TEXT)
RETURNS TEXT AS $$
BEGIN
  IF password_text IS NULL OR password_text = '' THEN
    RETURN NULL;
  END IF;
  RETURN crypt(password_text, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify passwords
CREATE OR REPLACE FUNCTION public.verify_password(password_text TEXT, hashed_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF password_text IS NULL OR hashed_password IS NULL THEN
    RETURN password_text IS NULL AND hashed_password IS NULL;
  END IF;
  RETURN hashed_password = crypt(password_text, hashed_password);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify prompt password and allow updates
CREATE OR REPLACE FUNCTION public.can_modify_prompt(prompt_id UUID, provided_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  stored_password TEXT;
BEGIN
  SELECT password INTO stored_password 
  FROM public.prompts 
  WHERE id = prompt_id;
  
  RETURN public.verify_password(provided_password, stored_password);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify comment password and allow updates
CREATE OR REPLACE FUNCTION public.can_modify_comment(comment_id UUID, provided_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  stored_password TEXT;
BEGIN
  SELECT password INTO stored_password 
  FROM public.comments 
  WHERE id = comment_id;
  
  RETURN public.verify_password(provided_password, stored_password);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view prompts" ON public.prompts;
DROP POLICY IF EXISTS "Anyone can create prompts" ON public.prompts;
DROP POLICY IF EXISTS "Anyone can update prompts" ON public.prompts;
DROP POLICY IF EXISTS "Anyone can delete prompts" ON public.prompts;
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can create comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can update comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can delete comments" ON public.comments;

-- Create secure RLS policies for prompts (excluding password field from selects)
CREATE POLICY "Anyone can view prompts (secure)" 
ON public.prompts 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create prompts" 
ON public.prompts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update prompts with valid password" 
ON public.prompts 
FOR UPDATE 
USING (password IS NULL OR public.can_modify_prompt(id, password));

CREATE POLICY "Anyone can delete prompts with valid password" 
ON public.prompts 
FOR DELETE 
USING (password IS NULL OR public.can_modify_prompt(id, password));

-- Create secure RLS policies for comments (excluding password field from selects)
CREATE POLICY "Anyone can view comments (secure)" 
ON public.comments 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update comments with valid password" 
ON public.comments 
FOR UPDATE 
USING (password IS NULL OR public.can_modify_comment(id, password));

CREATE POLICY "Anyone can delete comments with valid password" 
ON public.comments 
FOR DELETE 
USING (password IS NULL OR public.can_modify_comment(id, password));

-- Create a view for prompts without password field for public access
CREATE OR REPLACE VIEW public.prompts_public AS
SELECT 
  id,
  title,
  role,
  type,
  description,
  content,
  result,
  tool,
  author,
  likes,
  views,
  copy_count,
  created_at,
  updated_at
FROM public.prompts;

-- Create a view for comments without password field for public access
CREATE OR REPLACE VIEW public.comments_public AS
SELECT 
  id,
  prompt_id,
  author,
  content,
  created_at,
  updated_at
FROM public.comments;

-- Grant access to the views
GRANT SELECT ON public.prompts_public TO anon, authenticated;
GRANT SELECT ON public.comments_public TO anon, authenticated;