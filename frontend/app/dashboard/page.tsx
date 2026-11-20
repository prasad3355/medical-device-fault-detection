"use client";
import { DashboardView } from '@/components/dashboard/DashboardView';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
    return (
        <DashboardView
            onNavigateToUpload={() => router.push('/upload')}
            onNavigateToAnalysis={(rec) => {
                if (rec && rec.id) {
                    router.push(`/analysis?id=${encodeURIComponent(rec.id)}`);
                } else {
                    router.push('/analysis');
                }
            }}
            onNavigateToHistory={() => router.push('/history')}
        />
    );
}
