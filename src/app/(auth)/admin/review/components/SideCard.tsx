import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { focusAtom } from 'jotai-optics';
import style from './SideCard.module.css';
import { useMemo, useState } from 'react';
import {
    InputFormPageData,
    InputFormQuestion,
    QuestionInline,
} from '@/components/application_components/types';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    XMarkIcon,
} from '@heroicons/react/20/solid';
import { ApplicationWithTeamInfo } from '@/server/routers/applicationsRouter';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { StatusEnum } from '@/db/schema/applications';
import { trpc } from '@/trpc/client';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { getAcceptPendingStatusForEventLocation } from '@/lib/applicationAcceptStatus';
import {
    getApplicationExportField,
    getApplicationResponseString,
} from '@/lib/applications/applicationReviewExport';
import { sideCardAtomSJ } from '@/app/(auth)/admin/review/components/ReviewApplicationsTable';

export interface SideCardProps {
    visible: boolean;
    onclose: () => void;
    onPrev: () => void;
    onNext: () => void;
    selected?: ApplicationWithTeamInfo | null;
    onRefresh?: () => void;
    applicantIndex?: number;
    applicantTotal?: number;
}

function stripHtml(html: string): string {
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function questionLabel(question: InputFormQuestion): string {
    if ('title' in question && question.title?.trim()) {
        return stripHtml(question.title);
    }
    if ('label' in question && typeof question.label === 'string') {
        return stripHtml(question.label);
    }
    return 'Question';
}

function formatDisplayValue(value: unknown): string {
    if (value == null || value === '') return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) {
        const parts = value
            .map((v) => (v == null ? '' : String(v)))
            .filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : '—';
    }
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch {
            return '—';
        }
    }
    return String(value);
}

const responseAtom = atom(
    (get) => {
        const val = get(sideCardAtomSJ);
        if (!val) {
            return {} as Record<string, any>;
        }
        return val.response;
    },
    (get, set, val: Record<string, any>) => {
        set(sideCardAtomSJ, (prev) => {
            if (prev) {
                return { ...prev, response: val };
            }
            return prev;
        });
    }
);
const statusAtom = focusAtom(sideCardAtomSJ, (op) =>
    op.valueOr({} as ApplicationWithTeamInfo).prop('pendingStatus')
);

export default function SideCard({
    visible = false,
    onclose: _onclose,
    onPrev,
    onNext,
    selected,
    onRefresh,
    applicantIndex,
    applicantTotal,
}: SideCardProps) {
    const utils = trpc.useUtils();

    const responseData = useAtomValue(responseAtom);
    const applicationData = useAtomValue(sideCardAtomSJ);
    const setSideCardInfo = useSetAtom(sideCardAtomSJ);
    const [status, _setStatus] = useAtom(statusAtom);
    const [statusDirty, setStatusDirty] = useState(false);
    const hackathon = useAtomValue(hackathonAtom);
    const updateApplication = trpc.applications.updateApplication.useMutation({
        onSuccess: async (updatedEntry) => {
            await utils.applications.getApplications.cancel();

            setSideCardInfo((prev) =>
                prev && prev.userId === updatedEntry.userId
                    ? {
                          ...prev,
                          currentStatus: updatedEntry.currentStatus,
                          pendingStatus: updatedEntry.pendingStatus,
                          flagged: updatedEntry.flagged,
                      }
                    : prev
            );

            utils.applications.getApplications.setInfiniteData(
                {
                    hackathonId: hackathon.id,
                },
                (old) => {
                    if (!old) {
                        return {
                            pageParams: [],
                            pages: [],
                        };
                    }

                    return {
                        ...old,
                        pages: old.pages.map((page) => {
                            return {
                                ...page,
                                applications: page.applications.map(
                                    (application) => {
                                        if (
                                            application.userId !==
                                            updatedEntry.userId
                                        ) {
                                            return application;
                                        }

                                        return {
                                            ...application,
                                            currentStatus:
                                                updatedEntry.currentStatus,
                                            pendingStatus:
                                                updatedEntry.pendingStatus,
                                            flagged: updatedEntry.flagged,
                                        };
                                    }
                                ),
                            };
                        }),
                    };
                }
            );
        },
    });
    const cardId = applicationData?.userId;

    const ready = useMemo(
        () => visible && hackathon !== undefined,
        [visible, hackathon]
    );

    const applicationQuestionPages = useMemo(
        () =>
            (hackathon?.applicationQuestionPages ?? []) as InputFormPageData[],
        [hackathon?.applicationQuestionPages]
    );

    const acceptPendingStatus = useMemo(() => {
        const eventLocationKey = getApplicationResponseString(
            responseData,
            applicationQuestionPages,
            'location'
        );
        return getAcceptPendingStatusForEventLocation(
            eventLocationKey || undefined
        );
    }, [responseData, applicationQuestionPages]);

    const reviewerSelectValue = useMemo((): StatusEnum | undefined => {
        const selectable = new Set<StatusEnum>([
            'N/A',
            'Awaiting Review',
            acceptPendingStatus,
            'Wait List',
            'Declined',
        ]);
        if (status && selectable.has(status)) {
            return status;
        }
        return undefined;
    }, [status, acceptPendingStatus]);

    const isPendingStatusReadOnly =
        applicationData?.currentStatus === 'Accepted';

    const applicantTitle = useMemo(() => {
        const first = getApplicationResponseString(
            responseData,
            applicationQuestionPages,
            'firstName'
        ).trim();
        const last = getApplicationResponseString(
            responseData,
            applicationQuestionPages,
            'lastName'
        ).trim();
        const name = [first, last].filter(Boolean).join(' ');
        return name ? `${name}'s Application` : 'Application';
    }, [responseData, applicationQuestionPages]);

    function setStatus(s: StatusEnum) {
        _setStatus(s);
        setStatusDirty(true);
    }

    function onclose() {
        if (statusDirty && hackathon?.id && applicationData?.userId) {
            updateApplication
                .mutateAsync({
                    hackathonId: hackathon.id,
                    userId: applicationData.userId,
                    pendingStatus: status,
                })
                .then(() => {
                    utils.applications.getApplications.invalidate();
                    if (typeof onRefresh === 'function') onRefresh();
                });
        }
        setStatusDirty(false);
        _onclose();
    }

    const questionSections = useMemo(() => {
        if (!hackathon) return [];

        return applicationQuestionPages
            .map((page, pageIndex) => {
                const questions = page.questions.flatMap((question) => {
                    if (question.type === 'inline') {
                        return (question as QuestionInline).content.filter(
                            (q) => q.questionId != null
                        );
                    }
                    if (question.questionId == null) return [];
                    return [question];
                });

                return {
                    key: `page-${pageIndex}`,
                    title: page.title?.trim() || `Section ${pageIndex + 1}`,
                    questions,
                };
            })
            .filter((section) => section.questions.length > 0);
    }, [hackathon, applicationQuestionPages]);

    if (!visible || !ready || !responseData) {
        return null;
    }

    const navLabel =
        applicantIndex != null && applicantTotal != null && applicantTotal > 0
            ? `Applicant ${applicantIndex + 1} of ${applicantTotal}`
            : 'Applicant';

    return (
        <div className={style.cardContainer} key={cardId}>
            <header className={style.header}>
                <div className={style.titleBlock}>
                    <h1 className={style.titleHeading}>{applicantTitle}</h1>
                    <p className={style.teamLine}>
                        {applicationData?.teamName?.trim()
                            ? `Team: ${applicationData.teamName.trim()}`
                            : 'No team'}
                    </p>
                </div>
                <button
                    type="button"
                    className={style.titleClose}
                    onClick={onclose}
                    aria-label="Close"
                >
                    <XMarkIcon className="size-6" />
                </button>
            </header>

            <div className={style.scroll}>
                {questionSections.map((section) => (
                    <section key={section.key} className={style.sectionCard}>
                        <h2 className={style.sectionTitle}>{section.title}</h2>
                        <div className={style.fieldGrid}>
                            {section.questions.map((question) => {
                                const id = String(question.questionId);
                                const label = questionLabel(question);
                                const raw = getApplicationExportField(
                                    responseData,
                                    id
                                );
                                const display = formatDisplayValue(raw);

                                return (
                                    <div
                                        key={`${cardId}:${id}`}
                                        className={style.field}
                                    >
                                        <p className={style.fieldLabel}>
                                            {label}
                                        </p>
                                        <p className={style.fieldValue}>
                                            {display}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>

            <footer className={style.footer}>
                <div className={style.footerActions}>
                    <div className={style.statusActions}>
                        <label
                            className={style.statusSelectLabel}
                            htmlFor="sidecard-review-status"
                        >
                            Select status
                        </label>
                        <Select
                            key={acceptPendingStatus}
                            value={reviewerSelectValue}
                            disabled={isPendingStatusReadOnly}
                            onValueChange={(v) => setStatus(v as StatusEnum)}
                        >
                            <SelectTrigger
                                id="sidecard-review-status"
                                className="h-11 w-full min-w-[10.5rem] rounded-xl border-neutral-600/60 bg-neutral-800/60"
                                aria-label="Select status"
                                aria-readonly={isPendingStatusReadOnly}
                            >
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="z-[21000] border-neutral-800 bg-neutral-900 text-white">
                                <SelectItem value="N/A">N/A</SelectItem>
                                <SelectItem value="Awaiting Review">
                                    Under review
                                </SelectItem>
                                <SelectItem value={acceptPendingStatus}>
                                    Accept
                                </SelectItem>
                                <SelectItem value="Wait List">
                                    Waitlist
                                </SelectItem>
                                <SelectItem value="Declined">
                                    Decline
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className={style.navRow}>
                    <button
                        type="button"
                        className={style.navButton}
                        onClick={onPrev}
                        aria-label="Previous application"
                        disabled={
                            applicantIndex != null ? applicantIndex <= 0 : false
                        }
                    >
                        <ArrowLeftIcon className="size-6" />
                    </button>
                    <p className={style.navLabel}>{navLabel}</p>
                    <button
                        type="button"
                        className={style.navButton}
                        onClick={onNext}
                        aria-label="Next application"
                        disabled={
                            applicantIndex != null && applicantTotal != null
                                ? applicantIndex >= applicantTotal - 1
                                : false
                        }
                    >
                        <ArrowRightIcon className="size-6" />
                    </button>
                </div>
            </footer>
        </div>
    );
}
