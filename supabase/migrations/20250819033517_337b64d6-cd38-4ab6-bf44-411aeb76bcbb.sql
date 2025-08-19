-- Add functions for weekly and monthly visitor statistics
CREATE OR REPLACE FUNCTION public.get_weekly_visitors()
 RETURNS TABLE(visit_date date, visit_count integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT v.visit_date, v.visit_count
  FROM public.visitors v
  WHERE v.visit_date >= CURRENT_DATE - INTERVAL '6 days'
  ORDER BY v.visit_date DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_monthly_visitors()
 RETURNS TABLE(visit_month text, visit_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(v.visit_date, 'YYYY-MM') as visit_month,
    SUM(v.visit_count) as visit_count
  FROM public.visitors v
  WHERE v.visit_date >= CURRENT_DATE - INTERVAL '5 months'
  GROUP BY TO_CHAR(v.visit_date, 'YYYY-MM')
  ORDER BY visit_month DESC;
END;
$function$;