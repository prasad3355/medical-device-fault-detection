import numpy as np
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, Tuple, List

class DeepTemporalCNNBiLSTM:
    """
    1D-CNN + BiLSTM deep learning temporal architecture.
    Extracts spatial-temporal representations from multi-channel medical telemetry windows.
    """

    def __init__(self, input_dim: int = 5, conv_filters: int = 16, lstm_units: int = 32):
        self.input_dim = input_dim
        self.conv_filters = conv_filters
        self.lstm_units = lstm_units
        
        # Initialize deterministic projection weights
        np.random.seed(42)
        self.w_conv = np.random.randn(3, input_dim, conv_filters) * 0.1
        self.b_conv = np.zeros(conv_filters)
        
        # BiLSTM forward and backward transition weights
        self.w_lstm_fwd = np.random.randn(conv_filters, lstm_units) * 0.1
        self.u_lstm_fwd = np.random.randn(lstm_units, lstm_units) * 0.05
        self.w_lstm_bwd = np.random.randn(conv_filters, lstm_units) * 0.1
        self.u_lstm_bwd = np.random.randn(lstm_units, lstm_units) * 0.05

    def _relu(self, x: np.ndarray) -> np.ndarray:
        return np.maximum(0, x)

    def _sigmoid(self, x: np.ndarray) -> np.ndarray:
        return 1.0 / (1.0 + np.exp(-np.clip(x, -15.0, 15.0)))

    def _tanh(self, x: np.ndarray) -> np.ndarray:
        return np.tanh(x)

    def forward(self, x_seq: np.ndarray) -> np.ndarray:
        """
        Forward pass over a 3D batch [batch_size, seq_len, input_dim].
        Returns feature vector representation [batch_size, lstm_units * 2].
        """
        batch_size, seq_len, _ = x_seq.shape
        features = []

        for b in range(batch_size):
            seq = x_seq[b]  # [seq_len, input_dim]
            
            # 1D-CNN convolution with kernel size 3
            conv_out = []
            for t in range(seq_len - 2):
                window = seq[t:t+3]  # [3, input_dim]
                conv_t = np.tensordot(window, self.w_conv, axes=([0, 1], [0, 1])) + self.b_conv
                conv_out.append(self._relu(conv_t))
            
            conv_matrix = np.array(conv_out)  # [conv_steps, conv_filters]
            if len(conv_matrix) == 0:
                conv_matrix = np.zeros((1, self.conv_filters))

            steps = len(conv_matrix)

            # Forward LSTM pass
            h_fwd = np.zeros(self.lstm_units)
            for t in range(steps):
                inp = conv_matrix[t]
                gate_i = self._sigmoid(inp @ self.w_lstm_fwd + h_fwd @ self.u_lstm_fwd)
                cand = self._tanh(inp @ self.w_lstm_fwd)
                h_fwd = (1 - gate_i) * h_fwd + gate_i * cand

            # Backward LSTM pass
            h_bwd = np.zeros(self.lstm_units)
            for t in reversed(range(steps)):
                inp = conv_matrix[t]
                gate_i = self._sigmoid(inp @ self.w_lstm_bwd + h_bwd @ self.u_lstm_bwd)
                cand = self._tanh(inp @ self.w_lstm_bwd)
                h_bwd = (1 - gate_i) * h_bwd + gate_i * cand

            bilstm_rep = np.concatenate([h_fwd, h_bwd])
            features.append(bilstm_rep)

        return np.array(features)

class AnomalyEnsembleDetector:
    """
    Ensemble combining 1D-CNN + BiLSTM feature embeddings with Isolation Forest outlier scoring.
    """

    def __init__(self):
        self.dl_model = DeepTemporalCNNBiLSTM(input_dim=5, conv_filters=16, lstm_units=32)
        self.isolation_forest = IsolationForest(
            n_estimators=100,
            contamination=0.10,
            random_state=42
        )
        self._is_fitted = False

    def fit_synthetic_baseline(self):
        """
        Pre-fits the isolation forest on calibrated nominal medical baseline telemetry.
        """
        np.random.seed(42)
        # Generate 300 nominal physiological sequences [batch, seq_len=10, channels=5]
        spo2 = np.random.normal(98.2, 0.6, (300, 10, 1))
        hr = np.random.normal(74.0, 4.0, (300, 10, 1))
        temp = np.random.normal(36.9, 0.2, (300, 10, 1))
        press = np.random.normal(14.2, 0.5, (300, 10, 1))
        flow = np.random.normal(45.0, 1.0, (300, 10, 1))
        
        baseline_seqs = np.concatenate([spo2, hr, temp, press, flow], axis=2)
        embeddings = self.dl_model.forward(baseline_seqs)
        self.isolation_forest.fit(embeddings)
        self._is_fitted = True

    def score_sequence(self, x_seq: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Returns anomaly scores and isolation forest decision values.
        """
        if not self._is_fitted:
            self.fit_synthetic_baseline()

        embeddings = self.dl_model.forward(x_seq)
        anomaly_scores = -self.isolation_forest.score_samples(embeddings)
        is_outlier = self.isolation_forest.predict(embeddings) == -1
        return anomaly_scores, is_outlier
