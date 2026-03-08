import { getRiskLevel } from '@/lib/risk-engine';

interface RiskScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function RiskScoreGauge({ score, size = 'md' }: RiskScoreGaugeProps) {
  const level = getRiskLevel(score);
  const sizeMap = { sm: 80, md: 120, lg: 160 };
  const dim = sizeMap[size];
  const strokeWidth = size === 'sm' ? 6 : 8;
  const radius = (dim - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const colorMap = {
    low: 'text-risk-low',
    medium: 'text-risk-medium',
    high: 'text-risk-high',
    critical: 'text-risk-critical',
  };

  const glowMap = {
    low: 'glow-risk-low',
    medium: 'glow-risk-medium',
    high: 'glow-risk-high',
    critical: 'glow-risk-critical',
  };

  const strokeColorMap = {
    low: 'hsl(var(--risk-low))',
    medium: 'hsl(var(--risk-medium))',
    high: 'hsl(var(--risk-high))',
    critical: 'hsl(var(--risk-critical))',
  };

  const fontSizeMap = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };
  const labelSize = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' };

  return (
    <div className={`relative inline-flex items-center justify-center rounded-full ${glowMap[level]}`}>
      <svg width={dim} height={dim} className="-rotate-90">
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          stroke={strokeColorMap[level]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`font-bold font-mono ${fontSizeMap[size]} ${colorMap[level]}`}>
          {score}
        </span>
        <span className={`${labelSize[size]} uppercase tracking-wider text-muted-foreground font-medium`}>
          {level}
        </span>
      </div>
    </div>
  );
}
