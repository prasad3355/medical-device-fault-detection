import React from 'react';
import { AnalysisRecord, DeviceFaultStatus, PatientRiskLevel } from '../../types';
import { 
  FileText, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Clock, 
  Eye,
  Sliders
} from 'lucide-react';

interface RecentAnalysesTableProps {
  analyses: AnalysisRecord[];
  onSelectRecord: (record: AnalysisRecord) => void;
  onViewAllHistory: () => void;
}

export const RecentAnalysesTable: React.FC<RecentAnalysesTableProps> = ({
  analyses,
  onSelectRecord,
  onViewAllHistory
}) => {
  const getStatusBadge = (status: DeviceFaultStatus) => {
    switch (status) {
      case 'Normal':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Normal
          </span>
        );
      case 'Possible Anomaly':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-950/40 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Possible Anomaly
          </span>
        );
      case 'Fault Detected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-950/40 text-red-300 border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Fault Detected
          </span>
        );
    }
  };

  const getRiskBadge = (risk: PatientRiskLevel) => {
    switch (risk) {
      case 'Low':
        return <span className="text-xs font-medium text-emerald-400">Low Risk</span>;
      case 'Moderate':
        return <span className="text-xs font-medium text-amber-400">Moderate</span>;
      case 'High':
        return <span className="text-xs font-bold text-red-400 flex items-center gap-1">
          <AlertOctagon className="w-3.5 h-3.5" /> High Alert
        </span>;
    }
  };

  return (
    <div className="rounded-xl border border-slate-800/80 bg-gradient-to-b from-[#091122]/90 to-[#060a13] p-5 shadow-xl overflow-hidden">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Recent Diagnostic Analyses
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-800/50">
              {analyses.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical evaluations parsed through multi-channel 1D-CNN + BiLSTM inference
          </p>
        </div>

        <button
          onClick={onViewAllHistory}
          className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <span>View All in History Workspace</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Table Scrollable Container */}
      <div className="overflow-x-auto mt-2 -mx-5 px-5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-3">Dataset & Device</th>
              <th className="py-3 px-3 text-right">Records</th>
              <th className="py-3 px-3">Device Status</th>
              <th className="py-3 px-3">Patient Risk</th>
              <th className="py-3 px-3">Model Confidence</th>
              <th className="py-3 px-3">Analyzed</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-sm">
            {analyses.map((item) => (
              <tr 
                key={item.id}
                onClick={() => onSelectRecord(item)}
                className="group hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                {/* Dataset & Device info */}
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-800/80 group-hover:bg-cyan-950/60 border border-slate-700/50 group-hover:border-cyan-500/40 transition-colors text-slate-300 group-hover:text-cyan-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-white group-hover:text-cyan-300 transition-colors block text-xs sm:text-sm font-mono">
                        {item.datasetName}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[220px]">
                        {item.deviceType}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Records Count */}
                <td className="py-3.5 px-3 text-right font-mono text-xs text-slate-300 tabular-nums">
                  {item.recordsCount.toLocaleString()}
                </td>

                {/* Device Status */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  {getStatusBadge(item.deviceStatus)}
                </td>

                {/* Patient Risk */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  {getRiskBadge(item.patientRisk)}
                </td>

                {/* Confidence Bar */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-2.5 min-w-[130px]">
                    <span className="font-mono text-xs font-bold text-slate-200 tabular-nums w-12">
                      {item.confidence.toFixed(1)}%
                    </span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.confidence >= 95 
                            ? 'bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]' 
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${item.confidence}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Analyzed Time */}
                <td className="py-3.5 px-3 whitespace-nowrap text-xs text-slate-400 font-mono">
                  {item.analyzedAt}
                </td>

                {/* Action CTA */}
                <td className="py-3.5 px-3 text-right whitespace-nowrap">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRecord(item);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-cyan-400 hover:text-white hover:bg-cyan-600/30 border border-transparent hover:border-cyan-500/30 transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Report</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
