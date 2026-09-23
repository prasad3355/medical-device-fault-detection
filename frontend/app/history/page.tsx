"use client";
import { PredictionHistory } from '@/components/history/PredictionHistory';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
    const router = useRouter();

    return (
        <PredictionHistory
            onSelectRecordForReport={(record) => {
                router.push('/analysis');
            }}
        />
    );
}
