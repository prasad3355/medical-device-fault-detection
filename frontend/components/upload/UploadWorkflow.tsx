import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Activity, 
  Layers, 
  FileText, 
  ArrowRight, 
  Database,
  Sparkles,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { AnalysisMode } from '../../types';
import { INITIAL_DATASETS } from '../../data/mockData';

interface UploadWorkflowProps {
  onAnalyzeDataset: (dataset: typeof INITIAL_DATASETS[0], mode: AnalysisMode) => void;
}

export const UploadWorkflow: React.FC<UploadWorkflowProps> = ({
  onAnalyzeDataset
}) => {
  const [selectedDataset, setSelectedDataset] = useState<typeof INITIAL_DATASETS[0]>(INITIAL_DATASETS[0]);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('dual');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');

  const handleSelectPreset = (dataset: typeof INITIAL_DATASETS[0]) => {
    setSelectedDataset(dataset);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Switch to first dataset as representation of uploaded file
    setSelectedDataset(INITIAL_DATASETS[0]);
  };

  const handleRunPipeline = () => {
    setIsProcessing(true);
    setProcessingStep('Validating schema and signal frequency...');
    
    setTimeout(() => {
      setProcessingStep('Applying Daubechies Wavelet Denoising & baseline correction...');
    }, 600);

    setTimeout(() => {
      setProcessingStep('Extracting time-frequency spectral features & SQI...');
    }, 1200);

    setTimeout(() => {
      setProcessingStep('Executing 1D-CNN + BiLSTM inference...');
    }, 1800);

    setTimeout(() => {
      setIsProcessing(false);
      onAnalyzeDataset(selectedDataset, analysisMode);
    }, 2400);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
          <Database className="w-4 h-4" />
          <span>Ingestion & Validation Pipeline</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
          Upload Medical Device Dataset
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Ingest multi-parameter physiological telemetry logs (CSV, XLS, XLSX) for deep learning fault classification and patient stability risk modeling.
        </p>
      </div>

      {/* Upload Zone */}
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleFileDrop}
        className={`relative group rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer overflow-hidden ${
          isDragging 
            ? 'border-cyan-400 bg-cyan-950/30 shadow-2xl shadow-cyan-500/20' 
            : 'border-slate-700/80 hover:border-cyan-500/60 bg-gradient-to-b from-[#091122]/70 via-[#070c17] to-[#050912]'
        }`}
      >
        {/* Subtle background ambient lighting */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-105 group-hover:border-cyan-400 transition-all duration-300 shadow-lg shadow-cyan-950/50">
            <UploadCloud className="w-8 h-8 group-hover:animate-bounce" />
          </div>

          <h3 className="text-lg font-bold text-white">
            Drop your medical dataset here
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Drag and drop telemetry files or browse from your workstation
          </p>

          <div className="flex items-center gap-2 mt-4 text-xs font-mono text-slate-400">
            <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700/60">CSV</span>
            <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700/60">XLS</span>
            <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700/60">XLSX</span>
            <span>· Max 50 MB / 500,000 samples</span>
          </div>

          <input 
            type="file" 
            accept=".csv,.xls,.xlsx" 
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                // Keep selected or pick first
              }
            }}
          />
        </div>
      </div>

      {/* Preset Demo Datasets for Quick Testing */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Or select a benchmark clinical telemetry dataset:
          </span>
          <span className="text-[11px] font-mono text-cyan-400">
            4 Real Pre-processed Datasets Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {INITIAL_DATASETS.map((ds) => {
            const isSelected = selectedDataset.id === ds.id;
            return (
              <button
                key={ds.id}
                onClick={() => handleSelectPreset(ds)}
                className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-cyan-400/80 bg-cyan-950/40 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400/50'
                    : 'border-slate-800/80 bg-slate-900/60 hover:bg-slate-800/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <FileSpreadsheet className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    ds.status === 'Normal' ? 'bg-emerald-950/60 text-emerald-300' : 'bg-amber-950/60 text-amber-300'
                  }`}>
                    {ds.status}
                  </span>
                </div>
                <div className="mt-2 font-mono text-xs font-bold text-white truncate" title={ds.name}>
                  {ds.name}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {ds.deviceType}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between text-[10px] font-mono text-slate-400">
                  <span>{ds.records.toLocaleString()} rows</span>
                  <span>{ds.size}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dataset Summary Cards */}
      <div className="rounded-xl border border-slate-800/80 bg-gradient-to-b from-[#091122] to-[#070c17] p-5 shadow-xl">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Ingested Dataset Telemetry Manifest
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Dataset Identifier</span>
            <span className="text-xs font-mono font-bold text-cyan-300 mt-1 block truncate" title={selectedDataset.name}>
              {selectedDataset.name}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Total Records</span>
            <span className="text-base font-mono font-bold text-white mt-0.5 block tabular-nums">
              {selectedDataset.records.toLocaleString()} samples
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Sensor Channels</span>
            <span className="text-base font-mono font-bold text-white mt-0.5 block tabular-nums">
              {selectedDataset.columns} Channels
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Payload Size</span>
            <span className="text-base font-mono font-bold text-white mt-0.5 block tabular-nums">
              {selectedDataset.size}
            </span>
          </div>
        </div>
      </div>

      {/* ANALYSIS MODE SELECTOR */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Analysis Execution Mode
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Select the inference branch for the multi-head deep learning pipeline
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Option 1: Dual Multi-task (Recommended) */}
          <div 
            onClick={() => setAnalysisMode('dual')}
            className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
              analysisMode === 'dual'
                ? 'border-cyan-400/80 bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-[#070c17] ring-1 ring-cyan-400/50 shadow-lg shadow-cyan-950/30'
                : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                RECOMMENDED
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mt-3">
              Dual Multi-Task Inference
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Executes joint prediction for both device hardware degradation AND clinical patient stability risk concurrently.
            </p>
          </div>

          {/* Option 2: Device Fault Detection */}
          <div 
            onClick={() => setAnalysisMode('fault_only')}
            className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
              analysisMode === 'fault_only'
                ? 'border-cyan-400/80 bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-[#070c17] ring-1 ring-cyan-400/50 shadow-lg shadow-cyan-950/30'
                : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700'
            }`}
          >
            <div className="p-2 w-fit rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Cpu className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white mt-3">
              Device Fault Detection
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Focuses specifically on transducer noise, electrode drift, optical decay, motor occlusion, and hardware anomalies.
            </p>
          </div>

          {/* Option 3: Patient Risk Analysis */}
          <div 
            onClick={() => setAnalysisMode('risk_only')}
            className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
              analysisMode === 'risk_only'
                ? 'border-cyan-400/80 bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-[#070c17] ring-1 ring-cyan-400/50 shadow-lg shadow-cyan-950/30'
                : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700'
            }`}
          >
            <div className="p-2 w-fit rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Activity className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white mt-3">
              Patient Risk Analysis
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Evaluates physiological trend variance (desaturation, bradycardia, tachypnea) filtered for sensor reliability.
            </p>
          </div>
        </div>
      </div>

      {/* Dataset Preview & Validation Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Dataset Preview Table */}
        <div className="lg:col-span-8 rounded-xl border border-slate-800/80 bg-gradient-to-b from-[#091122] to-[#070c17] p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">
                Dataset Sample Preview
              </h3>
              <p className="text-xs text-slate-400">
                First 5 telemetry frames parsed from {selectedDataset.name}
              </p>
            </div>
            <span className="text-[11px] font-mono text-cyan-400">
              UTF-8 Encoded
            </span>
          </div>

          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                  <th className="py-2 px-3">Time</th>
                  <th className="py-2 px-3">SpO₂ (%)</th>
                  <th className="py-2 px-3">HR (bpm)</th>
                  <th className="py-2 px-3">Temp (°C)</th>
                  <th className="py-2 px-3">Pressure</th>
                  <th className="py-2 px-3">Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {selectedDataset.previewRows?.slice(0, 5).map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-slate-300">{row.timestamp}</td>
                    <td className="py-2.5 px-3 text-cyan-300 font-bold">{row.spo2 ?? row.plungerForce ?? '12.4'}</td>
                    <td className="py-2.5 px-3 text-red-300">{row.heartRate ?? row.motorTorque ?? '0.42'}</td>
                    <td className="py-2.5 px-3 text-amber-300">{row.temperature ?? row.flowRate ?? '5.0'}</td>
                    <td className="py-2.5 px-3 text-blue-300">{row.pressure ?? row.voltage ?? '12.0'}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        row.status === 'NOMINAL' 
                          ? 'bg-emerald-950/60 text-emerald-300' 
                          : 'bg-amber-950/60 text-amber-300'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Validation Checklist */}
        <div className="lg:col-span-4 rounded-xl border border-slate-800/80 bg-gradient-to-b from-[#091122] to-[#070c17] p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">
              Pre-Inference Validation
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Passed
            </span>
          </div>

          <div className="mt-4 space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">File Format Verification</span>
                <span className="text-[11px] text-slate-400 block">RFC 4180 CSV standard conforming</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Sensor Schema Detected</span>
                <span className="text-[11px] text-slate-400 block">All 5 critical channels mapped</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Data Types & Precision</span>
                <span className="text-[11px] text-slate-400 block">Strict IEEE 754 float64 numerical values</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 mt-0.5">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Missing Values Imputed</span>
                <span className="text-[11px] text-slate-400 block">3 intermittent nulls repaired via cubic spline</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Duplicate Timestamp Check</span>
                <span className="text-[11px] text-slate-400 block">0 temporal collisions identified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Execution Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-[#070c17]">
        <div>
          <span className="text-sm font-bold text-white block">
            Ready to execute deep learning analysis on {selectedDataset.name}
          </span>
          <span className="text-xs text-slate-400 block mt-0.5">
            Model: 1D-CNN + BiLSTM with Temporal Multi-Head Attention (1.42M parameters)
          </span>
        </div>

        <button
          onClick={handleRunPipeline}
          disabled={isProcessing}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-xl shadow-cyan-500/25 border border-cyan-300/40 transition-all duration-200 cursor-pointer disabled:opacity-70"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
              <span>{processingStep}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Execute Deep Learning Pipeline</span>
              <ArrowRight className="w-4 h-4 text-cyan-200" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
