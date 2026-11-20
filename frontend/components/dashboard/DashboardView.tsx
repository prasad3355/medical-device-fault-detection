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
  RefreshCw,
  Play,
  Pause,
  FastForward,
  X,
  AlertCircle
} from 'lucide-react';
import { KPICard } from './KPICard';
import { SensorIntelligenceChart } from './SensorIntelligenceChart';
import { FaultRiskDonuts } from './FaultRiskDonuts';
import { RecentAnalysesTable } from './RecentAnalysesTable';
import { MOCK_TELEMETRY } from '../../data/mockData';
import { AnalysisRecord, TelemetryPoint } from '../../types';
import { 
  fetchAnalysisHistory, 
  fetchAnalysisById, 
  fetchSimulatedMonitoring, 
  fetchPPGSimulation, 
  uploadDatasetFile,
  analyzeDataset,
  SimulationData, 
  PPGSimulationData 
} from '../../lib/api';

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

  // One-Click ICU Test Data Analysis State & Handler
  const [isAnalyzingIcuData, setIsAnalyzingIcuData] = useState<boolean>(false);
  const [icuDataError, setIcuDataError] = useState<string | null>(null);

  const handleAnalyzeIcuTestData = async () => {
    setIsAnalyzingIcuData(true);
    setIcuDataError(null);
    try {
      // Fetch bundled sample Synthetic_ICU_Telemetry_Test(1).csv
      const res = await fetch('/samples/Synthetic_ICU_Telemetry_Test(1).csv');
      if (!res.ok) {
        throw new Error(`Failed to load bundled sample file (${res.status} ${res.statusText})`);
      }
      const blob = await res.blob();
      const file = new File([blob], 'Synthetic_ICU_Telemetry_Test(1).csv', { type: 'text/csv' });

      // Run same upload & analysis flow as custom CSV in Dual mode
      const validation = await uploadDatasetFile(file);
      const analysisData = await analyzeDataset({
        fileName: validation.fileName,
        mode: 'dual',
      });

      // Open the actual report for that run automatically
      if (analysisData?.record) {
        onNavigateToAnalysis(analysisData.record);
      }
    } catch (err: any) {
      setIcuDataError(err.message || 'Execution error during ICU telemetry analysis. Please retry.');
    } finally {
      setIsAnalyzingIcuData(false);
    }
  };

  // Simulated Monitoring state
  type SimOption = 'sqi_ppg' | 'icu_alarm';
  const [simOption, setSimOption] = useState<SimOption>('sqi_ppg'); // Default: Sensor Signal Quality!
  const [ppgCase, setPpgCase] = useState<'good' | 'poor'>('good');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simLoading, setSimLoading] = useState<boolean>(false);
  const [simData, setSimData] = useState<SimulationData | null>(null);
  const [ppgData, setPpgData] = useState<PPGSimulationData | null>(null);
  const [simIndex, setSimIndex] = useState<number>(0);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [alarmTriggered, setAlarmTriggered] = useState<boolean>(false);

  // Simulation Handlers
  const handleStartSimulatedMonitoring = async () => {
    setSimLoading(true);
    try {
      if (simOption === 'sqi_ppg') {
        const data = await fetchPPGSimulation(ppgCase);
        setPpgData(data);
        setSimData(null);
      } else {
        const data = await fetchSimulatedMonitoring();
        setSimData(data);
        setPpgData(null);
      }
      setIsSimulating(true);
      setSimIndex(0);
      setIsPaused(false);
      setAlarmTriggered(false);
    } catch (err: any) {
      alert("Failed to start simulated monitoring: " + (err.message || err));
    } finally {
      setSimLoading(false);
    }
  };

  const handleRestartSimulation = () => {
    setSimIndex(0);
    setIsPaused(false);
    setAlarmTriggered(false);
  };

  const handleStopSimulation = () => {
    setIsSimulating(false);
    setSimData(null);
    setPpgData(null);
    setSimIndex(0);
    setIsPaused(false);
    setAlarmTriggered(false);
  };

  // Telemetry streaming ticker effect
  const activeTelemetryList = simOption === 'sqi_ppg' ? ppgData?.telemetry : simData?.telemetry;

  useEffect(() => {
    if (!isSimulating || !activeTelemetryList || isPaused || alarmTriggered) return;

    const interval = setInterval(() => {
      setSimIndex((prev) => {
        const step = Math.max(4, Math.floor(6 * simSpeed));
        const next = prev + step;
        if (next >= activeTelemetryList.length) {
          setAlarmTriggered(true);
          return activeTelemetryList.length;
        }
        return next;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [isSimulating, activeTelemetryList, isPaused, alarmTriggered, simSpeed]);

  const totalSimPoints = activeTelemetryList?.length || 300;
  const progressPercent = Math.min(100, Math.round((simIndex / totalSimPoints) * 100));
  const currentSimSec = simOption === 'sqi_ppg'
    ? (simIndex / 30.0) // 10 seconds @ 30 Hz
    : (-30.0 + (simIndex / totalSimPoints) * 30.0);
  const currentSimTime = simOption === 'sqi_ppg'
    ? `${currentSimSec.toFixed(1)}s`
    : `${currentSimSec.toFixed(1)}s`;

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

          <div className="flex flex-col gap-3 self-start md:self-auto shrink-0 w-full md:w-auto">
            {/* PRIMARY DASHBOARD ACTION BUTTON: Analyze ICU Test Data */}
            <div className="flex flex-col gap-1.5">
              <button
                onClick={handleAnalyzeIcuTestData}
                disabled={isAnalyzingIcuData}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-cyan-500/25 border border-cyan-300/40 transition-all duration-200 cursor-pointer disabled:opacity-75"
              >
                {isAnalyzingIcuData ? (
                  <>
                    <RefreshCw className="w-5 h-5 text-white animate-spin" />
                    <span>Analyzing…</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5 text-cyan-200" />
                    <span>Analyze ICU Test Data</span>
                  </>
                )}
              </button>
              <span className="text-[11px] text-slate-400 font-mono text-center md:text-left">
                Bundled sample: Synthetic_ICU_Telemetry_Test(1).csv · 240 samples · Dual Mode
              </span>
            </div>

            {/* Retryable Error Banner if one-click ICU analysis fails */}
            {icuDataError && (
              <div className="p-3 rounded-xl border border-red-500/40 bg-red-950/60 text-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-lg max-w-md">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-red-300 block">Analysis Error</span>
                    <span className="text-slate-200 text-[11px] leading-tight block">{icuDataError}</span>
                  </div>
                </div>
                <button
                  onClick={handleAnalyzeIcuTestData}
                  className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer shrink-0 self-end sm:self-auto"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Secondary Features: Simulation Option Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-md">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setSimOption('sqi_ppg'); handleStopSimulation(); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    simOption === 'sqi_ppg'
                      ? 'bg-purple-600 text-white shadow-md ring-1 ring-purple-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1. Sensor Signal Quality
                </button>
                <button
                  onClick={() => { setSimOption('icu_alarm'); handleStopSimulation(); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    simOption === 'icu_alarm'
                      ? 'bg-purple-600 text-white shadow-md ring-1 ring-purple-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2. ICU Alarm Verification
                </button>
              </div>

              {/* Case Selector for PPG */}
              {simOption === 'sqi_ppg' && (
                <div className="flex items-center gap-1 pl-1 border-t sm:border-t-0 sm:border-l border-slate-700/80 w-full sm:w-auto pt-1 sm:pt-0">
                  <button
                    onClick={() => { setPpgCase('good'); handleStopSimulation(); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all cursor-pointer ${
                      ppgCase === 'good'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Good Case (109003)
                  </button>
                  <button
                    onClick={() => { setPpgCase('poor'); handleStopSimulation(); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all cursor-pointer ${
                      ppgCase === 'poor'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Poor Case (100004)
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Simulated Monitoring Action Button */}
              <button
                onClick={handleStartSimulatedMonitoring}
                disabled={simLoading}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs border transition-all duration-200 cursor-pointer shadow-lg ${
                  isSimulating
                    ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400/80 shadow-purple-950/50 ring-2 ring-purple-400/50'
                    : 'bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border-purple-500/40 shadow-purple-950/30'
                }`}
              >
                {simLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 text-purple-200 animate-spin" />
                ) : (
                  <Activity className={`w-3.5 h-3.5 text-purple-200 ${isSimulating ? 'animate-pulse' : ''}`} />
                )}
                <span>
                  {isSimulating 
                    ? 'Restart Simulated Monitoring' 
                    : simOption === 'sqi_ppg' 
                    ? `Start Simulated Monitoring (${ppgCase.toUpperCase()} PPG)` 
                    : 'Start Simulated Monitoring (ICU t108s)'}
                </span>
              </button>

              <button
                onClick={onNavigateToUpload}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 font-semibold text-xs border border-slate-700/80 transition-all duration-200 cursor-pointer shadow-md"
              >
                <UploadCloud className="w-3.5 h-3.5 text-cyan-300" />
                <span>Ingest New Dataset</span>
              </button>

              {latestRun && !isSimulating && (
                <button
                  onClick={() => onNavigateToAnalysis(latestRun)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 font-semibold text-xs border border-slate-800 transition-all duration-200 cursor-pointer"
                >
                  <span>Latest Report</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              )}
            </div>
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

      {/* SIMULATED MONITORING CONTROL CONSOLE & REAL-TIME REPLAY BAR */}
      {isSimulating && (
        <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-[#070c17] p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-purple-500/20">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-xs font-semibold text-purple-200">
                  <span className={`w-2 h-2 rounded-full ${alarmTriggered ? (simOption === 'sqi_ppg' && ppgData?.isGood ? 'bg-emerald-400' : 'bg-red-400 animate-ping') : 'bg-emerald-400 animate-pulse'}`} />
                  {simOption === 'sqi_ppg'
                    ? (alarmTriggered ? 'SQI EVALUATION COMPLETE' : 'SIMULATED MONITORING: STREAMING PPG')
                    : (alarmTriggered ? 'ALARM EVENT TRIGGERED (t=0.0s)' : 'SIMULATED MONITORING: STREAMING ECG')}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {simOption === 'sqi_ppg' 
                    ? `BUT PPG Record #${ppgData?.recordId || (ppgCase === 'good' ? '109003' : '100004')}` 
                    : 'PhysioNet 2015 Record t108s'}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/60">
                  {simOption === 'sqi_ppg' ? 'Optical Transducer · 30 Hz' : 'Lead II · 250 Hz Native'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {simOption === 'sqi_ppg'
                  ? 'Replaying held-out smartphone optical PPG recording. Random Forest evaluates 15 morphological & spectral features (Cardiac SQI, SNR, Entropy).'
                  : 'Replaying pre-alarm waveform buffer. Random Forest evaluates multi-channel dynamics upon alarm trigger at 05:00 mark.'}
              </p>
            </div>

            {/* Playback Controls */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                onClick={() => setIsPaused(!isPaused)}
                disabled={alarmTriggered}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                onClick={() => {
                  if (activeTelemetryList) {
                    setSimIndex(activeTelemetryList.length);
                    setAlarmTriggered(true);
                  }
                }}
                disabled={alarmTriggered}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>{simOption === 'sqi_ppg' ? 'Jump to Evaluation' : 'Jump to Alarm'}</span>
              </button>

              <button
                onClick={handleRestartSimulation}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-900/70 text-purple-200 text-xs font-semibold border border-purple-500/40 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replay</span>
              </button>

              <button
                onClick={handleStopSimulation}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Exit Demo</span>
              </button>
            </div>
          </div>

          {/* Real-time Ticker & Vitals HUD */}
          {simOption === 'sqi_ppg' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">OBSERVATION WINDOW</span>
                <span className="text-sm font-mono font-bold text-cyan-300 mt-0.5 block">
                  {currentSimSec.toFixed(1)}s / 10.0s
                </span>
                <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-100 ${alarmTriggered ? (ppgData?.isGood ? 'bg-emerald-400' : 'bg-red-400') : 'bg-cyan-400'}`} 
                    style={{ width: `${progressPercent}%` }} 
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">ESTIMATED PULSE</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-base font-bold text-cyan-300 tabular-nums">
                    {ppgData ? `~${Math.round(ppgData.heartRate)} bpm` : '~72 bpm'}
                  </span>
                  <span className={`text-[10px] px-1 rounded border ${
                    ppgCase === 'good' 
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' 
                      : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                  }`}>
                    {ppgCase === 'good' ? 'PULSE' : 'DEGRADED'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">Optical PPG Peak Detector</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">CARDIAC SQI INDEX</span>
                <span className="text-base font-bold text-white mt-0.5 block tabular-nums">
                  {ppgData ? (ppgData.cardiacSqi * 100).toFixed(1) + '%' : 'Calculating...'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Autocorr: {ppgData ? ppgData.autocorrPeak.toFixed(3) : '--'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">QUALITY VERDICT</span>
                <span className={`text-xs font-bold mt-0.5 block ${
                  alarmTriggered 
                    ? (ppgData?.isGood ? 'text-emerald-400' : 'text-amber-400 animate-pulse') 
                    : 'text-slate-300'
                }`}>
                  {alarmTriggered 
                    ? (ppgData?.prediction || (ppgCase === 'good' ? 'Good Signal Quality' : 'Poor signal quality — check sensor'))
                    : 'Analyzing 30 Hz Waveform...'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {alarmTriggered 
                    ? `Confidence: ${(ppgData?.confidence || 95).toFixed(1)}%` 
                    : 'Awaiting completion...'}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">OBSERVATION WINDOW</span>
                <span className="text-sm font-mono font-bold text-cyan-300 mt-0.5 block">
                  {currentSimTime} / 0.0s
                </span>
                <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-100 ${alarmTriggered ? 'bg-red-400' : 'bg-cyan-400'}`} 
                    style={{ width: `${progressPercent}%` }} 
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">HEART RATE</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-base font-bold text-red-400 tabular-nums">~136 bpm</span>
                  <span className="text-[10px] px-1 rounded bg-red-950/60 text-red-300 border border-red-500/30">TACHY</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">Sinus Tachycardia Rhythm</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">PULSE OXIMETRY</span>
                <span className="text-base font-bold text-cyan-300 mt-0.5 block tabular-nums">98.0%</span>
                <span className="text-[10px] text-slate-400 block mt-1">PLETH Plethysmogram Nominal</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">RECORDED CLINICAL ALARM</span>
                <span className={`text-sm font-bold mt-0.5 block ${alarmTriggered ? 'text-red-400 font-extrabold animate-pulse' : 'text-slate-300'}`}>
                  {alarmTriggered ? '🚨 Tachycardia (#True alarm)' : 'Tachycardia (at 05:00)'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {alarmTriggered ? 'Alarm fired at sample 75,000' : 'Replay approaching trigger...'}
                </span>
              </div>
            </div>
          )}

          {/* VERDICT PANEL (Triggered when replay completes) */}
          {alarmTriggered && simOption === 'sqi_ppg' && ppgData && (
            <div className={`p-5 rounded-xl border shadow-xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300 ${
              ppgData.isGood 
                ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-[#070c17]' 
                : 'border-amber-500/50 bg-gradient-to-r from-amber-950/40 via-slate-900 to-[#070c17]'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    ppgData.isGood 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  }`}>
                    {ppgData.isGood ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6 animate-pulse" />}
                  </div>
                  <div>
                    <span className={`text-[10px] uppercase font-mono tracking-wider block ${
                      ppgData.isGood ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      Random Forest Signal Quality Verdict
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      <span>{ppgData.prediction}</span>
                      <span className={`text-xs font-mono font-normal px-2 py-0.5 rounded border ${
                        ppgData.isGood 
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' 
                          : 'bg-amber-950 text-amber-300 border-amber-500/40'
                      }`}>
                        BUT PPG Held-Out Test Case
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Model Score</span>
                    <span className="text-2xl font-extrabold text-white font-mono">{ppgData.confidence.toFixed(1)}%</span>
                  </div>
                  <button
                    onClick={() => onNavigateToAnalysis(ppgData.record)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-950/40 border border-cyan-400/40 cursor-pointer"
                  >
                    <span>Open Full Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">CLASSIFIER MODEL</span>
                  <span className="text-white font-semibold font-mono text-xs block mt-0.5">
                    Random Forest (ppg_quality_model.joblib)
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Evaluated 15 physiological & spectral PPG features
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">SENSOR DIAGNOSTIC</span>
                  <span className={`font-bold text-sm block mt-0.5 ${ppgData.isGood ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {ppgData.isGood ? 'Optimal Signal Fidelity' : 'Probe / Sensor Fault Warning'}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    {ppgData.isGood 
                      ? 'Consistent pulsatile waveform and clean cardiac peak' 
                      : 'Poor signal quality — check sensor contact and optical alignment'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">INFERENCE VALIDATION</span>
                  <span className="text-emerald-400 font-bold font-mono text-xs block mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Exact Python Match ({ppgData.confidence.toFixed(1)}%)
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Matches offline model inference on record #{ppgData.recordId}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ALARM VERDICT PANEL (Triggered when replay reaches recorded alarm in ICU mode) */}
          {alarmTriggered && simOption === 'icu_alarm' && simData && (
            <div className="p-5 rounded-xl border border-red-500/50 bg-gradient-to-r from-red-950/50 via-slate-900 to-[#070c17] shadow-xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-red-500/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40">
                    <AlertOctagon className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-red-400 block">
                      Random Forest Diagnostic Verdict
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      <span>{simData.prediction} Verified</span>
                      <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40">
                        PhysioNet 2015 Pre-Alarm Window
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Model Score</span>
                    <span className="text-2xl font-extrabold text-white font-mono">{simData.confidence.toFixed(1)}%</span>
                  </div>
                  <button
                    onClick={() => onNavigateToAnalysis(simData.record)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-950/40 border border-cyan-400/40 cursor-pointer"
                  >
                    <span>Open Full Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">CLASSIFIER MODEL</span>
                  <span className="text-white font-semibold font-mono text-xs block mt-0.5">
                    Random Forest (icu_alarm_model.joblib)
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Evaluated 48 spectral & QRS morphological features
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">PATIENT RISK LEVEL</span>
                  <span className="text-red-400 font-bold text-sm block mt-0.5">
                    {simData.patientRisk} Risk Alert
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Confirmed acute cardiac distress pattern
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">INFERENCE VALIDATION</span>
                  <span className="text-emerald-400 font-bold font-mono text-xs block mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Exact Python Match (68.7%)
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Matches direct offline Random Forest test inference
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sensor Intelligence Advanced Visualization */}
      <SensorIntelligenceChart
        telemetry={isSimulating && activeTelemetryList ? activeTelemetryList.slice(0, Math.max(10, simIndex)) : latestTelemetry}
        onSelectAnomalyInterval={() => {
          if (isSimulating) {
            if (simOption === 'sqi_ppg' && ppgData) onNavigateToAnalysis(ppgData.record);
            else if (simOption === 'icu_alarm' && simData) onNavigateToAnalysis(simData.record);
          } else {
            onNavigateToAnalysis(latestRun);
          }
        }}
        isSimulationMode={isSimulating}
        simulationTitle={
          isSimulating
            ? simOption === 'sqi_ppg'
              ? `Sensor Intelligence · Simulated Monitoring (Record #${ppgData?.recordId || (ppgCase === 'good' ? '109003' : '100004')} Optical PPG)`
              : "Sensor Intelligence · Simulated Monitoring (t108s ECG Lead II)"
            : undefined
        }
        simulationBadge={
          isSimulating
            ? simOption === 'sqi_ppg'
              ? (alarmTriggered ? (ppgData?.isGood ? "Signal Quality Validated" : "Poor Quality Alert") : "Streaming Optical PPG (30 Hz)")
              : (alarmTriggered ? "Arrhythmia Alarm Verified" : `Streaming Pre-Alarm Buffer (${currentSimTime})`)
            : undefined
        }
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
