import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { getRiskLevel } from '@/lib/risk-engine';
import RiskScoreGauge from '@/components/RiskScoreGauge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, LogOut, Shield, BarChart3, FolderOpen } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { data: projects, isLoading } = useProjects();

  const avgRisk = projects?.length
    ? Math.round(projects.reduce((sum, p) => sum + p.risk_score, 0) / projects.length)
    : 0;
  const atRiskCount = projects?.filter(p => p.risk_score > 50).length || 0;

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">Risk Predictor</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">{projects?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total Projects</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">{avgRisk}%</p>
                <p className="text-xs text-muted-foreground">Avg Risk Score</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">{atRiskCount}</p>
                <p className="text-xs text-muted-foreground">At Risk</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project List */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Projects</h2>
          <Button onClick={() => navigate('/new')} className="gap-2">
            <Plus className="h-4 w-4" /> New Project
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <p className="animate-pulse-glow text-primary font-mono">Loading projects...</p>
          </div>
        ) : projects?.length === 0 ? (
          <Card className="border-border/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                <Shield className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-medium">No projects yet</p>
                <p className="text-sm text-muted-foreground">Create your first project to get AI risk predictions</p>
              </div>
              <Button onClick={() => navigate('/new')} className="gap-2">
                <Plus className="h-4 w-4" /> Create Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {projects?.map((project) => {
              const level = getRiskLevel(project.risk_score);
              return (
                <Card
                  key={project.id}
                  className="border-border/50 hover:border-primary/30 transition-all cursor-pointer animate-slide-up"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <CardContent className="p-4 flex items-center gap-5">
                    <RiskScoreGauge score={project.risk_score} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{project.name}</h3>
                        <Badge
                          variant={level === 'low' ? 'secondary' : level === 'critical' ? 'destructive' : 'default'}
                          className="capitalize shrink-0 text-xs"
                        >
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {project.description && (
                        <p className="text-sm text-muted-foreground truncate">{project.description}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Budget: ${project.budget_spent.toLocaleString()} / ${project.budget.toLocaleString()}</span>
                        <span>Team: {project.team_size}</span>
                        <span className="capitalize">Complexity: {project.complexity}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
