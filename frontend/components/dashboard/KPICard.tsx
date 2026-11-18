import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, AlertTriangle, Activity, Database, CheckCircle2 } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle: string;
  icon: LucideIcon;
  variant?: 'cyan' | 'amber' | 'rose' | 'indigo';
  sparklinePoints: number[];
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  subtitle,
  icon: Icon,
  variant = 'cyan',
  sparklinePoints
}) => {
  // Color configuration
  const theme = {
    cyan: {
      border: 'border-cyan-500/30 hover:border-cyan-400/50',
      bgGlow: 'from-cyan-950/40 via-slate-900/80 to-[#0b1324]',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
      sparkColor: '#06b6d4',
      badge: 'text-cyan-400'
    },
    amber: {
      border: 'border-amber-500/30 hover:border-amber-400/50',
      bgGlow: 'from-amber-950/30 via-slate-900/80 to-[#0b1324]',
      iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      sparkColor: '#f59e0b',
      badge: 'text-amber-400'
    },
    rose: {
      border: 'border-red-500/30 hover:border-red-400/50',
      bgGlow: 'from-red-950/30 via-slate-900/80 to-[#0b1324]',
      iconBg: 'bg-red-500/10 text-red-400 border border-red-500/20',
      sparkColor: '#ef4444',
      badge: 'text-red-400'
    },
    indigo: {
      border: 'border-blue-500/30 hover:border-blue-400/50',
      bgGlow: 'from-blue-950/30 via-slate-900/80 to-[#0b1324]',
      iconBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      sparkColor: '#3b82f6',
      badge: 'text-blue-400'
    }
  }[variant];

  // Generate SVG path for sparkline
  const minVal = Math.min(...sparklinePoints);
  const maxVal = Math.max(...sparklinePoints);
  const range = maxVal - minVal || 1;
  const height = 36;
  const width = 110;
  
  const points = sparklinePoints.map((val, idx) => {
    const x = (idx / (sparklinePoints.length - 1)) * width;
    const y = height - ((val - minVal) / range) * (height - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className={`relative overflow-hidden rounded-xl border ${theme.border} bg-gradient-to-br ${theme.bgGlow} p-5 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-950/30`}>
      {/* Subtle top corner ambient glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className="flex items-baseline gap-2.5 mt-2">
            <span className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-white tabular-nums">
              {value}
            </span>
            {change && (
              <span className={`inline-flex items-center text-xs font-semibold font-mono ${
                changeType === 'positive' 
                  ? 'text-emerald-400' 
                  : changeType === 'negative' 
                  ? 'text-red-400' 
                  : 'text-slate-400'
              }`}>
                {changeType === 'positive' ? (
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                ) : changeType === 'negative' ? (
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                ) : null}
                {change}
              </span>
            )}
          </div>
        </div>

        <div className={`p-2.5 rounded-lg ${theme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-end justify-between">
        <p className="text-xs text-slate-400 max-w-[140px] truncate">
          {subtitle}
        </p>

        {/* Mini SVG Sparkline */}
        <div className="relative w-[110px] h-[36px]">
          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
            <defs>
              <linearGradient id={`grad-${variant}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.sparkColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={theme.sparkColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <polygon points={areaPoints} fill={`url(#grad-${variant})`} />
            <polyline
              points={points}
              fill="none"
              stroke={theme.sparkColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
