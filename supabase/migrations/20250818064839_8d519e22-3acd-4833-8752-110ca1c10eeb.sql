-- Create visitors table for tracking daily visits
CREATE TABLE public.visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  visit_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is public visitor data)
CREATE POLICY "Anyone can view visitor counts" 
ON public.visitors 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert visitor counts" 
ON public.visitors 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update visitor counts" 
ON public.visitors 
FOR UPDATE 
USING (true);

-- Create unique index on visit_date to prevent duplicates
CREATE UNIQUE INDEX idx_visitors_visit_date ON public.visitors(visit_date);

-- Create function to increment daily visitor count
CREATE OR REPLACE FUNCTION public.increment_daily_visitors()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Try to increment existing record for today
  UPDATE public.visitors 
  SET visit_count = visit_count + 1,
      updated_at = now()
  WHERE visit_date = CURRENT_DATE
  RETURNING visit_count INTO current_count;
  
  -- If no record exists for today, create one
  IF NOT FOUND THEN
    INSERT INTO public.visitors (visit_date, visit_count)
    VALUES (CURRENT_DATE, 1)
    RETURNING visit_count INTO current_count;
  END IF;
  
  RETURN current_count;
END;
$$;

-- Create function to get today's visitor count
CREATE OR REPLACE FUNCTION public.get_daily_visitors()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT visit_count INTO current_count
  FROM public.visitors 
  WHERE visit_date = CURRENT_DATE;
  
  RETURN COALESCE(current_count, 0);
END;
$$;

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_visitors_updated_at
BEFORE UPDATE ON public.visitors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();