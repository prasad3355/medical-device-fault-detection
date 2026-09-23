"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  UploadCloud,
  Database,
  ArrowRight
} from 'lucide-react';
import { NavigationRoute } from '../../types';

interface HeaderProps {
  activeDatasetName?: string;
  onOpenMobileSidebar?: () => void;
}

const ROUTE_LABELS: Record<string, { title: string; breadcrumb: string }> = {
  dashboard: { title: 'Dashboard', breadcrumb: 'Workspace / Medical Intelligence' },
  upload: { title: 'Upload Dataset', breadcrumb: 'Workspace / Dataset Ingestion' },
  analysis: { title: 'Analysis & Results', breadcrumb: 'Workspace / Diagnostic Report' },
  history: { title: 'Prediction History', breadcrumb: 'Workspace / Historical Telemetry' },
  'model-performance': { title: 'Model Performance', breadcrumb: 'Workspace / Neural Benchmarks' },
  'ml-pipeline': { title: 'ML Pipeline', breadcrumb: 'Workspace / Deep Learning Architecture' },
  about: { title: 'About Project', breadcrumb: 'Workspace / Project Specification' }
};

export const Header: React.FC<HeaderProps> = ({
  activeDatasetName = "ICU_MultiParameter_Telemetry.csv",
  onOpenMobileSidebar = () => { }
}) => {
  const pathname = usePathname();
  const currentRoute = pathname.substring(1) || 'dashboard';
  const currentInfo = ROUTE_LABELS[currentRoute] || { title: 'Dashboard', breadcrumb: 'Workspace / Dashboard' };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#070b15]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left: Breadcrumb & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <span>{currentInfo.breadcrumb}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none mt-0.5">
            {currentInfo.title}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* System Ready Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-medium text-slate-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span>System Ready</span>
        </div>

        {/* Dataset Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200">
          <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="max-w-[170px] truncate font-mono text-[11px]" title={activeDatasetName}>
            {activeDatasetName}
          </span>
        </div>

        {/* Upload Dataset Button */}
        {currentRoute !== 'upload' ? (
          <Link
            href="/upload"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/30 border border-cyan-400/30 hover:shadow-cyan-500/20 transition-all duration-200 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-cyan-100" />
            <span className="hidden sm:inline">Upload Dataset</span>
            <span className="sm:hidden">Upload</span>
          </Link>
        ) : (
          <Link
            href="/analysis"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-all duration-200 cursor-pointer"
          >
            <span>View Analysis</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </Link>
        )}
      </div>
    </header>
  );
};
