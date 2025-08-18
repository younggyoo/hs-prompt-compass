-- Create prompts table
CREATE TABLE public.prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  role TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  result TEXT,
  tool TEXT,
  author TEXT NOT NULL,
  password TEXT,
  likes INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  copy_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (all visitors can view)
CREATE POLICY "Anyone can view prompts" 
ON public.prompts 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create prompts" 
ON public.prompts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update prompts" 
ON public.prompts 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete prompts" 
ON public.prompts 
FOR DELETE 
USING (true);

CREATE POLICY "Anyone can view comments" 
ON public.comments 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update comments" 
ON public.comments 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete comments" 
ON public.comments 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON public.prompts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_prompts_created_at ON public.prompts(created_at DESC);
CREATE INDEX idx_prompts_role ON public.prompts(role);
CREATE INDEX idx_prompts_type ON public.prompts(type);
CREATE INDEX idx_comments_prompt_id ON public.comments(prompt_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);