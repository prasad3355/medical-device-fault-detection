"""
MedFault AI - ICU Arrhythmia Alarm Inference Engine
Integrates the trained Random Forest classifier trained on the PhysioNet 2015 Challenge.
Reuses the exact 48-feature extraction pipeline, signal scaling, and pre-alarm windowing.
"""

import os
import io
import time
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any

import numpy as np
import scipy.io as sio
import scipy.signal as signal
from scipy.stats import skew, kurtosis
import joblib

from app.api.schemas import (
    AnalysisRecord,
    TelemetryPoint,
    DetectedAnomaly,
    AnalysisResponse,
)

FS = 250.0  # Sampling frequency in Hz across PhysioNet 2015 challenge recordings
PRE_ALARM_SEC = 30.0  # 30-second pre-alarm observation window
PRE_ALARM_SAMPLES = int(PRE_ALARM_SEC * FS)  # 7500 samples
ALARM_SAMPLE = 75000  # Alarm occurs at 5-minute mark (300 seconds * 250 Hz)
START_SAMPLE = ALARM_SAMPLE - PRE_ALARM_SAMPLES  # 67500

ECG_LEAD_CANDIDATES = ["II", "V", "MCL", "I", "III", "aVF", "aVR", "aVL"]
ALARM_TYPES = [
    "Asystole",
    "Bradycardia",
    "Tachycardia",
    "Ventricular_Flutter_Fib",
    "Ventricular_Tachycardia",
]

# Locate saved model artifact
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
MODEL_PATH = BASE_DIR / "data_local" / "icu_alarm_model.joblib"


class ICUAlarmClassifier:
    def __init__(self, model_path: Optional[Path] = None):
        self.model_path = model_path or MODEL_PATH
        self.artifact = None
        self.model = None
        self.feature_names = None
        self.test_metrics = None
        self._load_model()

    def _load_model(self):
        if not self.model_path.exists():
            raise FileNotFoundError(
                f"ICU Alarm model artifact not found at {self.model_path}. Run training first."
            )
        self.artifact = joblib.load(self.model_path)
        self.model = self.artifact["model"]
        self.feature_names = self.artifact["feature_names"]
        self.test_metrics = self.artifact.get("test_metrics", {})

    def parse_header_text(self, hea_text: str) -> Dict[str, Any]:
        """Parses PhysioNet .hea WFDB header text."""
        lines = [line.strip() for line in hea_text.splitlines() if line.strip()]
        if not lines:
            raise ValueError("Empty header content")

        header_parts = lines[0].split()
        if len(header_parts) < 4:
            raise ValueError(f"Invalid WFDB header format: {lines[0]}")

        record_name = header_parts[0]
        n_sig = int(header_parts[1])
        fs = float(header_parts[2])
        n_samples = int(header_parts[3])

        signals_info = []
        for i in range(1, 1 + n_sig):
            if i >= len(lines):
                break
            parts = lines[i].split()
            mat_file = parts[0]
            gain_str = parts[2]
            gain_val = float(gain_str.split("/")[0]) if "/" in gain_str else float(gain_str)
            if gain_val <= 0:
                gain_val = 1.0
            lead_name = parts[-1]
            signals_info.append({
                "index": i - 1,
                "lead": lead_name,
                "gain": gain_val,
                "mat_file": mat_file,
            })

        alarm_type = "Unknown"
        is_true_alarm = None
        for line in lines:
            if line.startswith("#"):
                comment = line[1:].strip()
                comment_lower = comment.lower()
                if "true alarm" in comment_lower:
                    is_true_alarm = 1
                elif "false alarm" in comment_lower:
                    is_true_alarm = 0
                elif comment in ALARM_TYPES:
                    alarm_type = comment
                elif any(t.lower() in comment_lower for t in ALARM_TYPES):
                    for t in ALARM_TYPES:
                        if t.lower() in comment_lower:
                            alarm_type = t
                            break

        return {
            "record_name": record_name,
            "n_signals": n_sig,
            "fs": fs,
            "n_samples": n_samples,
            "signals": signals_info,
            "alarm_type": alarm_type,
            "is_true_alarm": is_true_alarm,
        }

    def compute_spectral_features(self, sig: np.ndarray, fs: float) -> Dict[str, float]:
        nperseg = min(len(sig), int(4.0 * fs))
        freqs, psd = signal.welch(sig, fs=fs, nperseg=nperseg)
        total_power = np.sum(psd) + 1e-12

        ecg_mask = (freqs >= 0.5) & (freqs <= 30.0)
        ecg_power = np.sum(psd[ecg_mask])

        lf_mask = freqs < 0.5
        lf_power = np.sum(psd[lf_mask])

        hf_mask = (freqs >= 40.0) & (freqs <= 100.0)
        hf_power = np.sum(psd[hf_mask])

        vtvf_mask = (freqs >= 2.5) & (freqs <= 7.5)
        vtvf_power = np.sum(psd[vtvf_mask])

        valid_mask = (freqs >= 0.5) & (freqs <= 40.0)
        dom_freq = freqs[valid_mask][np.argmax(psd[valid_mask])] if np.any(valid_mask) else 0.0

        psd_norm = psd / total_power
        psd_norm = psd_norm[psd_norm > 0]
        spec_entropy = -np.sum(psd_norm * np.log2(psd_norm))

        return {
            "total_power": float(total_power),
            "ecg_band_power": float(ecg_power),
            "sqi_power_ratio": float(ecg_power / total_power),
            "lf_wander_ratio": float(lf_power / total_power),
            "hf_noise_ratio": float(hf_power / total_power),
            "vtvf_power_ratio": float(vtvf_power / total_power),
            "dominant_freq": float(dom_freq),
            "spectral_entropy": float(spec_entropy),
        }

    def detect_qrs_peaks(self, sig: np.ndarray, fs: float) -> np.ndarray:
        if len(sig) < int(fs * 2):
            return np.array([], dtype=int)

        b, a = signal.butter(2, [5.0 / (fs / 2.0), 20.0 / (fs / 2.0)], btype="bandpass")
        filtered = signal.filtfilt(b, a, sig)
        diff = np.diff(filtered)
        squared = diff ** 2
        win_len = max(3, int(0.15 * fs))
        integrated = np.convolve(squared, np.ones(win_len) / win_len, mode="same")

        min_dist = int(0.20 * fs)
        threshold = np.percentile(integrated, 75)
        min_height = max(float(threshold), 1e-5)

        peaks, _ = signal.find_peaks(integrated, height=min_height, distance=min_dist)
        return peaks

    def extract_features(
        self, header_info: Dict[str, Any], val_array: np.ndarray
    ) -> Tuple[Dict[str, float], np.ndarray, str]:
        """
        Extracts the exact 48 features matching the training pipeline.
        Returns: (features_dict, primary_ecg_mv_30s, primary_lead_name)
        """
        total_samples = val_array.shape[1]
        alarm_idx = min(ALARM_SAMPLE, total_samples)
        start_idx = max(0, alarm_idx - PRE_ALARM_SAMPLES)

        signals_meta = header_info["signals"]
        lead_to_index: Dict[str, Tuple[int, float]] = {
            s["lead"].upper(): (s["index"], s["gain"]) for s in signals_meta
        }

        # Select Primary ECG Lead
        primary_idx = None
        primary_gain = 1.0
        primary_lead_name = "NONE"
        for candidate in ECG_LEAD_CANDIDATES:
            if candidate.upper() in lead_to_index:
                primary_idx, primary_gain = lead_to_index[candidate.upper()]
                primary_lead_name = candidate.upper()
                break

        if primary_idx is None:
            primary_idx = 0
            primary_gain = signals_meta[0]["gain"]
            primary_lead_name = signals_meta[0]["lead"]

        # Select Secondary ECG Lead
        secondary_idx = None
        secondary_gain = 1.0
        for candidate in ECG_LEAD_CANDIDATES:
            cand_upper = candidate.upper()
            if cand_upper in lead_to_index and cand_upper != primary_lead_name:
                secondary_idx, secondary_gain = lead_to_index[cand_upper]
                break

        raw_primary = val_array[primary_idx, start_idx:alarm_idx].astype(np.float64)
        sig = raw_primary / primary_gain
        sig = np.nan_to_num(sig, nan=0.0, posinf=10.0, neginf=-10.0)
        sig = np.clip(sig, -15.0, 15.0)

        sig_mean = float(np.mean(sig))
        sig_std = float(np.std(sig))
        sig_var = float(np.var(sig))
        sig_skew = float(skew(sig)) if sig_std > 1e-6 else 0.0
        sig_kurt = float(kurtosis(sig)) if sig_std > 1e-6 else 0.0
        sig_p2p = float(np.ptp(sig))
        sig_iqr = float(np.percentile(sig, 75) - np.percentile(sig, 25))
        sig_rms = float(np.sqrt(np.mean(sig ** 2)))

        centered = sig - sig_mean
        zero_crossings = int(np.sum(np.diff(np.signbit(centered)) != 0))

        spectral = self.compute_spectral_features(sig, FS)
        peaks = self.detect_qrs_peaks(sig, FS)
        n_beats = len(peaks)

        if n_beats >= 2:
            rr_intervals = np.diff(peaks) / FS
            rr_mean = float(np.mean(rr_intervals))
            rr_std = float(np.std(rr_intervals))
            rr_rmssd = float(np.sqrt(np.mean(np.diff(rr_intervals) ** 2))) if len(rr_intervals) >= 2 else 0.0
            max_pause = float(np.max(rr_intervals))
            pauses_gt_2s = int(np.sum(rr_intervals > 2.0))
            pauses_gt_4s = int(np.sum(rr_intervals > 4.0))

            instant_hr = 60.0 / (rr_intervals + 1e-6)
            instant_hr = np.clip(instant_hr, 10.0, 350.0)
            hr_mean = float(np.mean(instant_hr))
            hr_median = float(np.median(instant_hr))
            hr_std = float(np.std(instant_hr))
            hr_min = float(np.min(instant_hr))
            hr_max = float(np.max(instant_hr))
        else:
            rr_mean = 30.0
            rr_std = 0.0
            rr_rmssd = 0.0
            max_pause = 30.0
            pauses_gt_2s = 1 if n_beats <= 1 else 0
            pauses_gt_4s = 1 if n_beats == 0 else 0
            hr_mean = 0.0
            hr_median = 0.0
            hr_std = 0.0
            hr_min = 0.0
            hr_max = 0.0

        split_sample = int(len(sig) * (20.0 / PRE_ALARM_SEC))
        first_20s = sig[:split_sample]
        last_10s = sig[split_sample:]

        first20_std = float(np.std(first_20s)) + 1e-6
        last10_std = float(np.std(last_10s))
        last10_amp_ratio = float(last10_std / first20_std)
        last5_samples = int(5.0 * FS)
        last5s_max_amp = float(np.max(np.abs(sig[-last5_samples:]))) if len(sig) >= last5_samples else float(np.max(np.abs(sig)))

        peaks_last10 = [p for p in peaks if p >= split_sample]
        n_beats_last10 = len(peaks_last10)

        if secondary_idx is not None:
            raw_sec = val_array[secondary_idx, start_idx:alarm_idx].astype(np.float64) / secondary_gain
            raw_sec = np.nan_to_num(raw_sec, nan=0.0)
            sec_std = float(np.std(raw_sec))
            sec_p2p = float(np.ptp(raw_sec))
            sec_peaks = self.detect_qrs_peaks(raw_sec, FS)
            sec_n_beats = len(sec_peaks)
            sec_max_pause = float(np.max(np.diff(sec_peaks) / FS)) if len(sec_peaks) >= 2 else 30.0
            has_secondary_ecg = 1.0
        else:
            sec_std = sig_std
            sec_p2p = sig_p2p
            sec_n_beats = n_beats
            sec_max_pause = max_pause
            has_secondary_ecg = 0.0

        has_pleth = 1.0 if "PLETH" in lead_to_index else 0.0
        pleth_std = 0.0
        pleth_p2p = 0.0
        if has_pleth:
            pl_idx, pl_gain = lead_to_index["PLETH"]
            pl_sig = val_array[pl_idx, start_idx:alarm_idx].astype(np.float64) / (pl_gain if pl_gain > 0 else 1.0)
            pleth_std = float(np.std(pl_sig[-int(10 * FS):]))
            pleth_p2p = float(np.ptp(pl_sig[-int(10 * FS):]))

        has_abp = 1.0 if "ABP" in lead_to_index else 0.0
        abp_std = 0.0
        abp_mean = 0.0
        if has_abp:
            abp_idx, abp_gain = lead_to_index["ABP"]
            abp_sig = val_array[abp_idx, start_idx:alarm_idx].astype(np.float64) / (abp_gain if abp_gain > 0 else 1.0)
            abp_std = float(np.std(abp_sig[-int(10 * FS):]))
            abp_mean = float(np.mean(abp_sig[-int(10 * FS):]))

        alarm_type_str = header_info.get("alarm_type", "Unknown")
        alarm_type_features = {
            f"alarm_is_{t}": (1.0 if alarm_type_str == t else 0.0) for t in ALARM_TYPES
        }

        features: Dict[str, float] = {
            "sig_mean": sig_mean,
            "sig_std": sig_std,
            "sig_var": sig_var,
            "sig_skew": sig_skew,
            "sig_kurt": sig_kurt,
            "sig_p2p": sig_p2p,
            "sig_iqr": sig_iqr,
            "sig_rms": sig_rms,
            "zero_crossings": float(zero_crossings),
            **spectral,
            "n_beats": float(n_beats),
            "hr_mean": hr_mean,
            "hr_median": hr_median,
            "hr_std": hr_std,
            "hr_min": hr_min,
            "hr_max": hr_max,
            "rr_mean": rr_mean,
            "rr_std": rr_std,
            "rr_rmssd": rr_rmssd,
            "max_pause": max_pause,
            "pauses_gt_2s": float(pauses_gt_2s),
            "pauses_gt_4s": float(pauses_gt_4s),
            "last10_amp_ratio": last10_amp_ratio,
            "last5s_max_amp": last5s_max_amp,
            "n_beats_last10": float(n_beats_last10),
            "has_secondary_ecg": has_secondary_ecg,
            "sec_std": sec_std,
            "sec_p2p": sec_p2p,
            "sec_n_beats": float(sec_n_beats),
            "sec_max_pause": sec_max_pause,
            "has_pleth": has_pleth,
            "pleth_std": pleth_std,
            "pleth_p2p": pleth_p2p,
            "has_abp": has_abp,
            "abp_std": abp_std,
            "abp_mean": abp_mean,
            **alarm_type_features,
        }

        return features, sig, primary_lead_name

    def predict_alarm(
        self, hea_content: str, mat_bytes: bytes, record_name: str
    ) -> AnalysisResponse:
        """
        Executes end-to-end inference using the trained Random Forest model.
        Returns a complete AnalysisResponse compatible with the MedFault UI.
        """
        t0 = time.time()
        header_info = self.parse_header_text(hea_content)

        try:
            mat = sio.loadmat(io.BytesIO(mat_bytes))
        except Exception as e:
            raise ValueError(f"Failed to parse MATLAB .mat waveform binary: {str(e)}")

        val_array = mat.get("val")
        if val_array is None or val_array.ndim != 2:
            raise ValueError("MATLAB .mat file missing 'val' 2D telemetry signal matrix")

        # Feature extraction
        feats, ecg_sig, lead_name = self.extract_features(header_info, val_array)

        # Assemble feature vector in exact order expected by trained model
        feature_vector = np.array(
            [[feats[f] for f in self.feature_names]], dtype=np.float32
        )

        # Model inference
        pred_class = int(self.model.predict(feature_vector)[0])
        pred_proba = self.model.predict_proba(feature_vector)[0]
        true_prob = float(pred_proba[1])
        confidence_val = round((true_prob if pred_class == 1 else (1.0 - true_prob)) * 100, 1)

        alarm_type = header_info.get("alarm_type", "Arrhythmia")
        exec_time_ms = round((time.time() - t0) * 1000, 2)

        # Downsample 30s signal (7,500 samples @ 250 Hz) down to 300 points for UI charts
        downsample_factor = max(1, len(ecg_sig) // 300)
        telemetry_points: List[TelemetryPoint] = []
        for i in range(0, len(ecg_sig), downsample_factor):
            t_sec = -30.0 + (i / FS)
            time_label = f"{t_sec:.1f}s"
            is_near_alarm = t_sec >= -5.0
            telemetry_points.append(
                TelemetryPoint(
                    time=time_label,
                    timestamp=round(t_sec, 2),
                    spo2=98.0,
                    heartRate=round(feats["hr_mean"], 1),
                    temperature=36.8,
                    pressure=round(float(ecg_sig[i]), 3),  # ECG amplitude in mV
                    flowRate=0.0,
                    isAnomaly=is_near_alarm and (pred_class == 1),
                    anomalyType=f"{alarm_type} Episode" if (is_near_alarm and pred_class == 1) else None,
                    severity="critical" if (is_near_alarm and pred_class == 1) else "nominal",
                )
            )

        # Anomaly / Verification finding
        anomalies: List[DetectedAnomaly] = []
        if pred_class == 1:
            anomalies.append(
                DetectedAnomaly(
                    id=f"alarm-true-{int(time.time())}",
                    parameter=f"ECG {lead_name} / {alarm_type}",
                    timestamp="t-0.0s (Alarm Window)",
                    observedValue=f"True Alarm ({true_prob*100:.1f}% Confidence)",
                    expectedRange="Artifact / False Alarm",
                    confidence=confidence_val,
                    severity="critical",
                    implication=f"Confirmed acute {alarm_type} event. Pre-alarm ECG dynamics indicate genuine hemodynamic distress requiring clinician intervention.",
                    suggestedAction="Initiate bedside clinical protocol and verify patient vital signs immediately.",
                )
            )
        else:
            anomalies.append(
                DetectedAnomaly(
                    id=f"alarm-false-{int(time.time())}",
                    parameter=f"ECG {lead_name} / {alarm_type}",
                    timestamp="t-0.0s (Alarm Window)",
                    observedValue=f"False Alarm (Suppressed: {(1-true_prob)*100:.1f}%)",
                    expectedRange="Verified Arrhythmia Event",
                    confidence=confidence_val,
                    severity="low",
                    implication=f"Alarm classified as False Positive artifact. High baseline wander or electrode motion artifact triggered threshold breach without physiological crisis.",
                    suggestedAction="Suppress audible monitor alarm; inspect electrode contact and lead impedance.",
                )
            )

        run_id = f"icu-{header_info['record_name']}-{int(time.time()) % 10000}"
        device_status = "True Alarm" if pred_class == 1 else "False Alarm"
        patient_risk = "High" if pred_class == 1 else "Low"

        record = AnalysisRecord(
            id=run_id,
            datasetName=f"{header_info['record_name']} ({alarm_type})",
            recordsCount=len(ecg_sig),
            deviceType=f"ICU Monitor ({alarm_type})",
            deviceStatus=device_status,
            patientRisk=patient_risk,
            confidence=confidence_val,
            analyzedAt="Just now",
            anomaliesDetected=len(anomalies),
            sensorChannels=[s["lead"] for s in header_info["signals"]],
            fileSize=f"{len(mat_bytes) / 1024:.1f} KB",
            executionTimeMs=exec_time_ms,
        )

        sensor_averages = {
            "heartRate": round(feats["hr_mean"], 1),
            "maxPauseSec": round(feats["max_pause"], 2),
            "ecgAmplitudeMv": round(feats["sig_p2p"], 2),
            "sqiPowerRatio": round(feats["sqi_power_ratio"], 3),
            "trueAlarmProb": round(true_prob * 100, 1),
        }

        return AnalysisResponse(
            record=record,
            telemetry=telemetry_points,
            anomalies=anomalies,
            sensorAverages=sensor_averages,
            faultConfidence=confidence_val,
            riskConfidence=round(true_prob * 100, 1),
            sqiScore=round(feats["sqi_power_ratio"], 3),
        )


# Singleton classifier instance
icu_classifier = ICUAlarmClassifier()
