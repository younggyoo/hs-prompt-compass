-- Create function to get last 30 days visitors
CREATE OR REPLACE FUNCTION public.get_monthly_daily_visitors()
RETURNS TABLE(visit_date date, visit_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT v.visit_date, v.visit_count
  FROM public.visitors v
  WHERE v.visit_date >= CURRENT_DATE - INTERVAL '29 days'
  ORDER BY v.visit_date DESC;
END;
$function$;