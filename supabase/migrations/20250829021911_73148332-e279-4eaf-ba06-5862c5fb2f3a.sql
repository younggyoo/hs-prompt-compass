-- Update comment policies for admin users as well

-- Drop existing delete policy for comments
DROP POLICY IF EXISTS "Anyone can delete comments with valid password" ON public.comments;

-- Create new delete policy that includes admin bypass for comments
CREATE POLICY "Admins and users with password can delete comments" 
ON public.comments 
FOR DELETE 
USING (
  -- Allow if user is admin
  public.is_user_admin(auth.uid()) OR 
  -- Allow if password matches or no password set
  (password IS NULL OR public.can_modify_comment(id, password))
);

-- Drop existing update policy for comments
DROP POLICY IF EXISTS "Anyone can update comments with valid password" ON public.comments;

-- Create new update policy that includes admin bypass for comments
CREATE POLICY "Admins and users with password can update comments" 
ON public.comments 
FOR UPDATE 
USING (
  -- Allow if user is admin
  public.is_user_admin(auth.uid()) OR 
  -- Allow if password matches or no password set
  (password IS NULL OR public.can_modify_comment(id, password))
);