-- Create a function to atomically increment counters
CREATE OR REPLACE FUNCTION public.increment_prompt_counter(
  prompt_id UUID,
  counter_field TEXT,
  increment_value INTEGER DEFAULT 1
)
RETURNS TABLE(new_value INTEGER) AS $$
DECLARE
  current_value INTEGER;
BEGIN
  -- Validate counter field
  IF counter_field NOT IN ('likes', 'views', 'copy_count') THEN
    RAISE EXCEPTION 'Invalid counter field: %', counter_field;
  END IF;
  
  -- Use SQL to atomically increment the counter
  IF counter_field = 'likes' THEN
    UPDATE public.prompts 
    SET likes = likes + increment_value 
    WHERE id = prompt_id
    RETURNING likes INTO current_value;
  ELSIF counter_field = 'views' THEN
    UPDATE public.prompts 
    SET views = views + increment_value 
    WHERE id = prompt_id
    RETURNING views INTO current_value;
  ELSIF counter_field = 'copy_count' THEN
    UPDATE public.prompts 
    SET copy_count = copy_count + increment_value 
    WHERE id = prompt_id
    RETURNING copy_count INTO current_value;
  END IF;
  
  -- Return the new value
  RETURN QUERY SELECT current_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;