import { useParams, useNavigate } from 'react-router-dom';
import { useProject, useRiskFactors, useDeleteProject } from '@/hooks/useProjects';
import { getRiskLevel } from '@/lib/risk-engine';
import RiskScoreGauge from '@/components/RiskScoreGauge';
import RiskFactorCard from '@/components/RiskFactorCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trash2, DollarSign, Clock, Users, Layers } from 'lucide-react';
import { toast } from 'sonner';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(id);
  const { data: riskFactors } = useRiskFactors(id);
  const deleteProject = useDeleteProject();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-glow text-primary text-lg font-mono">Loading analysis...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  const level = getRiskLevel(project.risk_score);
  const budgetPct = project.budget > 0 ? Math.round((project.budget_spent / project.budget) * 100) : 0;
  const timelinePct = project.timeline_months > 0 ? Math.round((project.months_elapsed / project.timeline_months) * 100) : 0;

  const radarData = [
    { factor: 'Budget', value: budgetPct },
    { factor: 'Timeline', value: timelinePct },
    { factor: 'Team', value: Math.min(project.team_size * 5, 100) },
    { factor: 'Complexity', value: { low: 25, medium: 50, high: 75, critical: 100 }[project.complexity] || 50 },
    { factor: 'Overall', value: project.risk_score },
  ];

  const factorChartData = riskFactors?.map(f => ({
    name: f.name.length > 20 ? f.name.slice(0, 18) + '...' : f.name,
    risk: Math.round(f.probability * f.impact * 100),
  })) || [];

  const handleDelete = async () => {
    if (!confirm('Delete this project?')) return;
    try {
      await deleteProject.mutateAsync(project.id);
      toast.success('Project deleted');
      navigate('/');
    } catch { toast.error('Failed to delete'); }
  };

  const statCards = [
    { icon: DollarSign, label: 'Budget', value: `$${project.budget_spent.toLocaleString()} / $${project.budget.toLocaleString()}`, pct: budgetPct },
    { icon: Clock, label: 'Timeline', value: `${project.months_elapsed} / ${project.timeline_months} months`, pct: timelinePct },
    { icon: Users, label: 'Team Size', value: `${project.team_size} members`, pct: null },
    { icon: Layers, label: 'Complexity', value: project.complexity, pct: null },
  ];

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      <div className="container max-w-5xl py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-2">
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <RiskScoreGauge score={project.risk_score} size="lg" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
              <Badge variant={level === 'low' ? 'secondary' : level === 'critical' ? 'destructive' : 'default'} className="capitalize">
                {project.status.replace('_', ' ')}
              </Badge>
            </div>
            {project.description && <p className="text-muted-foreground">{project.description}</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((s) => (
            <Card key={s.label} className="border-border/50">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <s.icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{s.label}</span>
                </div>
                <p className="text-sm font-semibold capitalize">{s.value}</p>
                {s.pct !== null && (
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        s.pct > 80 ? 'bg-destructive' : s.pct > 50 ? 'bg-warning' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(s.pct, 100)}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Risk Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          {factorChartData.length > 0 && (
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Risk Factor Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={factorChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={120} />
                    <Tooltip />
                    <Bar dataKey="risk" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Risk Factors */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Risk Factors & Mitigations</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {riskFactors?.map((f) => (
              <RiskFactorCard
                key={f.id}
                name={f.name}
                category={f.category}
                severity={f.severity}
                probability={f.probability}
                impact={f.impact}
                mitigation={f.mitigation}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
