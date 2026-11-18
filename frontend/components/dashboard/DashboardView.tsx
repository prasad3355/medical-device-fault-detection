import React from 'react';
import { 
  Activity, 
  AlertTriangle, 
  AlertOctagon, 
  Database, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { KPICard } from './KPICard';
import { SensorIntelligenceChart } from './SensorIntelligenceChart';
import { FaultRiskDonuts } from './FaultRiskDonuts';
import { RecentAnalysesTable } from './RecentAnalysesTable';
import { MOCK_TELEMETRY, RECENT_ANALYSES } from '../../data/mockData';
import { AnalysisRecord, NavigationRoute } from '../../types';

interface DashboardViewProps {
  onNavigateToUpload: () => void;
  onNavigateToAnalysis: (record?: AnalysisRecord) => void;
  onNavigateToHistory: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToUpload,
  onNavigateToAnalysis,
  onNavigateToHistory
}) => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-r from-[#091122]/90 via-[#070c17] to-[#050912] p-6 sm:p-8 shadow-2xl">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            {/* System Status Pill */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-semibold text-cyan-300 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                Analysis Engine Ready
              </span>
              <span className="text-xs font-mono text-slate-400">
                Uploaded Telemetry Evaluation
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Medical Intelligence Dashboard
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Monitor device anomalies and patient-risk signals from uploaded datasets using our multi-channel 1D-CNN + BiLSTM deep learning pipeline.
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <button
              onClick={onNavigateToUpload}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-cyan-500/20 border border-cyan-300/30 transition-all duration-200 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-cyan-100" />
              <span>Ingest New Dataset</span>
            </button>

            <button
              onClick={() => onNavigateToAnalysis()}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-cyan-300 font-semibold text-xs sm:text-sm border border-slate-700/80 transition-all duration-200 cursor-pointer"
            >
              <span>Latest Report</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced KPI Composition */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KPICard
          title="Total Analyses"
          value="128"
          subtitle="Processed runs to date"
          change="+8 this week"
          changeType="positive"
          icon={Activity}
          variant="cyan"
          sparklinePoints={[85, 92, 98, 104, 112, 118, 128]}
        />

        <KPICard
          title="Device Faults"
          value="18"
          subtitle="Transducer anomalies flagged"
          change="+12.4%"
          changeType="negative"
          icon={AlertOctagon}
          variant="amber"
          sparklinePoints={[12, 14, 13, 16, 15, 17, 18]}
        />

        <KPICard
          title="Patient Risk Alerts"
          value="12"
          subtitle="Critical stability deviations"
          change="-4.2%"
          changeType="positive"
          icon={AlertTriangle}
          variant="rose"
          sparklinePoints={[16, 15, 18, 14, 13, 13, 12]}
        />

        <KPICard
          title="Datasets Processed"
          value="24"
          subtitle="Multi-parameter cohorts"
          change="+3 new"
          changeType="positive"
          icon={Database}
          variant="indigo"
          sparklinePoints={[14, 16, 17, 19, 21, 22, 24]}
        />
      </div>

      {/* Sensor Intelligence Advanced Visualization */}
      <SensorIntelligenceChart
        telemetry={MOCK_TELEMETRY}
        onSelectAnomalyInterval={() => onNavigateToAnalysis()}
      />

      {/* Fault & Risk Modern Radial Visualizations */}
      <FaultRiskDonuts />

      {/* Recent Analysis Table */}
      <RecentAnalysesTable
        analyses={RECENT_ANALYSES}
        onSelectRecord={(rec) => onNavigateToAnalysis(rec)}
        onViewAllHistory={onNavigateToHistory}
      />
    </div>
  );
};
