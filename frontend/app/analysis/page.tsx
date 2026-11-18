"use client";
import { AnalysisReport } from '@/components/analysis/AnalysisReport';
import { useRouter } from 'next/navigation';
import { RECENT_ANALYSES } from '@/data/mockData';

export default function AnalysisPage() {
    const router = useRouter();

    return (
        <AnalysisReport
            currentRecord={RECENT_ANALYSES[0]}
            onNavigateToUpload={() => router.push('/upload')}
            onNavigateToPipeline={() => router.push('/ml-pipeline')}
        />
    );
}
