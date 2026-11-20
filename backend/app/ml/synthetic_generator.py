import numpy as np
import pandas as pd
from pathlib import Path
from app.core.config import SAMPLES_DIR

def generate_icu_telemetry(n_points: int = 240) -> pd.DataFrame:
    """
    Generates ICU Multi-parameter Telemetry with desaturation & tachycardia anomaly window.
    """
    np.random.seed(101)
    timestamps = [f"{10 + (i*5)//60:02d}:{(i*5)%60:02d}" for i in range(n_points)]
    
    # Baseline nominal signals
    spo2 = np.random.normal(98.2, 0.4, n_points)
    hr = np.random.normal(74.0, 2.5, n_points)
    temp = np.random.normal(36.9, 0.15, n_points)
    press = np.random.normal(14.2, 0.3, n_points)
    flow = np.random.normal(45.0, 0.8, n_points)

    # Anomaly window between index 30 and 45
    spo2[30:42] = np.linspace(95.0, 88.4, 12) + np.random.normal(0, 0.2, 12)
    hr[30:42] = np.linspace(78.0, 114.0, 12) + np.random.normal(0, 1.0, 12)
    temp[30:42] = np.linspace(37.1, 38.0, 12)
    press[30:42] = np.linspace(14.5, 20.4, 12)

    # Recovery
    spo2[42:50] = np.linspace(89.0, 97.5, 8)
    hr[42:50] = np.linspace(110.0, 76.0, 8)

    # Sensor thermal drift anomaly between index 70 and 80
    temp[70:80] = np.linspace(37.0, 38.7, 10)

    df = pd.DataFrame({
        "time": timestamps,
        "spo2": np.clip(np.round(spo2, 1), 70, 100),
        "heartRate": np.clip(np.round(hr, 1), 30, 200),
        "temperature": np.clip(np.round(temp, 1), 34, 42),
        "pressure": np.clip(np.round(press, 1), 5, 35),
        "flowRate": np.clip(np.round(flow, 1), 10, 80)
    })
    return df

def generate_syringe_pump_log(n_points: int = 180) -> pd.DataFrame:
    """
    Smart Syringe Pump with Occlusion Fault (motor current & plunger force surge).
    """
    np.random.seed(202)
    timestamps = [f"{8 + (i*15)//60:02d}:{(i*15)%60:02d}" for i in range(n_points)]
    
    plunger_force = np.random.normal(12.2, 0.3, n_points)
    motor_torque = np.random.normal(0.42, 0.02, n_points)
    flow_rate = np.random.normal(5.0, 0.05, n_points)
    voltage = np.random.normal(12.0, 0.05, n_points)

    # Occlusion surge at point 25 onwards
    plunger_force[25:35] = np.linspace(13.0, 28.5, 10)
    motor_torque[25:35] = np.linspace(0.45, 1.15, 10)
    flow_rate[25:35] = np.linspace(5.0, 1.8, 10)
    voltage[25:35] = np.linspace(12.0, 11.2, 10)

    df = pd.DataFrame({
        "time": timestamps,
        "plungerForce": np.round(plunger_force, 2),
        "motorTorque": np.round(motor_torque, 2),
        "flowRate": np.round(flow_rate, 2),
        "voltage": np.round(voltage, 2),
        "heartRate": 75.0,
        "spo2": 98.0,
        "temperature": 37.0,
        "pressure": np.round(plunger_force * 0.8, 1)
    })
    return df

def generate_ventilator_log(n_points: int = 200) -> pd.DataFrame:
    """
    Ventilator log with nominal operating parameters.
    """
    np.random.seed(303)
    timestamps = [f"{14 + (i*10)//60:02d}:{(i*10)%60:02d}" for i in range(n_points)]
    
    pip = np.random.normal(18.3, 0.2, n_points)
    peep = np.random.normal(5.0, 0.1, n_points)
    tidal_vol = np.random.normal(450, 4.0, n_points)
    fio2 = np.full(n_points, 40.0)

    df = pd.DataFrame({
        "time": timestamps,
        "pressure": np.round(pip, 1),
        "flowRate": np.round(tidal_vol / 10.0, 1),
        "heartRate": 72.0,
        "spo2": 98.5,
        "temperature": 36.8
    })
    return df

def populate_sample_datasets():
    """
    Writes sample CSV files to backend/data/samples.
    """
    icu_df = generate_icu_telemetry()
    icu_path = SAMPLES_DIR / "ICU_MultiParameter_Telemetry_A4.csv"
    icu_df.to_csv(icu_path, index=False)

    syringe_df = generate_syringe_pump_log()
    syringe_path = SAMPLES_DIR / "Syringe_Pump_Motor_Infusion_Log.csv"
    syringe_df.to_csv(syringe_path, index=False)

    vent_df = generate_ventilator_log()
    vent_path = SAMPLES_DIR / "Ventilator_Flow_Pressure_Cohort7.csv"
    vent_df.to_csv(vent_path, index=False)

if __name__ == "__main__":
    populate_sample_datasets()
    print("Sample datasets populated successfully.")
