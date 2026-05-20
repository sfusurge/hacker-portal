'use client';

import type {
    InputFormPageData,
    QuestionFileUploads,
    QuestionMarkdownInput,
    QuestionMultipleChoice,
    QuestionTextLineInput,
    QuestionTextLinkInput,
    QuestionTitleLineInput,
} from './types';
import styles from './ReviewProject.module.css';
import { useState } from 'react';
import { atom, useAtomValue } from 'jotai';
import { currentTeamAtom } from '@/app/(auth)/ClientContext';
import { Button } from '../ui/button';
import ReviewApplicationDialog from './ReviewApplicationDialog';
import { Card, CardContent, CardHeader } from '../ui/card';
import { SkewmorphicButton } from '../ui/SkewmorphicButton/SkewmorphicButton';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { MarkdownDisplay } from '@/components/ui/Markdown/MarkdownDisplay';
import { getSubmissionPreviewQuestions } from '@/lib/projects/submissionFormQuestions';
import { resolveTeamIconUrl } from '@/utils/blobHelper';

export interface ReviewProjectProps {
    submit: () => void | Promise<void>;
    mobileMode?: boolean;
    response: InputFormPageData[];
    disableSubmitBtn?: boolean;
}

export const submitMessageAtom = atom({
    title: 'Confirm Submission',
    content: 'This form cannot be edited after submission.',
});

const TAGLINE_TITLE_PATTERN = /tagline|short description/i;
const LOCATION_TITLE_PATTERN = /participating from|where is your team/i;
const TRACK_TITLE_PATTERN = /project track|which project track/i;

function getTextValue(
    q: QuestionTextLineInput | QuestionTitleLineInput | undefined
): string {
    return typeof q?.value === 'string' ? q.value.trim() || 'N/A' : 'N/A';
}

function getLinkUrl(q: QuestionTextLinkInput | undefined): string {
    if (!q) return '';
    return typeof q.value === 'string' ? q.value.trim() : '';
}

function getChoiceLabel(q: QuestionMultipleChoice | undefined): string {
    if (!q?.value) return '';
    const selected = q.choices?.find((choice) => choice.data === q.value);
    return selected?.name?.trim() || String(q.value).trim();
}

function resolveUploadedImageSrc(candidate: unknown): string | null {
    if (typeof candidate !== 'string') return null;
    const trimmed = candidate.trim();
    if (!trimmed) return null;
    if (
        trimmed.startsWith('/') ||
        trimmed.startsWith('blob:') ||
        trimmed.startsWith('data:')
    ) {
        return trimmed;
    }
    return trimmed;
}

function getImageSrcs(q: QuestionFileUploads | undefined): string[] {
    if (!q?.fileList?.length) return [];
    return q.fileList
        .map((file) => {
            if (file instanceof File) {
                try {
                    return URL.createObjectURL(file);
                } catch {
                    return null;
                }
            }
            const candidate =
                (file as { url?: string; preview?: string }).url ??
                (file as { url?: string; preview?: string }).preview;
            return resolveUploadedImageSrc(candidate);
        })
        .filter((src): src is string => src !== null);
}

function ImageCarousel({
    images,
    index,
    onIndexChange,
}: {
    images: string[];
    index: number;
    onIndexChange: (i: number) => void;
}) {
    const prev = () =>
        onIndexChange((index - 1 + images.length) % images.length);
    const next = () => onIndexChange((index + 1) % images.length);
    const hasMultiple = images.length > 1;

    return (
        <>
            <CardHeader className={styles.cardHeader}>
                <div className={styles.imageWrapper}>
                    <img
                        src={images[index]}
                        alt={`Project image ${index + 1} of ${images.length}`}
                        className={styles.image}
                    />
                </div>

                {hasMultiple && (
                    <>
                        <SkewmorphicButton
                            icon
                            className={styles.arrowLeft}
                            onClick={prev}
                        >
                            <ArrowLeftIcon className={styles.arrowIcon} />
                        </SkewmorphicButton>
                        <SkewmorphicButton
                            icon
                            className={styles.arrowRight}
                            onClick={next}
                        >
                            <ArrowRightIcon className={styles.arrowIcon} />
                        </SkewmorphicButton>
                    </>
                )}
            </CardHeader>

            {hasMultiple && (
                <div className={cn(styles.dots, 'col-span-full')}>
                    {images.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onIndexChange(i)}
                            className={cn(
                                styles.dot,
                                i === index && styles.activeDot
                            )}
                        />
                    ))}
                </div>
            )}
        </>
    );
}

function TeamBadge() {
    const currentTeam = useAtomValue(currentTeamAtom);
    if (!currentTeam) return null;

    return (
        <div className="flex items-center gap-3">
            <img
                src={resolveTeamIconUrl(currentTeam.teamPictureUrl)}
                alt={currentTeam.name}
                className="h-14 w-14 shrink-0 rounded-xl border border-neutral-700/50 object-cover"
            />
            <div className="flex flex-col">
                <span className="text-sm text-white/50">Team</span>
                <span className="text-lg font-medium text-white">
                    {currentTeam.name}
                </span>
            </div>
        </div>
    );
}

function ProjectLinks({ links }: { links: { label: string; url: string }[] }) {
    const visible = links
        .map((link) => {
            const href = link.url.trim();
            return href ? { ...link, href } : null;
        })
        .filter(
            (link): link is { label: string; url: string; href: string } =>
                link !== null
        );

    if (visible.length === 0) return null;

    return (
        <ul
            className={cn(
                'list-none space-y-4 pl-0 text-white/50 underline',
                styles.linkList
            )}
        >
            {visible.map((link) => (
                <li key={link.label}>
                    <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {link.label}
                    </a>
                </li>
            ))}
        </ul>
    );
}

function TrackBadges({
    location,
    track,
}: {
    location?: string;
    track?: string;
}) {
    if (!location && !track) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {location && (
                <span className="bg-neutral-750/60 rounded-xl px-4 py-2 text-sm">
                    {location}
                </span>
            )}
            {track && (
                <span className="bg-neutral-750/60 rounded-xl px-4 py-2 text-sm">
                    {track}
                </span>
            )}
        </div>
    );
}

function DescriptionPreview({ question }: { question: QuestionMarkdownInput }) {
    const content = question.value?.trim() ?? '';
    if (!content) {
        return <p className="text-white/50">N/A</p>;
    }
    return <MarkdownDisplay content={content} />;
}

export function ReviewProject({
    submit,
    response,
    mobileMode = false,
    disableSubmitBtn = false,
}: ReviewProjectProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);

    const previewQuestions = getSubmissionPreviewQuestions(response);

    const titleQuestion = previewQuestions.find((q) => q.type === 'title-line');
    const taglineQuestion = previewQuestions.find(
        (q) =>
            q.type === 'text-line' && TAGLINE_TITLE_PATTERN.test(q.title ?? '')
    );
    const descriptionQuestion = previewQuestions.find(
        (q) => q.type === 'markdown'
    );
    const imageQuestion = previewQuestions.find(
        (q) => q.type === 'file-upload'
    );
    const locationQuestion = previewQuestions.find(
        (q) =>
            q.type === 'multiple-choice' &&
            LOCATION_TITLE_PATTERN.test(q.title ?? '')
    ) as QuestionMultipleChoice | undefined;
    const trackQuestion = previewQuestions.find(
        (q) =>
            q.type === 'multiple-choice' &&
            TRACK_TITLE_PATTERN.test(q.title ?? '')
    ) as QuestionMultipleChoice | undefined;

    const titleValue = getTextValue(
        titleQuestion as QuestionTitleLineInput | undefined
    );
    const taglineValue = getTextValue(
        taglineQuestion as QuestionTextLineInput | undefined
    );
    const imageSrcs = getImageSrcs(
        imageQuestion as QuestionFileUploads | undefined
    );
    const links = previewQuestions
        .filter((q): q is QuestionTextLinkInput => q.type === 'link')
        .map((q) => ({
            label: q.title?.trim() || 'Link',
            url: getLinkUrl(q),
        }));

    return (
        <div className="mb-28 flex flex-col gap-6 p-6 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-semibold">Preview Submission</h1>
                <p className="text-md font-sans text-white/60">
                    This preview reflects how your entry will appear to the
                    judging panel. Make sure you showcase your hard work at its
                    best.
                </p>
            </div>

            {previewQuestions.length === 0 ? (
                <div className="py-4 text-center">No questions to review</div>
            ) : (
                <Card>
                    {imageSrcs.length > 0 && (
                        <ImageCarousel
                            images={imageSrcs}
                            index={imageIndex}
                            onIndexChange={setImageIndex}
                        />
                    )}

                    <CardContent>
                        <div className="grid grid-cols-14 gap-8 px-6 py-6">
                            <div className="col-span-8 flex flex-col gap-8 px-6">
                                <div className="flex flex-col gap-2">
                                    <div className="text-3xl font-semibold">
                                        {titleValue}
                                    </div>
                                    <TrackBadges
                                        location={getChoiceLabel(
                                            locationQuestion
                                        )}
                                        track={getChoiceLabel(trackQuestion)}
                                    />
                                    {taglineQuestion && (
                                        <div className="text-sm text-white/60">
                                            {taglineValue}
                                        </div>
                                    )}
                                </div>
                                {descriptionQuestion && (
                                    <DescriptionPreview
                                        question={
                                            descriptionQuestion as QuestionMarkdownInput
                                        }
                                    />
                                )}
                            </div>

                            <div className="col-span-6 flex flex-col gap-8">
                                <TeamBadge />
                                <ProjectLinks links={links} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {mobileMode && !disableSubmitBtn && (
                <Button
                    variant="brand"
                    hierarchy="primary"
                    size="cozy"
                    onClick={() => setDialogOpen(true)}
                    disabled={isSubmitting}
                    className="w-full"
                >
                    Submit Application
                </Button>
            )}

            <ReviewApplicationDialog
                isOpen={dialogOpen}
                closeDialog={() => setDialogOpen(false)}
                onSubmit={async () => {
                    setIsSubmitting(true);
                    await submit();
                    setIsSubmitting(false);
                }}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
