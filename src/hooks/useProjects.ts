import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calculateRiskScore, generateRiskFactors, getStatusFromRisk } from '@/lib/risk-engine';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  budget: number;
  budget_spent: number;
  timeline_months: number;
  months_elapsed: number;
  team_size: number;
  complexity: string;
  status: string;
  risk_score: number;
  created_at: string;
  updated_at: string;
}

export interface RiskFactorRow {
  id: string;
  project_id: string;
  category: string;
  name: string;
  severity: string;
  probability: number;
  impact: number;
  mitigation: string | null;
  is_mitigated: boolean;
  created_at: string;
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Project[];
    },
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      if (!id) throw new Error('No project ID');
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Project;
    },
    enabled: !!id,
  });
}

export function useRiskFactors(projectId: string | undefined) {
  return useQuery({
    queryKey: ['risk_factors', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('No project ID');
      const { data, error } = await supabase
        .from('risk_factors')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as RiskFactorRow[];
    },
    enabled: !!projectId,
  });
}

interface CreateProjectInput {
  name: string;
  description?: string;
  budget: number;
  budget_spent: number;
  timeline_months: number;
  months_elapsed: number;
  team_size: number;
  complexity: string;
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const riskScore = calculateRiskScore(input);
      const status = getStatusFromRisk(riskScore);

      const { data: project, error } = await supabase
        .from('projects')
        .insert({ ...input, user_id: user.id, risk_score: riskScore, status })
        .select()
        .single();
      if (error) throw error;

      // Generate and insert risk factors
      const factors = generateRiskFactors(input);
      const factorRows = factors.map(f => ({ ...f, project_id: project.id }));
      await supabase.from('risk_factors').insert(factorRows);

      return project as Project;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}
