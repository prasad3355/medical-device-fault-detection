import { 
  AnalysisMode, 
  AnalysisRecord, 
  DetectedAnomaly, 
  ModelComparisonMetric, 
  ConfusionMatrixCell, 
  TrainingEpoch, 
  TelemetryPoint 
} from '../types';

const isServer = typeof window === 'undefined';
// In the browser, default to same-origin '/api' to use Next.js rewrites; on server (SSR), use direct backend URL
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || (isServer ? 'http://127.0.0.1:8000/api' : '/api');
export const API_BASE = RAW_API_URL.replace(/\/+$/, '');

export interface ValidationResult {
  isValid: boolean;
  fileName: string;
  fileSize: string;
  recordsCount: number;
  columns: string[];
  sampleRateHz: number;
  missingValues: number;
  validationErrors: string[];
  previewRows: Record<string, any>[];
}

export interface DatasetPreset {
  id: string;
  fileName: string;
  name: string;
  records: number;
  columns: number;
  size: string;
  deviceType: string;
  channels: string[];
  previewRows: Record<string, any>[];
}

export interface DatasetsCatalogResponse {
  presets: DatasetPreset[];
  uploads: { id: string; name: string; size: string }[];
}

export interface FullAnalysisData {
  record: AnalysisRecord;
  telemetry: TelemetryPoint[];
  anomalies: DetectedAnomaly[];
  sensorAverages: Record<string, number>;
  faultConfidence: number;
  riskConfidence: number;
  sqiScore: number;
  analysisMode: AnalysisMode;
}

export interface ModelPerformanceData {
  metrics: ModelComparisonMetric[];
  confusionMatrix: ConfusionMatrixCell[];
  trainingEpochs: TrainingEpoch[];
}

/**
 * Upload a CSV or Excel medical telemetry dataset to the backend.
 */
export async function uploadDatasetFile(file: File): Promise<ValidationResult> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      let errorMsg = `Upload failed (${res.status} ${res.statusText})`;
      try {
        const err = await res.json();
        errorMsg = err.detail || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    return res.json();
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message?.includes('fetch')) {
      throw new Error(`Network error connecting to ${API_BASE}/upload. Ensure the FastAPI backend is running on port 8000 and Next.js proxy is active.`);
    }
    throw err;
  }
}

/**
 * Upload a PhysioNet WFDB .hea header and .mat waveform binary pair for ICU Alarm Verification.
 */
export async function uploadAlarmPair(heaFile: File, matFile: File): Promise<ValidationResult> {
  const formData = new FormData();
  formData.append('hea_file', heaFile);
  formData.append('mat_file', matFile);

  try {
    const res = await fetch(`${API_BASE}/upload-alarm-pair`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      let errorMsg = `Upload failed (${res.status} ${res.statusText})`;
      try {
        const err = await res.json();
        errorMsg = err.detail || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    return res.json();
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message?.includes('fetch')) {
      throw new Error(`Network error connecting to ${API_BASE}/upload-alarm-pair. Ensure the FastAPI backend is running on port 8000.`);
    }
    throw err;
  }
}

/**
 * Execute deep learning fault and risk analysis on an uploaded or preset dataset.
 */
export async function analyzeDataset(params: {
  datasetId?: string;
  fileName?: string;
  mode: AnalysisMode;
  records?: Record<string, any>[];
}): Promise<FullAnalysisData> {
  try {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      let errorMsg = `Inference failed (${res.status} ${res.statusText})`;
      try {
        const err = await res.json();
        errorMsg = err.detail || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    const json = await res.json();
    return {
      record: json.record,
      telemetry: json.telemetry || [],
      anomalies: json.anomalies || [],
      sensorAverages: json.sensorAverages || {},
      faultConfidence: json.faultConfidence ?? json.record?.confidence ?? 90.0,
      riskConfidence: json.riskConfidence ?? json.record?.confidence ?? 90.0,
      sqiScore: json.sqiScore ?? 0.9,
      analysisMode: params.mode,
    };
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message?.includes('fetch')) {
      throw new Error(`Network error connecting to ${API_BASE}/analyze. Ensure the FastAPI backend is running on port 8000 and Next.js proxy is active.`);
    }
    throw err;
  }
}

/**
 * Retrieve all historical analysis runs.
 */
export async function fetchAnalysisHistory(): Promise<AnalysisRecord[]> {
  const res = await fetch(`${API_BASE}/history`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch history (${res.status} ${res.statusText})`);
  }

  return res.json();
}


/**
 * Retrieve a full analysis result by its run ID.
 */
export async function fetchAnalysisById(id: string): Promise<FullAnalysisData> {
  const res = await fetch(`${API_BASE}/analysis/${encodeURIComponent(id)}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Analysis run ${id} not found (${res.status})`);
  }

  return res.json();
}

/**
 * Retrieve available preset sample datasets and previously uploaded files.
 */
export async function fetchAvailableDatasets(): Promise<DatasetsCatalogResponse> {
  const res = await fetch(`${API_BASE}/datasets`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to load presets (${res.status})`);
  }

  return res.json();
}

/**
 * Retrieve empirical model performance benchmarks and metrics.
 */
export async function fetchModelPerformance(): Promise<ModelPerformanceData> {
  const res = await fetch(`${API_BASE}/models/metrics`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch model metrics (${res.status})`);
  }

  return res.json();
}

/**
 * Backend health check.
 */
export async function checkBackendHealth(): Promise<{ status: string; service: string }> {
  const res = await fetch(`${API_BASE}/health`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Backend health check failed (${res.status})`);
  }
  return res.json();
}


export interface SimulationData {
  record: AnalysisRecord;
  anomalies: DetectedAnomaly[];
  telemetry: TelemetryPoint[];
  alarmType: string;
  trueAlarm: boolean;
  prediction: string;
  confidence: number;
  patientRisk: string;
  preAlarmSeconds: number;
  totalSamples: number;
  samplingFrequency: number;
  sampleCount: number;
  alarmTimestamp: string;
}

/**
 * Fetch simulated monitoring data for PhysioNet t108s ECG recording.
 * Replays without a file upload and runs Random Forest inference on the pre-alarm window.
 */
export async function fetchSimulatedMonitoring(): Promise<SimulationData> {
  const res = await fetch(`${API_BASE}/simulation/t108s`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    let errorMsg = `Simulation request failed (${res.status} ${res.statusText})`;
    try {
      const err = await res.json();
      errorMsg = err.detail || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return res.json();
}

export interface PPGSimulationData {
  record: AnalysisRecord;
  anomalies: DetectedAnomaly[];
  telemetry: TelemetryPoint[];
  prediction: string;
  isGood: boolean;
  confidence: number;
  probGood: number;
  probPoor: number;
  cardiacSqi: number;
  autocorrPeak: number;
  heartRate: number;
  recordId: string;
  samplingFrequency: number;
  durationSec: number;
  metrics: {
    accuracy: number;
    recall_poor: number;
    recall_good: number;
    f1_poor: number;
    confusion_matrix: number[][];
  };
}

/**
 * Fetch simulated PPG sensor signal quality monitoring data (Good vs Poor case).
 * Replays without a file upload and runs Random Forest inference on the 15 PPG features.
 */
export async function fetchPPGSimulation(caseType: 'good' | 'poor' = 'good'): Promise<PPGSimulationData> {
  const res = await fetch(`${API_BASE}/simulation/ppg?case=${caseType}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    let errorMsg = `PPG Simulation request failed (${res.status} ${res.statusText})`;
    try {
      const err = await res.json();
      errorMsg = err.detail || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return res.json();
}



