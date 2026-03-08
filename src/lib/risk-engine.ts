export interface ProjectData {
  budget: number;
  budget_spent: number;
  timeline_months: number;
  months_elapsed: number;
  team_size: number;
  complexity: string;
}

export interface RiskFactor {
  category: string;
  name: string;
  severity: string;
  probability: number;
  impact: number;
  mitigation: string;
}

export function calculateRiskScore(project: ProjectData): number {
  const budgetRatio = project.budget > 0 ? project.budget_spent / project.budget : 0;
  const timelineRatio = project.timeline_months > 0 ? project.months_elapsed / project.timeline_months : 0;

  // Budget risk: overrun or trending towards it
  const budgetRisk = Math.min(budgetRatio * 40, 40);

  // Timeline risk
  const timelineRisk = Math.min(timelineRatio * 30, 30);

  // Complexity multiplier
  const complexityMap: Record<string, number> = { low: 0.6, medium: 1, high: 1.4, critical: 1.8 };
  const complexityMultiplier = complexityMap[project.complexity] || 1;

  // Team size risk (very small or very large teams)
  const teamRisk = project.team_size < 3 ? 10 : project.team_size > 20 ? 15 : 5;

  const rawScore = (budgetRisk + timelineRisk + teamRisk) * complexityMultiplier;
  return Math.min(Math.round(rawScore), 100);
}

export function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score <= 25) return 'low';
  if (score <= 50) return 'medium';
  if (score <= 75) return 'high';
  return 'critical';
}

export function generateRiskFactors(project: ProjectData): RiskFactor[] {
  const factors: RiskFactor[] = [];
  const budgetRatio = project.budget > 0 ? project.budget_spent / project.budget : 0;
  const timelineRatio = project.timeline_months > 0 ? project.months_elapsed / project.timeline_months : 0;

  if (budgetRatio > 0.8) {
    factors.push({
      category: 'budget',
      name: 'Budget overrun risk',
      severity: budgetRatio > 1 ? 'critical' : 'high',
      probability: Math.min(budgetRatio, 1),
      impact: 0.8,
      mitigation: 'Review scope and identify cost reduction areas. Consider phased delivery to manage remaining budget.',
    });
  } else if (budgetRatio > 0.5) {
    factors.push({
      category: 'budget',
      name: 'Budget trending high',
      severity: 'medium',
      probability: budgetRatio,
      impact: 0.5,
      mitigation: 'Monitor spending closely. Set up weekly budget reviews with stakeholders.',
    });
  }

  if (timelineRatio > 0.8) {
    factors.push({
      category: 'timeline',
      name: 'Schedule delay risk',
      severity: timelineRatio > 1 ? 'critical' : 'high',
      probability: Math.min(timelineRatio, 1),
      impact: 0.7,
      mitigation: 'Prioritize critical path items. Consider adding resources or reducing scope for remaining deliverables.',
    });
  }

  if (project.team_size < 3) {
    factors.push({
      category: 'resource',
      name: 'Understaffed team',
      severity: 'high',
      probability: 0.7,
      impact: 0.6,
      mitigation: 'Identify key resource gaps and plan for cross-training. Consider hiring contractors for critical roles.',
    });
  } else if (project.team_size > 20) {
    factors.push({
      category: 'resource',
      name: 'Communication overhead',
      severity: 'medium',
      probability: 0.6,
      impact: 0.5,
      mitigation: 'Implement clear communication channels. Break team into sub-teams with dedicated leads.',
    });
  }

  if (project.complexity === 'high' || project.complexity === 'critical') {
    factors.push({
      category: 'technical',
      name: 'Technical complexity risk',
      severity: project.complexity === 'critical' ? 'critical' : 'high',
      probability: 0.6,
      impact: 0.7,
      mitigation: 'Conduct regular architecture reviews. Build proof-of-concepts for high-risk components early.',
    });
  }

  if (factors.length === 0) {
    factors.push({
      category: 'scope',
      name: 'Project on track',
      severity: 'low',
      probability: 0.2,
      impact: 0.2,
      mitigation: 'Continue monitoring. Maintain regular status updates and risk reviews.',
    });
  }

  return factors;
}

export function getStatusFromRisk(score: number): string {
  if (score <= 25) return 'on_track';
  if (score <= 60) return 'active';
  return 'at_risk';
}
