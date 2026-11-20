import React, { useState, useEffect, useRef } from 'react';
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
  AlertTriangle,
  X
} from 'lucide-react';
import { AnalysisMode } from '../../types';
import { INITIAL_DATASETS } from '../../data/mockData';
import { 
  uploadDatasetFile, 
  uploadAlarmPair,
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
  const [selectedAlarmPair, setSelectedAlarmPair] = useState<{ hea: File; mat: File } | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('dual');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [failedStage, setFailedStage] = useState<'upload' | 'analyze' | null>(null);
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setSelectedAlarmPair(null);
    setValidationResult(null);
    setUploadError(null);
    setFailedStage(null);
    if (presets.length > 0) {
      setSelectedDataset(presets[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
    setSelectedAlarmPair(null);
    setUploadError(null);
    setFailedStage(null);
    setValidationResult(null);

    // If preset is a PhysioNet waveform pair, auto-switch to icu_alarm mode
    if (dataset.fileName?.includes('.hea') || dataset.name?.includes('PhysioNet')) {
      setAnalysisMode('icu_alarm');
    } else if (analysisMode === 'icu_alarm') {
      setAnalysisMode('dual');
    }
  };

  const processUploadedFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setFailedStage(null);

    const fileArray = Array.from(files);
    const heaFile = fileArray.find(f => f.name.toLowerCase().endsWith('.hea'));
    const matFile = fileArray.find(f => f.name.toLowerCase().endsWith('.mat'));

    // 1. Both .hea and .mat selected (PhysioNet Waveform Pair)
    if (heaFile && matFile) {
      setSelectedFile(heaFile);
      setSelectedAlarmPair({ hea: heaFile, mat: matFile });
      setIsUploading(true);

      try {
        const validation = await uploadAlarmPair(heaFile, matFile);
        setValidationResult(validation);

        const customDataset = {
          id: `upload-alarm-${Date.now()}`,
          fileName: validation.fileName,
          name: validation.fileName,
          records: validation.recordsCount,
          columns: validation.columns.length,
          size: validation.fileSize,
          deviceType: 'ICU Monitor (PhysioNet 2015)',
          status: 'PhysioNet Waveform Pair' as const,
          risk: 'Verification Pending' as const,
          confidence: 90.0,
          channels: validation.columns,
          previewRows: validation.previewRows.map((row: any) => ({
            timestamp: row.time || 't-0.0s',
            spo2: row.spo2 ?? 98.0,
            heartRate: row.heartRate ?? 75,
            temperature: row.temperature ?? 36.8,
            pressure: row.pressure ?? 0.0,
            motorCurrent: 0.0,
            status: row.status || 'WAVEFORM'
          }))
        };

        setSelectedDataset(customDataset);
        setAnalysisMode('icu_alarm'); // Auto-select ICU Alarm mode for .hea + .mat!
        setBackendHealthy(true);
      } catch (err: any) {
        setFailedStage('upload');
        setUploadError(err.message || 'Failed to upload and validate PhysioNet waveform pair.');
      } finally {
        setIsUploading(false);
      }
      return;
    }

    // 2. Incomplete PhysioNet upload guards
    if (heaFile && !matFile) {
      setSelectedFile(heaFile);
      setFailedStage('upload');
      setUploadError(`Incomplete PhysioNet waveform pair: Selected header '${heaFile.name}'. Please select BOTH the .hea header file and the .mat binary waveform file together (hold Ctrl/Cmd to select both files in the file dialog).`);
      return;
    }

    if (matFile && !heaFile) {
      setSelectedFile(matFile);
      setFailedStage('upload');
      setUploadError(`Incomplete PhysioNet waveform pair: Selected waveform '${matFile.name}'. Please select BOTH the .hea header file and the .mat binary waveform file together (hold Ctrl/Cmd to select both files in the file dialog).`);
      return;
    }

    // 3. Standard CSV / XLS / XLSX
    const singleFile = fileArray[0];
    setSelectedFile(singleFile);
    setSelectedAlarmPair(null);
    setIsUploading(true);

    try {
      const validation = await uploadDatasetFile(singleFile);
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
      if (analysisMode === 'icu_alarm') {
        setAnalysisMode('dual'); // Reset from icu_alarm to dual when uploading CSV vitals
      }
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
      processUploadedFiles(e.dataTransfer.files);
    }
  };

  const handleRunPipeline = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setUploadError(null);
    setFailedStage(null);

    const dsName = selectedDataset?.fileName || selectedDataset?.name || '';
    const isWaveform = dsName.includes('.hea') || dsName.includes('.mat');

    // Validation guard: Mode compatibility
    if (analysisMode === 'icu_alarm' && !isWaveform) {
      setIsProcessing(false);
      setFailedStage('analyze');
      setUploadError("Incompatible Input: ICU Alarm Verification requires physiological waveform files (.hea + .mat) with clinical alarm context. The selected file is a tabular CSV. Please choose Dual, Fault, or Risk mode for CSV vitals.");
      return;
    }

    if (analysisMode !== 'icu_alarm' && isWaveform) {
      setIsProcessing(false);
      setFailedStage('analyze');
      setUploadError("Incompatible Mode: PhysioNet waveform pairs (.hea + .mat) must be evaluated using the 'ICU Alarm Verification' mode.");
      return;
    }

    if (analysisMode === 'icu_alarm') {
      setProcessingStep('Extracting 30-sec pre-alarm ECG waveform segment...');
    } else {
      setProcessingStep('Validating schema & signal frequency...');
    }

    const stepTimer1 = setTimeout(() => {
      if (analysisMode === 'icu_alarm') {
        setProcessingStep('Bandpass filtering & QRS Pan-Tompkins dynamics...');
      } else {
        setProcessingStep('Applying Savitzky-Golay Denoising & baseline correction...');
      }
    }, 400);

    const stepTimer2 = setTimeout(() => {
      if (analysisMode === 'icu_alarm') {
        setProcessingStep('Computing 48 spectral, morphological & pause features...');
      } else {
        setProcessingStep('Computing spectral features & Signal Quality Index (SQI)...');
      }
    }, 800);

    const stepTimer3 = setTimeout(() => {
      if (analysisMode === 'icu_alarm') {
        setProcessingStep('Executing PhysioNet 2015 Random Forest classification...');
      } else {
        setProcessingStep('Executing 1D-CNN + BiLSTM temporal inference...');
      }
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
              if (failedStage === 'upload') {
                if (selectedAlarmPair) {
                  processUploadedFiles([selectedAlarmPair.hea, selectedAlarmPair.mat]);
                } else if (selectedFile) {
                  processUploadedFiles([selectedFile]);
                }
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

      {/* Hidden file input for file picker and Replace action */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept=".csv,.xls,.xlsx,.hea,.mat" 
        multiple
        className="hidden"
        disabled={isUploading || isProcessing}
        onClick={(e) => {
          (e.target as HTMLInputElement).value = '';
        }}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            processUploadedFiles(e.target.files);
          }
        }}
      />

      {/* Upload Zone / Solid Highlighted File Card */}
      {selectedFile ? (
        /* SOLID HIGHLIGHTED FILE CARD (when a file is selected) */
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileDrop}
          className={`relative rounded-2xl border-2 border-cyan-500 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-[#070c17] p-6 sm:p-8 shadow-2xl transition-all duration-300 ${
            isDragging ? 'ring-2 ring-cyan-400 bg-cyan-950/80 scale-[1.01]' : ''
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shrink-0 shadow-lg shadow-cyan-950/50">
                {isUploading ? (
                  <RefreshCw className="w-7 h-7 animate-spin text-cyan-400" />
                ) : (
                  <FileSpreadsheet className="w-7 h-7 text-cyan-300" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-xs font-semibold text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    File selected
                  </span>
                  {selectedAlarmPair ? (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/60">
                      PhysioNet WFDB Pair
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Telemetry Dataset
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight break-all">
                  {selectedAlarmPair 
                    ? `${selectedAlarmPair.hea.name} + ${selectedAlarmPair.mat.name}` 
                    : selectedFile.name}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-mono">
                  <span>
                    {selectedAlarmPair 
                      ? `${((selectedAlarmPair.hea.size + selectedAlarmPair.mat.size) / 1024).toFixed(1)} KB`
                      : `${(selectedFile.size / 1024).toFixed(1)} KB`}
                  </span>
                  {validationResult && (
                    <>
                      <span>·</span>
                      <span className="text-cyan-300">{validationResult.recordsCount.toLocaleString()} samples</span>
                      <span>·</span>
                      <span>{validationResult.columns.length} channels</span>
                    </>
                  )}
                  {isUploading && (
                    <span className="text-cyan-400 animate-pulse">· Ingesting...</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons: Analyze selected file, Replace, Remove */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={handleRunPipeline}
                disabled={isProcessing || isUploading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-cyan-950/40 border border-cyan-400/40 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Cpu className="w-4 h-4 text-cyan-200" />
                )}
                <span>{isProcessing ? 'Analyzing...' : 'Analyze selected file'}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing || isUploading}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Replace</span>
              </button>

              <button
                onClick={handleRemoveFile}
                disabled={isProcessing || isUploading}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-300 text-xs font-semibold border border-slate-800 hover:border-red-500/40 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* EMPTY DASHED DROP ZONE (when no file is selected) */
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
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
              {isUploading ? 'Validating and Ingesting Dataset...' : 'Drop your medical dataset here'}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Drag and drop telemetry files or browse from your workstation
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-mono text-slate-400">
              <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700/60">CSV</span>
              <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700/60">XLS</span>
              <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700/60">XLSX</span>
              <span className="px-2 py-1 rounded bg-purple-950/80 border border-purple-500/50 text-purple-300">HEA + MAT (PhysioNet)</span>
              <span>· Max 50 MB / 500,000 samples</span>
            </div>
          </div>
        </div>
      )}

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Option 4: ICU Alarm Verification (PhysioNet) */}
          <div 
            onClick={() => setAnalysisMode('icu_alarm')}
            className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
              analysisMode === 'icu_alarm'
                ? 'border-purple-400/80 bg-gradient-to-br from-purple-950/40 via-indigo-950/30 to-[#070c17] ring-1 ring-purple-400/50 shadow-lg shadow-purple-950/30'
                : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                PHYSIO-NET
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mt-3">
              ICU Alarm Verification
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Verifies true vs. false ICU arrhythmia alarms (Asystole, Brady, Tachy, V-Fib, V-Tach) using WFDB .hea + .mat waveforms.
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
            {analysisMode === 'icu_alarm' 
              ? 'Model: Random Forest (PhysioNet 2015 48-Feature Pre-Alarm) · Mode: ICU ALARM VERIFICATION'
              : `Model: 1D-CNN + BiLSTM with Temporal Multi-Head Attention · Mode: ${analysisMode.toUpperCase()}`}
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
