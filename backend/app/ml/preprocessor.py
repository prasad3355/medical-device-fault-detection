import numpy as np
import pandas as pd
from scipy import signal
from typing import Dict, Tuple

class MedicalSignalPreprocessor:
    """
    Preprocessor for physiological and device telemetry signals.
    Implements baseline correction, noise reduction, and Signal Quality Index (SQI) assessment.
    """

    def __init__(self, window_size: int = 5, polyorder: int = 2):
        self.window_size = window_size
        self.polyorder = polyorder

    def remove_baseline_wander(self, series: np.ndarray) -> np.ndarray:
        """
        Subtracts low-frequency baseline drift using a median filter.
        """
        if len(series) < 15:
            return series - np.mean(series)
        baseline = signal.medfilt(series, kernel_size=min(15, len(series) if len(series) % 2 != 0 else len(series) - 1))
        return series - baseline

    def smooth_signal(self, series: np.ndarray) -> np.ndarray:
        """
        Applies Savitzky-Golay filtering for edge-preserving denoising.
        Falls back to moving average if series is short.
        """
        n = len(series)
        if n < 7:
            return series
        
        # Ensure window length is odd and <= n
        win_len = min(7, n if n % 2 != 0 else n - 1)
        if win_len <= self.polyorder:
            win_len = self.polyorder + 1 if (self.polyorder + 1) % 2 != 0 else self.polyorder + 2

        try:
            return signal.savgol_filter(series, window_length=win_len, polyorder=min(self.polyorder, win_len - 1))
        except Exception:
            # Fallback rolling mean
            return pd.Series(series).rolling(3, min_periods=1, center=True).mean().to_numpy()

    def compute_sqi(self, series: np.ndarray) -> float:
        """
        Calculates Signal Quality Index (0.0 to 1.0).
        Evaluates kurtosis, signal-to-noise ratio, and variance stability.
        SQI < 0.65 indicates poor electrode contact, transducer degradation, or disconnected leads.
        """
        if len(series) < 5 or np.all(series == series[0]):
            return 0.50

        diff = np.diff(series)
        std_diff = np.std(diff)
        if std_diff == 0:
            return 0.95

        # Kurtosis of first derivative
        mean_diff = np.mean(diff)
        m4 = np.mean((diff - mean_diff) ** 4)
        m2 = np.mean((diff - mean_diff) ** 2)
        kurt = (m4 / (m2 ** 2 + 1e-8)) if m2 > 0 else 3.0

        # Normal Gaussian kurtosis is 3.0. Extreme spikes elevate kurtosis.
        kurt_penalty = max(0.0, min(0.4, (abs(kurt - 3.0) / 15.0)))
        
        # Noise ratio: high frequency variance vs overall variance
        hf_ratio = np.var(diff) / (np.var(series) + 1e-8)
        hf_penalty = max(0.0, min(0.3, hf_ratio * 0.1))

        sqi = max(0.20, min(0.99, 1.0 - (kurt_penalty + hf_penalty)))
        return round(float(sqi), 3)

    def preprocess_dataframe(self, df: pd.DataFrame, channel_cols: list) -> Tuple[pd.DataFrame, Dict[str, float]]:
        """
        Processes all telemetry channels and returns cleaned DataFrame alongside SQI scores.
        """
        cleaned_df = df.copy()
        sqi_scores = {}

        for col in channel_cols:
            if col in cleaned_df.columns:
                raw_values = cleaned_df[col].astype(float).to_numpy()
                smoothed = self.smooth_signal(raw_values)
                sqi = self.compute_sqi(raw_values)
                cleaned_df[col] = smoothed
                sqi_scores[col] = sqi

        return cleaned_df, sqi_scores
