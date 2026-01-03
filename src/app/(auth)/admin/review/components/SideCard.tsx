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
import { XMarkIcon } from '@heroicons/react/20/solid';
import { ApplicationWithTeamInfo } from '@/server/routers/applicationsRouter';
import { Button } from '@/components/ui/button';
import { CheckBoxWithLabel } from '@/components/ui/checkbox/checkboxWithLabel';
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
                        const choices = new Set<string>(
                            get(dataAtom).map((v: string) => v.toLowerCase())
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
                                res.push(c.name);
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
                    {/* title and close button */}
                    <div className={style.titleRow}>
                        <h1 style={{ fontSize: '24px' }}>
                            Review/Edit Application
                        </h1>
                        <button onClick={onclose}>
                            <XMarkIcon style={{ width: '2rem' }} />
                        </button>
                    </div>

                    <div className={style.hor}>
                        <Button onClick={onPrev}>Prev</Button>
                        <Button
                            className={
                                status === 'Accepted - RSVP to Confirm'
                                    ? style.selectedButton
                                    : ''
                            }
                            onClick={() => {
                                // TODO This shouldn't be hard coded
                                // should which ever status in appropreiate for the hackathon. Sparkjam needs payment, but most others won't
                                setStatus('Accepted - RSVP to Confirm');
                            }}
                            variant={'brand'}
                            hierarchy={'primary'}
                        >
                            Accept
                        </Button>
                        <Button
                            className={
                                status === 'Wait List'
                                    ? style.selectedButton
                                    : ''
                            }
                            onClick={() => {
                                setStatus('Wait List');
                            }}
                            variant={'caution'}
                            hierarchy={'primary'}
                        >
                            Waitlist
                        </Button>
                        <Button
                            className={
                                status === 'Declined'
                                    ? style.selectedButton
                                    : ''
                            }
                            onClick={() => {
                                setStatus('Declined');
                            }}
                            variant={'danger'}
                            hierarchy={'primary'}
                        >
                            Decline
                        </Button>
                        <Button onClick={onNext}>Next</Button>
                        <div className="flex flex-col gap-2">
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
                                    setUpdateCurrentStatus(e.target.checked);
                                }}
                            />
                        </div>
                    </div>

                    {/* application data */}

                    {Object.entries(responseData).map(([id, val]) => {
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

                    {/* Status change (repeating at both top and bottom of page)*/}
                    <div className={style.hor}>
                        <Button onClick={onPrev}>Prev</Button>
                        <Button
                            className={
                                status === 'Accepted - Pending Payment'
                                    ? style.selectedButton
                                    : ''
                            }
                            onClick={() => {
                                // TODO This shouldn't be hard coded
                                // should which ever status in appropreiate for the hackathon. Sparkjam needs payment, but most others won't
                                setStatus('Accepted - RSVP to Confirm');
                            }}
                            variant={'brand'}
                            hierarchy={'primary'}
                        >
                            Accept
                        </Button>
                        <Button
                            className={
                                status === 'Wait List'
                                    ? style.selectedButton
                                    : ''
                            }
                            onClick={() => {
                                setStatus('Wait List');
                            }}
                            variant={'caution'}
                            hierarchy={'primary'}
                        >
                            Waitlist
                        </Button>
                        <Button
                            className={
                                status === 'Declined'
                                    ? style.selectedButton
                                    : ''
                            }
                            onClick={() => {
                                setStatus('Declined');
                            }}
                            variant={'danger'}
                            hierarchy={'primary'}
                        >
                            Decline
                        </Button>
                        <Button onClick={onNext}>Next</Button>
                    </div>
                </div>
            )}
        </>
    );
}
