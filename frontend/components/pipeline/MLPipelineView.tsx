import React, { useState } from 'react';
import { 
  GitFork, 
  Database, 
  CheckCircle2, 
  Binary, 
  Waves, 
  Cpu, 
  AlertOctagon, 
  HeartPulse, 
  BellRing, 
  Info, 
  ChevronRight, 
  Layers, 
  ArrowDown, 
  Sliders, 
  Code,
  Zap,
  Sparkles
} from 'lucide-react';
import { PIPELINE_NODES } from '../../data/mockData';
import { PipelineNodeData } from '../../types';

export const MLPipelineView: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<PipelineNodeData>(PIPELINE_NODES[4]); // Default to CNN/LSTM

  const getNodeIcon = (id: string) => {
    switch (id) {
      case 'node-dataset': return Database;
      case 'node-validation': return CheckCircle2;
      case 'node-preprocessing': return Waves;
      case 'node-feature': return Binary;
      case 'node-model': return Cpu;
      case 'node-fault-detection': return AlertOctagon;
      case 'node-risk-analysis': return HeartPulse;
      case 'node-results': return BellRing;
      default: return Cpu;
    }
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
          <GitFork className="w-4 h-4" />
          <span>System Architecture & Engineering Specification</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
          END-TO-END ML PIPELINE
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          From raw medical data to intelligent fault and risk predictions. Click any architectural node to inspect underlying tensor transformations, neural specifications, and hyperparameters.
        </p>
      </div>

      {/* Main Interactive Node-Based Technical Canvas */}
      <div className="relative rounded-2xl border border-slate-800 bg-[#070c17] p-6 sm:p-10 shadow-2xl overflow-hidden bg-tech-dots">
        {/* Ambient Lighting Accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto flex flex-col items-center">
          {/* Node 1: DATASET INGESTION */}
          {(() => {
            const node = PIPELINE_NODES[0];
            const Icon = getNodeIcon(node.id);
            const isSelected = selectedNode.id === node.id;
            return (
              <div 
                onClick={() => setSelectedNode(node)}
                className={`w-full sm:w-[480px] p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'border-cyan-400 bg-cyan-950/60 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/50' 
                    : 'border-slate-800 bg-[#091122]/90 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 block font-bold">NODE {node.number}</span>
                      <h4 className="text-sm font-bold text-white">{node.title}</h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {node.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 pl-11">{node.shortDesc}</p>
              </div>
            );
          })()}

          {/* Connector Line 1 */}
          <div className="flex flex-col items-center my-1.5">
            <div className="w-[2px] h-6 bg-gradient-to-b from-cyan-400/80 to-cyan-500/30" />
            <ArrowDown className="w-3.5 h-3.5 text-cyan-400 -mt-1" />
          </div>

          {/* Node 2: VALIDATION */}
          {(() => {
            const node = PIPELINE_NODES[1];
            const Icon = getNodeIcon(node.id);
            const isSelected = selectedNode.id === node.id;
            return (
              <div 
                onClick={() => setSelectedNode(node)}
                className={`w-full sm:w-[480px] p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'border-cyan-400 bg-cyan-950/60 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/50' 
                    : 'border-slate-800 bg-[#091122]/90 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-blue-400 block font-bold">NODE {node.number}</span>
                      <h4 className="text-sm font-bold text-white">{node.title}</h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-500/30">
                    {node.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 pl-11">{node.shortDesc}</p>
              </div>
            );
          })()}

          {/* Connector Line 2 */}
          <div className="flex flex-col items-center my-1.5">
            <div className="w-[2px] h-6 bg-gradient-to-b from-blue-400/80 to-blue-500/30" />
            <ArrowDown className="w-3.5 h-3.5 text-blue-400 -mt-1" />
          </div>

          {/* Node 3: PREPROCESSING */}
          {(() => {
            const node = PIPELINE_NODES[2];
            const Icon = getNodeIcon(node.id);
            const isSelected = selectedNode.id === node.id;
            return (
              <div 
                onClick={() => setSelectedNode(node)}
                className={`w-full sm:w-[480px] p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'border-cyan-400 bg-cyan-950/60 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/50' 
                    : 'border-slate-800 bg-[#091122]/90 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-indigo-400 block font-bold">NODE {node.number}</span>
                      <h4 className="text-sm font-bold text-white">{node.title}</h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-500/30">
                    {node.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 pl-11">{node.shortDesc}</p>
              </div>
            );
          })()}

          {/* Connector Line 3 */}
          <div className="flex flex-col items-center my-1.5">
            <div className="w-[2px] h-6 bg-gradient-to-b from-indigo-400/80 to-indigo-500/30" />
            <ArrowDown className="w-3.5 h-3.5 text-indigo-400 -mt-1" />
          </div>

          {/* Node 4: FEATURE EXTRACTION */}
          {(() => {
            const node = PIPELINE_NODES[3];
            const Icon = getNodeIcon(node.id);
            const isSelected = selectedNode.id === node.id;
            return (
              <div 
                onClick={() => setSelectedNode(node)}
                className={`w-full sm:w-[480px] p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'border-cyan-400 bg-cyan-950/60 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/50' 
                    : 'border-slate-800 bg-[#091122]/90 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 block font-bold">NODE {node.number}</span>
                      <h4 className="text-sm font-bold text-white">{node.title}</h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-500/30">
                    {node.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 pl-11">{node.shortDesc}</p>
              </div>
            );
          })()}

          {/* Connector Line 4 */}
          <div className="flex flex-col items-center my-1.5">
            <div className="w-[2px] h-6 bg-gradient-to-b from-cyan-400/80 to-cyan-500/30" />
            <ArrowDown className="w-3.5 h-3.5 text-cyan-400 -mt-1" />
          </div>

          {/* Node 5: CNN / LSTM BACKBONE (CENTRAL ENGINE) */}
          {(() => {
            const node = PIPELINE_NODES[4];
            const Icon = getNodeIcon(node.id);
            const isSelected = selectedNode.id === node.id;
            return (
              <div 
                onClick={() => setSelectedNode(node)}
                className={`relative w-full sm:w-[520px] p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'border-cyan-400 bg-gradient-to-r from-cyan-950/80 via-blue-950/60 to-[#091122] shadow-2xl shadow-cyan-500/25 ring-2 ring-cyan-400/60' 
                    : 'border-cyan-500/40 bg-gradient-to-r from-[#0d1b38] to-[#091224] hover:border-cyan-400'
                }`}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-500 text-[#070c17] text-[10px] font-extrabold tracking-wider uppercase font-mono shadow-md">
                  CORE NEURAL ENGINE
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-400 text-slate-950 shadow-md">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-cyan-300 block font-bold">NODE {node.number} · 1.42M WEIGHTS</span>
                      <h4 className="text-base font-extrabold text-white">{node.title}</h4>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-400/40">
                    {node.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2.5 pl-12 leading-relaxed">
                  {node.shortDesc}
                </p>
              </div>
            );
          })()}

          {/* Branching Split Connector */}
          <div className="w-full sm:w-[480px] my-3">
            <div className="flex items-center justify-center">
              <div className="w-[2px] h-4 bg-cyan-400" />
            </div>
            {/* Horizontal Split Line */}
            <div className="relative h-[2px] bg-slate-700 mx-12">
              <div className="absolute left-0 top-0 w-3 h-[2px] bg-cyan-400" />
              <div className="absolute right-0 top-0 w-3 h-[2px] bg-blue-400" />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-cyan-400 to-blue-400" />
            </div>
            <div className="flex justify-between px-10">
              <ArrowDown className="w-3.5 h-3.5 text-amber-400 -mt-0.5" />
              <ArrowDown className="w-3.5 h-3.5 text-blue-400 -mt-0.5" />
            </div>
          </div>

          {/* Dual Branch Nodes: 06A & 06B */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full sm:w-[540px]">
            {/* Node 6A: DEVICE FAULT DETECTION */}
            {(() => {
              const node = PIPELINE_NODES[5];
              const Icon = getNodeIcon(node.id);
              const isSelected = selectedNode.id === node.id;
              return (
                <div 
                  onClick={() => setSelectedNode(node)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isSelected 
                      ? 'border-amber-400 bg-amber-950/60 shadow-lg shadow-amber-950/50 ring-1 ring-amber-400/50' 
                      : 'border-slate-800 bg-[#091122]/90 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">NODE {node.number}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-2">{node.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{node.shortDesc}</p>
                </div>
              );
            })()}

            {/* Node 6B: PATIENT RISK ANALYSIS */}
            {(() => {
              const node = PIPELINE_NODES[6];
              const Icon = getNodeIcon(node.id);
              const isSelected = selectedNode.id === node.id;
              return (
                <div 
                  onClick={() => setSelectedNode(node)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isSelected 
                      ? 'border-blue-400 bg-blue-950/60 shadow-lg shadow-blue-950/50 ring-1 ring-blue-400/50' 
                      : 'border-slate-800 bg-[#091122]/90 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-blue-400 font-bold">NODE {node.number}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-2">{node.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{node.shortDesc}</p>
                </div>
              );
            })()}
          </div>

          {/* Merge Lines to Node 7 */}
          <div className="w-full sm:w-[480px] my-3">
            <div className="relative h-[2px] bg-slate-700 mx-12">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-cyan-400 to-blue-400" />
            </div>
            <div className="flex items-center justify-center">
              <div className="w-[2px] h-4 bg-cyan-400" />
            </div>
            <div className="flex items-center justify-center">
              <ArrowDown className="w-3.5 h-3.5 text-cyan-400 -mt-1" />
            </div>
          </div>

          {/* Node 7: RESULTS & DECISION ENGINE */}
          {(() => {
            const node = PIPELINE_NODES[7];
            const Icon = getNodeIcon(node.id);
            const isSelected = selectedNode.id === node.id;
            return (
              <div 
                onClick={() => setSelectedNode(node)}
                className={`w-full sm:w-[480px] p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'border-emerald-400 bg-emerald-950/50 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-400/50' 
                    : 'border-slate-800 bg-[#091122]/90 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 block font-bold">NODE {node.number}</span>
                      <h4 className="text-sm font-bold text-white">{node.title}</h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {node.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 pl-11">{node.shortDesc}</p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* SELECTED NODE DEEP SPECIFICATION DRAWER */}
      {selectedNode && (
        <div className="rounded-xl border border-cyan-500/40 bg-gradient-to-br from-[#091122] to-[#070c17] p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                NODE {selectedNode.number} SPECIFICATION AUDIT
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {selectedNode.title} · {selectedNode.details.technology}
              </h3>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-800/60 self-start sm:self-auto">
              Category: {selectedNode.category.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {selectedNode.details.inputShape && (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">TENSOR INPUT SHAPE</span>
                <span className="font-mono font-bold text-cyan-300 text-sm mt-0.5 block">{selectedNode.details.inputShape}</span>
              </div>
            )}
            {selectedNode.details.outputShape && (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">OUTPUT EMBEDDING</span>
                <span className="font-mono font-bold text-emerald-300 text-sm mt-0.5 block">{selectedNode.details.outputShape}</span>
              </div>
            )}
            {selectedNode.details.parameters && (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">LEARNED PARAMETERS</span>
                <span className="font-mono font-bold text-amber-300 text-sm mt-0.5 block">{selectedNode.details.parameters}</span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Implementation Guarantees & Specifications
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {selectedNode.details.specifications.map((spec, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TRAINING & APPLICATION INFERENCE WORKFLOWS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflow 1: MODEL TRAINING */}
        <div className="rounded-xl border border-slate-800/80 bg-gradient-to-b from-[#091122]/90 to-[#060a13] p-5 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Offline Model Training Lifecycle
            </h3>
          </div>

          <div className="mt-4 flex flex-col gap-2.5 text-xs font-mono">
            {[
              { step: '01', name: 'Raw Telemetry Curation', desc: 'PhysioNet & Multi-hospital ICU cohort recordings' },
              { step: '02', name: 'Preprocess & Augment', desc: 'Wavelet denoising, synthetic jitter & baseline drift' },
              { step: '03', name: 'Supervised Training', desc: 'AdamW optimizer (cosine annealing, focal loss)' },
              { step: '04', name: 'K-Fold Validation', desc: '10-fold cross validation with stratified patient splits' },
              { step: '05', name: 'Model Export', desc: 'Quantized ONNX & TorchScript graph generation' }
            ].map((s) => (
              <div key={s.step} className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                    {s.step}
                  </span>
                  <span className="text-slate-200 font-sans font-medium text-xs">{s.name}</span>
                </div>
                <span className="text-[11px] text-slate-400 truncate max-w-[200px]">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow 2: APPLICATION INFERENCE */}
        <div className="rounded-xl border border-slate-800/80 bg-gradient-to-b from-[#091122]/90 to-[#060a13] p-5 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Cpu className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Realtime Application Inference
            </h3>
          </div>

          <div className="mt-4 flex flex-col gap-2.5 text-xs font-mono">
            {[
              { step: '01', name: 'CSV / Excel Upload', desc: 'User drops medical telemetry file onto dashboard' },
              { step: '02', name: 'Browser Preprocessor', desc: 'Validation, imputation, sliding 128-sample windowing' },
              { step: '03', name: 'Trained Model Weights', desc: 'PyTorch / ONNX runtime multi-task classification' },
              { step: '04', name: 'Confidence Calibration', desc: 'Temperature scaling for accurate failure certainty' },
              { step: '05', name: 'Dashboard Rendering', desc: 'Highlighted anomaly intervals & clinical engineering report' }
            ].map((s) => (
              <div key={s.step} className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                    {s.step}
                  </span>
                  <span className="text-slate-200 font-sans font-medium text-xs">{s.name}</span>
                </div>
                <span className="text-[11px] text-slate-400 truncate max-w-[200px]">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
