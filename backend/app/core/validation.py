import pandas as pd
import numpy as np
import io
from typing import Dict, Any, List, Tuple
from app.api.schemas import ValidationResult

CHANNEL_ALIASES = {
    "spo2": [
        "spo2", "oximeter", "oxygen_saturation", "o2_sat", "saturation", "s_po2", "sa_o2"
    ],
    "heartRate": [
        "heartrate", "heart_rate", "hr", "pulse", "bpm", "pulse_rate"
    ],
    "temperature": [
        "temperature", "temp", "core_temp", "body_temp", "temp_c", "surface_temp"
    ],
    "pressure": [
        "pressure", "airway_pressure", "pip", "peep", "art_press", "ven_press",
        "sys_bp", "systolic", "systolicbp", "systolic_bp", "sbp", "bp_sys",
        "arterial_pressure", "venous_pressure", "mean_pressure", "map"
    ],
    "flowRate": [
        "flowrate", "flow_rate", "flow", "tidal_vol", "tidal_volume", "blood_flow",
        "respiratoryrate", "respiratory_rate", "resp_rate", "rr", "breathing_rate"
    ],
    "motorCurrent": [
        "motorcurrent", "motor_current", "current", "torque", "motor_torque", "plungerforce", "plunger_force"
    ],
    "voltage": [
        "voltage", "volt", "v_bat", "battery_v"
    ]
}

def normalize_column_name(col: str) -> str:
    cleaned = col.lower().strip().replace(" ", "_").replace("-", "_").replace("(", "").replace(")", "").replace("%", "")
    for canonical, aliases in CHANNEL_ALIASES.items():
        for alias in aliases:
            if alias == cleaned or alias in cleaned:
                return canonical
    return cleaned

def parse_dataset_bytes(file_bytes: bytes, file_name: str) -> pd.DataFrame:
    if file_name.endswith((".xlsx", ".xls")):
        df = pd.read_excel(io.BytesIO(file_bytes))
    else:
        # Try comma, then semicolon, then tab delimiter
        try:
            df = pd.read_csv(io.BytesIO(file_bytes))
        except Exception:
            df = pd.read_csv(io.BytesIO(file_bytes), sep=r"[;,\t]", engine="python")
    return df

def validate_dataframe(df: pd.DataFrame, file_name: str, file_size_bytes: int) -> Tuple[ValidationResult, pd.DataFrame]:
    errors = []
    
    if df.empty:
        errors.append("Dataset contains 0 rows.")
        return ValidationResult(
            isValid=False,
            fileName=file_name,
            fileSize=f"{file_size_bytes / 1024:.1f} KB",
            recordsCount=0,
            columns=[],
            sampleRateHz=0.0,
            missingValues=0,
            validationErrors=errors,
            previewRows=[]
        ), df

    # Normalize column names
    col_map = {col: normalize_column_name(col) for col in df.columns}
    df_renamed = df.rename(columns=col_map)

    # Count missing values
    missing_count = int(df_renamed.isnull().sum().sum())
    
    # Identify channel columns
    recognized_channels = [c for c in df_renamed.columns if c in CHANNEL_ALIASES.keys()]
    if not recognized_channels:
        errors.append(f"No medical telemetry channels recognized in columns: {list(df.columns)}. Expected channels like SpO2, HeartRate, Temp, Pressure, FlowRate.")

    # Fill missing values gracefully
    df_clean = df_renamed.bfill().ffill().fillna(0)

    # Estimate sampling rate if timestamp or time exists
    sample_rate_hz = 1.0
    for time_col in ["time", "timestamp", "datetime", "date_time", "t"]:
        if time_col in df_clean.columns:
            try:
                parsed = pd.to_datetime(df_clean[time_col], errors="coerce")
                if parsed.notnull().sum() > 2:
                    deltas = parsed.diff().dt.total_seconds().dropna()
                    median_delta = deltas.median()
                    if median_delta > 0:
                        sample_rate_hz = round(1.0 / median_delta, 2)
            except Exception:
                pass
            break

    # Format file size
    if file_size_bytes > 1024 * 1024:
        size_str = f"{file_size_bytes / (1024 * 1024):.2f} MB"
    else:
        size_str = f"{file_size_bytes / 1024:.1f} KB"

    # Preview rows (first 10)
    preview = df_clean.head(10).to_dict(orient="records")

    result = ValidationResult(
        isValid=len(errors) == 0,
        fileName=file_name,
        fileSize=size_str,
        recordsCount=len(df_clean),
        columns=list(df_clean.columns),
        sampleRateHz=sample_rate_hz,
        missingValues=missing_count,
        validationErrors=errors,
        previewRows=preview
    )
    return result, df_clean
