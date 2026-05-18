'use client';

import type {
    InputFormQuestion,
    InputFormPageData,
    QuestionFileUploads,
    QuestionRichTextInput,
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

function findById(questions: InputFormQuestion[], id: number) {
    return questions.find((q) => q.questionId === id);
}

function getTextValue(
    q: QuestionTextLineInput | QuestionTitleLineInput | undefined
): string {
    return typeof q?.value === 'string' ? q.value.trim() || 'N/A' : 'N/A';
}

function getLinkUrl(q: QuestionTextLinkInput | undefined): string {
    if (!q) return '';
    return typeof q.value === 'string' ? q.value.trim() : '';
}

function deltaToText(delta?: Record<any, any>): string {
    return (
        delta?.ops
            ?.map((op: any) => op.insert ?? '')
            .join('')
            .trim() || 'N/A'
    );
}

function getImageSrcs(q: QuestionFileUploads | undefined): string[] {
    if (!q?.fileList?.length) return [];
    return q.fileList
        .map((file) => {
            if (file instanceof File) return URL.createObjectURL(file);
            return (file as any).url || (file as any).preview || null;
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
                src={currentTeam.teamPictureUrl || '/teams/default.webp'}
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
    const visible = links.filter((l) => l.url);
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
                        href={link.url}
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

export function ReviewProject({
    submit,
    response,
    mobileMode = false,
    disableSubmitBtn = false,
}: ReviewProjectProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);

    const allQuestions = response.flatMap((page) => page.questions ?? []);

    const titleValue = getTextValue(
        findById(allQuestions, 1) as QuestionTitleLineInput | undefined
    );
    const taglineValue = getTextValue(
        findById(allQuestions, 5) as QuestionTextLineInput | undefined
    );
    const description = findById(allQuestions, 6) as
        | QuestionRichTextInput
        | undefined;
    const imageSrcs = getImageSrcs(
        findById(allQuestions, 10) as QuestionFileUploads | undefined
    );
    const prototypeUrl = getLinkUrl(
        findById(allQuestions, 7) as QuestionTextLinkInput | undefined
    );
    const pitchDeckUrl = getLinkUrl(
        findById(allQuestions, 8) as QuestionTextLinkInput | undefined
    );
    const videoPitchUrl = getLinkUrl(
        findById(allQuestions, 9) as QuestionTextLinkInput | undefined
    );

    const links = [
        { label: 'Link to Presentation', url: pitchDeckUrl },
        { label: 'Link to Prototype', url: prototypeUrl },
        { label: 'Link to Video Pitch', url: videoPitchUrl },
    ];

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

            {allQuestions.length === 0 ? (
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
                            <div className="col-span-8 flex flex-col gap-10 px-6">
                                <div className="flex flex-col gap-2">
                                    <div className="text-3xl font-semibold">
                                        {titleValue}
                                    </div>
                                    <div className="text-sm text-white/60">
                                        {taglineValue}
                                    </div>
                                </div>
                                <div>{deltaToText(description?.value)}</div>
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
