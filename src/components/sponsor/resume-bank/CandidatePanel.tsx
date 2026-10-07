'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PdfViewer from '@/components/ui/pdf-viewer';
import { User } from './types';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    XMarkIcon,
    ClipboardDocumentIcon,
    ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/solid';

interface CandidatePanelProps {
    selectedUser: User | null;
    onClose: () => void;
    onNavigateUser: (direction: 'prev' | 'next') => void;
    canNavigatePrev: boolean;
    canNavigateNext: boolean;
    currentIndex: number;
    totalRows: number;
}

function isHttpUrl(value: string) {
    return Boolean(value) && value !== 'N/A' && value.startsWith('http');
}

export default function CandidatePanel({
    selectedUser,
    onClose,
    onNavigateUser,
    canNavigatePrev,
    canNavigateNext,
    currentIndex,
    totalRows,
}: CandidatePanelProps) {
    const [mounted, setMounted] = useState(false);
    const [emailCopied, setEmailCopied] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setEmailCopied(false);
    }, [selectedUser?.id]);

    useEffect(() => {
        if (!selectedUser) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [selectedUser]);

    useEffect(() => {
        if (!selectedUser) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft' && canNavigatePrev)
                onNavigateUser('prev');
            if (e.key === 'ArrowRight' && canNavigateNext)
                onNavigateUser('next');
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [
        selectedUser,
        onClose,
        onNavigateUser,
        canNavigatePrev,
        canNavigateNext,
    ]);

    if (!selectedUser || !mounted) return null;

    const copyEmail = async () => {
        if (!selectedUser.email || selectedUser.email === 'N/A') return;
        try {
            await navigator.clipboard.writeText(selectedUser.email);
            setEmailCopied(true);
            window.setTimeout(() => setEmailCopied(false), 1600);
        } catch {
            // ignore clipboard failures
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[300] flex h-dvh max-h-dvh justify-end bg-black/55 backdrop-blur-[2px]">
            <button
                type="button"
                aria-label="Close candidate panel"
                className="absolute inset-0 cursor-default"
                onClick={onClose}
            />
            <aside className="relative z-10 flex h-full max-h-dvh w-full max-w-3xl flex-col overflow-hidden border-l border-neutral-600/40 bg-neutral-900 shadow-2xl">
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-neutral-600/30 px-5 py-4">
                    <div className="min-w-0 space-y-1">
                        <p className="text-sm text-white/60">
                            Candidate {currentIndex + 1} of {totalRows}
                        </p>
                        <h2 className="truncate text-xl font-bold text-white">
                            {selectedUser.firstName} {selectedUser.lastName}
                        </h2>
                        <p className="truncate text-sm text-white/60">
                            {selectedUser.schoolLabel}
                        </p>
                    </div>
                    <Button
                        variant="default"
                        hierarchy="secondary"
                        size="iconButton"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-neutral-600/30 px-5 py-3">
                    {selectedUser.email !== 'N/A' && (
                        <Button
                            variant="default"
                            hierarchy="secondary"
                            size="compact"
                            className="cursor-copy"
                            leadingIconChild={
                                <ClipboardDocumentIcon className="h-4 w-4" />
                            }
                            onClick={copyEmail}
                        >
                            {emailCopied ? 'Copied!' : 'Copy email'}
                        </Button>
                    )}
                    {isHttpUrl(selectedUser.github) && (
                        <Link
                            href={selectedUser.github}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button
                                variant="default"
                                hierarchy="secondary"
                                size="compact"
                            >
                                GitHub
                            </Button>
                        </Link>
                    )}
                    {isHttpUrl(selectedUser.linkedin) && (
                        <Link
                            href={selectedUser.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button
                                variant="default"
                                hierarchy="secondary"
                                size="compact"
                            >
                                LinkedIn
                            </Button>
                        </Link>
                    )}
                    <Link
                        href={selectedUser.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sm:ml-auto"
                    >
                        <Button
                            variant="brand"
                            hierarchy="primary"
                            size="compact"
                            trailingIconChild={
                                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                            }
                        >
                            Open PDF
                        </Button>
                    </Link>
                </div>

                <div className="min-h-0 flex-1 overflow-hidden px-5 py-4">
                    <PdfViewer url={selectedUser.resumeUrl} fill />
                </div>

                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-neutral-600/30 px-5 py-4">
                    <Button
                        variant="default"
                        hierarchy="secondary"
                        size="compact"
                        disabled={!canNavigatePrev}
                        leadingIconChild={<ArrowLeftIcon className="h-4 w-4" />}
                        onClick={() => onNavigateUser('prev')}
                    >
                        Previous
                    </Button>
                    <span className="hidden text-center text-sm text-white/60 md:inline">
                        Arrow keys to navigate · Esc to close
                    </span>
                    <Button
                        variant="default"
                        hierarchy="secondary"
                        size="compact"
                        disabled={!canNavigateNext}
                        trailingIconChild={
                            <ArrowRightIcon className="h-4 w-4" />
                        }
                        onClick={() => onNavigateUser('next')}
                    >
                        Next
                    </Button>
                </div>
            </aside>
        </div>,
        document.body
    );
}
