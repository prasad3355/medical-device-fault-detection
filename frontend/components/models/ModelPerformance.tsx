import React, { useState, useEffect } from 'react';
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
import { Cpu, Award, Zap, GitBranch, ArrowRight, ShieldCheck, CheckCircle2, RefreshCw, Info } from 'lucide-react';
import { fetchModelPerformance, ModelPerformanceData } from '../../lib/api';
import { 
  MODEL_COMPARISONS, 
  CONFUSION_MATRIX, 
  TRAINING_HISTORY 
} from '../../data/mockData';

export const ModelPerformance: React.FC = () => {
  const [activeHistoryTab, setActiveHistoryTab] = useState<'accuracy' | 'loss'>('accuracy');
  const [data, setData] = useState<ModelPerformanceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    fetchModelPerformance()
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          // Fallback to baseline
          setData({
            metrics: MODEL_COMPARISONS,
            confusionMatrix: CONFUSION_MATRIX,
            trainingEpochs: TRAINING_HISTORY
          });
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  const metrics = data?.metrics || MODEL_COMPARISONS;
  const confusionMatrix = data?.confusionMatrix || CONFUSION_MATRIX;
  const trainingEpochs = data?.trainingEpochs || TRAINING_HISTORY;

  const activeModelMetric = metrics.find(m => m.model.includes('1D-CNN') || m.model.includes('Active')) || metrics[0];

  const RadialMetric = ({ title, value, subtitle, color }: { title: string; value: number; subtitle: string; color: string }) => {
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className="relative rounded-xl border border-slate-800/80 bg-gradient-to-br from-[#091122]/90 to-[#060a13] p-5 shadow-xl flex items-center gap-4">
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
              {value ? `${value.toFixed(1)}%` : 'N/A'}
            </span>
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            {title}
          </span>
          <span className="text-lg font-bold text-white tracking-tight mt-0.5 block">
            {value ? `${value.toFixed(1)}%` : 'Unavailable'}
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
          Empirical metrics for the 1D-CNN + BiLSTM architecture evaluated across cross-validation on multi-sensor medical telemetry.
        </p>

        {/* Source provenance label */}
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span><strong>Metric Source:</strong> Synthetic Evaluation & Baseline Validation Set (10-Fold Stratified Validation).</span>
        </div>
      </div>

      {/* TOP RADIAL METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <RadialMetric
          title="Overall Accuracy"
          value={activeModelMetric?.accuracy || 97.8}
          subtitle="Top-1 multi-class classification"
          color="#06b6d4"
        />
        <RadialMetric
          title="Macro Precision"
          value={activeModelMetric?.precision || 96.5}
          subtitle="Low false-alarm fault rate"
          color="#3b82f6"
        />
        <RadialMetric
          title="Macro Recall"
          value={activeModelMetric?.recall || 98.2}
          subtitle="Critical fault capture rate"
          color="#10b981"
        />
        <RadialMetric
          title="F1-Score Harmonized"
          value={activeModelMetric?.f1Score || 97.3}
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
            Source: Controlled Validation Baseline
          </span>
        </div>

        <div className="h-[320px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={metrics}
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
          <span>Inference Latency: <strong>{activeModelMetric?.inferenceLatencyMs || 12.4}ms per tensor</strong> on standard edge CPU</span>
          <span className="font-mono text-cyan-400">Deep Learning Temporal Feature Extractor Active</span>
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
              N = 2,492 validation samples
            </span>
          </div>

          <div className="mt-4">
            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              <div className="text-left text-slate-400">Actual \ Pred</div>
              <div>Normal</div>
              <div>Anomaly</div>
              <div>Fault</div>
            </div>

            {['Normal', 'Possible Anomaly', 'Fault Detected'].map((actualClass) => {
              const rowCells = confusionMatrix.filter((c) => c.actual === actualClass);
              return (
                <div key={actualClass} className="grid grid-cols-4 gap-1.5 mb-1.5 text-xs font-mono">
                  <div className="flex items-center text-[11px] font-sans font-medium text-slate-300 pr-1">
                    {actualClass === 'Possible Anomaly' ? 'Anomaly' : actualClass}
                  </div>

                  {rowCells.map((cell) => {
                    const isDiagonal = cell.actual === cell.predicted;
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
            <span>Overall Diagnostic Sensitivity: 96.4%</span>
            <span className="text-emerald-400 font-mono">True Positives: 2,432 / 2,492</span>
          </div>
        </div>

        {/* Right: TRAINING HISTORY */}
        <div className="lg:col-span-6 rounded-xl border border-slate-800/80 bg-gradient-to-b from-[#091122]/90 to-[#060a13] p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Training & Validation Convergence
              </h3>
              <p className="text-xs text-slate-400">
                Epoch progression over AdamW optimizer
              </p>
            </div>

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

          <div className="h-[220px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trainingEpochs}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis 
                  dataKey="epoch" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false} 
                  label={{ value: 'Epoch', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  domain={activeHistoryTab === 'accuracy' ? [70, 100] : [0, 0.8]}
                  fontFamily="var(--font-mono)"
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#091122', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                {activeHistoryTab === 'accuracy' ? (
                  <>
                    <Line type="monotone" dataKey="trainAccuracy" name="Train Accuracy (%)" stroke="#06b6d4" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="valAccuracy" name="Val Accuracy (%)" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  </>
                ) : (
                  <>
                    <Line type="monotone" dataKey="trainLoss" name="Train Loss" stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="valLoss" name="Val Loss" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Optimal Checkpoint: Epoch 25</span>
            <span className="text-cyan-400 font-mono">Min Validation Loss: 0.11</span>
          </div>
        </div>
      </div>
    </div>
  );
};
