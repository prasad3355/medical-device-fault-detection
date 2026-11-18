import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceArea, 
  ReferenceLine 
} from 'recharts';
import { TelemetryPoint } from '../../types';
import { AlertCircle, SlidersHorizontal, Info, Eye, Layers } from 'lucide-react';

interface SensorIntelligenceChartProps {
  telemetry: TelemetryPoint[];
  onSelectAnomalyInterval?: (intervalName: string) => void;
}

export const SensorIntelligenceChart: React.FC<SensorIntelligenceChartProps> = ({
  telemetry,
  onSelectAnomalyInterval
}) => {
  const [activeChannel, setActiveChannel] = useState<'all' | 'spo2' | 'heartRate' | 'temperature' | 'pressure'>('all');
  const [showAnomalyShading, setShowAnomalyShading] = useState<boolean>(true);

  // Custom clean tooltip matching dark medical theme
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as TelemetryPoint;
      return (
        <div className="bg-[#091122]/95 backdrop-blur-md border border-cyan-500/30 rounded-lg p-3 shadow-xl shadow-black/60 text-xs font-mono">
          <div className="flex items-center justify-between gap-4 pb-1.5 border-b border-slate-800 text-slate-400">
            <span className="font-semibold text-slate-200">Timestamp: {label}</span>
            {dataPoint.isAnomaly && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                dataPoint.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {dataPoint.anomalyType || 'ANOMALY DETECTED'}
              </span>
            )}
          </div>

          <div className="mt-2 space-y-1">
            {(activeChannel === 'all' || activeChannel === 'spo2') && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-cyan-400 flex items-center gap-1.5 font-sans font-medium">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span> SpO₂:
                </span>
                <span className="font-bold text-white tabular-nums">{dataPoint.spo2.toFixed(1)}%</span>
              </div>
            )}

            {(activeChannel === 'all' || activeChannel === 'heartRate') && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-red-400 flex items-center gap-1.5 font-sans font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span> Heart Rate:
                </span>
                <span className="font-bold text-white tabular-nums">{dataPoint.heartRate} bpm</span>
              </div>
            )}

            {(activeChannel === 'all' || activeChannel === 'temperature') && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-amber-400 flex items-center gap-1.5 font-sans font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span> Temperature:
                </span>
                <span className="font-bold text-white tabular-nums">{dataPoint.temperature.toFixed(1)}°C</span>
              </div>
            )}

            {(activeChannel === 'all' || activeChannel === 'pressure') && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-blue-400 flex items-center gap-1.5 font-sans font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span> Airway Pressure:
                </span>
                <span className="font-bold text-white tabular-nums">{dataPoint.pressure.toFixed(1)} cmH₂O</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative rounded-xl border border-slate-800/80 bg-gradient-to-b from-[#091122]/90 to-[#060a13] p-5 shadow-xl">
      {/* Ambient glow behind chart */}
      <div className="absolute top-1/4 left-1/3 w-64 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              Sensor Intelligence
            </h2>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-medium text-amber-400">
              <AlertCircle className="w-3 h-3" />
              <span>3 anomalous intervals detected</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multi-channel physiological telemetry from uploaded dataset · Offline diagnostic evaluation
          </p>
        </div>

        {/* Channel Selectors */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-lg border border-slate-800 self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: 'all', label: 'All Channels' },
            { id: 'spo2', label: 'SpO₂' },
            { id: 'heartRate', label: 'Heart Rate' },
            { id: 'temperature', label: 'Temp' },
            { id: 'pressure', label: 'Pressure' }
          ].map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id as any)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                activeChannel === ch.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>
      </div>

      {/* Anomaly Interval Ribbon Badges */}
      <div className="py-2.5 px-1 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Flagged Regions:
          </span>
          <button 
            onClick={() => onSelectAnomalyInterval?.('10:30 - 10:42')}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-950/40 hover:bg-red-950/60 border border-red-500/30 text-[11px] text-red-300 font-mono transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            10:30–10:42 · SpO₂ Desaturation (88.4%)
          </button>
          <button 
            onClick={() => onSelectAnomalyInterval?.('11:10 - 11:16')}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/40 hover:bg-amber-950/60 border border-amber-500/30 text-[11px] text-amber-300 font-mono transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            11:10–11:16 · Airway Pressure Surge
          </button>
          <button 
            onClick={() => onSelectAnomalyInterval?.('11:35 - 11:42')}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/40 hover:bg-amber-950/60 border border-amber-500/30 text-[11px] text-amber-300 font-mono transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            11:35–11:42 · Thermal Drift (38.7°C)
          </button>
        </div>

        <button
          onClick={() => setShowAnomalyShading(!showAnomalyShading)}
          className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Eye className="w-3 h-3" />
          <span>{showAnomalyShading ? 'Hide anomaly highlights' : 'Show anomaly highlights'}</span>
        </button>
      </div>

      {/* Main Chart Area */}
      <div className="h-[320px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={telemetry} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {/* SpO2 Gradient (Cyan) */}
              <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>

              {/* Heart Rate Gradient (Red/Rose) */}
              <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>

              {/* Temperature Gradient (Amber) */}
              <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>

              {/* Pressure Gradient (Blue) */}
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />

            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false}
              fontFamily="var(--font-mono)"
            />

            <YAxis 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false}
              domain={['auto', 'auto']}
              fontFamily="var(--font-mono)"
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Shaded Anomaly Region 1: Critical Desaturation (10:30 to 10:42) */}
            {showAnomalyShading && (
              <ReferenceArea 
                x1="10:30" 
                x2="10:42" 
                stroke="#ef4444" 
                strokeOpacity={0.4}
                fill="#ef4444" 
                fillOpacity={0.12} 
              />
            )}

            {/* Shaded Anomaly Region 2: Pressure Surge (11:10 to 11:16) */}
            {showAnomalyShading && (
              <ReferenceArea 
                x1="11:10" 
                x2="11:16" 
                stroke="#f59e0b" 
                strokeOpacity={0.4}
                fill="#f59e0b" 
                fillOpacity={0.12} 
              />
            )}

            {/* Shaded Anomaly Region 3: Thermal Drift (11:35 to 11:42) */}
            {showAnomalyShading && (
              <ReferenceArea 
                x1="11:35" 
                x2="11:42" 
                stroke="#f59e0b" 
                strokeOpacity={0.4}
                fill="#f59e0b" 
                fillOpacity={0.12} 
              />
            )}

            {/* Threshold line for SpO2 critical floor */}
            {(activeChannel === 'all' || activeChannel === 'spo2') && (
              <ReferenceLine 
                y={90} 
                stroke="#ef4444" 
                strokeDasharray="4 4" 
                strokeOpacity={0.7}
                label={{ value: 'SpO₂ Floor (90%)', fill: '#ef4444', fontSize: 10, position: 'right' }} 
              />
            )}

            {/* Primary Channel Areas */}
            {(activeChannel === 'all' || activeChannel === 'spo2') && (
              <Area
                type="monotone"
                dataKey="spo2"
                stroke="#06b6d4"
                strokeWidth={2.2}
                fill="url(#cyanGrad)"
                name="SpO₂ (%)"
                isAnimationActive={true}
              />
            )}

            {(activeChannel === 'all' || activeChannel === 'heartRate') && (
              <Area
                type="monotone"
                dataKey="heartRate"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#roseGrad)"
                name="Heart Rate (bpm)"
                isAnimationActive={true}
              />
            )}

            {(activeChannel === 'all' || activeChannel === 'temperature') && (
              <Area
                type="monotone"
                dataKey="temperature"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#amberGrad)"
                name="Temp (°C)"
                isAnimationActive={true}
              />
            )}

            {(activeChannel === 'all' || activeChannel === 'pressure') && (
              <Area
                type="monotone"
                dataKey="pressure"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#blueGrad)"
                name="Pressure (cmH₂O)"
                isAnimationActive={true}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Clean Legend Bar at bottom */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-slate-300">SpO₂ (Normal: 95-100%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="text-slate-300">Heart Rate (60-100 bpm)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-slate-300">Temp (36.5-37.4°C)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span>Resolution: 1 sample/min</span>
          <span>·</span>
          <span>Wavelet Denoised (db4)</span>
        </div>
      </div>
    </div>
  );
};
