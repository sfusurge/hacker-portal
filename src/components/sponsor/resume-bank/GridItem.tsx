'use client';

import { Button } from '@/components/ui/button';
import { displaySponsorSchool } from '@/lib/applications/sponsorResumeBank';
import PdfPreview from './PdfPreview';
import { User } from './types';

interface GridItemProps {
    user: User;
    selected?: boolean;
    onViewResume: (userId: number) => void;
}

function isHttpUrl(value: string) {
    return Boolean(value) && value !== 'N/A' && value.startsWith('http');
}

function GitHubIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
            className={className}
        >
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
        </svg>
    );
}

function LinkedInIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
            className={className}
        >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    );
}

export default function GridItem({
    user,
    selected = false,
    onViewResume,
}: GridItemProps) {
    const hasGithub = isHttpUrl(user.github);
    const hasLinkedin = isHttpUrl(user.linkedin);

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onViewResume(user.id)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onViewResume(user.id);
                }
            }}
            className={`group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-xl border text-left transition-colors ${
                selected
                    ? 'border-brand-500/70 bg-brand-950/40'
                    : 'bg-neutral-850 border-neutral-600/30 hover:border-neutral-500/50 hover:bg-neutral-800'
            }`}
        >
            <div className="relative isolate z-0 h-44 w-full shrink-0 overflow-hidden border-b border-neutral-600/30 bg-neutral-800 @[450px]:h-48 @[650px]:h-52">
                <PdfPreview
                    url={user.resumeUrl}
                    name={`${user.firstName} ${user.lastName}`}
                    thumbnail
                />
            </div>

            <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-3 bg-inherit p-3">
                <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="min-w-0 truncate text-sm leading-5 font-semibold text-white">
                            {user.firstName} {user.lastName}
                        </h3>
                        <div className="flex h-5 shrink-0 items-center gap-0.5">
                            {hasGithub ? (
                                <a
                                    href={user.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${user.firstName}'s GitHub`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex h-5 w-5 items-center justify-center rounded text-white/55 transition-colors hover:text-white"
                                >
                                    <GitHubIcon className="h-3.5 w-3.5" />
                                </a>
                            ) : null}
                            {hasLinkedin ? (
                                <a
                                    href={user.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${user.firstName}'s LinkedIn`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex h-5 w-5 items-center justify-center rounded text-white/55 transition-colors hover:text-white"
                                >
                                    <LinkedInIcon className="h-3.5 w-3.5" />
                                </a>
                            ) : null}
                        </div>
                    </div>
                    <p className="truncate text-xs text-white/60">
                        {displaySponsorSchool(user)}
                    </p>
                </div>

                <Button
                    variant="default"
                    hierarchy="secondary"
                    size="compact"
                    className="mt-auto w-full shrink-0 text-xs"
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewResume(user.id);
                    }}
                >
                    View profile
                </Button>
            </div>
        </div>
    );
}
