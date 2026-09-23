import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ShieldCheck, AlertTriangle, AlertOctagon, HeartPulse, CheckCircle2 } from 'lucide-react';

interface FaultRiskDonutsProps {
  deviceFaultDistribution?: { name: string; value: number; color: string; count: number }[];
  patientRiskDistribution?: { name: string; value: number; color: string; count: number }[];
}

export const FaultRiskDonuts: React.FC<FaultRiskDonutsProps> = ({
  deviceFaultDistribution = [
    { name: 'Normal Operation', value: 78.4, color: '#10b981', count: 101 },
    { name: 'Possible Anomaly', value: 13.8, color: '#f59e0b', count: 18 },
    { name: 'Fault Detected', value: 7.8, color: '#ef4444', count: 9 },
  ],
  patientRiskDistribution = [
    { name: 'Low Risk', value: 82.0, color: '#10b981', count: 105 },
    { name: 'Moderate Risk', value: 12.0, color: '#f59e0b', count: 15 },
    { name: 'High Risk Alert', value: 6.0, color: '#ef4444', count: 8 },
  ]
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Card 1: DEVICE FAULT INTELLIGENCE */}
      <div className="relative rounded-xl border border-slate-800/80 bg-gradient-to-br from-[#091224]/90 via-[#070c17] to-[#050912] p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Device Fault Intelligence
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Deep learning hardware state classification across 128 evaluation runs
            </p>
          </div>
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 mt-4">
          {/* Radial Donut Visualization */}
          <div className="sm:col-span-5 h-[160px] relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceFaultDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="#070c17"
                  strokeWidth={2}
                >
                  {deviceFaultDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`${val}%`, 'Proportion']}
                  contentStyle={{ backgroundColor: '#091122', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-bold text-white font-mono leading-none">
                78.4%
              </span>
              <span className="text-[10px] text-slate-400 font-sans mt-0.5">
                Nominal
              </span>
            </div>
          </div>

          {/* Breakdown Legend */}
          <div className="sm:col-span-7 space-y-2.5">
            {deviceFaultDistribution.map((item) => (
              <div 
                key={item.name}
                className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: item.color }} 
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-200">
                      {item.name}
                    </span>
                    <span className="block text-[11px] font-mono text-slate-400">
                      {item.count} datasets evaluated
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-white">
                    {item.value.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Calibration verified via Platt scaling
          </span>
          <span className="font-mono text-cyan-400">Loss: 0.042</span>
        </div>
      </div>

      {/* Card 2: PATIENT RISK */}
      <div className="relative rounded-xl border border-slate-800/80 bg-gradient-to-br from-[#0b1429]/90 via-[#070c17] to-[#050912] p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Patient Risk Stratification
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-task physiological consequence assessment independent of sensor noise
            </p>
          </div>
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <HeartPulse className="w-4 h-4" />
          </div>
        </div>

        {/* Segmented Meter Bar & Radial Status */}
        <div className="mt-4 space-y-4">
          {/* Visual Multi-Segment Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span>Risk Severity Horizon</span>
              <span className="font-mono text-slate-400">128 Cohort Runs</span>
            </div>
            <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex p-[1px] border border-slate-800">
              <div 
                className="bg-emerald-500 h-full rounded-l-full transition-all duration-500" 
                style={{ width: `${patientRiskDistribution[0].value}%` }} 
                title={`Low Risk: ${patientRiskDistribution[0].value}%`}
              />
              <div 
                className="bg-amber-500 h-full transition-all duration-500" 
                style={{ width: `${patientRiskDistribution[1].value}%` }} 
                title={`Moderate Risk: ${patientRiskDistribution[1].value}%`}
              />
              <div 
                className="bg-red-500 h-full rounded-r-full transition-all duration-500" 
                style={{ width: `${patientRiskDistribution[2].value}%` }} 
                title={`High Risk: ${patientRiskDistribution[2].value}%`}
              />
            </div>
          </div>

          {/* Three Tier Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 block">
                Low Risk
              </span>
              <span className="text-lg font-bold font-mono text-white mt-1 block">
                82.0%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Stable telemetry
              </span>
            </div>

            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 block">
                Moderate Risk
              </span>
              <span className="text-lg font-bold font-mono text-white mt-1 block">
                12.0%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Vigilance advised
              </span>
            </div>

            <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/20 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400 block">
                High Risk
              </span>
              <span className="text-lg font-bold font-mono text-white mt-1 block">
                6.0%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Immediate review
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Clinical Protocol Alert Buffer: Active
          </span>
          <span className="font-mono text-blue-400">Dual Attention Head</span>
        </div>
      </div>
    </div>
  );
};
