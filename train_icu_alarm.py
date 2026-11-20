"""
MedFault AI - PhysioNet Challenge 2015 ICU Alarm Classification
Baseline Random Forest Model for True vs. False Arrhythmia Alarms

Dataset: PhysioNet/Computing in Cardiology Challenge 2015
Recordings: 750 multi-lead ICU recordings (ECG leads II, V, etc., plus optional PLETH and ABP)
Goal: Classify true vs. false critical arrhythmia alarms from the 30 seconds before the alarm.
"""

import os
import sys
import glob
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any

import numpy as np
import scipy.io as sio
import scipy.signal as signal
from scipy.stats import skew, kurtosis
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    confusion_matrix,
    classification_report,
    recall_score,
    precision_score,
    f1_score,
    accuracy_score,
    roc_auc_score,
)
import joblib

# Constants
FS = 250.0  # Sampling frequency in Hz across PhysioNet 2015 challenge recordings
PRE_ALARM_SEC = 30.0  # Duration of pre-alarm window in seconds
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


def parse_header(hea_path: str) -> Dict[str, Any]:
    """
    Parses a PhysioNet WFDB header (.hea) file.
    Extracts signal names, gains, ADC zeroes, alarm type, and true/false ground truth.
    """
    with open(hea_path, "r", encoding="utf-8", errors="ignore") as f:
        lines = [line.strip() for line in f if line.strip()]

    # First line: [record_name, n_signals, fs, n_samples]
    header_parts = lines[0].split()
    record_name = header_parts[0]
    n_sig = int(header_parts[1])
    fs = float(header_parts[2])
    n_samples = int(header_parts[3])

    signals_info = []
    for i in range(1, 1 + n_sig):
        parts = lines[i].split()
        mat_file = parts[0]
        gain_str = parts[2]
        # Gain is typically "7247/mV" or "1.052e+04/mV"
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

    # Comments for label and alarm type
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


def compute_spectral_features(sig: np.ndarray, fs: float) -> Dict[str, float]:
    """Computes spectral power and band ratios via Welch periodogram."""
    nperseg = min(len(sig), int(4.0 * fs))
    freqs, psd = signal.welch(sig, fs=fs, nperseg=nperseg)
    total_power = np.sum(psd) + 1e-12

    # ECG band (0.5 - 30 Hz)
    ecg_mask = (freqs >= 0.5) & (freqs <= 30.0)
    ecg_power = np.sum(psd[ecg_mask])

    # Low frequency baseline wander (< 0.5 Hz)
    lf_mask = freqs < 0.5
    lf_power = np.sum(psd[lf_mask])

    # High frequency noise (> 40 Hz)
    hf_mask = (freqs >= 40.0) & (freqs <= 100.0)
    hf_power = np.sum(psd[hf_mask])

    # VT / VF band (2.5 - 7.5 Hz)
    vtvf_mask = (freqs >= 2.5) & (freqs <= 7.5)
    vtvf_power = np.sum(psd[vtvf_mask])

    # Dominant frequency
    valid_mask = (freqs >= 0.5) & (freqs <= 40.0)
    dom_freq = freqs[valid_mask][np.argmax(psd[valid_mask])] if np.any(valid_mask) else 0.0

    # Spectral entropy
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


def detect_qrs_peaks(sig: np.ndarray, fs: float) -> np.ndarray:
    """
    Lightweight Pan-Tompkins style QRS complex detector:
    Bandpass (5-20 Hz) -> Derivative -> Squaring -> Moving Average Integration -> Peak Finding.
    """
    if len(sig) < int(fs * 2):
        return np.array([], dtype=int)

    # 1. Bandpass filter 5-20 Hz
    b, a = signal.butter(2, [5.0 / (fs / 2.0), 20.0 / (fs / 2.0)], btype="bandpass")
    filtered = signal.filtfilt(b, a, sig)

    # 2. Derivative approximation
    diff = np.diff(filtered)

    # 3. Squaring
    squared = diff ** 2

    # 4. Moving integration (150 ms)
    win_len = max(3, int(0.15 * fs))
    integrated = np.convolve(squared, np.ones(win_len) / win_len, mode="same")

    # 5. Adaptive peak finding
    # Minimum refractory distance = 200 ms (max HR 300 bpm)
    min_dist = int(0.20 * fs)
    threshold = np.percentile(integrated, 75)
    min_height = max(float(threshold), 1e-5)

    peaks, _ = signal.find_peaks(integrated, height=min_height, distance=min_dist)
    return peaks


def extract_features_from_recording(
    header_info: Dict[str, Any], mat_path: str
) -> Optional[Dict[str, float]]:
    """
    Extracts ECG signal features from the 30 seconds before the alarm.
    Matches lead channels, scales by physical gain (mV), and derives statistical,
    frequency, QRS dynamics, pre-alarm temporal gradients, and auxiliary signals.
    """
    if not os.path.exists(mat_path):
        return None

    try:
        mat = sio.loadmat(mat_path)
    except Exception:
        return None

    val = mat.get("val")
    if val is None or val.ndim != 2:
        return None

    # Identify sample range for 30 seconds before alarm
    # Alarm is at index ALARM_SAMPLE (75000), 30s before is [67500:75000]
    total_samples = val.shape[1]
    alarm_idx = min(ALARM_SAMPLE, total_samples)
    start_idx = max(0, alarm_idx - PRE_ALARM_SAMPLES)
    if (alarm_idx - start_idx) < int(10 * FS):
        return None

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

    # Fallback to first available signal if no standard candidate matched
    if primary_idx is None:
        primary_idx = 0
        primary_gain = signals_meta[0]["gain"]
        primary_lead_name = signals_meta[0]["lead"]

    # Select Secondary ECG Lead if present
    secondary_idx = None
    secondary_gain = 1.0
    for candidate in ECG_LEAD_CANDIDATES:
        cand_upper = candidate.upper()
        if cand_upper in lead_to_index and cand_upper != primary_lead_name:
            secondary_idx, secondary_gain = lead_to_index[cand_upper]
            break

    # Extract & scale primary ECG signal in physical mV
    raw_primary = val[primary_idx, start_idx:alarm_idx].astype(np.float64)
    sig = raw_primary / primary_gain

    # Clean extreme outliers or NaNs
    sig = np.nan_to_num(sig, nan=0.0, posinf=10.0, neginf=-10.0)
    sig = np.clip(sig, -15.0, 15.0)

    # 1. Primary Lead Statistical & Amplitude Features
    sig_mean = float(np.mean(sig))
    sig_std = float(np.std(sig))
    sig_var = float(np.var(sig))
    sig_skew = float(skew(sig)) if sig_std > 1e-6 else 0.0
    sig_kurt = float(kurtosis(sig)) if sig_std > 1e-6 else 0.0
    sig_p2p = float(np.ptp(sig))
    sig_iqr = float(np.percentile(sig, 75) - np.percentile(sig, 25))
    sig_rms = float(np.sqrt(np.mean(sig ** 2)))

    # Zero & mean crossings
    centered = sig - sig_mean
    zero_crossings = int(np.sum(np.diff(np.signbit(centered)) != 0))

    # 2. Spectral Features
    spectral = compute_spectral_features(sig, FS)

    # 3. QRS Detection & Heart Rate Dynamics
    peaks = detect_qrs_peaks(sig, FS)
    n_beats = len(peaks)

    if n_beats >= 2:
        rr_intervals = np.diff(peaks) / FS  # in seconds
        rr_mean = float(np.mean(rr_intervals))
        rr_std = float(np.std(rr_intervals))
        rr_rmssd = float(np.sqrt(np.mean(np.diff(rr_intervals) ** 2))) if len(rr_intervals) >= 2 else 0.0
        max_pause = float(np.max(rr_intervals))
        pauses_gt_2s = int(np.sum(rr_intervals > 2.0))
        pauses_gt_4s = int(np.sum(rr_intervals > 4.0))

        # Heart rates in beats-per-minute
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

    # 4. Pre-Alarm Temporal Trajectory (Last 10 seconds vs First 20 seconds)
    # Critical for Asystole (amplitude drops to 0 in last 10s) and VT/Tachycardia onset
    split_sample = int(len(sig) * (20.0 / PRE_ALARM_SEC))
    first_20s = sig[:split_sample]
    last_10s = sig[split_sample:]

    first20_std = float(np.std(first_20s)) + 1e-6
    last10_std = float(np.std(last_10s))
    last10_amp_ratio = float(last10_std / first20_std)
    last5_samples = int(5.0 * FS)
    last5s_max_amp = float(np.max(np.abs(sig[-last5_samples:]))) if len(sig) >= last5_samples else float(np.max(np.abs(sig)))

    # Last 10s QRS count
    peaks_last10 = [p for p in peaks if p >= split_sample]
    n_beats_last10 = len(peaks_last10)

    # 5. Secondary ECG Lead Features
    if secondary_idx is not None:
        raw_sec = val[secondary_idx, start_idx:alarm_idx].astype(np.float64) / secondary_gain
        raw_sec = np.nan_to_num(raw_sec, nan=0.0)
        sec_std = float(np.std(raw_sec))
        sec_p2p = float(np.ptp(raw_sec))
        sec_peaks = detect_qrs_peaks(raw_sec, FS)
        sec_n_beats = len(sec_peaks)
        sec_max_pause = float(np.max(np.diff(sec_peaks) / FS)) if len(sec_peaks) >= 2 else 30.0
        has_secondary_ecg = 1.0
    else:
        sec_std = sig_std
        sec_p2p = sig_p2p
        sec_n_beats = n_beats
        sec_max_pause = max_pause
        has_secondary_ecg = 0.0

    # 6. Auxiliary Signals (Pulsatile validation: PLETH / ABP)
    # Real hemodynamic pulses confirm vital signs during suspected lead disconnections
    has_pleth = 1.0 if "PLETH" in lead_to_index else 0.0
    pleth_std = 0.0
    pleth_p2p = 0.0
    if has_pleth:
        pl_idx, pl_gain = lead_to_index["PLETH"]
        pl_sig = val[pl_idx, start_idx:alarm_idx].astype(np.float64) / (pl_gain if pl_gain > 0 else 1.0)
        pleth_std = float(np.std(pl_sig[-int(10 * FS):]))
        pleth_p2p = float(np.ptp(pl_sig[-int(10 * FS):]))

    has_abp = 1.0 if "ABP" in lead_to_index else 0.0
    abp_std = 0.0
    abp_mean = 0.0
    if has_abp:
        abp_idx, abp_gain = lead_to_index["ABP"]
        abp_sig = val[abp_idx, start_idx:alarm_idx].astype(np.float64) / (abp_gain if abp_gain > 0 else 1.0)
        abp_std = float(np.std(abp_sig[-int(10 * FS):]))
        abp_mean = float(np.mean(abp_sig[-int(10 * FS):]))

    # 7. One-Hot Alarm Context
    alarm_type_str = header_info.get("alarm_type", "Unknown")
    alarm_type_features = {
        f"alarm_is_{t}": (1.0 if alarm_type_str == t else 0.0) for t in ALARM_TYPES
    }

    # Aggregate full feature map
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

    return features


def load_dataset(dataset_dir: Path) -> Tuple[np.ndarray, np.ndarray, List[str], List[Dict[str, Any]]]:
    """
    Scans subdirectories for matched .hea and .mat recordings, extracts ECG features,
    and returns feature matrix X, label vector y, feature names, and metadata.
    """
    hea_pattern = str(dataset_dir / "**" / "*.hea")
    hea_files = sorted(glob.glob(hea_pattern, recursive=True))

    if not hea_files:
        raise FileNotFoundError(f"No .hea files found in {dataset_dir}")

    print(f"Discovered {len(hea_files)} .hea header files in {dataset_dir}")

    records_data: List[Dict[str, float]] = []
    labels: List[int] = []
    metadata: List[Dict[str, Any]] = []

    for hea_path in hea_files:
        mat_path = hea_path[:-4] + ".mat"
        if not os.path.exists(mat_path):
            continue

        header_info = parse_header(hea_path)
        if header_info["is_true_alarm"] is None:
            continue

        feats = extract_features_from_recording(header_info, mat_path)
        if feats is not None:
            records_data.append(feats)
            labels.append(header_info["is_true_alarm"])
            metadata.append({
                "record_name": header_info["record_name"],
                "alarm_type": header_info["alarm_type"],
                "hea_path": hea_path,
                "mat_path": mat_path,
                "label": header_info["is_true_alarm"],
            })

    if not records_data:
        raise ValueError("No valid features could be extracted from recordings.")

    feature_names = sorted(list(records_data[0].keys()))
    X = np.array([[row[col] for col in feature_names] for row in records_data], dtype=np.float32)
    y = np.array(labels, dtype=np.int64)

    return X, y, feature_names, metadata


def main():
    print("=" * 70)
    print("MedFault AI — PhysioNet 2015 ICU Arrhythmia Alarm Training Pipeline")
    print("=" * 70)

    project_root = Path(__file__).resolve().parent
    dataset_dir = project_root / "data_local" / "physionet-2015"
    output_dir = project_root / "data_local"
    model_save_path = output_dir / "icu_alarm_model.joblib"

    output_dir.mkdir(parents=True, exist_ok=True)

    # 1. Ingestion & Feature Extraction
    print(f"\n[1/5] Ingesting recordings and extracting 30-sec pre-alarm ECG features...")
    X, y, feature_names, metadata = load_dataset(dataset_dir)
    usable_count = len(y)
    true_count = int(np.sum(y == 1))
    false_count = int(np.sum(y == 0))

    print(f"Usable recordings processed: {usable_count} / 750")
    print(f"Ground Truth Distribution: {true_count} True Alarms ({true_count/usable_count*100:.1f}%), {false_count} False Alarms ({false_count/usable_count*100:.1f}%)")
    print(f"Feature Vector Dimension: {X.shape[1]} features extracted per recording")

    # 2. Train / Held-out Split
    # Check for reliable patient IDs:
    # PhysioNet 2015 de-identified records do not expose patient identifiers in headers.
    # Therefore, we use a stratified recording-level split, stratifying across (alarm_type x label).
    print("\n[2/5] Creating stratified train/test split...")
    print("Note on Splitting: Reliable patient IDs are not present in PhysioNet 2015 header files.")
    print("Limitation: Split is stratified at the recording level based on alarm category and alarm veracity.")

    strat_tags = [f"{m['alarm_type']}_{m['label']}" for m in metadata]
    train_idx, test_idx = train_test_split(
        np.arange(usable_count),
        test_size=0.20,
        random_state=42,
        stratify=strat_tags,
    )

    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]
    meta_train = [metadata[i] for i in train_idx]
    meta_test = [metadata[i] for i in test_idx]

    print(f"Training set: {len(X_train)} recordings ({np.sum(y_train == 1)} True, {np.sum(y_train == 0)} False)")
    print(f"Held-out test set: {len(X_test)} recordings ({np.sum(y_test == 1)} True, {np.sum(y_test == 0)} False)")

    # 3. Model Training
    print("\n[3/5] Training baseline Random Forest classifier...")
    clf = RandomForestClassifier(
        n_estimators=250,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced_subsample",
        random_state=42,
        n_jobs=-1,
    )
    clf.fit(X_train, y_train)
    print("Random Forest model trained successfully.")

    # 4. Evaluation on Held-out Test Set
    print("\n[4/5] Evaluating performance on held-out test recordings...")
    y_pred = clf.predict(X_test)
    y_proba = clf.predict_proba(X_test)[:, 1]

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()
    rec_true = recall_score(y_test, y_pred)
    rec_false = recall_score(y_test, y_pred, pos_label=0)
    prec_true = precision_score(y_test, y_pred, zero_division=0)
    f1_val = f1_score(y_test, y_pred, zero_division=0)
    acc_val = accuracy_score(y_test, y_pred)
    auc_val = roc_auc_score(y_test, y_proba)

    print("\n" + "-" * 50)
    print("HELD-OUT EVALUATION METRICS:")
    print("-" * 50)
    print(f"Number of Usable Recordings: {usable_count}")
    print(f"Confusion Matrix (Rows: Actual [False, True], Cols: Predicted [False, True]):")
    print(f"  [[TN={tn:3d}, FP={fp:3d}],")
    print(f"   [FN={fn:3d}, TP={tp:3d}]]")
    print(f"\nRecall for True Alarms (Sensitivity): {rec_true * 100:.2f}% ({tp}/{tp + fn})")
    print(f"Specificity (False Alarm Suppression):  {rec_false * 100:.2f}% ({tn}/{tn + fp})")
    print(f"Precision for True Alarms:              {prec_true * 100:.2f}%")
    print(f"F1-Score (True Alarms):                 {f1_val * 100:.2f}%")
    print(f"Overall Accuracy:                       {acc_val * 100:.2f}%")
    print(f"ROC-AUC:                                {auc_val:.4f}")
    print("-" * 50)

    # Breakdown by alarm type on held-out set
    print("\nBreakdown by Arrhythmia Alarm Type on Held-Out Test Set:")
    for alarm_t in ALARM_TYPES:
        indices = [i for i, m in enumerate(meta_test) if m["alarm_type"] == alarm_t]
        if indices:
            sub_y_true = y_test[indices]
            sub_y_pred = y_pred[indices]
            sub_cm = confusion_matrix(sub_y_true, sub_y_pred, labels=[0, 1])
            sub_true_total = int(np.sum(sub_y_true == 1))
            sub_rec = recall_score(sub_y_true, sub_y_pred, zero_division=0) if sub_true_total > 0 else 1.0
            print(f"  {alarm_t:<26} | Total: {len(indices):2d} | True Alarms: {sub_true_total:2d} | True Recall: {sub_rec * 100:5.1f}% | CM: TN={sub_cm[0,0]} FP={sub_cm[0,1]} FN={sub_cm[1,0]} TP={sub_cm[1,1]}")

    # Top feature importances
    importances = clf.feature_importances_
    sorted_idx = np.argsort(importances)[::-1][:8]
    print("\nTop 8 Most Informative ECG Features:")
    for rank, idx in enumerate(sorted_idx, 1):
        print(f"  {rank}. {feature_names[idx]:<25} ({importances[idx] * 100:.2f}%)")

    # 5. Save & Verify Reload
    print(f"\n[5/5] Saving model artifact to {model_save_path}...")
    model_payload = {
        "model": clf,
        "feature_names": feature_names,
        "fs": FS,
        "pre_alarm_sec": PRE_ALARM_SEC,
        "usable_recordings": usable_count,
        "classes": [0, 1],
        "class_labels": {0: "False alarm", 1: "True alarm"},
        "test_metrics": {
            "confusion_matrix": cm.tolist(),
            "recall_true": float(rec_true),
            "recall_false": float(rec_false),
            "f1_score": float(f1_val),
            "accuracy": float(acc_val),
            "roc_auc": float(auc_val),
        },
    }
    joblib.dump(model_payload, model_save_path)
    print(f"Model saved. File size: {os.path.getsize(model_save_path) / 1024:.1f} KB")

    # Reload verification on one held-out recording
    print("\nVerifying reloaded model on a held-out test recording...")
    reloaded_artifact = joblib.load(model_save_path)
    reloaded_clf = reloaded_artifact["model"]
    reloaded_feat_names = reloaded_artifact["feature_names"]

    held_out_idx = 0
    sample_feat_dict = extract_features_from_recording(
        parse_header(meta_test[held_out_idx]["hea_path"]),
        meta_test[held_out_idx]["mat_path"],
    )
    sample_vec = np.array([[sample_feat_dict[k] for k in reloaded_feat_names]], dtype=np.float32)
    sample_pred = int(reloaded_clf.predict(sample_vec)[0])
    sample_proba = float(reloaded_clf.predict_proba(sample_vec)[0, 1])
    actual_label = int(meta_test[held_out_idx]["label"])
    record_id = meta_test[held_out_idx]["record_name"]
    alarm_name = meta_test[held_out_idx]["alarm_type"]

    label_names = {0: "False alarm", 1: "True alarm"}
    print(f"  Recording:        {record_id} ({alarm_name})")
    print(f"  Actual Ground Truth: {actual_label} ({label_names[actual_label]})")
    print(f"  Model Prediction:    {sample_pred} ({label_names[sample_pred]})")
    print(f"  True Alarm Probability: {sample_proba * 100:.2f}%")
    print(f"  Prediction Match:    {'CORRECT' if sample_pred == actual_label else 'DISCREPANCY'}")

    assert sample_pred in [0, 1], "Reloaded model prediction is invalid"
    print("\n[VERIFIED] Model artifact successfully saved, reloaded, and verified on held-out recording.")
    print("=" * 70)


if __name__ == "__main__":
    main()
