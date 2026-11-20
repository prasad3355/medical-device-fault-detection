import numpy as np
import pandas as pd
from typing import List, Dict, Any

class TelemetryFeatureExtractor:
    """
    Extracts time-domain, statistical, and spectral features across telemetry windows.
    """

    def __init__(self, window_size: int = 10, step_size: int = 5):
        self.window_size = window_size
        self.step_size = step_size

    def extract_channel_features(self, values: np.ndarray, prefix: str) -> Dict[str, float]:
        if len(values) == 0:
            return {
                f"{prefix}_mean": 0.0,
                f"{prefix}_std": 0.0,
                f"{prefix}_min": 0.0,
                f"{prefix}_max": 0.0,
                f"{prefix}_range": 0.0,
                f"{prefix}_rate_of_change": 0.0,
                f"{prefix}_iqr": 0.0,
            }

        mean_val = float(np.mean(values))
        std_val = float(np.std(values))
        min_val = float(np.min(values))
        max_val = float(np.max(values))
        ptp_val = max_val - min_val
        diffs = np.diff(values) if len(values) > 1 else np.array([0.0])
        max_roc = float(np.max(np.abs(diffs))) if len(diffs) > 0 else 0.0
        q75, q25 = np.percentile(values, [75, 25])
        iqr_val = float(q75 - q25)

        return {
            f"{prefix}_mean": round(mean_val, 4),
            f"{prefix}_std": round(std_val, 4),
            f"{prefix}_min": round(min_val, 4),
            f"{prefix}_max": round(max_val, 4),
            f"{prefix}_range": round(ptp_val, 4),
            f"{prefix}_rate_of_change": round(max_roc, 4),
            f"{prefix}_iqr": round(iqr_val, 4),
        }

    def extract_cross_correlation(self, df: pd.DataFrame, ch1: str, ch2: str) -> float:
        if ch1 in df.columns and ch2 in df.columns and len(df) > 2:
            try:
                corr = df[ch1].corr(df[ch2])
                return round(float(corr) if not np.isnan(corr) else 0.0, 3)
            except Exception:
                return 0.0
        return 0.0

    def extract_window_matrix(self, df: pd.DataFrame, channels: List[str]) -> np.ndarray:
        """
        Creates a 3D tensor [num_windows, window_size, num_channels] for deep learning sequence inputs.
        """
        data = df[channels].to_numpy()
        num_rows = len(data)
        
        if num_rows < self.window_size:
            # Pad to window size
            padded = np.pad(data, ((0, self.window_size - num_rows), (0, 0)), mode="edge")
            return np.expand_dims(padded, axis=0)

        windows = []
        for start in range(0, num_rows - self.window_size + 1, self.step_size):
            end = start + self.window_size
            windows.append(data[start:end])

        return np.array(windows)
