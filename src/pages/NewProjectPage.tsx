import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProject } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function NewProjectPage() {
  const navigate = useNavigate();
  const createProject = useCreateProject();

  const [form, setForm] = useState({
    name: '',
    description: '',
    budget: 100000,
    budget_spent: 0,
    timeline_months: 6,
    months_elapsed: 0,
    team_size: 5,
    complexity: 'medium',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject.mutateAsync(form);
      toast.success('Project created with risk analysis');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create project');
    }
  };

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      <div className="container max-w-2xl py-8 space-y-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-xl">New Project</CardTitle>
            <CardDescription>Enter project details to generate AI risk predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Mobile App Redesign"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief project description..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Budget ($)</Label>
                  <Input
                    type="number"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Budget Spent ($)</Label>
                  <Input
                    type="number"
                    value={form.budget_spent}
                    onChange={(e) => setForm({ ...form, budget_spent: Number(e.target.value) })}
                    min={0}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Timeline (months)</Label>
                  <Input
                    type="number"
                    value={form.timeline_months}
                    onChange={(e) => setForm({ ...form, timeline_months: Number(e.target.value) })}
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Months Elapsed</Label>
                  <Input
                    type="number"
                    value={form.months_elapsed}
                    onChange={(e) => setForm({ ...form, months_elapsed: Number(e.target.value) })}
                    min={0}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Team Size: {form.team_size}</Label>
                <Slider
                  value={[form.team_size]}
                  onValueChange={([v]) => setForm({ ...form, team_size: v })}
                  min={1}
                  max={50}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Complexity Level</Label>
                <Select value={form.complexity} onValueChange={(v) => setForm({ ...form, complexity: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={createProject.isPending}>
                <Plus className="h-4 w-4" />
                {createProject.isPending ? 'Analyzing Risks...' : 'Create & Analyze Risks'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
