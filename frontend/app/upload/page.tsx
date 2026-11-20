"use client";
import { UploadWorkflow } from '@/components/upload/UploadWorkflow';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
    const router = useRouter();

    return (
        <UploadWorkflow
            onAnalyzeSuccess={(data) => {
                if (data && data.record && data.record.id) {
                    router.push(`/analysis?id=${encodeURIComponent(data.record.id)}`);
                } else {
                    router.push('/analysis');
                }
            }}
        />
    );
}
