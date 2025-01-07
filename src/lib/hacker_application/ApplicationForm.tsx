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
import { useMemo } from 'react';
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

    const _pagesAtom = atom(
        (get) => {
            //getter
            return get(appDataAtom).pages;
        },
        (get, set, val: ApplicationPage[]) => {
            set(appDataAtom, (prev) => {
                prev.pages = val;
                return { ...prev };
            });
        }
    );

    const pageIndexAtom = atom(0); // defining the state
    const currentPageIndex = useAtomValue(pageIndexAtom); // using the state to get the for reals value

    const pagesAtomsAtom = splitAtom(_pagesAtom); // create an atom containing a list of atoms
    const [pagesAtoms] = useAtom(pagesAtomsAtom); // getting the list of atoms out of the previous ato

    const pageStatesAtom = atom(
        appData.pages.map(
            (item) =>
                ({
                    title: item.title!,
                    state: 'not started',
                    error: false,
                }) as PageFormState
        )
    );
    const pageStateAtomsAtom = splitAtom(pageStatesAtom);
    const [pageStateAtoms] = useAtom(pageStateAtomsAtom);

    return (
        <div className={style.appFormRoot}>
            <h1 className={style.mainTitle}>{appData.hackathonName}</h1>

            <PageIndicator
                pageStateAtoms={pageStatesAtom}
                indexAtom={pageIndexAtom}
            ></PageIndicator>
            {pagesAtoms.map((pageAtom, index) => (
                <Page
                    pageAtom={pageAtom}
                    pageStateAtom={pageStateAtoms[currentPageIndex]}
                    hidden={index === currentPageIndex}
                ></Page>
            ))}
            <PageButtons indexAtom={pageIndexAtom} />
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

    const questionsAtom = atom(
        (get) => get(pageAtom).questions,
        (get, set, newQuestion: ApplicationQuestion[]) => {
            set(pageAtom, (prev) => {
                prev.questions = newQuestion;
                return { ...prev };
            });
        }
    );
    const questionAtomsAtom = splitAtom(questionsAtom);
    const [questionAtoms] = useAtom(questionAtomsAtom);

    return (
        <form
            className={style.page}
            style={hidden ? { display: 'hidden' } : {}}
        >
            {page.title && <h2 className={style.title}>{page.title}</h2>}
            {page.description && <p className={style.description}></p>}
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

/**
 * Present Prev, Next page buttons. And also
 *
 */
function PageButtons({ indexAtom }: { indexAtom: PrimitiveAtom<number> }) {
    return <></>;
}

function Question({
    questionAtom,
}: {
    questionAtom: PrimitiveAtom<ApplicationQuestion>;
}) {
    const question = useAtomValue(questionAtom);

    switch (question.type) {
        case 'text-line':
            // save to cast since "type" is checked.
            // no strict checking is needed. If submitted data is badly formatted/illegal, it's the server's responsibility to reject it.
            return (
                <TextLineInput
                    dataAtom={
                        questionAtom as PrimitiveAtom<QuestionTextLineInput>
                    }
                />
            );

        default:
            throw new Error(`unexpected input type: ${question.type}`);
    }
}
