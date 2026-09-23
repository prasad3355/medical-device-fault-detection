"use client";
import { DashboardView } from '@/components/dashboard/DashboardView';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
    return (
        <DashboardView
            onNavigateToUpload={() => router.push('/upload')}
            onNavigateToAnalysis={() => router.push('/analysis')}
            onNavigateToHistory={() => router.push('/history')}
        />
    );
}
