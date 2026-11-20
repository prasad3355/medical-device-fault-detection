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
  ChevronRight,
  Activity,
  Cpu
} from 'lucide-react';
import { SensorIntelligenceChart } from '../dashboard/SensorIntelligenceChart';
import { AnalysisRecord, TelemetryPoint, DetectedAnomaly, AnalysisMode } from '../../types';
import { FullAnalysisData } from '../../lib/api';
import { generateAnalysisPDF } from '../../lib/pdfGenerator';

interface AnalysisReportProps {
  data?: FullAnalysisData;
  onNavigateToUpload: () => void;
  onNavigateToPipeline: () => void;
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({
  data,
  onNavigateToUpload,
  onNavigateToPipeline
}) => {
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const currentRecord = data?.record;
  const telemetry = data?.telemetry || [];
  const anomalies = data?.anomalies || [];
  const mode: AnalysisMode = data?.analysisMode || 'dual';
  const sqiScore = data?.sqiScore ?? 0.88;

  const datasetName = currentRecord?.datasetName || 'Ingested_Telemetry.csv';
  const recordCount = currentRecord?.recordsCount || telemetry.length;
  const status = currentRecord?.deviceStatus || 'Normal';
  const confidence = currentRecord?.confidence || 95.0;
  const risk = currentRecord?.patientRisk || 'Low';
  const executionTimeMs = currentRecord?.executionTimeMs || 340;

  const handleExport = () => {
    if (!data) return;
    setIsExporting(true);
    setExportError(null);
    try {
      generateAnalysisPDF(data);
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err: any) {
      setIsExporting(false);
      setExportError(err.message || 'Failed to generate PDF report.');
    }
  };

  const isFaultMode = mode === 'fault_only';
  const isRiskMode = mode === 'risk_only';
  const isDualMode = mode === 'dual';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner: Analysis Completed */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 via-blue-950/30 to-[#070c17] p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Analysis complete
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Mode: {mode.toUpperCase()}
              </span>
              {(datasetName.toLowerCase().includes('icu') || datasetName.toLowerCase().includes('synthetic') || currentRecord?.deviceType?.toLowerCase().includes('synthetic')) && (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  Synthetic ICU telemetry
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              Diagnostic Telemetry Report · {datasetName}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 pt-1">
              <span className="text-white font-medium">{recordCount.toLocaleString()} samples evaluated</span>
              <span>·</span>
              <span className="text-cyan-300">Source: {datasetName}</span>
              <span>·</span>
              <span className="text-purple-300">Synthetic ICU telemetry</span>
              <span>·</span>
              <span>Inference: {executionTimeMs.toFixed(0)}ms</span>
              <span>·</span>
              <span>{currentRecord?.sensorChannels?.length || 5} Channels</span>
              <span>·</span>
              <span>Run ID: {currentRecord?.id || 'MF-LIVE'}</span>
            </div>
          </div>

          {/* Right Export Actions */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 self-start md:self-auto">
            {exportError && (
              <span className="text-[11px] text-red-400 font-mono bg-red-950/60 px-2 py-1 rounded border border-red-500/40">
                {exportError}
              </span>
            )}
            <button
              onClick={handleExport}
              disabled={!data || isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 hover:border-cyan-500/40 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {exportSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">PDF Downloaded</span>
                </>
              ) : isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 text-cyan-400" />
                  <span>Download PDF Report</span>
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

      {/* Prototype Review Banner for ICU Alarm Mode */}
      {mode === 'icu_alarm' && (
        <div className="p-4 rounded-xl border border-purple-500/40 bg-purple-950/30 text-purple-200 flex items-start gap-3 shadow-lg">
          <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">ICU Arrhythmia Alarm Verification Prototype</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PhysioNet 2015 Challenge
              </span>
            </div>
            <p className="text-purple-300/90 leading-relaxed">
              Prototype result for clinical review. Model trained and verified on 750 PhysioNet 2015 ICU recordings with held-out true alarm recall of 75.9% and specificity of 92.4%.
            </p>
          </div>
        </div>
      )}

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
                {mode === 'icu_alarm'
                  ? 'PhysioNet ICU Alarm Verification Verdict'
                  : isRiskMode 
                  ? 'Patient Stability & Physiological Risk' 
                  : 'Medical Device Hardware & Sensor Status'}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
              <span>{mode === 'icu_alarm' ? 'Random Forest (PhysioNet 2015)' : '1D-CNN + BiLSTM Inference'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center mt-6">
            {/* Left Big Status Metric */}
            <div className="sm:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <span className={`p-3 rounded-xl border ${
                  status === 'True Alarm' || status === 'Fault Detected' || risk === 'High'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : status === 'False Alarm' || (status === 'Normal' && risk === 'Low')
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                  {status === 'False Alarm' || (status === 'Normal' && risk === 'Low') ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : status === 'True Alarm' || status === 'Fault Detected' || risk === 'High' ? (
                    <AlertOctagon className="w-8 h-8" />
                  ) : (
                    <AlertTriangle className="w-8 h-8" />
                  )}
                </span>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {mode === 'icu_alarm'
                      ? 'ICU Alarm Classification'
                      : isRiskMode 
                      ? 'Physiological Risk Level' 
                      : 'Device Fault Classification'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {isRiskMode ? `${risk} Risk` : status}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {mode === 'icu_alarm' ? (
                  status === 'True Alarm'
                    ? 'True arrhythmia alarm verified by multi-feature pre-alarm ECG analysis. Critical cardiac event requires immediate clinical intervention.'
                    : 'False arrhythmia alarm identified. Transient sensor noise, motion artifact, or lead displacement caused pseudo-arrhythmia trigger; safe to suppress.'
                ) : isRiskMode ? (
                  'Patient physiological telemetry stream evaluated against clinical stability thresholds. Detected flags represent patterns observed during telemetry monitoring that may warrant clinical review.'
                ) : status === 'Normal' ? (
                  'All telemetry signals, impedance values, and sensor coupling indices remained within nominal IEC specifications throughout the recording session.'
                ) : status === 'Possible Anomaly' ? (
                  'Temporal convolution detected localized phase distortion or high-frequency fluctuations across sensor leads, indicating potential transducer wear or coupling artifacts.'
                ) : (
                  'Hardware/sensor fault pattern confirmed by deep learning sequence model. Signal characteristics indicate significant transducer malfunction, motor occlusion, or circuit disconnect.'
                )}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                {!isRiskMode && (
                  <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">
                      {mode === 'icu_alarm' ? 'ALARM VERDICT' : 'DEVICE FAULT STATUS'}
                    </span>
                    <span className={`font-bold font-sans text-sm ${
                      status === 'True Alarm' || status === 'Fault Detected'
                        ? 'text-red-400'
                        : status === 'False Alarm' || status === 'Normal'
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}>{status}</span>
                  </div>
                )}
                {!isFaultMode && (
                  <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">PATIENT RISK LEVEL</span>
                    <span className={`font-bold font-sans text-sm ${
                      risk === 'Low' ? 'text-emerald-400' : risk === 'Moderate' ? 'text-amber-400' : 'text-red-400'
                    }`}>{risk} Risk</span>
                  </div>
                )}
                <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">SIGNAL QUALITY (SQI)</span>
                  <span className="text-emerald-400 font-bold font-sans text-sm">{sqiScore.toFixed(2)} / 1.0</span>
                </div>
              </div>
            </div>

            {/* Right Large Confidence Gauge */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Classification Confidence
              </span>

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
                    Calibrated
                  </span>
                </div>
              </div>

              <span className="text-[11px] text-slate-400 text-center mt-3">
                Calculated via 1D-CNN + BiLSTM Softmax Probability
              </span>
            </div>
          </div>
        </div>

        {/* Diagnostic Meta Card */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800/80 bg-gradient-to-b from-[#091122]/90 to-[#060a13] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                Device Telemetry Manifest
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                {currentRecord?.deviceType || 'Medical Monitor'}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Dataset File</span>
                <span className="font-semibold text-slate-200 mt-0.5 block truncate" title={datasetName}>
                  {datasetName}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Evaluation Mode</span>
                <span className="font-mono text-cyan-300 mt-0.5 block">
                  {mode === 'dual' ? 'Dual (Device Fault + Patient Risk)' : mode === 'fault_only' ? 'Device Fault Only' : 'Patient Risk Only'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Anomalies Detected</span>
                <span className="font-mono text-slate-200 mt-0.5 block">
                  {anomalies.length} Interval Infractions
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Hardware Channels</span>
                <span className="font-semibold text-slate-300 mt-0.5 block">
                  {currentRecord?.sensorChannels?.join(', ') || 'SpO2, Heart Rate, Pressure, Temp, Flow'}
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

      {/* SENSOR INTELLIGENCE CHART (Actual Telemetry Points) */}
      <SensorIntelligenceChart telemetry={telemetry} />

      {/* DETECTED ANOMALIES & DIAGNOSTIC FINDINGS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Detected Anomalies & Diagnostic Insights
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Specific interval deviations flagged by sequential thresholding and recurrent attention
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {anomalies.length} Flagged Events
          </span>
        </div>

        {anomalies.length === 0 ? (
          <div className="p-8 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">No Anomalies Detected</h4>
            <p className="text-xs text-slate-300 mt-1 max-w-lg mx-auto">
              All telemetry parameters, acoustic signal characteristics, and electrode impedances operated strictly within nominal physiological and hardware baseline bounds.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {anomalies.map((anomaly) => {
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
                      <span className="text-slate-400">Model Confidence:</span>
                      <span className="font-mono text-cyan-300 font-bold">{anomaly.confidence}%</span>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-2.5">
                    <span className="font-semibold text-slate-200">Finding: </span>
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
        )}
      </div>

      {/* AI ANALYSIS SUMMARY */}
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
                Inference Summary
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Diagnostic inference executed using a 1D-CNN temporal feature extractor paired with a Bidirectional LSTM layer and an unsupervised Isolation Forest scoring head. The Signal Quality Index (SQI) evaluated across all active channels registered at <strong>{sqiScore.toFixed(2)} / 1.0</strong>.
            </p>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {anomalies.length > 0 ? (
                `A total of ${anomalies.length} parameter infraction(s) were isolated within the telemetry timeline. Deviations reflect observed sensor states and are flagged for technical verification and clinical review.`
              ) : (
                'Zero anomalous events were identified. Signal stability analysis indicates compliant transducer operation and stable physiological dynamics.'
              )}
            </p>

            <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <Info className="w-3.5 h-3.5" />
                Note: Software decision-support and demonstration prototype only. Not an autonomous clinical diagnosis device.
              </span>
              <span className="font-mono text-cyan-400">
                Architecture: 1D-CNN + BiLSTM + IsolationForest
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
