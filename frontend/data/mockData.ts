import { 
  AnalysisRecord, 
  ConfusionMatrixCell, 
  DetectedAnomaly, 
  ModelComparisonMetric, 
  PipelineNodeData, 
  TelemetryPoint, 
  TrainingEpoch 
} from '../types';

export const INITIAL_DATASETS = [
  {
    id: 'ds-1',
    name: 'ICU_MultiParameter_Telemetry_A4.csv',
    records: 2450,
    columns: 8,
    size: '1.42 MB',
    deviceType: 'Multi-parameter Patient Monitor (Mindray ePM 12M)',
    status: 'Possible Anomaly' as const,
    risk: 'Moderate' as const,
    confidence: 94.2,
    date: '2026-09-22 14:28:10',
    channels: ['SpO2', 'Heart Rate', 'Core Temp', 'Airway Pressure', 'Motor Current'],
    previewRows: [
      { timestamp: '10:00:00', spo2: 98.4, heartRate: 72, temperature: 36.8, pressure: 14.2, motorCurrent: 1.18, status: 'NOMINAL' },
      { timestamp: '10:05:00', spo2: 98.2, heartRate: 73, temperature: 36.9, pressure: 14.1, motorCurrent: 1.20, status: 'NOMINAL' },
      { timestamp: '10:10:00', spo2: 97.9, heartRate: 75, temperature: 36.9, pressure: 14.3, motorCurrent: 1.19, status: 'NOMINAL' },
      { timestamp: '10:15:00', spo2: 98.1, heartRate: 74, temperature: 37.0, pressure: 14.2, motorCurrent: 1.22, status: 'NOMINAL' },
      { timestamp: '10:20:00', spo2: 98.0, heartRate: 76, temperature: 37.1, pressure: 14.5, motorCurrent: 1.21, status: 'NOMINAL' },
      { timestamp: '10:25:00', spo2: 97.5, heartRate: 78, temperature: 37.2, pressure: 14.8, motorCurrent: 1.25, status: 'NOMINAL' },
      { timestamp: '10:30:00', spo2: 94.1, heartRate: 88, temperature: 37.4, pressure: 16.5, motorCurrent: 1.48, status: 'WARNING' },
      { timestamp: '10:35:00', spo2: 89.2, heartRate: 104, temperature: 37.8, pressure: 19.8, motorCurrent: 1.82, status: 'ANOMALY' },
      { timestamp: '10:40:00', spo2: 88.5, heartRate: 112, temperature: 38.0, pressure: 20.4, motorCurrent: 1.89, status: 'ANOMALY' },
      { timestamp: '10:45:00', spo2: 93.8, heartRate: 92, temperature: 37.6, pressure: 17.1, motorCurrent: 1.51, status: 'RECOVERING' },
    ]
  },
  {
    id: 'ds-2',
    name: 'Syringe_Pump_Motor_Infusion_Log.csv',
    records: 1840,
    columns: 6,
    size: '860 KB',
    deviceType: 'Smart Syringe Infusion Pump (Alaris GP Plus)',
    status: 'Fault Detected' as const,
    risk: 'High' as const,
    confidence: 96.8,
    date: '2026-09-22 11:15:42',
    channels: ['Plunger Force', 'Motor Torque', 'Optical Encoder', 'Flow Rate', 'Voltage'],
    previewRows: [
      { timestamp: '08:00:00', plungerForce: 12.1, motorTorque: 0.42, flowRate: 5.0, voltage: 12.0, status: 'NOMINAL' },
      { timestamp: '08:15:00', plungerForce: 12.4, motorTorque: 0.43, flowRate: 5.0, voltage: 12.0, status: 'NOMINAL' },
      { timestamp: '08:30:00', plungerForce: 18.9, motorTorque: 0.74, flowRate: 4.2, voltage: 11.8, status: 'WARNING' },
      { timestamp: '08:45:00', plungerForce: 28.5, motorTorque: 1.15, flowRate: 2.1, voltage: 11.2, status: 'OCCLUSION_FAULT' },
    ]
  },
  {
    id: 'ds-3',
    name: 'Ventilator_Flow_Pressure_Cohort7.csv',
    records: 3120,
    columns: 9,
    size: '2.10 MB',
    deviceType: 'Mechanical Ventilator (Hamilton-C6)',
    status: 'Normal' as const,
    risk: 'Low' as const,
    confidence: 98.1,
    date: '2026-09-21 19:40:15',
    channels: ['Peak Inspiratory Pressure', 'PEEP', 'Tidal Volume', 'FiO2', 'Turbine RPM'],
    previewRows: [
      { timestamp: '14:00:00', pip: 18.2, peep: 5.0, tidalVol: 450, fio2: 40, turbineRpm: 18400, status: 'NOMINAL' },
      { timestamp: '14:10:00', pip: 18.4, peep: 5.1, tidalVol: 452, fio2: 40, turbineRpm: 18450, status: 'NOMINAL' },
      { timestamp: '14:20:00', pip: 18.3, peep: 5.0, tidalVol: 449, fio2: 40, turbineRpm: 18420, status: 'NOMINAL' },
    ]
  },
  {
    id: 'ds-4',
    name: 'Dialysis_Hemodynamics_Monitor_R2.csv',
    records: 2780,
    columns: 7,
    size: '1.65 MB',
    deviceType: 'Hemodialysis Machine (Fresenius 5008S)',
    status: 'Possible Anomaly' as const,
    risk: 'Moderate' as const,
    confidence: 91.5,
    date: '2026-09-20 09:12:08',
    channels: ['Arterial Pressure', 'Venous Pressure', 'TMP', 'Blood Flow Rate', 'Conductivity'],
    previewRows: [
      { timestamp: '07:00:00', artPress: -120, venPress: 85, tmp: 45, bloodFlow: 300, conductivity: 13.9, status: 'NOMINAL' },
      { timestamp: '07:15:00', artPress: -125, venPress: 88, tmp: 48, bloodFlow: 300, conductivity: 13.9, status: 'NOMINAL' },
      { timestamp: '07:30:00', artPress: -180, venPress: 135, tmp: 82, bloodFlow: 280, conductivity: 14.1, status: 'WARNING' },
    ]
  }
];

export const MOCK_TELEMETRY: TelemetryPoint[] = [
  { time: '10:00', timestamp: 0, spo2: 98.4, heartRate: 72, temperature: 36.8, pressure: 14.2, flowRate: 45.0, isAnomaly: false },
  { time: '10:05', timestamp: 5, spo2: 98.2, heartRate: 73, temperature: 36.9, pressure: 14.1, flowRate: 45.2, isAnomaly: false },
  { time: '10:10', timestamp: 10, spo2: 97.9, heartRate: 74, temperature: 36.9, pressure: 14.3, flowRate: 44.8, isAnomaly: false },
  { time: '10:15', timestamp: 15, spo2: 98.1, heartRate: 75, temperature: 37.0, pressure: 14.2, flowRate: 45.1, isAnomaly: false },
  { time: '10:20', timestamp: 20, spo2: 97.8, heartRate: 76, temperature: 37.1, pressure: 14.5, flowRate: 44.9, isAnomaly: false },
  { time: '10:25', timestamp: 25, spo2: 97.5, heartRate: 78, temperature: 37.2, pressure: 14.8, flowRate: 44.5, isAnomaly: false },
  { time: '10:28', timestamp: 28, spo2: 96.1, heartRate: 82, temperature: 37.3, pressure: 15.4, flowRate: 43.8, isAnomaly: false },
  // Anomaly 1 interval (10:30 - 10:42)
  { time: '10:30', timestamp: 30, spo2: 94.2, heartRate: 89, temperature: 37.5, pressure: 16.8, flowRate: 41.2, isAnomaly: true, anomalyType: 'SPO2_DESAT_EARLY', severity: 'warning' },
  { time: '10:33', timestamp: 33, spo2: 91.5, heartRate: 98, temperature: 37.7, pressure: 18.5, flowRate: 38.6, isAnomaly: true, anomalyType: 'SPO2_RAPID_DROP', severity: 'critical' },
  { time: '10:36', timestamp: 36, spo2: 89.1, heartRate: 106, temperature: 37.9, pressure: 19.8, flowRate: 36.4, isAnomaly: true, anomalyType: 'CRITICAL_DESATURATION', severity: 'critical' },
  { time: '10:39', timestamp: 39, spo2: 88.4, heartRate: 112, temperature: 38.1, pressure: 20.4, flowRate: 35.8, isAnomaly: true, anomalyType: 'TACHYCARDIA_SPIKE', severity: 'critical' },
  { time: '10:42', timestamp: 42, spo2: 91.0, heartRate: 104, temperature: 38.0, pressure: 18.9, flowRate: 37.5, isAnomaly: true, anomalyType: 'RECOVERY_INITIATED', severity: 'warning' },
  // Post-treatment stabilization
  { time: '10:45', timestamp: 45, spo2: 94.8, heartRate: 91, temperature: 37.7, pressure: 16.4, flowRate: 42.0, isAnomaly: false },
  { time: '10:50', timestamp: 50, spo2: 96.4, heartRate: 84, temperature: 37.4, pressure: 15.2, flowRate: 43.6, isAnomaly: false },
  { time: '10:55', timestamp: 55, spo2: 97.2, heartRate: 79, temperature: 37.2, pressure: 14.7, flowRate: 44.2, isAnomaly: false },
  { time: '11:00', timestamp: 60, spo2: 97.8, heartRate: 77, temperature: 37.1, pressure: 14.4, flowRate: 44.8, isAnomaly: false },
  { time: '11:05', timestamp: 65, spo2: 98.0, heartRate: 75, temperature: 37.0, pressure: 14.3, flowRate: 45.0, isAnomaly: false },
  // Anomaly 2 interval (Pressure instability 11:10 - 11:16)
  { time: '11:10', timestamp: 70, spo2: 97.6, heartRate: 76, temperature: 37.0, pressure: 17.5, flowRate: 41.5, isAnomaly: true, anomalyType: 'CIRCUIT_RESISTANCE', severity: 'warning' },
  { time: '11:13', timestamp: 73, spo2: 97.4, heartRate: 78, temperature: 37.1, pressure: 21.2, flowRate: 37.0, isAnomaly: true, anomalyType: 'AIRWAY_PRESSURE_SURGE', severity: 'warning' },
  { time: '11:16', timestamp: 76, spo2: 97.5, heartRate: 76, temperature: 37.0, pressure: 17.8, flowRate: 41.0, isAnomaly: false },
  { time: '11:20', timestamp: 80, spo2: 98.1, heartRate: 74, temperature: 36.9, pressure: 14.4, flowRate: 44.9, isAnomaly: false },
  { time: '11:25', timestamp: 85, spo2: 98.3, heartRate: 73, temperature: 36.9, pressure: 14.2, flowRate: 45.1, isAnomaly: false },
  // Anomaly 3 interval (Thermal drift 11:35 - 11:42)
  { time: '11:30', timestamp: 90, spo2: 98.2, heartRate: 74, temperature: 37.0, pressure: 14.2, flowRate: 45.0, isAnomaly: false },
  { time: '11:35', timestamp: 95, spo2: 97.9, heartRate: 79, temperature: 38.4, pressure: 14.5, flowRate: 44.7, isAnomaly: true, anomalyType: 'PROBE_THERMAL_DRIFT', severity: 'warning' },
  { time: '11:40', timestamp: 100, spo2: 97.8, heartRate: 81, temperature: 38.7, pressure: 14.6, flowRate: 44.6, isAnomaly: true, anomalyType: 'SENSOR_OVERHEAT_ALERT', severity: 'warning' },
  { time: '11:45', timestamp: 105, spo2: 98.0, heartRate: 76, temperature: 37.3, pressure: 14.3, flowRate: 45.0, isAnomaly: false },
  { time: '11:50', timestamp: 110, spo2: 98.2, heartRate: 74, temperature: 37.0, pressure: 14.2, flowRate: 45.2, isAnomaly: false },
  { time: '11:55', timestamp: 115, spo2: 98.3, heartRate: 73, temperature: 36.9, pressure: 14.1, flowRate: 45.3, isAnomaly: false },
  { time: '12:00', timestamp: 120, spo2: 98.5, heartRate: 72, temperature: 36.8, pressure: 14.2, flowRate: 45.2, isAnomaly: false }
];

export const MOCK_DETECTED_ANOMALIES: DetectedAnomaly[] = [
  {
    id: 'anom-1',
    parameter: 'Oxygen Saturation (SpO₂)',
    timestamp: '10:33 - 10:41',
    observedValue: '88.4% (Trough)',
    expectedRange: '95.0% - 100.0%',
    confidence: 96.4,
    severity: 'critical',
    implication: 'Significant deviation from physiological baseline accompanied by signal quality index drop (SQI < 0.65).',
    suggestedAction: 'Verify optical pulse oximeter probe coupling and inspect LED photodiode alignment before treating as purely physiological desaturation.'
  },
  {
    id: 'anom-2',
    parameter: 'Peak Airway Pressure',
    timestamp: '11:10 - 11:15',
    observedValue: '21.2 cmH₂O (Peak)',
    expectedRange: '12.0 - 16.0 cmH₂O',
    confidence: 92.8,
    severity: 'moderate',
    implication: 'Transient resistance spike detected across respiratory circuit flow transducer.',
    suggestedAction: 'Check for partial condensation in water trap or patient coughing artifact.'
  },
  {
    id: 'anom-3',
    parameter: 'Sensor Surface Temperature',
    timestamp: '11:35 - 11:42',
    observedValue: '38.7°C (Elevated)',
    expectedRange: '36.5°C - 37.4°C',
    confidence: 89.1,
    severity: 'moderate',
    implication: 'Thermal drift observed in internal sensor amplifier stage under continuous duty.',
    suggestedAction: 'Perform thermal recalibration; verify probe power supply regulation voltage.'
  }
];

export const RECENT_ANALYSES: AnalysisRecord[] = [
  {
    id: 'rec-101',
    datasetName: 'ICU_MultiParameter_Telemetry_A4.csv',
    recordsCount: 2450,
    deviceType: 'Multiparameter Patient Monitor',
    deviceStatus: 'Possible Anomaly',
    patientRisk: 'Moderate',
    confidence: 94.2,
    analyzedAt: '24 mins ago',
    anomaliesDetected: 3,
    sensorChannels: ['SpO2', 'Heart Rate', 'Temperature', 'Pressure'],
    fileSize: '1.42 MB',
    executionTimeMs: 412
  },
  {
    id: 'rec-102',
    datasetName: 'Syringe_Pump_Motor_Infusion_Log.csv',
    recordsCount: 1840,
    deviceType: 'Smart Syringe Infusion Pump',
    deviceStatus: 'Fault Detected',
    patientRisk: 'High',
    confidence: 96.8,
    analyzedAt: '2 hours ago',
    anomaliesDetected: 4,
    sensorChannels: ['Plunger Force', 'Motor Torque', 'Voltage'],
    fileSize: '860 KB',
    executionTimeMs: 320
  },
  {
    id: 'rec-103',
    datasetName: 'Ventilator_Flow_Pressure_Cohort7.csv',
    recordsCount: 3120,
    deviceType: 'Mechanical Ventilator',
    deviceStatus: 'Normal',
    patientRisk: 'Low',
    confidence: 98.1,
    analyzedAt: '5 hours ago',
    anomaliesDetected: 0,
    sensorChannels: ['Inspiratory Pressure', 'PEEP', 'Tidal Volume'],
    fileSize: '2.10 MB',
    executionTimeMs: 518
  },
  {
    id: 'rec-104',
    datasetName: 'Dialysis_Hemodynamics_Monitor_R2.csv',
    recordsCount: 2780,
    deviceType: 'Hemodialysis System',
    deviceStatus: 'Possible Anomaly',
    patientRisk: 'Moderate',
    confidence: 91.5,
    analyzedAt: 'Yesterday 16:30',
    anomaliesDetected: 2,
    sensorChannels: ['Arterial Press', 'Venous Press', 'TMP'],
    fileSize: '1.65 MB',
    executionTimeMs: 440
  },
  {
    id: 'rec-105',
    datasetName: 'Anesthesia_Workstation_Gas_Audit.csv',
    recordsCount: 4200,
    deviceType: 'Anesthesia Delivery Station',
    deviceStatus: 'Normal',
    patientRisk: 'Low',
    confidence: 97.4,
    analyzedAt: 'Yesterday 11:20',
    anomaliesDetected: 0,
    sensorChannels: ['O2 Sensor', 'N2O Sensor', 'Agent Conc'],
    fileSize: '2.84 MB',
    executionTimeMs: 625
  },
  {
    id: 'rec-106',
    datasetName: 'Defibrillator_Capacitor_Discharge.csv',
    recordsCount: 960,
    deviceType: 'Biphasic Defibrillator',
    deviceStatus: 'Fault Detected',
    patientRisk: 'High',
    confidence: 98.7,
    analyzedAt: '2 days ago',
    anomaliesDetected: 5,
    sensorChannels: ['Charge Voltage', 'Discharge Current', 'Impedance'],
    fileSize: '512 KB',
    executionTimeMs: 180
  },
  {
    id: 'rec-107',
    datasetName: 'Neonatal_Incubator_Microclimate.csv',
    recordsCount: 3800,
    deviceType: 'Infant Incubator',
    deviceStatus: 'Normal',
    patientRisk: 'Low',
    confidence: 99.0,
    analyzedAt: '3 days ago',
    anomaliesDetected: 0,
    sensorChannels: ['Air Temp', 'Skin Temp', 'Relative Humidity'],
    fileSize: '1.98 MB',
    executionTimeMs: 490
  }
];

export const MODEL_COMPARISONS: ModelComparisonMetric[] = [
  {
    model: 'Baseline (Random Forest)',
    accuracy: 88.4,
    precision: 87.1,
    recall: 86.5,
    f1Score: 86.8,
    inferenceLatencyMs: 14.2
  },
  {
    model: '1D-CNN Baseline',
    accuracy: 93.6,
    precision: 92.8,
    recall: 93.1,
    f1Score: 92.9,
    inferenceLatencyMs: 6.8
  },
  {
    model: 'LSTM Recurrent Model',
    accuracy: 94.5,
    precision: 93.9,
    recall: 94.2,
    f1Score: 94.0,
    inferenceLatencyMs: 18.5
  },
  {
    model: 'MEDFAULT Hybrid (CNN + Bi-LSTM + Attention)',
    accuracy: 97.8,
    precision: 96.4,
    recall: 95.9,
    f1Score: 96.1,
    inferenceLatencyMs: 8.4
  }
];

export const CONFUSION_MATRIX: ConfusionMatrixCell[] = [
  { actual: 'Normal', predicted: 'Normal', count: 942, percentage: 97.7 },
  { actual: 'Normal', predicted: 'Possible Anomaly', count: 18, percentage: 1.9 },
  { actual: 'Normal', predicted: 'Fault Detected', count: 4, percentage: 0.4 },
  
  { actual: 'Possible Anomaly', predicted: 'Normal', count: 14, percentage: 4.8 },
  { actual: 'Possible Anomaly', predicted: 'Possible Anomaly', count: 262, percentage: 89.7 },
  { actual: 'Possible Anomaly', predicted: 'Fault Detected', count: 16, percentage: 5.5 },

  { actual: 'Fault Detected', predicted: 'Normal', count: 2, percentage: 1.4 },
  { actual: 'Fault Detected', predicted: 'Possible Anomaly', count: 6, percentage: 4.2 },
  { actual: 'Fault Detected', predicted: 'Fault Detected', count: 136, percentage: 94.4 }
];

export const TRAINING_HISTORY: TrainingEpoch[] = [
  { epoch: 1, trainAccuracy: 71.2, valAccuracy: 69.5, trainLoss: 0.68, valLoss: 0.72 },
  { epoch: 5, trainAccuracy: 82.4, valAccuracy: 80.8, trainLoss: 0.44, valLoss: 0.48 },
  { epoch: 10, trainAccuracy: 88.9, valAccuracy: 87.2, trainLoss: 0.31, valLoss: 0.35 },
  { epoch: 15, trainAccuracy: 92.1, valAccuracy: 90.6, trainLoss: 0.22, valLoss: 0.26 },
  { epoch: 20, trainAccuracy: 94.3, valAccuracy: 92.8, trainLoss: 0.17, valLoss: 0.21 },
  { epoch: 25, trainAccuracy: 95.8, valAccuracy: 94.2, trainLoss: 0.13, valLoss: 0.18 },
  { epoch: 30, trainAccuracy: 96.7, valAccuracy: 95.4, trainLoss: 0.10, valLoss: 0.15 },
  { epoch: 35, trainAccuracy: 97.4, valAccuracy: 96.1, trainLoss: 0.08, valLoss: 0.13 },
  { epoch: 40, trainAccuracy: 98.1, valAccuracy: 96.8, trainLoss: 0.06, valLoss: 0.12 },
  { epoch: 45, trainAccuracy: 98.6, valAccuracy: 97.4, trainLoss: 0.05, valLoss: 0.11 },
  { epoch: 50, trainAccuracy: 99.0, valAccuracy: 97.8, trainLoss: 0.04, valLoss: 0.10 }
];

export const PIPELINE_NODES: PipelineNodeData[] = [
  {
    id: 'node-dataset',
    number: '01',
    title: 'Dataset Ingestion',
    shortDesc: 'Multi-channel medical device telemetry stream or tabular CSV/XLS upload',
    status: 'Ready',
    category: 'input',
    details: {
      technology: 'Streaming Ingestion Engine & Format Parser',
      inputShape: '[N_samples, Channels, Timestamps]',
      outputShape: 'Structured DataFrame (Tabular/Matrix)',
      specifications: [
        'Automated schema detection for multi-vendor physiological monitors',
        'High-throughput parser handling up to 100,000 samples/sec',
        'ISO 11073-10101 medical device nomenclature standard mapping'
      ]
    }
  },
  {
    id: 'node-validation',
    number: '02',
    title: 'Schema Validation',
    shortDesc: 'Signal integrity checking, null handling & sample frequency verification',
    status: 'Active',
    category: 'transform',
    details: {
      technology: 'Pydantic Strict Schema Validator & Nyquist Verifier',
      inputShape: 'Raw Tabular Payload',
      outputShape: 'Validated Clean Data Matrix',
      specifications: [
        'Range limit inspection (e.g. SpO2 0-100%, HR 20-300 bpm)',
        'Sample jitter & temporal continuity verification',
        'Categorical transducer encoding & channel presence assertions'
      ]
    }
  },
  {
    id: 'node-preprocessing',
    number: '03',
    title: 'Signal Preprocessing',
    shortDesc: 'Wavelet denoising, baseline wander removal, and z-score normalization',
    status: 'Optimized',
    category: 'transform',
    details: {
      technology: 'Discrete Wavelet Transform (Daubechies db4) + RobustScaler',
      inputShape: '[Batch, 128, Channels]',
      outputShape: '[Batch, 128, Channels, Normalized]',
      specifications: [
        'High-frequency motion artifact filtration via soft thresholding',
        'Adaptive 50/60 Hz notch filtering for AC power interference',
        'Sliding window segmentation with 50% overlap (128-sample frames)'
      ]
    }
  },
  {
    id: 'node-feature',
    number: '04',
    title: 'Feature Extraction',
    shortDesc: 'Time-domain, frequency-domain spectral power & entropy signatures',
    status: 'Optimized',
    category: 'transform',
    details: {
      technology: 'Fast Fourier Transform (FFT) + Spectral Entropy Engine',
      inputShape: '[Batch, 128, Channels]',
      outputShape: '[Batch, 64, FeatureVector]',
      specifications: [
        'Statistical moments (mean, variance, skewness, kurtosis)',
        'Spectral energy bands (VLF, LF, HF power ratios)',
        'Signal Quality Index (SQI) computation per channel'
      ]
    }
  },
  {
    id: 'node-model',
    number: '05',
    title: 'CNN / LSTM Backbone',
    shortDesc: '1D Temporal Convolutional layers fused with Bidirectional LSTM Attention',
    status: 'Optimized',
    category: 'model',
    details: {
      technology: 'PyTorch Hybrid 1D-CNN + BiLSTM + Multihead Self-Attention',
      inputShape: '[Batch, 128, Features]',
      outputShape: 'Latent Representation [Batch, 128]',
      parameters: '1,428,350 Trainable Weights',
      specifications: [
        '3x 1D-Conv Blocks (Kernel sizes 7, 5, 3 with BatchNorm and Mish activation)',
        '2-Layer Bidirectional LSTM (Hidden dimension: 128 per direction)',
        'Temporal Attention mechanism weighting critical anomalous windows',
        'Dropout (p=0.25) to prevent sensor-specific overfitting'
      ]
    }
  },
  {
    id: 'node-fault-detection',
    number: '06A',
    title: 'Device Fault Detection',
    shortDesc: 'Hardware state classifier: Normal, Sensor Degradation, or Hardware Fault',
    status: 'Ready',
    category: 'inference',
    details: {
      technology: 'Multi-class Softmax Classification Head',
      inputShape: 'Latent Embedding [128]',
      outputShape: 'Probability Distribution [Normal, Anomaly, Fault]',
      specifications: [
        'Calibrated temperature scaling for reliable predictive confidence',
        'Cross-entropy loss with focal regularization for class imbalance',
        'Sensor probe disconnection vs transducer failure differentiation'
      ]
    }
  },
  {
    id: 'node-risk-analysis',
    number: '06B',
    title: 'Patient Risk Analysis',
    shortDesc: 'Multi-task risk stratification estimating patient stability impact',
    status: 'Ready',
    category: 'inference',
    details: {
      technology: 'Dual-task Clinical Severity Estimator',
      inputShape: 'Latent Embedding [128] + Physiological SQI',
      outputShape: 'Risk Score [Low, Moderate, High]',
      specifications: [
        'Decouples patient vital sign deterioration from device sensor artifacts',
        'Threshold alerts calibrated against clinical engineering protocols',
        'Provides early warning buffer before hardware shutdown occurs'
      ]
    }
  },
  {
    id: 'node-results',
    number: '07',
    title: 'Results & Decision Engine',
    shortDesc: 'Confidence aggregation, anomaly interval indexing & alert dispatching',
    status: 'Ready',
    category: 'output',
    details: {
      technology: 'Clinical Decision Support Aggregator & Export Engine',
      inputShape: 'Dual Predictions + Anomaly Coordinates',
      outputShape: 'Structured Diagnostic Report & Realtime Alert Payload',
      specifications: [
        'Anomaly boundary detection with millisecond timestamp markers',
        'Natural-language engineering explanation generation',
        'Interoperable FHIR / HL7 payload formatting support'
      ]
    }
  }
];
