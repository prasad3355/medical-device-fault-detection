import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  MODEL_COMPARISONS, 
  CONFUSION_MATRIX, 
  TRAINING_HISTORY 
} from '../../data/mockData';
import { Cpu, Award, Zap, GitBranch, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ModelPerformance: React.FC = () => {
  const [activeHistoryTab, setActiveHistoryTab] = useState<'accuracy' | 'loss'>('accuracy');

  // Radial Metric Card Component
  const RadialMetric = ({ title, value, subtitle, color }: { title: string; value: number; subtitle: string; color: string }) => {
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className="relative rounded-xl border border-slate-800/80 bg-gradient-to-br from-[#091122]/90 to-[#060a13] p-5 shadow-xl flex items-center gap-4">
        {/* SVG Radial Progress */}
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#1e293b"
              strokeWidth="7"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke={color}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-bold font-mono text-white tabular-nums">
              {value.toFixed(1)}%
            </span>
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            {title}
          </span>
          <span className="text-lg font-bold text-white tracking-tight mt-0.5 block">
            {value.toFixed(1)}%
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            {subtitle}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
          <Cpu className="w-4 h-4" />
          <span>Evaluation Benchmarks & Academic Validation</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
          Deep Learning Model Performance
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Comprehensive empirical metrics for the 1D-CNN + BiLSTM architecture tested across 10-fold cross-validation on multi-center medical device telemetry.
        </p>
      </div>

      {/* TOP RADIAL METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <RadialMetric
          title="Overall Accuracy"
          value={97.8}
          subtitle="Top-1 multi-class classification"
          color="#06b6d4"
        />
        <RadialMetric
          title="Macro Precision"
          value={96.4}
          subtitle="Low false-alarm fault rate"
          color="#3b82f6"
        />
        <RadialMetric
          title="Macro Recall"
          value={95.9}
          subtitle="Critical fault capture rate"
          color="#10b981"
        />
        <RadialMetric
          title="F1-Score Harmonized"
          value={96.1}
          subtitle="Balanced harmonic mean"
          color="#a855f7"
        />
      </div>

      {/* MODEL COMPARISON: Grouped Bar Chart */}
      <div className="rounded-xl border border-slate-800/80 bg-gradient-to-b from-[#091122]/90 to-[#060a13] p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Architecture Benchmark Comparison
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical evaluation comparing traditional baselines vs MEDFAULT hybrid CNN-BiLSTM
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            Metric: % on Held-out Test Cohort
          </span>
        </div>

        <div className="h-[320px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={MODEL_COMPARISONS}
              margin={{ top: 20, right: 10, left: -20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis 
                dataKey="model" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                interval={0}
              />
              <YAxis 
                domain={[70, 100]} 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                fontFamily="var(--font-mono)"
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#091122', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                formatter={(val: any) => [`${val}%`]}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              <Bar dataKey="accuracy" name="Accuracy (%)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="precision" name="Precision (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recall" name="Recall (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="f1Score" name="F1-Score (%)" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <span>Inference Latency: <strong>8.4ms per 128-sample tensor</strong> on standard edge TPU / CPU</span>
          <span className="font-mono text-cyan-400">+9.4% improvement over Random Forest baseline</span>
        </div>
      </div>

      {/* CONFUSION MATRIX & TRAINING HISTORY SIDE-BY-SIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: CONFUSION MATRIX HEATMAP */}
        <div className="lg:col-span-6 rounded-xl border border-slate-800/80 bg-gradient-to-b from-[#091122]/90 to-[#060a13] p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Confusion Matrix Heatmap
              </h3>
              <p className="text-xs text-slate-400">
                Ground Truth vs Deep Learning Predicted Classification
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              N = 1,400 samples
            </span>
          </div>

          <div className="mt-4">
            {/* 3x3 Grid Header */}
            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              <div className="text-left text-slate-400">Actual \ Pred</div>
              <div>Normal</div>
              <div>Anomaly</div>
              <div>Fault</div>
            </div>

            {/* Matrix Rows */}
            {['Normal', 'Possible Anomaly', 'Fault Detected'].map((actualClass) => {
              const rowCells = CONFUSION_MATRIX.filter((c) => c.actual === actualClass);
              return (
                <div key={actualClass} className="grid grid-cols-4 gap-1.5 mb-1.5 text-xs font-mono">
                  {/* Row Label */}
                  <div className="flex items-center text-[11px] font-sans font-medium text-slate-300 pr-1">
                    {actualClass === 'Possible Anomaly' ? 'Anomaly' : actualClass}
                  </div>

                  {/* 3 Predicted Columns */}
                  {rowCells.map((cell) => {
                    const isDiagonal = cell.actual === cell.predicted;
                    // Intensity color based on percentage
                    const bgStyle = isDiagonal
                      ? cell.percentage > 90
                        ? 'bg-cyan-500/30 text-cyan-200 border-cyan-500/50'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      : cell.count > 10
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-slate-900 text-slate-400 border-slate-800';

                    return (
                      <div
                        key={cell.predicted}
                        className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-colors ${bgStyle}`}
                      >
                        <span className="font-bold text-sm tabular-nums">
                          {cell.count}
                        </span>
                        <span className="text-[10px] opacity-80">
                          {cell.percentage.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Diagonal (Nominal classification): 97.2%</span>
            <span className="text-emerald-400 font-mono">True Positive: 1,340 / 1,400</span>
          </div>
        </div>

        {/* Right: TRAINING HISTORY (Accuracy & Loss Curves) */}
        <div className="lg:col-span-6 rounded-xl border border-slate-800/80 bg-gradient-to-b from-[#091122]/90 to-[#060a13] p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Training & Validation Convergence
              </h3>
              <p className="text-xs text-slate-400">
                50 Epochs over AdamW optimizer (lr=1e-3, cosine decay)
              </p>
            </div>

            {/* Toggle Accuracy / Loss */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveHistoryTab('accuracy')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeHistoryTab === 'accuracy'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Accuracy
              </button>
              <button
                onClick={() => setActiveHistoryTab('loss')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeHistoryTab === 'loss'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Loss
              </button>
            </div>
          </div>

          <div className="h-[210px] w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              {activeHistoryTab === 'accuracy' ? (
                <LineChart data={TRAINING_HISTORY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis dataKey="epoch" stroke="#64748b" fontSize={11} tickLine={false} label={{ value: 'Epoch', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
                  <YAxis domain={[65, 100]} stroke="#64748b" fontSize={11} tickLine={false} fontFamily="var(--font-mono)" />
                  <Tooltip contentStyle={{ backgroundColor: '#091122', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Line type="monotone" dataKey="trainAccuracy" name="Training Accuracy (%)" stroke="#06b6d4" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="valAccuracy" name="Validation Accuracy (%)" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              ) : (
                <LineChart data={TRAINING_HISTORY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis dataKey="epoch" stroke="#64748b" fontSize={11} tickLine={false} label={{ value: 'Epoch', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
                  <YAxis domain={[0, 0.8]} stroke="#64748b" fontSize={11} tickLine={false} fontFamily="var(--font-mono)" />
                  <Tooltip contentStyle={{ backgroundColor: '#091122', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Line type="monotone" dataKey="trainLoss" name="Training Cross-Entropy Loss" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="valLoss" name="Validation Loss" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="mt-2 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Early stopping threshold: patience = 8</span>
            <span className="text-cyan-400 font-mono">Final Val Loss: 0.10</span>
          </div>
        </div>
      </div>

      {/* MODEL ARCHITECTURE BLOCK */}
      <div className="rounded-xl border border-slate-800/80 bg-gradient-to-b from-[#091122]/90 to-[#060a13] p-5 shadow-xl">
        <h3 className="text-base font-bold text-white tracking-tight mb-1">
          Deep Learning Model Layer Architecture
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Hierarchical tensor transformations from physiological continuous time series to multi-task decision
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-cyan-400 block font-bold">STAGE 1</span>
            <span className="text-xs font-bold text-white mt-1 block">Input Tensor</span>
            <span className="text-[11px] text-slate-400 font-mono mt-1 block">[Batch, 128, 6]</span>
            <span className="text-[10px] text-slate-400 block mt-1">Multi-channel sensor window</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-cyan-400 block font-bold">STAGE 2</span>
            <span className="text-xs font-bold text-white mt-1 block">Wavelet Transform</span>
            <span className="text-[11px] text-slate-400 font-mono mt-1 block">DWT (db4)</span>
            <span className="text-[10px] text-slate-400 block mt-1">Denoising & artifact removal</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-cyan-400 block font-bold">STAGE 3</span>
            <span className="text-xs font-bold text-white mt-1 block">1D-CNN Extractor</span>
            <span className="text-[11px] text-slate-400 font-mono mt-1 block">Conv1D (k=7, 5, 3)</span>
            <span className="text-[10px] text-slate-400 block mt-1">Local morphological signatures</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-cyan-400 block font-bold">STAGE 4</span>
            <span className="text-xs font-bold text-white mt-1 block">Bi-LSTM Attention</span>
            <span className="text-[11px] text-slate-400 font-mono mt-1 block">Hidden Dim: 256</span>
            <span className="text-[10px] text-slate-400 block mt-1">Long-term temporal context</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-cyan-400 block font-bold">STAGE 5</span>
            <span className="text-xs font-bold text-white mt-1 block">Multi-Task Head</span>
            <span className="text-[11px] text-slate-400 font-mono mt-1 block">Softmax [Fault + Risk]</span>
            <span className="text-[10px] text-slate-400 block mt-1">Calibrated predictions</span>
          </div>
        </div>
      </div>
    </div>
  );
};
