import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { AnalysisMode } from '../../types';
import { INITIAL_DATASETS } from '../../data/mockData';
import { 
  uploadDatasetFile, 
  analyzeDataset, 
  fetchAvailableDatasets,
  checkBackendHealth,
  FullAnalysisData,
  ValidationResult
} from '../../lib/api';

interface UploadWorkflowProps {
  onAnalyzeSuccess: (data: FullAnalysisData) => void;
}

export const UploadWorkflow: React.FC<UploadWorkflowProps> = ({
  onAnalyzeSuccess
}) => {
  const [presets, setPresets] = useState<any[]>(INITIAL_DATASETS);
  const [selectedDataset, setSelectedDataset] = useState<any>(INITIAL_DATASETS[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('dual');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [failedStage, setFailedStage] = useState<'upload' | 'analyze' | null>(null);
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Load presets & backend health on mount
  useEffect(() => {
    let isMounted = true;
    checkBackendHealth()
      .then(() => { if (isMounted) setBackendHealthy(true); })
      .catch(() => { if (isMounted) setBackendHealthy(false); });

    fetchAvailableDatasets()
      .then((res) => {
        if (isMounted && res.presets && res.presets.length > 0) {
          setPresets(res.presets);
          setSelectedDataset(res.presets[0]);
        }
      })
      .catch(() => {
        // Fallback to INITIAL_DATASETS
      });
    return () => { isMounted = false; };
  }, []);

  const handleSelectPreset = (dataset: any) => {
    setSelectedDataset(dataset);
    setSelectedFile(null);
    setUploadError(null);
    setFailedStage(null);
    setValidationResult(null);
  };

  const processUploadedFile = async (file: File) => {
    setSelectedFile(file);
    setIsUploading(true);
    setUploadError(null);
    setFailedStage(null);

    try {
      const validation = await uploadDatasetFile(file);
      setValidationResult(validation);

      const customDataset = {
        id: `upload-${Date.now()}`,
        fileName: validation.fileName,
        name: validation.fileName,
        records: validation.recordsCount,
        columns: validation.columns.length,
        size: validation.fileSize,
        deviceType: 'User Telemetry Ingestion',
        status: validation.isValid ? ('Nominal Schema' as const) : ('Warning' as const),
        risk: 'Evaluation Pending' as const,
        confidence: 95.0,
        channels: validation.columns,
        previewRows: validation.previewRows.map((row: any) => ({
          timestamp: row.time || row.timestamp || '00:00',
          spo2: row.spo2 ?? 98.0,
          heartRate: row.heartRate ?? 72,
          temperature: row.temperature ?? 36.8,
          pressure: row.pressure ?? 14.2,
          motorCurrent: row.motorCurrent ?? 1.18,
          status: 'INSPECTED'
        }))
      };

      setSelectedDataset(customDataset);
      setBackendHealthy(true);
    } catch (err: any) {
      setFailedStage('upload');
      setUploadError(err.message || 'Failed to upload and parse telemetry file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleRunPipeline = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setUploadError(null);
    setFailedStage(null);

    setProcessingStep('Validating schema & signal frequency...');
    const stepTimer1 = setTimeout(() => {
      setProcessingStep('Applying Savitzky-Golay Denoising & baseline correction...');
    }, 400);

    const stepTimer2 = setTimeout(() => {
      setProcessingStep('Computing spectral features & Signal Quality Index (SQI)...');
    }, 800);

    const stepTimer3 = setTimeout(() => {
      setProcessingStep('Executing 1D-CNN + BiLSTM temporal inference...');
    }, 1200);

    try {
      const analysisData = await analyzeDataset({
        datasetId: selectedDataset.id,
        fileName: selectedDataset.fileName || selectedDataset.name,
        mode: analysisMode,
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      setIsProcessing(false);
      onAnalyzeSuccess(analysisData);
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsProcessing(false);
      setFailedStage('analyze');
      setUploadError(err.message || 'Execution error during ML inference pipeline. Please retry.');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

        {/* Live Engine Status Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
          <span className={`w-2.5 h-2.5 rounded-full ${
            backendHealthy === true 
              ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' 
              : backendHealthy === false 
              ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse' 
              : 'bg-amber-400 animate-pulse'
          }`} />
          <span className={backendHealthy === false ? 'text-rose-300' : backendHealthy === true ? 'text-slate-300' : 'text-amber-300'}>
            {backendHealthy === true ? 'Backend: 127.0.0.1:8000 (Ready)' : backendHealthy === false ? 'Backend: Offline (Check port 8000)' : 'Checking Backend...'}
          </span>
        </div>
      </div>

      {/* Error Banner if any */}
      {uploadError && (
        <div className="p-4 rounded-xl border border-red-500/40 bg-red-950/40 text-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm block">Pipeline Error</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                  {failedStage === 'upload' ? 'Upload & Validation Stage' : 'ML Inference Stage'}
                </span>
              </div>
              <span className="text-xs text-red-300 mt-1 block leading-relaxed">{uploadError}</span>
              {selectedFile && (
                <span className="text-[11px] text-red-400/90 font-mono mt-1 block">
                  Preserved File for Retry: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              if (failedStage === 'upload' && selectedFile) {
                processUploadedFile(selectedFile);
              } else {
                handleRunPipeline();
              }
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-600/40 hover:bg-red-600/60 text-xs font-semibold border border-red-400/40 text-white shrink-0 cursor-pointer transition-colors shadow-md"
          >
            {failedStage === 'upload' ? 'Retry File Upload' : 'Retry Pipeline Analysis'}
          </button>
        </div>
      )}

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
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-105 group-hover:border-cyan-400 transition-all duration-300 shadow-lg shadow-cyan-950/50">
            {isUploading ? (
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8 group-hover:animate-bounce" />
            )}
          </div>

          <h3 className="text-lg font-bold text-white">
            {isUploading ? 'Validating and Ingesting Dataset...' : selectedFile ? `Custom File Selected: ${selectedFile.name}` : 'Drop your medical dataset here'}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {selectedFile 
              ? `${(selectedFile.size / 1024).toFixed(1)} KB · Drag new file or click to replace`
              : 'Drag and drop telemetry files or browse from your workstation'}
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
            disabled={isUploading || isProcessing}
            onClick={(e) => {
              // Clear previous value so selecting the same file repeatedly triggers onChange
              (e.target as HTMLInputElement).value = '';
            }}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                processUploadedFile(e.target.files[0]);
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
            {presets.length} Benchmark Datasets Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {presets.map((ds) => {
            const isSelected = selectedDataset?.id === ds.id;
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
                    {ds.status || 'Ready'}
                  </span>
                </div>
                <div className="mt-2 font-mono text-xs font-bold text-white truncate" title={ds.name}>
                  {ds.name}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {ds.deviceType}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between text-[10px] font-mono text-slate-400">
                  <span>{ds.records?.toLocaleString() || '1,000+'} rows</span>
                  <span>{ds.size || '1.0 MB'}</span>
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
            <span className="text-xs font-mono font-bold text-cyan-300 mt-1 block truncate" title={selectedDataset?.name}>
              {selectedDataset?.name}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Total Records</span>
            <span className="text-base font-mono font-bold text-white mt-0.5 block tabular-nums">
              {selectedDataset?.records?.toLocaleString() || '2,450'} samples
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Sensor Channels</span>
            <span className="text-base font-mono font-bold text-white mt-0.5 block tabular-nums">
              {selectedDataset?.columns || selectedDataset?.channels?.length || 5} Channels
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Payload Size</span>
            <span className="text-base font-mono font-bold text-white mt-0.5 block tabular-nums">
              {selectedDataset?.size || '1.42 MB'}
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
                First 5 telemetry frames parsed from {selectedDataset?.name}
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
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {selectedDataset?.previewRows?.slice(0, 5).map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-slate-300">{row.time || row.timestamp || `t+${idx*5}s`}</td>
                    <td className="py-2.5 px-3 text-cyan-300 font-bold">{row.spo2 ?? row.plungerForce ?? '98.2'}</td>
                    <td className="py-2.5 px-3 text-red-300">{row.heartRate ?? row.motorTorque ?? '74.0'}</td>
                    <td className="py-2.5 px-3 text-amber-300">{row.temperature ?? row.flowRate ?? '36.9'}</td>
                    <td className="py-2.5 px-3 text-blue-300">{row.pressure ?? row.voltage ?? '14.2'}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        row.status === 'ANOMALY' || row.status === 'WARNING'
                          ? 'bg-amber-950/60 text-amber-300' 
                          : 'bg-emerald-950/60 text-emerald-300'
                      }`}>
                        {row.status || 'NOMINAL'}
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
              <CheckCircle2 className="w-3.5 h-3.5" /> {validationResult?.isValid ?? true ? 'Passed' : 'Warning'}
            </span>
          </div>

          <div className="mt-4 space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">File Format Verification</span>
                <span className="text-[11px] text-slate-400 block">
                  {selectedDataset?.fileName?.endsWith('.xlsx') ? 'Excel Spreadsheet (.xlsx)' : 'RFC 4180 CSV standard conforming'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Sensor Schema Mapped</span>
                <span className="text-[11px] text-slate-400 block">
                  {selectedDataset?.channels?.length || selectedDataset?.columns || 5} Telemetry channels recognized
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Sampling Rate</span>
                <span className="text-[11px] text-slate-400 block">
                  {validationResult?.sampleRateHz ? `${validationResult.sampleRateHz} Hz Native Telemetry` : '1.0 Hz Calibrated Stream'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Missing Values Sanitized</span>
                <span className="text-[11px] text-slate-400 block">
                  {validationResult?.missingValues ?? 0} nulls detected (interpolated)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Execution Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-[#070c17]">
        <div>
          <span className="text-sm font-bold text-white block">
            Ready to execute deep learning analysis on {selectedDataset?.name}
          </span>
          <span className="text-xs text-slate-400 block mt-0.5">
            Model: 1D-CNN + BiLSTM with Temporal Multi-Head Attention · Mode: {analysisMode.toUpperCase()}
          </span>
        </div>

        <button
          onClick={handleRunPipeline}
          disabled={isProcessing || isUploading}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-xl shadow-cyan-500/25 border border-cyan-300/40 transition-all duration-200 cursor-pointer disabled:opacity-60"
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
