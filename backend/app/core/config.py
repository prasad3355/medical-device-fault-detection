import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "data" / "uploads"
SAMPLES_DIR = BASE_DIR / "data" / "samples"
STORAGE_DIR = BASE_DIR / "data" / "storage"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
SAMPLES_DIR.mkdir(parents=True, exist_ok=True)
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "*"
]

# Normal physiological / hardware operational thresholds
NOMINAL_THRESHOLDS = {
    "spo2": {"min": 95.0, "max": 100.0, "unit": "%"},
    "heartRate": {"min": 60.0, "max": 100.0, "unit": "bpm"},
    "temperature": {"min": 36.5, "max": 37.5, "unit": "°C"},
    "pressure": {"min": 10.0, "max": 16.0, "unit": "cmH2O"},
    "flowRate": {"min": 40.0, "max": 50.0, "unit": "L/min"},
    "motorCurrent": {"min": 1.0, "max": 1.3, "unit": "A"},
    "plungerForce": {"min": 10.0, "max": 15.0, "unit": "N"},
}
