import unittest
import pandas as pd
import numpy as np
import io
from app.ml.preprocessor import MedicalSignalPreprocessor
from app.ml.feature_extraction import TelemetryFeatureExtractor
from app.ml.models import DeepTemporalCNNBiLSTM, AnomalyEnsembleDetector
from app.ml.detector import MedicalFaultAndRiskDetector
from app.core.validation import validate_dataframe, parse_dataset_bytes
from app.storage.repository import repository
from app.api.schemas import AnalysisRequest
from app.api.routes import analyze_dataset, upload_dataset

class TestMedicalPipeline(unittest.TestCase):

    def setUp(self):
        self.preprocessor = MedicalSignalPreprocessor()
        self.detector = MedicalFaultAndRiskDetector()

    def test_preprocessor_smoothing_and_sqi(self):
        # Generate signal with high frequency noise
        t = np.linspace(0, 10, 100)
        signal = 98.0 + np.sin(t) + np.random.normal(0, 0.5, 100)
        smoothed = self.preprocessor.smooth_signal(signal)
        sqi = self.preprocessor.compute_sqi(signal)

        self.assertEqual(len(smoothed), 100)
        self.assertGreaterEqual(sqi, 0.20)
        self.assertLessEqual(sqi, 1.0)

    def test_cnn_bilstm_forward_pass(self):
        model = DeepTemporalCNNBiLSTM(input_dim=5, conv_filters=16, lstm_units=32)
        # Dummy batch: 2 windows of length 10 with 5 channels
        batch = np.random.randn(2, 10, 5)
        embeddings = model.forward(batch)
        # Output should be [2, 64] (32 fwd + 32 bwd)
        self.assertEqual(embeddings.shape, (2, 64))

    def test_validation_clean_csv(self):
        csv_data = "time,spo2,heartRate,temperature,pressure,flowRate\n10:00,98.2,72,36.8,14.2,45.0\n10:05,98.0,74,36.9,14.3,45.1"
        df = parse_dataset_bytes(csv_data.encode("utf-8"), "test.csv")
        result, clean_df = validate_dataframe(df, "test.csv", len(csv_data))
        self.assertTrue(result.isValid)
        self.assertEqual(result.recordsCount, 2)
        self.assertEqual(len(result.validationErrors), 0)

    def test_validation_empty_csv(self):
        df = pd.DataFrame()
        result, _ = validate_dataframe(df, "empty.csv", 0)
        self.assertFalse(result.isValid)
        self.assertGreater(len(result.validationErrors), 0)

    def test_dual_mode_analysis(self):
        # Create synthetic dataframe with an anomaly
        n = 50
        df = pd.DataFrame({
            "time": [f"10:{i:02d}" for i in range(n)],
            "spo2": [98.0]*30 + [87.5]*10 + [97.0]*10,
            "heartRate": [74.0]*30 + [115.0]*10 + [75.0]*10,
            "temperature": [36.9]*50,
            "pressure": [14.0]*30 + [22.0]*10 + [14.0]*10,
            "flowRate": [45.0]*50
        })
        record, telemetry, anomalies, avgs, f_conf, r_conf, sqi = self.detector.analyze_telemetry_dataframe(
            df, "synthetic_test.csv", mode="dual"
        )
        self.assertGreater(len(telemetry), 0)
        self.assertGreater(len(anomalies), 0)
        self.assertIn(record.deviceStatus, ["Possible Anomaly", "Fault Detected"])
        self.assertIn(record.patientRisk, ["Moderate", "High"])

    def test_fault_only_mode(self):
        df = pd.DataFrame({
            "time": [f"10:{i:02d}" for i in range(40)],
            "spo2": [98.0]*40,
            "heartRate": [72.0]*40,
            "temperature": [36.8]*40,
            "pressure": [14.0]*20 + [24.0]*10 + [14.0]*10,
            "flowRate": [45.0]*40
        })
        record, telemetry, anomalies, _, _, _, _ = self.detector.analyze_telemetry_dataframe(
            df, "fault_test.csv", mode="fault_only"
        )
        # In fault_only mode, patient risk is set to Not assessed
        self.assertEqual(record.patientRisk, "Not assessed")
        self.assertIn(record.deviceStatus, ["Possible Anomaly", "Fault Detected"])

    def test_risk_only_mode(self):
        df = pd.DataFrame({
            "time": [f"10:{i:02d}" for i in range(40)],
            "spo2": [98.0]*20 + [86.0]*10 + [95.0]*10,
            "heartRate": [72.0]*20 + [125.0]*10 + [74.0]*10,
            "temperature": [36.8]*40,
            "pressure": [14.0]*40,
            "flowRate": [45.0]*40
        })
        record, telemetry, anomalies, _, _, _, _ = self.detector.analyze_telemetry_dataframe(
            df, "risk_test.csv", mode="risk_only"
        )
        # In risk_only mode, device status is set to Not assessed
        self.assertEqual(record.deviceStatus, "Not assessed")
        self.assertIn(record.patientRisk, ["Moderate", "High"])

    def test_persistence_save_and_retrieve_details(self):
        from app.api.schemas import AnalysisResponse, AnalysisRecord, TelemetryPoint, DetectedAnomaly
        rec = AnalysisRecord(
            id="test-run-999",
            datasetName="persist_test.csv",
            recordsCount=100,
            deviceType="Infusion Pump",
            deviceStatus="Fault Detected",
            patientRisk="High",
            confidence=95.5,
            analyzedAt="Just now",
            anomaliesDetected=1,
            sensorChannels=["SpO2", "Heart Rate"],
            fileSize="12.0 KB",
            executionTimeMs=312.0
        )
        resp = AnalysisResponse(
            record=rec,
            telemetry=[
                TelemetryPoint(time="10:00", timestamp=0.0, spo2=98.0, heartRate=72.0, temperature=36.8, pressure=14.0, flowRate=45.0)
            ],
            anomalies=[
                DetectedAnomaly(
                    id="anom-test",
                    parameter="SpO2",
                    timestamp="10:00",
                    observedValue="88%",
                    expectedRange="95-100%",
                    confidence=94.0,
                    severity="critical",
                    implication="Desaturation",
                    suggestedAction="Check airway"
                )
            ],
            sensorAverages={"spo2": 98.0},
            faultConfidence=95.5,
            riskConfidence=95.5,
            sqiScore=0.92
        )
        repository.save_full_analysis(resp, mode="dual")
        retrieved = repository.get_full_analysis_by_id("test-run-999")
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved["record"]["id"], "test-run-999")
        self.assertEqual(len(retrieved["telemetry"]), 1)
        self.assertEqual(len(retrieved["anomalies"]), 1)
        self.assertEqual(retrieved["analysisMode"], "dual")

if __name__ == "__main__":
    unittest.main()
