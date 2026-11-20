from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field

DeviceFaultStatus = Literal["Normal", "Possible Anomaly", "Fault Detected", "Not assessed", "True Alarm", "False Alarm"]
PatientRiskLevel = Literal["Low", "Moderate", "High", "Not assessed"]
AnalysisMode = Literal["dual", "fault_only", "risk_only", "icu_alarm"]

class TelemetryPoint(BaseModel):
    time: str
    timestamp: float
    spo2: float
    heartRate: float
    temperature: float
    pressure: float
    flowRate: float
    isAnomaly: Optional[bool] = False
    anomalyType: Optional[str] = None
    severity: Optional[Literal["warning", "critical", "nominal"]] = "nominal"

class DetectedAnomaly(BaseModel):
    id: str
    parameter: str
    timestamp: str
    observedValue: str
    expectedRange: str
    confidence: float
    severity: Literal["low", "moderate", "critical"]
    implication: str
    suggestedAction: str

class AnalysisRecord(BaseModel):
    id: str
    datasetName: str
    recordsCount: int
    deviceType: str
    deviceStatus: DeviceFaultStatus
    patientRisk: PatientRiskLevel
    confidence: float
    analyzedAt: str
    anomaliesDetected: int
    sensorChannels: List[str]
    fileSize: str
    executionTimeMs: float

class ValidationResult(BaseModel):
    isValid: bool
    fileName: str
    fileSize: str
    recordsCount: int
    columns: List[str]
    sampleRateHz: float
    missingValues: int
    validationErrors: List[str]
    previewRows: List[Dict[str, Any]]

class AnalysisRequest(BaseModel):
    datasetId: Optional[str] = None
    fileName: Optional[str] = None
    mode: AnalysisMode = "dual"
    records: Optional[List[Dict[str, Any]]] = None

class AnalysisResponse(BaseModel):
    record: AnalysisRecord
    telemetry: List[TelemetryPoint]
    anomalies: List[DetectedAnomaly]
    sensorAverages: Dict[str, float]
    faultConfidence: float
    riskConfidence: float
    sqiScore: float

class ModelComparisonMetric(BaseModel):
    model: str
    accuracy: float
    precision: float
    recall: float
    f1Score: float
    inferenceLatencyMs: float

class ConfusionMatrixCell(BaseModel):
    actual: DeviceFaultStatus
    predicted: DeviceFaultStatus
    count: int
    percentage: float

class TrainingEpoch(BaseModel):
    epoch: int
    trainAccuracy: float
    valAccuracy: float
    trainLoss: float
    valLoss: float

class ModelPerformanceResponse(BaseModel):
    metrics: List[ModelComparisonMetric]
    confusionMatrix: List[ConfusionMatrixCell]
    trainingEpochs: List[TrainingEpoch]
