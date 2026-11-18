"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  UploadCloud,
  BarChart3,
  History,
  Cpu,
  GitFork,
  Info,
  ShieldCheck,
  ChevronRight,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose = () => { } }) => {
  const pathname = usePathname();
  const currentRoute = pathname.substring(1) || 'dashboard';

  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, badge: null, href: '/dashboard' },
    { id: 'upload', label: 'Upload Dataset', icon: UploadCloud, badge: 'Workflow', href: '/upload' },
    { id: 'analysis', label: 'Analysis & Results', icon: BarChart3, badge: null, href: '/analysis' },
    { id: 'history', label: 'Prediction History', icon: History, badge: '7 Logs', href: '/history' },
    { id: 'models', label: 'Model Performance', icon: Cpu, badge: '97.8%', href: '/model-performance' },
  ];

  const technicalNavItems = [
    { id: 'ml-pipeline', label: 'ML Pipeline', icon: GitFork, badge: 'Architecture', href: '/ml-pipeline' },
  ];

  const infoNavItems = [
    { id: 'about', label: 'About Project', icon: Info, badge: 'ID: 37013', href: '/about' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[280px] bg-[#070c17] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Subtle Ambient Glow at Top */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-cyan-500/10 via-blue-500/5 to-transparent pointer-events-none" />

        {/* Brand Header */}
        <div className="relative px-6 py-5 border-b border-slate-800/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Mark: Medical Cross + Signal Pulse */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px] shadow-lg shadow-cyan-500/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#091122] rounded-[11px] flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z" className="opacity-30 fill-cyan-500/10" />
                  <path d="M3 12h4l2-4 3 8 2-6 2 3h5" className="stroke-cyan-300 drop-shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
                </svg>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-white font-sans">
                  MEDFAULT <span className="text-cyan-400 font-extrabold">AI</span>
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 tracking-normal">
                Medical Device Intelligence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 z-10">
          <div>
            <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Core Workspace
            </div>
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.id;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onClose}
                    className={`group relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left ${isActive
                        ? 'text-cyan-300 bg-gradient-to-r from-cyan-950/60 via-blue-950/40 to-transparent shadow-[inset_0_1px_0_0_rgba(56,189,248,0.2)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                    )}
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded text-xs ${isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                        }`}>
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isActive ? 'text-cyan-400 translate-x-0.5' : 'text-transparent group-hover:text-slate-600'
                      }`} />
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="h-[1px] bg-slate-800/80 mx-2" />

          <div>
            <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Deep Learning
            </div>
            <nav className="space-y-1">
              {technicalNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.id;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onClose}
                    className={`group relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left ${isActive
                        ? 'text-cyan-300 bg-gradient-to-r from-cyan-950/60 via-blue-950/40 to-transparent shadow-[inset_0_1px_0_0_rgba(56,189,248,0.2)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                    )}
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isActive ? 'text-cyan-400 translate-x-0.5' : 'text-transparent group-hover:text-slate-600'
                      }`} />
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="h-[1px] bg-slate-800/80 mx-2" />

          <div>
            <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Project Information
            </div>
            <nav className="space-y-1">
              {infoNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.id;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onClose}
                    className={`group relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left ${isActive
                        ? 'text-cyan-300 bg-gradient-to-r from-cyan-950/60 via-blue-950/40 to-transparent shadow-[inset_0_1px_0_0_rgba(56,189,248,0.2)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                    )}
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isActive ? 'text-cyan-400 translate-x-0.5' : 'text-transparent group-hover:text-slate-600'
                      }`} />
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom System Status Box */}
        <div className="p-4 border-t border-slate-800/80 bg-[#060a13] z-10">
          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5 tracking-wider uppercase">
              <span>System Status</span>
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-200">
                AI Engine Ready
              </span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Academic Project</span>
              <span className="text-cyan-400/90 font-medium">v1.0 · 37013</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
