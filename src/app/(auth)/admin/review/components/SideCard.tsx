import { sideCardAtomSJ } from '@/app/(auth)/admin/review/components/ReviewApplicationsTable';
import {
    atom,
    Atom,
    PrimitiveAtom,
    useAtom,
    useAtomValue,
    WritableAtom,
} from 'jotai';
import { focusAtom } from 'jotai-optics';
import style from './SideCard.module.css';
import { MouseEventHandler, useEffect, useMemo } from 'react';
import { useHackathon } from '@/hooks/use-hackathon';
import {
    ApplicationQuestion,
    ApplicationQuestionType,
    QuestionCheckBoxInput,
    QuestionMultipleCheckBox,
    QuestionNumberInput,
} from '@/app/(auth)/application/application_components/types';
import { CheckBoxInput } from '@/app/(auth)/application/application_components/application_question_fields/CheckboxInput';
import { NumberInput } from '@/app/(auth)/application/application_components/application_question_fields/NumberInput';
import { TextLineInput } from '@/app/(auth)/application/application_components/application_question_fields/TextLineInput';
import { TextAreaInput } from '@/app/(auth)/application/application_components/application_question_fields/TextAreaInput';
import { RadioInput } from '@/app/(auth)/application/application_components/application_question_fields/RadioInput';
import { CheckBoxGroupInput } from '@/app/(auth)/application/application_components/application_question_fields/CheckboxGroupInput';
import { Label } from '@/components/ui/label/label';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { ApplicationWithTeamInfo } from '@/server/routers/applicationsRouter';

export interface SideCardProps {
    visible: boolean;
    onclose: MouseEventHandler<HTMLDivElement | HTMLButtonElement>;
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

export default function SideCard({ visible = false, onclose }: SideCardProps) {
    const responseData = useAtomValue(responseAtom);
    const [status, setStatus] = useAtom(statusAtom);

    const { hackathon } = useHackathon();
    const ready = useMemo(
        () => visible && hackathon !== undefined,
        [visible, hackathon]
    );

    const questionTypeMap = useMemo(() => {
        // converts question id to Application question type
        const map = new Map<string, ApplicationQuestion>();

        if (!hackathon) {
            return map;
        }

        for (const page of hackathon.pages) {
            for (const question of page.questions) {
                map.set(`${question.questionId}`, question);
            }
        }

        return map;
    }, [hackathon]);

    function getGenericInputAtom<
        Q extends ApplicationQuestion & { value: unknown },
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

            case 'text-line':
                const textLineAtom = getGenericInputAtom(question, dataAtom);
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
                        const choices = new Set<string>(get(dataAtom));
                        for (const c of question.choices) {
                            if (choices.has(c.name)) {
                                c.value = true;
                                choices.delete(c.name);
                            } else {
                                c.value = false;
                            }
                        }

                        if (choices.size > 0) {
                            // some value is not yet comsumed, there must be an 'other value available
                            question.otherValue = choices.values().next().value;
                        }
                        return question;
                    },
                    (get, set, val: QuestionMultipleCheckBox) => {
                        console.log('checkbox test', val);

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

            default:
                return <p>Unknown requestion type: {question.type}</p>;
        }
    }

    if (!responseData) {
        return <h1>Error, application data is not loaded</h1>;
    }

    return (
        <>
            {ready && <div className={style.background} onClick={onclose} />}
            {ready && (
                <div className={style.cardContainer}>
                    {/* title and close button */}
                    <div className={style.titleRow}>
                        <h1 style={{ fontSize: '24px' }}>
                            Review/Edit Application
                        </h1>
                        <button onClick={onclose}>
                            <XMarkIcon style={{ width: '2rem' }} />
                        </button>
                    </div>

                    {/* application data */}

                    {Object.entries(responseData).map(([id, val]) => {
                        const q = questionTypeMap.get(id);

                        if (!q) {
                            return <p key={id}>Unknown question id: {id}</p>;
                        }

                        return (
                            <div key={id}>
                                <Label style={{ paddingBottom: '0.5rem' }}>
                                    {q.title}
                                </Label>
                                {getFieldFromType(id)}
                            </div>
                        );
                    })}

                    {/* Status change */}
                </div>
            )}
        </>
    );
}
