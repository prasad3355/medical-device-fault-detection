import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  AlertOctagon, 
  Database, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { KPICard } from './KPICard';
import { SensorIntelligenceChart } from './SensorIntelligenceChart';
import { FaultRiskDonuts } from './FaultRiskDonuts';
import { RecentAnalysesTable } from './RecentAnalysesTable';
import { MOCK_TELEMETRY } from '../../data/mockData';
import { AnalysisRecord, TelemetryPoint } from '../../types';
import { fetchAnalysisHistory, fetchAnalysisById } from '../../lib/api';

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
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [latestTelemetry, setLatestTelemetry] = useState<TelemetryPoint[]>(MOCK_TELEMETRY);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    fetchAnalysisHistory()
      .then(async (data) => {
        if (!isMounted) return;
        setAnalyses(data || []);
        
        // If analyses exist, load telemetry of the latest run
        if (data && data.length > 0) {
          try {
            const latestRun = await fetchAnalysisById(data[0].id);
            if (isMounted && latestRun && latestRun.telemetry && latestRun.telemetry.length > 0) {
              setLatestTelemetry(latestRun.telemetry);
            }
          } catch {}
        }
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  // Compute live KPIs
  const totalCount = analyses.length;
  const faultCount = analyses.filter(a => a.deviceStatus !== 'Normal').length;
  const riskCount = analyses.filter(a => a.patientRisk !== 'Low').length;
  const uniqueDatasetsCount = new Set(analyses.map(a => a.datasetName)).size;

  // Compute live distributions
  const normalFaults = analyses.filter(a => a.deviceStatus === 'Normal').length;
  const possibleAnomalies = analyses.filter(a => a.deviceStatus === 'Possible Anomaly').length;
  const detectedFaults = analyses.filter(a => a.deviceStatus === 'Fault Detected').length;

  const lowRisks = analyses.filter(a => a.patientRisk === 'Low').length;
  const moderateRisks = analyses.filter(a => a.patientRisk === 'Moderate').length;
  const highRisks = analyses.filter(a => a.patientRisk === 'High').length;

  const deviceDistribution = totalCount > 0 ? [
    { name: 'Normal Operation', value: Math.round((normalFaults / totalCount) * 100), color: '#10b981', count: normalFaults },
    { name: 'Possible Anomaly', value: Math.round((possibleAnomalies / totalCount) * 100), color: '#f59e0b', count: possibleAnomalies },
    { name: 'Fault Detected', value: Math.round((detectedFaults / totalCount) * 100), color: '#ef4444', count: detectedFaults },
  ] : [
    { name: 'Normal Operation', value: 100, color: '#10b981', count: 0 },
    { name: 'Possible Anomaly', value: 0, color: '#f59e0b', count: 0 },
    { name: 'Fault Detected', value: 0, color: '#ef4444', count: 0 },
  ];

  const riskDistribution = totalCount > 0 ? [
    { name: 'Low Risk', value: Math.round((lowRisks / totalCount) * 100), color: '#10b981', count: lowRisks },
    { name: 'Moderate Risk', value: Math.round((moderateRisks / totalCount) * 100), color: '#f59e0b', count: moderateRisks },
    { name: 'High Risk Alert', value: Math.round((highRisks / totalCount) * 100), color: '#ef4444', count: highRisks },
  ] : [
    { name: 'Low Risk', value: 100, color: '#10b981', count: 0 },
    { name: 'Moderate Risk', value: 0, color: '#f59e0b', count: 0 },
    { name: 'High Risk Alert', value: 0, color: '#ef4444', count: 0 },
  ];

  const latestRun = analyses[0];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-r from-[#091122]/90 via-[#070c17] to-[#050912] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-1/4 w-96 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-semibold text-cyan-300 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                Inference Engine Active
              </span>
              <span className="text-xs font-mono text-slate-400">
                FastAPI + 1D-CNN/BiLSTM
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Medical Intelligence Dashboard
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Monitor device anomalies and patient-risk signals from uploaded datasets using our multi-channel 1D-CNN + BiLSTM deep learning pipeline.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <button
              onClick={onNavigateToUpload}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-cyan-500/20 border border-cyan-300/30 transition-all duration-200 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-cyan-100" />
              <span>Ingest New Dataset</span>
            </button>

            {latestRun && (
              <button
                onClick={() => onNavigateToAnalysis(latestRun)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-cyan-300 font-semibold text-xs sm:text-sm border border-slate-700/80 transition-all duration-200 cursor-pointer"
              >
                <span>Latest Report</span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced KPI Composition */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KPICard
          title="Total Analyses"
          value={totalCount.toString()}
          subtitle="Processed runs to date"
          change={totalCount > 0 ? "Active Database" : "Ready"}
          changeType="positive"
          icon={Activity}
          variant="cyan"
          sparklinePoints={[85, 92, 98, 104, 112, 118, Math.max(120, totalCount)]}
        />

        <KPICard
          title="Device Faults"
          value={faultCount.toString()}
          subtitle="Transducer anomalies flagged"
          change={faultCount > 0 ? `${faultCount} flagged` : "0 anomalies"}
          changeType={faultCount > 0 ? "negative" : "positive"}
          icon={AlertOctagon}
          variant="amber"
          sparklinePoints={[12, 14, 13, 16, 15, 17, Math.max(18, faultCount)]}
        />

        <KPICard
          title="Patient Risk Alerts"
          value={riskCount.toString()}
          subtitle="Stability deviations for review"
          change={riskCount > 0 ? `${riskCount} review flags` : "Stable"}
          changeType={riskCount > 0 ? "negative" : "positive"}
          icon={AlertTriangle}
          variant="rose"
          sparklinePoints={[16, 15, 18, 14, 13, 13, Math.max(12, riskCount)]}
        />

        <KPICard
          title="Datasets Evaluated"
          value={uniqueDatasetsCount.toString()}
          subtitle="Multi-parameter cohorts"
          change={`${uniqueDatasetsCount} distinct files`}
          changeType="positive"
          icon={Database}
          variant="indigo"
          sparklinePoints={[14, 16, 17, 19, 21, 22, Math.max(24, uniqueDatasetsCount)]}
        />
      </div>

      {/* Sensor Intelligence Advanced Visualization */}
      <SensorIntelligenceChart
        telemetry={latestTelemetry}
        onSelectAnomalyInterval={() => onNavigateToAnalysis(latestRun)}
      />

      {/* Fault & Risk Modern Radial Visualizations */}
      <FaultRiskDonuts
        deviceFaultDistribution={deviceDistribution}
        patientRiskDistribution={riskDistribution}
      />

      {/* Recent Analysis Table */}
      {analyses.length === 0 && !loading ? (
        <div className="rounded-xl border border-slate-800 bg-[#091122]/60 p-8 text-center space-y-3">
          <Database className="w-10 h-10 text-cyan-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Telemetry Datasets Analyzed Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Upload your first ICU, syringe pump, or ventilator sensor log to populate the dashboard and inspect deep learning fault classifications.
          </p>
          <button
            onClick={onNavigateToUpload}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/40"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload First Dataset</span>
          </button>
        </div>
      ) : (
        <RecentAnalysesTable
          analyses={analyses}
          onSelectRecord={(rec) => onNavigateToAnalysis(rec)}
          onViewAllHistory={onNavigateToHistory}
        />
      )}
    </div>
  );
};
