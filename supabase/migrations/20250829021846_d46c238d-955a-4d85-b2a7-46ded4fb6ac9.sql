-- Check and update RLS policies for admin users
-- First, let's create a policy that allows admins to delete any prompt

-- Drop existing delete policy if exists
DROP POLICY IF EXISTS "Anyone can delete prompts with valid password" ON public.prompts;

-- Create new delete policy that includes admin bypass
CREATE POLICY "Admins and users with password can delete prompts" 
ON public.prompts 
FOR DELETE 
USING (
  -- Allow if user is admin
  public.is_user_admin(auth.uid()) OR 
  -- Allow if password matches or no password set
  (password IS NULL OR public.can_modify_prompt(id, password))
);

-- Also update the update policy for consistency
DROP POLICY IF EXISTS "Anyone can update prompts with valid password" ON public.prompts;

CREATE POLICY "Admins and users with password can update prompts" 
ON public.prompts 
FOR UPDATE 
USING (
  -- Allow if user is admin
  public.is_user_admin(auth.uid()) OR 
  -- Allow if password matches or no password set
  (password IS NULL OR public.can_modify_prompt(id, password))
);