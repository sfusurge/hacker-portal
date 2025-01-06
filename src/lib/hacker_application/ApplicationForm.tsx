'use client';

import { atom, PrimitiveAtom, useAtom, useAtomValue } from 'jotai';
import { ApplicationData, ApplicationPage, ApplicationQuestion, QuestionTextLineInput } from './types';
import { splitAtom } from 'jotai/utils';
import style from './ApplicationForm.module.css';
import { TextLineInput } from './application_question_fields/TextLineInput';
import { useEffect, useMemo, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

// Atoms
const pageIndexAtom = atom(0); // defining the state

/**
 *
 * appData can be locally cached or a new empty one.
 */
export function ApplicationForm({ appDataAtom }: { appDataAtom: PrimitiveAtom<ApplicationData> }) {
    const appData = useAtomValue(appDataAtom);

    // useMemo to not recreate the atom each time.
    const _pagesAtom = useMemo(() => {
        return atom<ApplicationPage[], ApplicationPage[][], void>(
            (get) => {
                //getter
                return get(appDataAtom).pages;
            },
            (get, set, val) => {
                set(appDataAtom, (prev) => {
                    prev.pages = val;
                    return { ...prev };
                });
            }
        );
    }, []);

    const currentPageIndex = useAtomValue(pageIndexAtom); // using the state to get the for reals value

    const pagesAtomsAtom = splitAtom(_pagesAtom);

    const [pagesAtoms] = useAtom(pagesAtomsAtom);

    return (
        <div className={style.appFormRoot}>
            <h1 className={style.mainTitle}>{appData.hackathonName}</h1>
            <p className={style.description}>{appData.description}</p>

            <PageIndicator></PageIndicator>
            <div className={style.formContainer}>
                <Page pageAtom={pagesAtoms[currentPageIndex]}></Page>
                <PageButtons indexAtom={pageIndexAtom} pageCount={pagesAtoms.length} />
            </div>
        </div>
    );
}

function Question({ questionAtom }: { questionAtom: PrimitiveAtom<ApplicationQuestion> }) {
    const question = useAtomValue(questionAtom);
    const error = useMemo(() => atom<string | undefined>(undefined), []);

    function getInnerInput(
        type: ApplicationQuestion['type'],
        _questionAtom: PrimitiveAtom<ApplicationQuestion>,
        _errorAtom: PrimitiveAtom<string | undefined>
    ) {
        switch (type) {
            case 'text-line':
                // save to cast since "type" is checked.
                // no strict checking is needed. If submitted data is badly formatted/illegal, it's the server's responsibility to reject it.
                return <TextLineInput dataAtom={_questionAtom as PrimitiveAtom<QuestionTextLineInput>} />;

            default:
                throw new Error(`unexpected input type: ${type}`);
        }
    }

    return (
        <div className={style.ver} style={{ gap: '0.25rem' }}>
            {question.title && <Label>{question.title}</Label>}
            {question.description && <span>{question.description}</span>}
            {getInnerInput(question.type, questionAtom, error)}
        </div>
    );
}

function Page({ pageAtom }: { pageAtom: PrimitiveAtom<ApplicationPage> }) {
    const page = useAtomValue(pageAtom);

    const questionsAtom = useMemo(() => {
        return atom(
            (get) => get(pageAtom).questions,
            (get, set, val: ApplicationQuestion[]) => {
                set(pageAtom, (prev) => {
                    prev.questions = val;
                    return { ...prev };
                });
            }
        );
    }, []);
    const questionAtomsAtom = splitAtom(questionsAtom);
    const [questionAtoms] = useAtom(questionAtomsAtom);

    const formRef = useRef<HTMLFormElement>(null);

    return (
        <div className={style.page}>
            {page.title && <h2 className={style.title}>{page.title}</h2>}
            {page.description && <p className={style.description}>{page.description}</p>}

            <form ref={formRef} className={style.ver}>
                {questionAtoms.map((questionAtom, index) => (
                    <Question key={index} questionAtom={questionAtom} />
                ))}
            </form>
        </div>
    );
}

/**
 * For showing which page the user is currently on.
 */
function PageIndicator() {
    return <></>;
}

/**
 * Present Prev, Next page buttons. And also
 *
 */
function PageButtons({
    indexAtom,
    pageCount,
    review_submit,
}: {
    indexAtom: PrimitiveAtom<number>;
    pageCount: number;
    review_submit?: () => void;
}) {
    const [index, setIndex] = useAtom(indexAtom);

    return (
        <div className={style.pageButtons}>
            {index > 0 && (
                <Button
                    onClick={() => {
                        if (index > 0) {
                            setIndex(index - 1);
                        }
                    }}
                >
                    Previous
                </Button>
            )}

            {index < pageCount - 1 && (
                <Button
                    onClick={() => {
                        if (index < pageCount) {
                            setIndex(index + 1);
                        }
                    }}
                >
                    Next
                </Button>
            )}
            {index === pageCount - 1 && <Button onClick={review_submit}>Review & Submit</Button>}
        </div>
    );
}
