-- Fix security warnings by setting proper search path for all functions
ALTER FUNCTION public.increment_prompt_counter(UUID, TEXT, INTEGER) SET search_path = 'public';
ALTER FUNCTION public.hash_password(TEXT) SET search_path = 'public';
ALTER FUNCTION public.verify_password(TEXT, TEXT) SET search_path = 'public';
ALTER FUNCTION public.can_modify_prompt(UUID, TEXT) SET search_path = 'public';
ALTER FUNCTION public.can_modify_comment(UUID, TEXT) SET search_path = 'public';