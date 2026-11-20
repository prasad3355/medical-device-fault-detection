import json
import sqlite3
from pathlib import Path
from typing import List, Optional, Dict, Any
from app.core.config import STORAGE_DIR, SAMPLES_DIR
from app.api.schemas import (
    AnalysisRecord, 
    AnalysisResponse, 
    TelemetryPoint, 
    DetectedAnomaly
)

DB_PATH = STORAGE_DIR / "med_fault.db"

class AnalysisRepository:
    """
    Manages persistent storage for analysis records, telemetry points, and anomalies.
    """

    def __init__(self):
        self._init_db()
        self._seed_initial_data_if_empty()

    def _get_connection(self):
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS analyses (
                    id TEXT PRIMARY KEY,
                    datasetName TEXT,
                    recordsCount INTEGER,
                    deviceType TEXT,
                    deviceStatus TEXT,
                    patientRisk TEXT,
                    confidence REAL,
                    analyzedAt TEXT,
                    anomaliesDetected INTEGER,
                    sensorChannels TEXT,
                    fileSize TEXT,
                    executionTimeMs REAL
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS analysis_details (
                    id TEXT PRIMARY KEY,
                    record_json TEXT,
                    telemetry_json TEXT,
                    anomalies_json TEXT,
                    sensor_averages_json TEXT,
                    fault_confidence REAL,
                    risk_confidence REAL,
                    sqi_score REAL,
                    analysis_mode TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()

    def _seed_initial_data_if_empty(self):
        with self._get_connection() as conn:
            cur = conn.execute("SELECT COUNT(*) as count FROM analyses")
            row = cur.fetchone()
            if row and row["count"] == 0:
                initial_records = [
                    (
                        "rec-101",
                        "ICU_MultiParameter_Telemetry_A4.csv",
                        2450,
                        "Multiparameter Patient Monitor",
                        "Possible Anomaly",
                        "Moderate",
                        94.2,
                        "24 mins ago",
                        3,
                        json.dumps(["SpO2", "Heart Rate", "Temperature", "Pressure"]),
                        "1.42 MB",
                        412.0
                    ),
                    (
                        "rec-102",
                        "Syringe_Pump_Motor_Infusion_Log.csv",
                        1840,
                        "Smart Syringe Infusion Pump",
                        "Fault Detected",
                        "High",
                        96.8,
                        "2 hours ago",
                        4,
                        json.dumps(["Plunger Force", "Motor Torque", "Voltage"]),
                        "860 KB",
                        320.0
                    ),
                    (
                        "rec-103",
                        "Ventilator_Flow_Pressure_Cohort7.csv",
                        3120,
                        "Mechanical Ventilator",
                        "Normal",
                        "Low",
                        98.1,
                        "5 hours ago",
                        0,
                        json.dumps(["Inspiratory Pressure", "PEEP", "Tidal Volume"]),
                        "2.10 MB",
                        518.0
                    ),
                    (
                        "rec-104",
                        "Dialysis_Hemodynamics_Monitor_R2.csv",
                        2780,
                        "Hemodialysis System",
                        "Possible Anomaly",
                        "Moderate",
                        91.5,
                        "Yesterday 16:30",
                        2,
                        json.dumps(["Arterial Press", "Venous Press", "TMP"]),
                        "1.65 MB",
                        440.0
                    ),
                    (
                        "rec-105",
                        "Anesthesia_Workstation_Gas_Audit.csv",
                        4200,
                        "Anesthesia Delivery Station",
                        "Normal",
                        "Low",
                        97.4,
                        "Yesterday 11:20",
                        0,
                        json.dumps(["O2 Sensor", "N2O Sensor", "Agent Conc"]),
                        "2.84 MB",
                        625.0
                    ),
                    (
                        "rec-106",
                        "Defibrillator_Capacitor_Discharge.csv",
                        960,
                        "Biphasic Defibrillator",
                        "Fault Detected",
                        "High",
                        98.7,
                        "2 days ago",
                        5,
                        json.dumps(["Charge Voltage", "Discharge Current", "Impedance"]),
                        "512 KB",
                        180.0
                    )
                ]
                conn.executemany("""
                    INSERT INTO analyses VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, initial_records)
                conn.commit()

    def save_full_analysis(self, response: AnalysisResponse, mode: str = "dual"):
        with self._get_connection() as conn:
            # Save summary record
            record = response.record
            conn.execute("""
                INSERT OR REPLACE INTO analyses (
                    id, datasetName, recordsCount, deviceType, deviceStatus,
                    patientRisk, confidence, analyzedAt, anomaliesDetected,
                    sensorChannels, fileSize, executionTimeMs
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                record.id,
                record.datasetName,
                record.recordsCount,
                record.deviceType,
                record.deviceStatus,
                record.patientRisk,
                record.confidence,
                record.analyzedAt,
                record.anomaliesDetected,
                json.dumps(record.sensorChannels),
                record.fileSize,
                record.executionTimeMs
            ))

            # Save full details for reload/refresh
            conn.execute("""
                INSERT OR REPLACE INTO analysis_details (
                    id, record_json, telemetry_json, anomalies_json,
                    sensor_averages_json, fault_confidence, risk_confidence,
                    sqi_score, analysis_mode
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                record.id,
                record.model_dump_json(),
                json.dumps([t.model_dump() for t in response.telemetry]),
                json.dumps([a.model_dump() for a in response.anomalies]),
                json.dumps(response.sensorAverages),
                response.faultConfidence,
                response.riskConfidence,
                response.sqiScore,
                mode
            ))
            conn.commit()

    def get_all_analyses(self) -> List[AnalysisRecord]:
        with self._get_connection() as conn:
            rows = conn.execute("SELECT * FROM analyses ORDER BY rowid DESC").fetchall()
            records = []
            for r in rows:
                records.append(
                    AnalysisRecord(
                        id=r["id"],
                        datasetName=r["datasetName"],
                        recordsCount=r["recordsCount"],
                        deviceType=r["deviceType"],
                        deviceStatus=r["deviceStatus"],
                        patientRisk=r["patientRisk"],
                        confidence=r["confidence"],
                        analyzedAt=r["analyzedAt"],
                        anomaliesDetected=r["anomaliesDetected"],
                        sensorChannels=json.loads(r["sensorChannels"]) if r["sensorChannels"] else [],
                        fileSize=r["fileSize"],
                        executionTimeMs=r["executionTimeMs"]
                    )
                )
            return records

    def get_full_analysis_by_id(self, record_id: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            row = conn.execute("SELECT * FROM analysis_details WHERE id = ?", (record_id,)).fetchone()
            if row:
                return {
                    "record": json.loads(row["record_json"]),
                    "telemetry": json.loads(row["telemetry_json"]),
                    "anomalies": json.loads(row["anomalies_json"]),
                    "sensorAverages": json.loads(row["sensor_averages_json"]),
                    "faultConfidence": row["fault_confidence"],
                    "riskConfidence": row["risk_confidence"],
                    "sqiScore": row["sqi_score"],
                    "analysisMode": row["analysis_mode"] or "dual"
                }

            # If not in analysis_details, check summary analyses table
            summary_row = conn.execute("SELECT * FROM analyses WHERE id = ?", (record_id,)).fetchone()
            if not summary_row:
                return None

            # Reconstruct fallback details for seeded record
            record = AnalysisRecord(
                id=summary_row["id"],
                datasetName=summary_row["datasetName"],
                recordsCount=summary_row["recordsCount"],
                deviceType=summary_row["deviceType"],
                deviceStatus=summary_row["deviceStatus"],
                patientRisk=summary_row["patientRisk"],
                confidence=summary_row["confidence"],
                analyzedAt=summary_row["analyzedAt"],
                anomaliesDetected=summary_row["anomaliesDetected"],
                sensorChannels=json.loads(summary_row["sensorChannels"]) if summary_row["sensorChannels"] else [],
                fileSize=summary_row["fileSize"],
                executionTimeMs=summary_row["executionTimeMs"]
            )
            return {
                "record": record.model_dump(),
                "telemetry": [],
                "anomalies": [],
                "sensorAverages": {},
                "faultConfidence": summary_row["confidence"],
                "riskConfidence": summary_row["confidence"],
                "sqiScore": 0.88,
                "analysisMode": "dual"
            }

repository = AnalysisRepository()
