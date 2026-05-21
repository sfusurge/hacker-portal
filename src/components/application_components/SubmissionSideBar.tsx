'use client';

import { isReviewPageAtom } from '@/components/application_components/InputForm';
import { useAtomValue } from 'jotai';
import type { ReactNode } from 'react';

export function SubmissionSideBar({ children }: { children: ReactNode }) {
    const isReviewPage = useAtomValue(isReviewPageAtom);

    if (isReviewPage) {
        return null;
    }

    return (
        <div className="flex flex-col gap-8 lg:max-w-1/4 lg:self-start">
            {children}
        </div>
    );
}
