"""
MedFault AI - Sensor Signal Quality (PPG) Training Script
Dataset: BUT PPG (Brno University of Technology Smartphone PPG Database 2.0.0)
Model: Random Forest Classifier for Good vs Poor signal quality
Subject-level split: Grouped by participant ID (first 3 digits of recording ID)
"""

import sys
import time
import shutil
import concurrent.futures
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd
from scipy import signal, stats
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GroupShuffleSplit
from sklearn.metrics import confusion_matrix, classification_report, recall_score, accuracy_score, f1_score
import joblib
import wfdb

BASE_DIR = Path(__file__).resolve().parent
BUT_PPG_DIR = BASE_DIR / "data_local" / "butppg" / "brno-university-of-technology-smartphone-ppg-database-but-ppg-2.0.0"
MODEL_SAVE_PATH = BASE_DIR / "data_local" / "ppg_quality_model.joblib"
SAMPLES_DIR = BASE_DIR / "backend" / "data" / "samples"
SAMPLES_DIR.mkdir(parents=True, exist_ok=True)

FEATURE_NAMES = [
    "std",
    "p2p",
    "iqr",
    "skew",
    "kurt",
    "line_length",
    "zero_crossings",
    "num_peaks",
    "heart_rate",
    "hr_variability",
    "peak_amp_std",
    "cardiac_sqi",
    "hf_noise_ratio",
    "spectral_entropy",
    "autocorr_peak",
]


def extract_ppg_features(sig: np.ndarray, fs: float = 30.0) -> Dict[str, float]:
    """
    Extracts 15 domain-specific physiological and spectral features from a 10s (300-point) PPG signal.
    """
    sig = np.asarray(sig, dtype=np.float64)
    std_val = float(np.std(sig))
    mean_val = float(np.mean(sig))
    p2p = float(np.ptp(sig))
    iqr = float(np.percentile(sig, 75) - np.percentile(sig, 25))

    sk = float(stats.skew(sig)) if std_val > 1e-6 else 0.0
    kt = float(stats.kurtosis(sig)) if std_val > 1e-6 else 0.0
    line_len = float(np.sum(np.abs(np.diff(sig)))) / (p2p + 1e-6)

    med = np.median(sig)
    zc = int(np.sum(np.diff(sig > med) != 0))

    prom = max(1e-4, std_val * 0.4)
    peaks, _ = signal.find_peaks(sig, distance=8, prominence=prom)
    num_peaks = len(peaks)

    if num_peaks >= 2:
        intervals = np.diff(peaks) / fs
        hr = float(60.0 / np.mean(intervals))
        hr_std = float(np.std(intervals))
        peak_amp_std = float(np.std(sig[peaks]))
    else:
        hr = 0.0
        hr_std = 0.0
        peak_amp_std = 0.0

    # Spectral analysis
    nperseg = min(len(sig), 128)
    freqs, psd = signal.welch(sig, fs=fs, nperseg=nperseg)
    total_power = float(np.sum(psd)) + 1e-9
    cardiac_mask = (freqs >= 0.7) & (freqs <= 3.5)
    hf_mask = freqs > 4.0
    cardiac_sqi = float(np.sum(psd[cardiac_mask]) / total_power)
    hf_ratio = float(np.sum(psd[hf_mask]) / total_power)

    psd_norm = psd / total_power
    psd_norm = psd_norm[psd_norm > 0]
    spectral_entropy = float(-np.sum(psd_norm * np.log2(psd_norm)))

    # Autocorrelation periodicity
    if std_val > 1e-6:
        norm_sig = (sig - mean_val) / std_val
        ac = np.correlate(norm_sig, norm_sig, mode="full")
        ac = ac[len(ac) // 2 :]
        ac = ac / (ac[0] + 1e-8)
        if len(ac) > 45:
            ac_peaks, _ = signal.find_peaks(ac[8:45], distance=5)
            max_ac = float(np.max(ac[8:45][ac_peaks])) if len(ac_peaks) > 0 else 0.0
        else:
            max_ac = 0.0
    else:
        max_ac = 0.0

    return {
        "std": std_val,
        "p2p": p2p,
        "iqr": iqr,
        "skew": sk,
        "kurt": kt,
        "line_length": line_len,
        "zero_crossings": zc,
        "num_peaks": num_peaks,
        "heart_rate": hr,
        "hr_variability": hr_std,
        "peak_amp_std": peak_amp_std,
        "cardiac_sqi": cardiac_sqi,
        "hf_noise_ratio": hf_ratio,
        "spectral_entropy": spectral_entropy,
        "autocorr_peak": max_ac,
    }


def load_single_record(item: Tuple[str, int, str]) -> Tuple[str, int, str, np.ndarray, Dict[str, float]]:
    rec_id, quality, subj_id = item
    record_path = BUT_PPG_DIR / rec_id / f"{rec_id}_PPG"
    try:
        rec = wfdb.rdrecord(str(record_path))
        sig = rec.p_signal.flatten() if rec.p_signal is not None else rec.d_signal.flatten()
        feats = extract_ppg_features(sig, fs=float(rec.fs))
        return rec_id, quality, subj_id, sig, feats
    except Exception as e:
        return rec_id, quality, subj_id, np.array([]), {}


def main():
    print("=" * 65)
    print("   MedFault AI - PPG Sensor Signal Quality Training")
    print(f"   Dataset Location: {BUT_PPG_DIR}")
    print("=" * 65)

    if not BUT_PPG_DIR.exists():
        print(f"ERROR: Dataset directory not found at {BUT_PPG_DIR}")
        sys.exit(1)

    ann_csv = BUT_PPG_DIR / "quality-hr-ann.csv"
    if not ann_csv.exists():
        print(f"ERROR: Annotations not found at {ann_csv}")
        sys.exit(1)

    df_ann = pd.read_csv(ann_csv)
    print(f"Loaded {len(df_ann)} annotation rows from quality-hr-ann.csv.")
    
    # Map participant ID (subject ID is first 3 characters of recording ID)
    df_ann["subj_id"] = df_ann["ID"].astype(str).str[:3]
    unique_subjects = df_ann["subj_id"].unique()
    print(f"Identified {len(unique_subjects)} unique participants in dataset.")

    # Multi-threaded loading
    print("\nReading PPG waveform files with wfdb across 16 threads...")
    t0 = time.time()
    work_items = [
        (str(row["ID"]), int(row["Quality"]), str(row["subj_id"]))
        for _, row in df_ann.iterrows()
    ]

    records_data = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
        for res in pool.map(load_single_record, work_items):
            rec_id, quality, subj_id, sig, feats = res
            if len(sig) == 300 and len(feats) == len(FEATURE_NAMES):
                records_data.append({
                    "id": rec_id,
                    "quality": quality,
                    "subj_id": subj_id,
                    "sig": sig,
                    **feats
                })

    load_time = time.time() - t0
    print(f"Successfully processed {len(records_data)} valid recordings in {load_time:.2f} seconds.")

    df_data = pd.DataFrame(records_data)
    print("\nDataset Class Distribution:")
    print(f"  Total: {len(df_data)} recordings")
    print(f"  Good Signal Quality (1): {(df_data['quality'] == 1).sum()} ({(df_data['quality'] == 1).mean()*100:.1f}%)")
    print(f"  Poor Signal Quality (0): {(df_data['quality'] == 0).sum()} ({(df_data['quality'] == 0).mean()*100:.1f}%)")

    # Split by participant using GroupShuffleSplit
    print("\nSplitting by participant using GroupShuffleSplit (80% train, 20% test)...")
    gss = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=42)
    train_idx, test_idx = next(gss.split(df_data, groups=df_data["subj_id"]))

    train_df = df_data.iloc[train_idx].copy()
    test_df = df_data.iloc[test_idx].copy()

    train_subjects = set(train_df["subj_id"].unique())
    test_subjects = set(test_df["subj_id"].unique())
    overlap = train_subjects.intersection(test_subjects)
    assert len(overlap) == 0, f"Subject leakage detected: {overlap}"

    print(f"Train set: {len(train_df)} recordings across {len(train_subjects)} participants")
    print(f"Test set:  {len(test_df)} recordings across {len(test_subjects)} participants")

    X_train = train_df[FEATURE_NAMES].values
    y_train = train_df["quality"].values
    X_test = test_df[FEATURE_NAMES].values
    y_test = test_df["quality"].values

    # Train Random Forest
    print("\nTraining Random Forest Classifier for Good vs Poor signal quality...")
    clf = RandomForestClassifier(
        n_estimators=150,
        max_depth=10,
        min_samples_split=4,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_train, y_train)

    # Evaluate
    y_pred = clf.predict(X_test)
    y_proba = clf.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, pos_label=0) # F1 for Poor quality
    
    # Recall for Poor quality (Class 0)
    recall_poor = recall_score(y_test, y_pred, pos_label=0)
    recall_good = recall_score(y_test, y_pred, pos_label=1)

    cm = confusion_matrix(y_test, y_pred)
    # cm layout: [[TN(0,0), FP(0,1)], [FN(1,0), TP(1,1)]]
    # where 0 is Poor and 1 is Good:
    # Row 0: Actual Poor (Pred Poor, Pred Good)
    # Row 1: Actual Good (Pred Poor, Pred Good)
    tn, fp, fn, tp = cm[0, 0], cm[0, 1], cm[1, 0], cm[1, 1]

    print("\n" + "=" * 65)
    print("   EVALUATION RESULTS ON HELD-OUT PARTICIPANTS")
    print("=" * 65)
    print(f"Overall Accuracy:                    {acc*100:.2f}%")
    print(f"Recall for Poor Signal Quality (0):  {recall_poor*100:.2f}% ({tn} / {tn + fp})")
    print(f"Recall for Good Signal Quality (1):  {recall_good*100:.2f}% ({tp} / {tp + fn})")
    print(f"F1-Score for Poor Signal Quality:    {f1*100:.2f}%")
    print("\nConfusion Matrix (Rows=Actual [Poor, Good], Cols=Predicted [Poor, Good]):")
    print(f"                Predicted Poor    Predicted Good")
    print(f"  Actual Poor        {tn:<17} {fp}")
    print(f"  Actual Good        {fn:<17} {tp}")
    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Poor (0)", "Good (1)"]))

    # Select one held-out good case and one held-out poor case for the demo
    test_df["pred"] = y_pred
    test_df["prob_good"] = y_proba

    # Find highest confidence correct Good case and Poor case
    good_cases = test_df[(test_df["quality"] == 1) & (test_df["pred"] == 1)].sort_values(by="prob_good", ascending=False)
    poor_cases = test_df[(test_df["quality"] == 0) & (test_df["pred"] == 0)].sort_values(by="prob_good", ascending=True)

    heldout_good = good_cases.iloc[0]
    heldout_poor = poor_cases.iloc[0]

    good_id = str(heldout_good["id"])
    poor_id = str(heldout_poor["id"])

    print("=" * 65)
    print("   SELECTED HELD-OUT CASES FOR LOCAL DEMO")
    print("=" * 65)
    print(f"1. Held-Out GOOD Case: Recording ID {good_id} (Subject {heldout_good['subj_id']})")
    print(f"   Ground Truth: Good (1) | Model Confidence: {heldout_good['prob_good']*100:.1f}% Good")
    print(f"   Cardiac SQI: {heldout_good['cardiac_sqi']:.3f} | Autocorr: {heldout_good['autocorr_peak']:.3f}")

    print(f"\n2. Held-Out POOR Case: Recording ID {poor_id} (Subject {heldout_poor['subj_id']})")
    print(f"   Ground Truth: Poor (0) | Model Confidence: {(1.0 - heldout_poor['prob_good'])*100:.1f}% Poor")
    print(f"   Cardiac SQI: {heldout_poor['cardiac_sqi']:.3f} | Autocorr: {heldout_poor['autocorr_peak']:.3f}")

    # Copy held-out sample waveform files into backend/data/samples/
    for rid, tag in [(good_id, "ppg_good"), (poor_id, "ppg_poor")]:
        src_hea = BUT_PPG_DIR / rid / f"{rid}_PPG.hea"
        src_dat = BUT_PPG_DIR / rid / f"{rid}_PPG.dat"
        dst_hea = SAMPLES_DIR / f"{tag}.hea"
        dst_dat = SAMPLES_DIR / f"{tag}.dat"
        if src_hea.exists() and src_dat.exists():
            shutil.copyfile(src_hea, dst_hea)
            shutil.copyfile(src_dat, dst_dat)
            # Also keep original named copies
            shutil.copyfile(src_hea, SAMPLES_DIR / f"{rid}_PPG.hea")
            shutil.copyfile(src_dat, SAMPLES_DIR / f"{rid}_PPG.dat")
            print(f"Copied {rid}_PPG (.hea + .dat) to {SAMPLES_DIR}")

    # Save model artifact
    artifact = {
        "model": clf,
        "feature_names": FEATURE_NAMES,
        "metrics": {
            "accuracy": float(acc),
            "recall_poor": float(recall_poor),
            "recall_good": float(recall_good),
            "f1_poor": float(f1),
            "confusion_matrix": cm.tolist(),
        },
        "heldout_cases": {
            "good_id": good_id,
            "poor_id": poor_id,
            "good_subject": str(heldout_good["subj_id"]),
            "poor_subject": str(heldout_poor["subj_id"]),
            "good_confidence": float(heldout_good["prob_good"] * 100),
            "poor_confidence": float((1.0 - heldout_poor["prob_good"]) * 100),
        },
        "trained_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    }

    joblib.dump(artifact, MODEL_SAVE_PATH)
    print(f"\nModel artifact successfully saved to: {MODEL_SAVE_PATH}")
    print("Feature vector contract:")
    print(" ", FEATURE_NAMES)

    # Verification load test
    loaded = joblib.load(MODEL_SAVE_PATH)
    sample_feat = np.array([[heldout_good[f] for f in loaded["feature_names"]]])
    pred_test = loaded["model"].predict(sample_feat)[0]
    prob_test = loaded["model"].predict_proba(sample_feat)[0]
    print(f"\nVerification reload test on {good_id}: Predicted={pred_test} ({'Good' if pred_test==1 else 'Poor'}), Prob={prob_test}")
    print("Training and verification complete!")


if __name__ == "__main__":
    main()
