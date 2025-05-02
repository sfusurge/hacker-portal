import { sideCardAtomSJ } from '@/app/(auth)/admin/reviewsparkjam/components/ReviewApplicationsTable';
import { atom, Atom, useAtomValue } from 'jotai';
import { focusAtom } from 'jotai-optics';
import style from './SideCard.module.css';
import { MouseEventHandler, useMemo } from 'react';
import { useHackathon } from '@/hooks/use-hackathon';
import {
    ApplicationQuestion,
    ApplicationQuestionType,
    QuestionCheckBoxInput,
} from '@/app/(auth)/application/application_components/types';

export interface SideCardProps {
    visible: boolean;
    onclose: MouseEventHandler<HTMLDivElement | HTMLButtonElement>;
}

const responseAtom = atom(
    (get) => {
        const val = get(sideCardAtomSJ);
        if (!val) {
            return {} as Record<number, any>;
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
export default function ImprovedSideCard({
    visible = false,
    onclose,
}: SideCardProps) {
    const applicationData = useAtomValue(responseAtom);
    const { hackathon } = useHackathon();
    const ready = useMemo(
        () => visible && hackathon !== undefined,
        [visible, hackathon]
    );

    const questionTypeMap = useMemo(() => {
        // converts question id to Application question type
        const map = new Map<number, ApplicationQuestion>();

        if (!hackathon) {
            return map;
        }

        for (const page of hackathon.pages) {
            for (const question of page.questions) {
                map.set(question.questionId, question);
            }
        }

        return map;
    }, [hackathon]);

    function getFieldFromType(questionId: number) {
        const question = questionTypeMap.get(questionId);
        const dataAtom = focusAtom(responseAtom, (optics) =>
            optics.prop(questionId)
        );

        if (!question) {
            return '';
        }

        switch (question.type) {
            case 'checkbox':
                return (
                    <CheckBoxField
                        question={question}
                        data={dataAtom as Atom<boolean>}
                    />
                );

            default:
                break;
        }
    }

    if (!applicationData) {
        return <h1>Error, application data is not loaded</h1>;
    }

    return (
        <>
            {ready && (
                <div className={style.background} onClick={onclose}></div>
            )}
            {ready && (
                <div className={style.cardContainer}>
                    {/* title and close button */}
                    <div className={style.titleRow}>
                        <h1>Review/Edit Application</h1>
                        <button onClick={onclose}>Close</button>
                    </div>

                    {/* application button */}

                    {/* Status change */}
                </div>
            )}
        </>
    );
}

function CheckBoxField({
    question,
    data,
}: {
    question: QuestionCheckBoxInput;
    data: Atom<boolean>;
}) {
    return <></>;
}
