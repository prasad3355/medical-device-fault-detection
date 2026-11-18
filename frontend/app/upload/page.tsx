"use client";
import { UploadWorkflow } from '@/components/upload/UploadWorkflow';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
    const router = useRouter();

    return (
        <UploadWorkflow
            onAnalyzeDataset={(dataset, mode) => {
                // You could pass parameters via state management or query params
                router.push('/analysis');
            }}
        />
    );
}
