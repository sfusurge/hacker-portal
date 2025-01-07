'use client';

import { atom, PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
    ApplicationData,
    ApplicationPage,
    ApplicationQuestion,
    QuestionTextLineInput,
} from './types';
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
export function ApplicationForm({
    appDataAtom,
}: {
    appDataAtom: PrimitiveAtom<ApplicationData>;
}) {
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

    const pagesAtomsAtom = splitAtom(_pagesAtom); // create an atom containing a list of atoms, from a single atom containing a list
    const [pagesAtoms] = useAtom(pagesAtomsAtom); // getting the list of atoms out of the previous ato

    const pageStatesAtom = useMemo(
        () =>
            atom(
                appData.pages.map(
                    (item) =>
                        ({
                            title: item.title!,
                            state: 'not started',
                            error: false,
                        }) as PageFormState
                )
            ),
        []
    );
    const pageStateAtomsAtom = splitAtom(pageStatesAtom);
    const [pageStateAtoms] = useAtom(pageStateAtomsAtom);

    return (
        <div className={style.appFormRoot}>
            <h1 className={style.mainTitle}>{appData.hackathonName}</h1>

            <div className={style.appFormContent}>
                <PageIndicator
                    pageStateAtoms={pageStatesAtom}
                    indexAtom={pageIndexAtom}
                ></PageIndicator>
                <div className={style.formContainer}>
                    {pagesAtoms.map((pageAtom, index) => (
                        <Page
                            key={index}
                            pageAtom={pageAtom}
                            pageStateAtom={pageStateAtoms[currentPageIndex]}
                            hidden={index !== currentPageIndex}
                        ></Page>
                    ))}
                    <PageButtons
                        indexAtom={pageIndexAtom}
                        pageCount={pagesAtoms.length}
                        review_submit={() => {
                            alert('review!');
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

/**
 * completed: every form field that is required is filled.
 * started: at least one of the field is filled.
 * error: the form the page has validation error. Error should only be displayed if the user tries to submit at least once.
 */
interface PageFormState {
    title: string;
    state: 'completed' | 'started' | 'not started';
    error: boolean;
}

function Page({
    pageAtom,
    hidden,
    pageStateAtom,
}: {
    pageAtom: PrimitiveAtom<ApplicationPage>;
    hidden: boolean;
    pageStateAtom: PrimitiveAtom<PageFormState>;
}) {
    const page = useAtomValue(pageAtom);
    const setPageState = useSetAtom(pageStateAtom);
    const formRef = useRef<HTMLFormElement>(null);
    useEffect(() => {
        if (formRef.current) {
            const valid = formRef.current.checkValidity();
            console.log(valid);

            // setPageState({
            //     title:page.title!,
            //     error:!valid,
            //     state:"completed"
            // });
        }
    }, [page]);

    const questionsAtom = useMemo(
        () =>
            atom(
                (get) => get(pageAtom).questions,
                (get, set, newQuestion: ApplicationQuestion[]) => {
                    set(pageAtom, (prev) => {
                        prev.questions = newQuestion;
                        return { ...prev };
                    });
                }
            ),
        []
    );
    const questionAtomsAtom = splitAtom(questionsAtom);
    const [questionAtoms] = useAtom(questionAtomsAtom);

    return (
        <form
            ref={formRef}
            className={style.page}
            style={hidden ? { display: 'none' } : {}}
            noValidate
        >
            {page.title && <h2 className={style.title}>{page.title}</h2>}
            {page.description && <p className={style.description}></p>}
            {questionAtoms.map((item, index) => (
                <Question questionAtom={item} key={index}></Question>
            ))}
        </form>
    );
}

/**
 * For showing which page the user is currently on.
 */
function PageIndicator({
    pageStateAtoms,
    indexAtom,
}: {
    pageStateAtoms: PrimitiveAtom<PageFormState[]>;
    indexAtom: PrimitiveAtom<number>;
}) {
    const pageStates = useAtomValue(pageStateAtoms);
    const setIndex = useSetAtom(indexAtom);

    function getPageStatus(pageState: PageFormState) {
        if (pageState.error) {
            return '❗';
        }

        switch (pageState.state) {
            case 'completed':
                return '✅';
            case 'not started':
                return '⭕';
            case 'started':
                return '❓';

            default:
                throw 'unexpected page status';
        }
    }

    return (
        <div className={style.pageStatusContainer}>
            {pageStates.map((item, index) => {
                return (
                    <button
                        key={item.title}
                        onClick={() => {
                            setIndex(index);
                        }}
                    >
                        {getPageStatus(item)} {item.title}
                    </button>
                );
            })}
        </div>
    );
}

function Question({
    questionAtom,
}: {
    questionAtom: PrimitiveAtom<ApplicationQuestion>;
}) {
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
                return (
                    <TextLineInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionTextLineInput>
                        }
                    />
                );

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
            {index === pageCount - 1 && (
                <Button onClick={review_submit}>Review & Submit</Button>
            )}
        </div>
    );
}
