import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

interface RiskFactorCardProps {
  name: string;
  category: string;
  severity: string;
  probability: number;
  impact: number;
  mitigation: string | null;
}

export default function RiskFactorCard({ name, category, severity, probability, impact, mitigation }: RiskFactorCardProps) {
  const severityConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
    low: { variant: 'secondary', icon: <CheckCircle className="h-3.5 w-3.5" /> },
    medium: { variant: 'outline', icon: <Shield className="h-3.5 w-3.5" /> },
    high: { variant: 'default', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
    critical: { variant: 'destructive', icon: <XCircle className="h-3.5 w-3.5" /> },
  };

  const config = severityConfig[severity] || severityConfig.medium;

  return (
    <Card className="animate-slide-up border-border/50 hover:border-primary/30 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold leading-tight">{name}</CardTitle>
          <Badge variant={config.variant} className="shrink-0 gap-1 text-xs">
            {config.icon}
            {severity}
          </Badge>
        </div>
        <Badge variant="outline" className="w-fit text-xs capitalize">
          {category}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Probability</p>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${probability * 100}%` }}
              />
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-1">{Math.round(probability * 100)}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Impact</p>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-warning transition-all duration-700"
                style={{ width: `${impact * 100}%` }}
              />
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-1">{Math.round(impact * 100)}%</p>
          </div>
        </div>
        {mitigation && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">💡 Mitigation</p>
            <p className="text-xs leading-relaxed">{mitigation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
