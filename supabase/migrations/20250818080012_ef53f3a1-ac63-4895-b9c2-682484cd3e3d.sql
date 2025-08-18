-- Fix the hash_password function to use explicit type casting for gen_salt
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
  RETURN crypt(password_text, gen_salt('bf'::text));
END;
$function$;