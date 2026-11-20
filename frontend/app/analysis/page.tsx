"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnalysisReport } from '@/components/analysis/AnalysisReport';
import { fetchAnalysisById, fetchAnalysisHistory, FullAnalysisData } from '@/lib/api';
import { RefreshCw, AlertTriangle, ArrowLeft, UploadCloud } from 'lucide-react';

function AnalysisContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const runId = searchParams.get('id');

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [analysisData, setAnalysisData] = useState<FullAnalysisData | null>(null);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);

        const loadAnalysis = async () => {
            try {
                let targetId = runId;
                if (!targetId) {
                    // Fetch latest from history if no ID specified
                    const history = await fetchAnalysisHistory();
                    if (history && history.length > 0) {
                        targetId = history[0].id;
                    } else {
                        if (isMounted) {
                            setLoading(false);
                            setAnalysisData(null);
                        }
                        return;
                    }
                }

                const data = await fetchAnalysisById(targetId);
                if (isMounted) {
                    setAnalysisData(data);
                    setLoading(false);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err.message || 'Unable to load analysis report.');
                    setLoading(false);
                }
            }
        };

        loadAnalysis();

        return () => {
            isMounted = false;
        };
    }, [runId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="text-sm font-mono text-slate-400">Loading Diagnostic Telemetry Report...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl border border-red-500/30 bg-red-950/20 text-center space-y-4 shadow-xl">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Report Not Found</h3>
                <p className="text-sm text-slate-300">{error}</p>
                <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                        onClick={() => router.push('/upload')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                    >
                        <UploadCloud className="w-4 h-4" />
                        <span>Upload Dataset</span>
                    </button>
                    <button
                        onClick={() => router.push('/history')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>View History</span>
                    </button>
                </div>
            </div>
        );
    }

    if (!analysisData) {
        return (
            <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl border border-slate-800 bg-[#091122]/60 text-center space-y-4 shadow-xl">
                <UploadCloud className="w-12 h-12 text-cyan-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Telemetry Analyses Available</h3>
                <p className="text-sm text-slate-400">
                    No past analyses were found in the database. Ingest an ICU or ventilator dataset to view its live deep learning report.
                </p>
                <button
                    onClick={() => router.push('/upload')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold shadow-lg shadow-cyan-900/40 cursor-pointer"
                >
                    <UploadCloud className="w-4 h-4" />
                    <span>Go to Dataset Upload</span>
                </button>
            </div>
        );
    }

    return (
        <AnalysisReport
            data={analysisData}
            onNavigateToUpload={() => router.push('/upload')}
            onNavigateToPipeline={() => router.push('/ml-pipeline')}
        />
    );
}

export default function AnalysisPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="text-sm font-mono text-slate-400">Initializing Analysis Workspace...</p>
            </div>
        }>
            <AnalysisContent />
        </Suspense>
    );
}
