'use client';

import { atom, PrimitiveAtom, useAtom, useAtomValue } from 'jotai';
import {
    ApplicationData,
    ApplicationPage,
    ApplicationQuestion,
    QuestionTextLineInput,
} from './types';
import { splitAtom } from 'jotai/utils';
import style from './ApplicationForm.module.css';
import { TextLineInput } from './application_question_fields/TextLineInput';
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

    const _pagesAtom = atom<ApplicationPage[], ApplicationPage[][], void>(
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

    const pageIndexAtom = atom(0); // defining the state
    const currentPageIndex = useAtomValue(pageIndexAtom); // using the state to get the for reals value

    const pagesAtomsAtom = splitAtom(_pagesAtom);
    const [pagesAtoms] = useAtom(pagesAtomsAtom);

    return (
        <div className={style.appFormRoot}>
            <h1 className={style.mainTitle}>{appData.hackathonName}</h1>
            <p className={style.description}>{appData.description}</p>

            <PageIndicator></PageIndicator>
            <Page pageAtom={pagesAtoms[currentPageIndex]}></Page>
            <PageButtons indexAtom={pageIndexAtom} />
        </div>
    );
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

function Page({ pageAtom }: { pageAtom: PrimitiveAtom<ApplicationPage> }) {
    const page = useAtomValue(pageAtom);

    const questionsAtom = atom((get) => get(pageAtom).questions);
    const questionAtomsAtom = splitAtom(questionsAtom);
    const [questionAtoms] = useAtom(questionAtomsAtom);

    return (
        <div className={style.page}>
            {page.title && <h2 className={style.title}>{page.title}</h2>}
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
function PageButtons({ indexAtom }: { indexAtom: PrimitiveAtom<number> }) {
    return <></>;
}
