'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PdfViewer from '@/components/ui/pdf-viewer';
import {
    ResponsiveDialog,
    ResponsiveDialogContent,
    ResponsiveDialogDescription,
    ResponsiveDialogHeader,
    ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import { User } from './types';

interface ResumeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedUser: User | null;
    onNavigateUser: (direction: 'prev' | 'next') => void;
    canNavigatePrev: boolean;
    canNavigateNext: boolean;
    currentIndex: number;
    totalRows: number;
}

export default function ResumeDialog({
    open,
    onOpenChange,
    selectedUser,
    onNavigateUser,
    canNavigatePrev,
    canNavigateNext,
    currentIndex,
    totalRows,
}: ResumeDialogProps) {
    return (
        <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
            <ResponsiveDialogContent
                className="w-full sm:max-w-8/12"
                overlayZIndex={100}
            >
                <ResponsiveDialogHeader>
                    <ResponsiveDialogTitle>
                        {selectedUser
                            ? `${selectedUser.firstName} ${selectedUser.lastName}'s Resume`
                            : ''}
                    </ResponsiveDialogTitle>
                    <ResponsiveDialogDescription>
                        {selectedUser ? (
                            <>
                                {selectedUser.school}
                                {(selectedUser.linkedin !== 'N/A' ||
                                    selectedUser.github !== 'N/A') &&
                                    ' | '}
                                <span>
                                    {selectedUser.linkedin !== 'N/A' && (
                                        <>
                                            <Link
                                                href={selectedUser.linkedin}
                                                target="_blank"
                                                className="text-brand-400 hover:underline"
                                            >
                                                Linkedin
                                            </Link>
                                            {selectedUser.github !== 'N/A' &&
                                                ' | '}
                                        </>
                                    )}
                                    {selectedUser.github !== 'N/A' && (
                                        <Link
                                            className="text-brand-400 hover:underline"
                                            target="_blank"
                                            href={selectedUser.github}
                                        >
                                            Github
                                        </Link>
                                    )}
                                </span>
                            </>
                        ) : (
                            ''
                        )}
                    </ResponsiveDialogDescription>
                </ResponsiveDialogHeader>

                {selectedUser && (
                    <div className="flex w-full flex-col gap-3">
                        <PdfViewer url={selectedUser.resumeUrl} />
                        <div className="flex w-full justify-end">
                            <Link
                                href={selectedUser?.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-white/60 hover:underline"
                            >
                                Open Resume in New Tab
                            </Link>
                        </div>
                    </div>
                )}

                <div className="mb-4 flex items-center justify-between">
                    <Button
                        variant="default"
                        hierarchy={'primary'}
                        size="compact"
                        disabled={!canNavigatePrev}
                        onClick={() => onNavigateUser('prev')}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-white/60">
                        {currentIndex + 1} of {totalRows}
                    </span>
                    <Button
                        variant="default"
                        hierarchy={'primary'}
                        size="compact"
                        disabled={!canNavigateNext}
                        onClick={() => onNavigateUser('next')}
                    >
                        Next
                    </Button>
                </div>
            </ResponsiveDialogContent>
        </ResponsiveDialog>
    );
}
