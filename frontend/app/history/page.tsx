"use client";
import { PredictionHistory } from '@/components/history/PredictionHistory';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
    const router = useRouter();

    return (
        <PredictionHistory
            onSelectRecordForReport={(record) => {
                if (record && record.id) {
                    router.push(`/analysis?id=${encodeURIComponent(record.id)}`);
                } else {
                    router.push('/analysis');
                }
            }}
        />
    );
}
