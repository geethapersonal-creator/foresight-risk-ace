
-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  budget NUMERIC NOT NULL DEFAULT 0,
  budget_spent NUMERIC NOT NULL DEFAULT 0,
  timeline_months INTEGER NOT NULL DEFAULT 1,
  months_elapsed INTEGER NOT NULL DEFAULT 0,
  team_size INTEGER NOT NULL DEFAULT 1,
  complexity TEXT NOT NULL DEFAULT 'medium' CHECK (complexity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'at_risk', 'on_track', 'completed', 'cancelled')),
  risk_score NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create risk_factors table
CREATE TABLE public.risk_factors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('budget', 'timeline', 'scope', 'resource', 'technical', 'external')),
  name TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  probability NUMERIC NOT NULL DEFAULT 0.5 CHECK (probability >= 0 AND probability <= 1),
  impact NUMERIC NOT NULL DEFAULT 0.5 CHECK (impact >= 0 AND impact <= 1),
  mitigation TEXT,
  is_mitigated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_factors ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Risk factors policies
CREATE POLICY "Users can view own risk factors" ON public.risk_factors FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = risk_factors.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can create risk factors" ON public.risk_factors FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = risk_factors.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can update risk factors" ON public.risk_factors FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = risk_factors.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can delete risk factors" ON public.risk_factors FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = risk_factors.project_id AND projects.user_id = auth.uid())
);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
