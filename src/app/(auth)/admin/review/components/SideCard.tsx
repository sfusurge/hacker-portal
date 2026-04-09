import { sideCardAtomSJ } from '@/app/(auth)/admin/review/components/ReviewApplicationsTable';
import { atom, useAtom, useAtomValue, WritableAtom } from 'jotai';
import { focusAtom } from 'jotai-optics';
import style from './SideCard.module.css';
import { useMemo, useState } from 'react';
import {
    InputFormQuestion,
    QuestionMultipleCheckBox,
    QuestionApiDropdown,
    QuestionInline,
    QuestionDropdown,
    QuestionMajorInput,
    QuestionFileUploads,
} from '@/components/application_components/types';
import { CheckBoxInput } from '@/components/application_components/InputFormComponents/CheckboxInput';
import { NumberInput } from '@/components/application_components/InputFormComponents/NumberInput';
import { TextLineInput } from '@/components/application_components/InputFormComponents/TextLineInput';
import { TextAreaInput } from '@/components/application_components/InputFormComponents/TextAreaInput';
import { RadioInput } from '@/components/application_components/InputFormComponents/RadioInput';
import { CheckBoxGroupInput } from '@/components/application_components/InputFormComponents/CheckboxGroupInput';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    XMarkIcon,
} from '@heroicons/react/20/solid';
import { ApplicationWithTeamInfo } from '@/server/routers/applicationsRouter';
import { Button } from '@/components/ui/button';
import { CheckBoxWithLabel } from '@/components/ui/checkbox/checkboxWithLabel';
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
import { TextLinkInput } from '@/components/application_components/InputFormComponents/TextLinkInput';
import { ApiDropdownInput } from '@/components/application_components/InputFormComponents/ApiDropdownInput';
import { InlineInput } from '@/components/application_components/InputFormComponents/InlineInput';
import { DateInput } from '@/components/application_components/InputFormComponents/DateInput';
import { DropdownInput } from '@/components/application_components/InputFormComponents/DropdownInput';
import { MajorInput } from '@/components/application_components/InputFormComponents/MajorInput';
import { FileUploadInput } from '@/components/application_components/InputFormComponents/FileUploadInput';
import { questionIdsInOrderFromPages } from '@/app/(auth)/admin/review/applicationQuestionOrder';
import { getAcceptPendingStatusForEventLocation } from '@/lib/applicationAcceptStatus';

export interface SideCardProps {
    visible: boolean;
    onclose: () => void;
    onPrev: () => void;
    onNext: () => void;
    selected?: ApplicationWithTeamInfo | null;
    onRefresh?: () => void;
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
}: SideCardProps) {
    const utils = trpc.useUtils();

    const responseData = useAtomValue(responseAtom);
    const applicationData = useAtomValue(sideCardAtomSJ);
    const [status, _setStatus] = useAtom(statusAtom);
    const [editing, setEditing] = useState(false);
    const [updateCurrentStatus, setUpdateCurrentStatus] = useState(false);
    const hackathon = useAtomValue(hackathonAtom);
    const updateApplication = trpc.applications.updateApplication.useMutation({
        onSuccess: async (updatedEntry) => {
            await utils.applications.getApplications.cancel();

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
    /*
    useEffect(() => {
        if (selected) {
            setSideCardAtom(selected as unknown as ApplicationWithTeamInfo);
        }
    }, [selected, setSideCardAtom]);
*/

    const ready = useMemo(
        () => visible && hackathon !== undefined,
        [visible, hackathon]
    );

    const acceptPendingStatus = useMemo(
        () =>
            getAcceptPendingStatusForEventLocation(
                typeof responseData?.['2'] === 'string'
                    ? responseData['2']
                    : responseData?.['2'] != null
                      ? String(responseData['2'])
                      : undefined,
                hackathon?.isPaid ?? false
            ),
        [responseData, hackathon?.isPaid]
    );

    /** pending status for dropdown. `N/A` is shown as "Awaiting review" (same option). */
    const reviewerSelectValue = useMemo((): StatusEnum | undefined => {
        if (status === 'N/A') {
            return 'Awaiting Review';
        }
        const selectable = new Set<StatusEnum>([
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

    /** name from application response (question ids 5 & 6) */
    const applicantTitle = useMemo(() => {
        const first =
            typeof responseData?.['5'] === 'string'
                ? responseData['5'].trim()
                : '';
        const last =
            typeof responseData?.['6'] === 'string'
                ? responseData['6'].trim()
                : '';
        const name = [first, last].filter(Boolean).join(' ');
        return name ? `${name}'s Application` : 'Application';
    }, [responseData]);

    function setStatus(s: StatusEnum) {
        _setStatus(s);
        setEditing(true);
    }

    function onclose() {
        if (editing) {
            updateApplication
                .mutateAsync({
                    hackathonId: hackathon?.id!,
                    userId: applicationData?.userId!,
                    pendingStatus: updateCurrentStatus ? status : status,
                    status: updateCurrentStatus ? status : undefined,
                    response: responseData,
                })
                .then(() => {
                    utils.applications.getApplications.invalidate();
                    if (typeof onRefresh === 'function') onRefresh();
                });
        }
        _onclose();
    }

    const orderedQuestionIds = useMemo(
        () => questionIdsInOrderFromPages(hackathon?.applicationQuestionPages),
        [hackathon?.applicationQuestionPages]
    );

    const sortedResponseKeys = useMemo(() => {
        const keys = Object.keys(responseData);
        return [...keys].sort((a, b) => {
            const ia = orderedQuestionIds.indexOf(a);
            const ib = orderedQuestionIds.indexOf(b);
            if (ia === -1 && ib === -1) return a.localeCompare(b);
            if (ia === -1) return 1;
            if (ib === -1) return -1;
            return ia - ib;
        });
    }, [responseData, orderedQuestionIds]);

    const questionTypeMap = useMemo(() => {
        const map = new Map<string, InputFormQuestion>();

        if (!hackathon) {
            return map;
        }

        for (const page of hackathon.applicationQuestionPages) {
            for (const question of page.questions) {
                if (question.questionId) {
                    map.set(`${question.questionId}`, question);
                }

                if (question.type === 'inline') {
                    const inlineQuestion = question as QuestionInline;
                    for (const contentQuestion of inlineQuestion.content) {
                        if (contentQuestion.questionId) {
                            map.set(
                                `${contentQuestion.questionId}`,
                                contentQuestion
                            );
                        }
                    }
                }
            }
        }

        return map;
    }, [hackathon]);

    function getGenericInputAtom<
        Q extends InputFormQuestion & { value: unknown },
    >(question: Q, dataAtom: WritableAtom<any, [any], void>) {
        return atom(
            (get) => {
                return { ...question, value: get(dataAtom) };
            },
            (get, set, val: Q) => {
                set(dataAtom, val.value);
            }
        );
    }

    function getFieldFromType(questionId: string) {
        const question = questionTypeMap.get(questionId);

        const dataAtom = focusAtom(responseAtom, (optics) =>
            optics.prop(questionId)
        );

        if (!question) {
            return '';
        }

        switch (question.type) {
            case 'checkbox':
                const checkBoxAtom = getGenericInputAtom(question, dataAtom);
                return <CheckBoxInput dataAtom={checkBoxAtom} />;

            case 'number':
                const numberAtom = getGenericInputAtom(question, dataAtom);
                return <NumberInput dataAtom={numberAtom} />;

            case 'link':
                const linkAtom = getGenericInputAtom(question, dataAtom);

                return <TextLinkInput dataAtom={linkAtom} />;

            case 'api-dropdown':
                const apiDropdownAtom = atom(
                    (get) => {
                        return { ...question, selection: get(dataAtom) };
                    },
                    (get, set, val: QuestionApiDropdown) => {
                        set(dataAtom, val.selection);
                    }
                );

                return <ApiDropdownInput dataAtom={apiDropdownAtom} />;

            case 'text-line':
                const textLineAtom = getGenericInputAtom(question, dataAtom);
                // @ts-ignore
                return <TextLineInput dataAtom={textLineAtom} />;

            case 'text-area':
                const textAreaAtom = getGenericInputAtom(question, dataAtom);
                return <TextAreaInput dataAtom={textAreaAtom} />;
            case 'multiple-choice':
                const choiceAtom = getGenericInputAtom(question, dataAtom);
                return <RadioInput dataAtom={choiceAtom} />;
            case 'multiple-checkbox':
                const multiCheckboxAtom = atom(
                    (get) => {
                        const value = get(dataAtom) as unknown;
                        const arr: unknown[] = Array.isArray(value)
                            ? value
                            : [];
                        const choices = new Set<string>(
                            arr.map((v) => String(v).toLowerCase())
                        );
                        for (const c of question.choices) {
                            if (choices.has(c.data.toLowerCase())) {
                                c.value = true;
                                choices.delete(c.data);
                            } else {
                                c.value = false;
                            }
                        }

                        if (choices.size > 0) {
                            // some value is not yet comsumed, there must be an 'other value available
                            return {
                                ...question,
                                otherValue: choices.values().next().value,
                            };
                        }

                        return question;
                    },
                    (get, set, val: QuestionMultipleCheckBox) => {
                        const res: string[] = [];
                        for (const c of val.choices) {
                            if (c.value) {
                                res.push(c.data);
                            }
                        }
                        if (val.allowOther && val.otherValue) {
                            res.push(val.otherValue);
                        }
                        set(dataAtom, res);
                    }
                );
                // @ts-ignore
                return <CheckBoxGroupInput dataAtom={multiCheckboxAtom} />;

            case 'inline':
                const inlineQuestion = question as QuestionInline;
                const inlineAtom = atom(
                    (get) => {
                        const contentWithData = inlineQuestion.content.map(
                            (contentQ) => {
                                if (!contentQ.questionId) return contentQ;
                                const contentDataAtom = focusAtom(
                                    responseAtom,
                                    (optics) =>
                                        optics.prop(String(contentQ.questionId))
                                );
                                const contentValue = get(contentDataAtom);

                                return {
                                    ...contentQ,
                                    value: contentValue,
                                    selection: contentValue,
                                };
                            }
                        );
                        return { ...question, content: contentWithData };
                    },
                    (get, set, val: QuestionInline) => {
                        for (const contentQ of val.content) {
                            if (contentQ.questionId) {
                                const contentDataAtom = focusAtom(
                                    responseAtom,
                                    (optics) =>
                                        optics.prop(String(contentQ.questionId))
                                );
                                if ('value' in contentQ) {
                                    set(contentDataAtom, contentQ.value);
                                } else if ('selection' in contentQ) {
                                    set(contentDataAtom, contentQ.selection);
                                }
                            }
                        }
                    }
                );
                return <InlineInput dataAtom={inlineAtom} />;

            case 'date-ymd':
                const dateAtom = getGenericInputAtom(question, dataAtom);
                return <DateInput dataAtom={dateAtom} />;

            case 'dropdown':
                const dropdownAtom = atom(
                    (get) => {
                        return { ...question, value: get(dataAtom) };
                    },
                    (get, set, val: QuestionDropdown) => {
                        set(dataAtom, val.value);
                    }
                );
                return <DropdownInput dataAtom={dropdownAtom} />;

            case 'major':
                const majorAtom = atom(
                    (get) => {
                        return { ...question, selection: get(dataAtom) };
                    },
                    (get, set, val: QuestionMajorInput) => {
                        set(dataAtom, val.selection);
                    }
                );
                return <MajorInput dataAtom={majorAtom} />;

            case 'file-upload':
                const fileUploadAtom = atom(
                    (get) => {
                        return { ...question, fileLinks: get(dataAtom) };
                    },
                    (get, set, val: QuestionFileUploads) => {
                        set(dataAtom, val.fileLinks);
                    }
                );
                return <FileUploadInput dataAtom={fileUploadAtom} />;

            default:
                return <p>Unknown question type: {question.type}</p>;
        }
    }

    if (!responseData) {
        return <h1>Error, application data is not loaded</h1>;
    }

    return (
        <>
            {ready && <div className={style.background} onClick={onclose} />}
            {ready && (
                <div className={style.cardContainer} key={cardId}>
                    <div className={style.headerBlock}>
                        <div className={style.titleRow}>
                            <h1 className={style.titleHeading}>
                                {applicantTitle}
                            </h1>
                            <div className={`${style.titleRowNav} h-full`}>
                                <Button
                                    onClick={onPrev}
                                    aria-label="Previous application"
                                    type="button"
                                >
                                    <ArrowLeftIcon className="h-5 w-5" />
                                </Button>
                                <Button
                                    onClick={onNext}
                                    aria-label="Next application"
                                    type="button"
                                >
                                    <ArrowRightIcon className="h-5 w-5" />
                                </Button>
                            </div>
                            <button
                                type="button"
                                className={style.titleClose}
                                onClick={onclose}
                                aria-label="Close"
                            >
                                <XMarkIcon style={{ width: '2rem' }} />
                            </button>
                        </div>

                        <div className={style.headerToolbar}>
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
                                    onValueChange={(v) =>
                                        setStatus(v as StatusEnum)
                                    }
                                >
                                    <SelectTrigger
                                        id="sidecard-review-status"
                                        className="h-11 w-full min-w-[12rem] border-neutral-700 bg-neutral-800"
                                        aria-label="Select status"
                                    >
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[21000] border-neutral-800 bg-neutral-900 text-white">
                                        <SelectItem value="Awaiting Review">
                                            Awaiting review
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
                                <div className={style.headerCheckboxes}>
                                    <CheckBoxWithLabel
                                        name="Editing"
                                        checked={editing}
                                        onChange={(e) => {
                                            setEditing(e.target.checked);
                                        }}
                                    />
                                    <CheckBoxWithLabel
                                        name="Override Current Status"
                                        checked={updateCurrentStatus}
                                        onChange={(e) => {
                                            setUpdateCurrentStatus(
                                                e.target.checked
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* application data */}

                    {sortedResponseKeys.map((id) => {
                        const q = questionTypeMap.get(id);

                        if (!q) {
                            return (
                                <p key={`${cardId}:${id}`}>
                                    Unknown question id: {id}
                                </p>
                            );
                        }

                        return (
                            <div key={`${cardId}:${id}`}>
                                <div
                                    className={style.htmlHolder}
                                    dangerouslySetInnerHTML={{
                                        __html: q.title ?? '',
                                    }}
                                ></div>
                                {getFieldFromType(id)}
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
