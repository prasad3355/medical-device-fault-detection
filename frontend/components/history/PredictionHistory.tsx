import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  Eye, 
  ArrowUpDown, 
  SlidersHorizontal,
  X,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Layers,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { RECENT_ANALYSES } from '../../data/mockData';
import { AnalysisRecord, DeviceFaultStatus, PatientRiskLevel } from '../../types';

interface PredictionHistoryProps {
  onSelectRecordForReport: (record: AnalysisRecord) => void;
}

export const PredictionHistory: React.FC<PredictionHistoryProps> = ({
  onSelectRecordForReport
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [dateRange, setDateRange] = useState<string>('all_time');
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);

  // Filter logic
  const filteredRecords = RECENT_ANALYSES.filter((item) => {
    const matchesSearch = 
      item.datasetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deviceType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || item.deviceStatus === statusFilter;
    const matchesRisk = riskFilter === 'All' || item.patientRisk === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
          <Clock className="w-4 h-4" />
          <span>Historical Audit & Telemetry Workspace</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
          Prediction & Anomaly History
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Search, filter, and audit past deep learning classification runs across diverse clinical device datasets.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-800/80 bg-gradient-to-r from-[#091122]/90 to-[#070c17] shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by dataset name, device model, or hardware type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Quick Date Range Picker */}
          <div className="flex items-center gap-2 self-stretch md:self-auto">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all_time">All Evaluation Runs</option>
              <option value="today">Past 24 Hours</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>
          </div>
        </div>

        {/* Filter Badges & Segmented Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Device Status:
            </span>
            {['All', 'Normal', 'Possible Anomaly', 'Fault Detected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Patient Risk:
            </span>
            {['All', 'Low', 'Moderate', 'High'].map((rk) => (
              <button
                key={rk}
                onClick={() => setRiskFilter(rk)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  riskFilter === rk
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {rk}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-slate-800/80 bg-gradient-to-b from-[#091122]/90 to-[#060a13] p-5 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-mono text-slate-400">
            Showing {filteredRecords.length} of {RECENT_ANALYSES.length} evaluations
          </span>
          <span className="text-xs font-mono text-cyan-400">
            Click row to inspect neural tensor diagnostics
          </span>
        </div>

        <div className="overflow-x-auto -mx-5 px-5 mt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Dataset Name</th>
                <th className="py-3 px-3">Device Category</th>
                <th className="py-3 px-3 text-right">Samples</th>
                <th className="py-3 px-3">Device Status</th>
                <th className="py-3 px-3">Risk Level</th>
                <th className="py-3 px-3">Model Confidence</th>
                <th className="py-3 px-3">Analyzed</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {filteredRecords.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedRecord(item)}
                  className="group hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="font-mono font-semibold text-white group-hover:text-cyan-300 text-xs sm:text-sm">
                        {item.datasetName}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-xs text-slate-300 max-w-[200px] truncate">
                    {item.deviceType}
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono text-xs text-slate-300 tabular-nums">
                    {item.recordsCount.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium ${
                      item.deviceStatus === 'Normal'
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                        : item.deviceStatus === 'Possible Anomaly'
                        ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
                        : 'bg-red-950/40 text-red-300 border border-red-500/30'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        item.deviceStatus === 'Normal' ? 'bg-emerald-400' : item.deviceStatus === 'Possible Anomaly' ? 'bg-amber-400' : 'bg-red-400'
                      }`} />
                      {item.deviceStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap text-xs font-medium">
                    <span className={item.patientRisk === 'Low' ? 'text-emerald-400' : item.patientRisk === 'Moderate' ? 'text-amber-400' : 'text-red-400 font-bold'}>
                      {item.patientRisk}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white tabular-nums w-12">
                        {item.confidence.toFixed(1)}%
                      </span>
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-400" 
                          style={{ width: `${item.confidence}%` }} 
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap text-xs text-slate-400 font-mono">
                    {item.analyzedAt}
                  </td>

                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRecordForReport(item);
                      }}
                      className="px-2.5 py-1 rounded text-xs font-medium text-cyan-400 hover:text-white hover:bg-cyan-600/30 border border-transparent hover:border-cyan-500/30 transition-all cursor-pointer"
                    >
                      Open Full Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Inspection Slide-Over / Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl border border-cyan-500/40 bg-[#091122] p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                    Audit Record: {selectedRecord.id}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedRecord.analyzedAt}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  {selectedRecord.datasetName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">DEVICE STATUS</span>
                <span className="text-white font-bold font-sans text-sm mt-0.5 block">{selectedRecord.deviceStatus}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">PATIENT RISK</span>
                <span className="text-amber-400 font-bold font-sans text-sm mt-0.5 block">{selectedRecord.patientRisk}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">CONFIDENCE</span>
                <span className="text-cyan-300 font-bold font-mono text-sm mt-0.5 block">{selectedRecord.confidence}%</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">EXECUTION TIME</span>
                <span className="text-white font-bold font-mono text-sm mt-0.5 block">{selectedRecord.executionTimeMs} ms</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
              <span className="font-semibold text-slate-300 block">Device Hardware Specifications</span>
              <p className="text-slate-400">
                Type: {selectedRecord.deviceType} · File Size: {selectedRecord.fileSize} · Total Samples: {selectedRecord.recordsCount.toLocaleString()}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedRecord.sensorChannels.map((ch) => (
                  <span key={ch} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
                    {ch}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close Audit
              </button>
              <button
                onClick={() => {
                  onSelectRecordForReport(selectedRecord);
                  setSelectedRecord(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/30 cursor-pointer"
              >
                <span>Open Diagnostic Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
