-- Fix password verification functions to access pgcrypto extension
CREATE OR REPLACE FUNCTION public.verify_password(password_text text, hashed_password text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  IF password_text IS NULL OR hashed_password IS NULL THEN
    RETURN password_text IS NULL AND hashed_password IS NULL;
  END IF;
  RETURN hashed_password = crypt(password_text, hashed_password);
END;
$function$;

CREATE OR REPLACE FUNCTION public.hash_password(password_text text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  IF password_text IS NULL OR password_text = '' THEN
    RETURN NULL;
  END IF;
  -- Use cost factor 12 for stronger security (was using default 6)
  RETURN crypt(password_text, gen_salt('bf', 12));
END;
$function$;