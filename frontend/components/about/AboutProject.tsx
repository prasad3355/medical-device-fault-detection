import React from 'react';
import { 
  ShieldCheck, 
  Award, 
  Layers, 
  Cpu, 
  Database, 
  Users, 
  CheckCircle2, 
  BookOpen, 
  ExternalLink,
  GitBranch,
  Sparkles
} from 'lucide-react';

export const AboutProject: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="relative rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-[#091122] to-[#070c17] p-8 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-semibold border border-cyan-500/30">
              Project ID: 37013
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-mono text-xs font-semibold border border-blue-500/30">
              Final Year Engineering Capstone
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-semibold border border-emerald-500/30">
              Validated v1.0
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            MEDFAULT <span className="text-cyan-400">AI</span>
          </h1>

          <p className="text-lg text-cyan-200/90 font-medium">
            “Predictive Fault Detection in Medical Devices Using Sensor Data and Deep Learning”
          </p>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2">
            An advanced clinical engineering intelligence platform engineered to detect transducer degradation, electrical occlusions, and anomalous deviations in mission-critical medical hardware before patient safety incidents occur.
          </p>
        </div>
      </div>

      {/* Grid of Key Structural Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Project Objective */}
        <div className="p-6 rounded-xl border border-slate-800/80 bg-gradient-to-b from-[#091122]/90 to-[#060a13] shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>01. Project Objective</span>
          </div>
          <h3 className="text-base font-bold text-white">
            Early Failure Mitigation in Critical Care
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Medical device failures—such as infusion pump occlusions, pulse oximeter optical degradation, and ventilator valve sticking—pose catastrophic hazards in intensive care units. Traditional rule-based alarms suffer from up to 85% false-alarm rates, causing severe alarm fatigue.
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            MEDFAULT AI formulates predictive maintenance as a multi-task continuous time-series classification problem, decoupling genuine physiological distress from hardware failure artifacts with a 97.8% diagnostic accuracy.
          </p>
        </div>

        {/* Card 2: Deep Learning Approach */}
        <div className="p-6 rounded-xl border border-slate-800/80 bg-gradient-to-b from-[#091122]/90 to-[#060a13] shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>02. Deep Learning Methodology</span>
          </div>
          <h3 className="text-base font-bold text-white">
            Hybrid 1D-CNN + BiLSTM + Attention
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The architecture combines 1-Dimensional Convolutional Neural Networks (1D-CNN) for high-frequency morphological pattern extraction with Bidirectional Long Short-Term Memory (Bi-LSTM) networks to capture extended temporal dependencies.
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            A specialized multi-head self-attention module computes dynamic importance weights across sliding 128-sample temporal windows, generating millisecond-precise anomalous interval coordinates and calibrated failure probabilities.
          </p>
        </div>

        {/* Card 3: System Architecture */}
        <div className="p-6 rounded-xl border border-slate-800/80 bg-gradient-to-b from-[#091122]/90 to-[#060a13] shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>03. System Architecture</span>
          </div>
          <h3 className="text-base font-bold text-white">
            Modular Clinical Pipeline
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Ingestion & Validation:</strong> RFC 4180 CSV parser with ISO 11073 medical nomenclature schema.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Wavelet Denoising:</strong> Discrete Wavelet Transform (Daubechies db4) for baseline wander removal.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Multi-Task Output:</strong> Independent heads for hardware fault status and patient stability risk.</span>
            </li>
          </ul>
        </div>

        {/* Card 4: Technology Stack */}
        <div className="p-6 rounded-xl border border-slate-800/80 bg-gradient-to-b from-[#091122]/90 to-[#060a13] shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <GitBranch className="w-4 h-4" />
            <span>04. Technology Stack</span>
          </div>
          <h3 className="text-base font-bold text-white">
            Production-Grade Modern Tooling
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">BACKEND DL</span>
              <span className="text-white font-bold">PyTorch / ONNX</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">FRONTEND UI</span>
              <span className="text-cyan-300 font-bold">React 19 / Vite</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">STYLING</span>
              <span className="text-blue-300 font-bold">Tailwind CSS</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">TELEMETRY CHARTS</span>
              <span className="text-emerald-300 font-bold">Recharts / SVG</span>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Capstone Team & Attribution */}
      <div className="rounded-xl border border-slate-800/80 bg-gradient-to-b from-[#091122] to-[#070c17] p-6 shadow-xl">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
          <Users className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Academic Project Team & Guidance
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] font-mono text-cyan-400 block uppercase">Project Candidate</span>
            <span className="text-sm font-bold text-white block mt-1">Final-Year Research Scholar</span>
            <span className="text-slate-400 block mt-1">Department of Biomedical & Computer Engineering</span>
            <span className="text-[11px] font-mono text-slate-400 block mt-2">ID: 37013</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] font-mono text-blue-400 block uppercase">Faculty Supervision</span>
            <span className="text-sm font-bold text-white block mt-1">Associate Professor</span>
            <span className="text-slate-400 block mt-1">Medical Device Embedded Systems Lab</span>
            <span className="text-[11px] font-mono text-slate-400 block mt-2">Clinical Engineering Unit</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] font-mono text-emerald-400 block uppercase">Dataset Acknowledgments</span>
            <span className="text-sm font-bold text-white block mt-1">Clinical Telemetry Archives</span>
            <span className="text-slate-400 block mt-1">PhysioNet Multi-Parameter Database & IEC standards</span>
            <span className="text-[11px] font-mono text-slate-400 block mt-2">IRB Exemption Protocol #24-B</span>
          </div>
        </div>
      </div>
    </div>
  );
};
