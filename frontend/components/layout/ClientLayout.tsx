"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useState } from "react";

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <>
            {/* Background Ambience: Subtle radial navy/cyan glow and technical grid */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[140px]" />
                <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[160px]" />
                <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px]" />
                <div className="absolute inset-0 bg-tech-grid opacity-30" />
            </div>

            <Sidebar
                isOpen={mobileSidebarOpen}
                onClose={() => setMobileSidebarOpen(false)}
            />

            <div className="lg:pl-[280px] flex-1 flex flex-col relative z-10 transition-all duration-300 min-h-screen">
                <Header
                    onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
                />

                <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1440px] w-full mx-auto pb-10">
                    {children}
                </main>

                {/* Global Quiet Footer */}
                <footer className="mt-auto border-t border-slate-800/60 bg-[#060a12]/80 px-4 sm:px-8 py-4 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-20">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-300">MEDFAULT AI</span>
                        <span>·</span>
                        <span className="hidden sm:inline">Predictive Fault Detection in Medical Devices</span>
                        <span>·</span>
                        <span className="font-mono text-cyan-400/80">Project ID: 37013</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono text-slate-400">
                        <span>Discrete Wavelet Denoising (db4)</span>
                        <span>·</span>
                        <span>1D-CNN + BiLSTM + Attention</span>
                        <span>·</span>
                        <span className="text-emerald-400">System Ready</span>
                    </div>
                </footer>
            </div>
        </>
    );
}
