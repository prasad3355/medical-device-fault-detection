import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  FileDown, 
  RefreshCw, 
  ShieldCheck, 
  Sliders, 
  Clock, 
  Layers, 
  Share2,
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';
import { SensorIntelligenceChart } from '../dashboard/SensorIntelligenceChart';
import { MOCK_TELEMETRY, MOCK_DETECTED_ANOMALIES } from '../../data/mockData';
import { AnalysisRecord } from '../../types';

interface AnalysisReportProps {
  currentRecord?: AnalysisRecord;
  onNavigateToUpload: () => void;
  onNavigateToPipeline: () => void;
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({
  currentRecord,
  onNavigateToUpload,
  onNavigateToPipeline
}) => {
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const datasetName = currentRecord?.datasetName || 'ICU_MultiParameter_Telemetry_A4.csv';
  const recordCount = currentRecord?.recordsCount || 2450;
  const status = currentRecord?.deviceStatus || 'Possible Anomaly';
  const confidence = currentRecord?.confidence || 94.2;
  const risk = currentRecord?.patientRisk || 'Moderate';

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner: Analysis Completed */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 via-blue-950/30 to-[#070c17] p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Analysis Completed
              </span>
              <span className="text-xs font-mono text-slate-400">
                Latent Attention Head #4
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              Diagnostic Telemetry Report · {datasetName}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
              <span>{recordCount.toLocaleString()} records analyzed</span>
              <span>·</span>
              <span>Inference: 412ms</span>
              <span>·</span>
              <span>5 Channels</span>
              <span>·</span>
              <span>Execution ID: MF-2026-928</span>
            </div>
          </div>

          {/* Right Export Actions */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 hover:border-cyan-500/40 transition-all cursor-pointer shadow-md"
            >
              {exportSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Report Exported</span>
                </>
              ) : isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 text-cyan-400" />
                  <span>Export Engineering Report</span>
                </>
              )}
            </button>

            <button
              onClick={onNavigateToUpload}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold border border-cyan-400/30 shadow-md shadow-cyan-900/30 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>New Analysis</span>
            </button>
          </div>
        </div>
      </div>

      {/* OVERALL DEVICE STATUS - Large Tasteful Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Status Gauge Card */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-800/80 bg-gradient-to-b from-[#091122]/90 to-[#060a13] p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Primary Model Verdict
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Overall Medical Device Status
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Multi-layer Softmax Head</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center mt-6">
            {/* Left Big Status Metric */}
            <div className="sm:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <span className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <AlertTriangle className="w-8 h-8" />
                </span>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    State Classification
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {status}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                The neural feature extractor detected non-linear phase distortion across optical sensor channels. The signal indicates potential transducer degradation rather than immediate catastrophic failure.
              </p>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">PATIENT RISK LEVEL</span>
                  <span className="text-amber-400 font-bold font-sans text-sm">{risk}</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">ANOMALY CLUSTERS</span>
                  <span className="text-cyan-300 font-bold font-sans text-sm">3 Regions</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">SIGNAL QUALITY (SQI)</span>
                  <span className="text-emerald-400 font-bold font-sans text-sm">0.78 / 1.0</span>
                </div>
              </div>
            </div>

            {/* Right Large Confidence Gauge */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Classification Confidence
              </span>

              {/* Large Circular Gauge Element */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="#1e293b"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="url(#confGrad)"
                    strokeWidth="8"
                    strokeDasharray={301.6}
                    strokeDashoffset={301.6 * (1 - confidence / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="confGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold font-mono text-white tabular-nums">
                    {confidence.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-cyan-300 font-mono">
                    High Certainty
                  </span>
                </div>
              </div>

              <span className="text-[11px] text-slate-400 text-center mt-3">
                Calibrated via Monte Carlo dropout validation
              </span>
            </div>
          </div>
        </div>

        {/* Diagnostic Meta Card */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800/80 bg-gradient-to-b from-[#091122]/90 to-[#060a13] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                Hardware Device Info
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                ICU Telemetry
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Device Class</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">
                  Mindray ePM 12M Vital Signs Monitor
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Firmware Baseline</span>
                <span className="font-mono text-slate-200 mt-0.5 block">
                  FW-04.12.8 (IEC 60601-1-8 Certified)
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Telemetry Frequency</span>
                <span className="font-mono text-slate-200 mt-0.5 block">
                  100 Hz Native → Decimated to 1 Hz
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Suspected Subsystem</span>
                <span className="font-semibold text-amber-300 mt-0.5 block">
                  Optical Photoplethysmogram Sensor Cable
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={onNavigateToPipeline}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-cyan-300 transition-colors cursor-pointer"
            >
              <span>Inspect Neural Pipeline Architecture</span>
              <ChevronRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>

      {/* SENSOR INTELLIGENCE CHART */}
      <SensorIntelligenceChart telemetry={MOCK_TELEMETRY} />

      {/* DETECTED ANOMALIES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Detected Anomalies & Diagnostic Insights
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Individual interval infractions flagged by threshold and recurrent attention heads
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {MOCK_DETECTED_ANOMALIES.length} Critical Events
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_DETECTED_ANOMALIES.map((anomaly) => {
            const isCritical = anomaly.severity === 'critical';
            return (
              <div
                key={anomaly.id}
                onClick={() => setSelectedAnomalyId(anomaly.id)}
                className={`p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isCritical
                    ? 'border-red-500/30 bg-gradient-to-b from-red-950/20 to-[#070c17] hover:border-red-500/50'
                    : 'border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-[#070c17] hover:border-amber-500/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-400 block">
                      {anomaly.timestamp}
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {anomaly.parameter}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                    isCritical 
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {anomaly.severity}
                  </span>
                </div>

                <div className="mt-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400">Observed Value:</span>
                    <span className="font-mono font-bold text-white">{anomaly.observedValue}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400">Expected Normal:</span>
                    <span className="font-mono text-slate-300">{anomaly.expectedRange}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400">Neural Confidence:</span>
                    <span className="font-mono text-cyan-300 font-bold">{anomaly.confidence}%</span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-2.5">
                  <span className="font-semibold text-slate-200">Implication: </span>
                  {anomaly.implication}
                </div>

                <div className="mt-2.5 text-[11px] text-cyan-300/90 leading-relaxed bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-800/40">
                  <span className="font-bold text-cyan-200">Suggested Action: </span>
                  {anomaly.suggestedAction}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI ANALYSIS SUMMARY - Sophisticated Clinical Engineering Panel */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 via-[#091122] to-[#060a13] p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Deep Learning Synthesis & Clinical Engineering Insight
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                AI Inference Summary
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              An abnormal SpO₂ pattern was detected between 10:32 and 10:41 with a minimum trough of 88.4%, concurrent with a mild airway pressure surge (21.2 cmH₂O) and sensor temperature drift to 38.7°C. The Bi-LSTM temporal attention weights concentrate heavily on the 10:30–10:42 interval.
            </p>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              The deep learning model categorizes this event as a <strong>Possible Transducer Sensor Anomaly</strong> (94.2% confidence). The simultaneous high-frequency jitter observed in the Signal Quality Index (SQI) indicates likely optical sensor probe degradation or intermittent cable motion artifact, rather than primary hemodynamic collapse.
            </p>

            <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <Info className="w-3.5 h-3.5" />
                Note: Diagnostic decision support only. Do not treat as clinical physician diagnosis.
              </span>
              <span className="font-mono text-cyan-400">
                Model: MEDFAULT-CNN-BiLSTM-v1
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
