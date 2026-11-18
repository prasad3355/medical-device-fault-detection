export type NavigationRoute = 
  | 'dashboard' 
  | 'upload' 
  | 'analysis' 
  | 'history' 
  | 'models' 
  | 'pipeline' 
  | 'about';

export type DeviceFaultStatus = 'Normal' | 'Possible Anomaly' | 'Fault Detected';
export type PatientRiskLevel = 'Low' | 'Moderate' | 'High';
export type AnalysisMode = 'dual' | 'fault_only' | 'risk_only';

export interface TelemetryPoint {
  time: string;
  timestamp: number;
  spo2: number;
  heartRate: number;
  temperature: number;
  pressure: number;
  flowRate: number;
  isAnomaly?: boolean;
  anomalyType?: string;
  severity?: 'warning' | 'critical' | 'nominal';
}

export interface DetectedAnomaly {
  id: string;
  parameter: string;
  timestamp: string;
  observedValue: string;
  expectedRange: string;
  confidence: number;
  severity: 'low' | 'moderate' | 'critical';
  implication: string;
  suggestedAction: string;
}

export interface AnalysisRecord {
  id: string;
  datasetName: string;
  recordsCount: number;
  deviceType: string;
  deviceStatus: DeviceFaultStatus;
  patientRisk: PatientRiskLevel;
  confidence: number;
  analyzedAt: string;
  anomaliesDetected: number;
  sensorChannels: string[];
  fileSize: string;
  executionTimeMs: number;
}

export interface ModelComparisonMetric {
  model: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  inferenceLatencyMs: number;
}

export interface ConfusionMatrixCell {
  actual: DeviceFaultStatus;
  predicted: DeviceFaultStatus;
  count: number;
  percentage: number;
}

export interface TrainingEpoch {
  epoch: number;
  trainAccuracy: number;
  valAccuracy: number;
  trainLoss: number;
  valLoss: number;
}

export interface PipelineNodeData {
  id: string;
  number: string;
  title: string;
  shortDesc: string;
  status: 'Ready' | 'Active' | 'Optimized';
  category: 'input' | 'transform' | 'model' | 'inference' | 'output';
  details: {
    technology: string;
    inputShape?: string;
    outputShape?: string;
    parameters?: string;
    specifications: string[];
  };
}
