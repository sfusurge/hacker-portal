'use client';

import { atom, PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
    HackathonData,
    ApplicationPage,
    ApplicationQuestion,
    QuestionCheckBoxInput,
    QuestionMultipleCheckBox,
    QuestionMultipleChoice,
    QuestionNumberInput,
    QuestionTextAreaInput,
    QuestionTextLineInput,
} from './types';
import { atomWithStorage, splitAtom } from 'jotai/utils';
import style from './ApplicationForm.module.css';
import { TextLineInput } from './application_question_fields/TextLineInput';
import {
    ComponentProps,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Label } from '@/components/ui/label/label';
import { isApplicationQuestionFilled } from './application_question_fields/shared';
import { NumberInput } from './application_question_fields/NumberInput';
import { RadioInput } from './application_question_fields/RadioInput';
import { CheckBoxInput } from './application_question_fields/CheckboxInput';
import { CheckBoxGroupInput } from './application_question_fields/CheckboxGroupInput';
import { TextAreaInput } from './application_question_fields/TextAreaInput';
import { ReviewPage } from './ReviewPage';
import {
    PageFormState,
    DesktopPageIndicator,
    MobilePageIndicator,
} from './PageStatus/ApplicationPageIndicator';

import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { redirect } from 'next/navigation';
import { SkewmorphicButton } from '@/components/ui/SkewmorphicButton/SkewmorphicButton';
import useMediaQuery from 'beautiful-react-hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { useHackathon } from '@/hooks/use-hackathon';

/**
 * Only render the children when page is mounted, ie, clientside *only*.
 * This may come in handy when the state management goes outta hand later.
 */
function ClientOnly({ children, ...delegated }: ComponentProps<'div'>) {
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        setHasMounted(true);
    }, []);
    if (!hasMounted) {
        return null;
    }
    return <div {...delegated}>{children}</div>;
}

// Atoms
export const pageIndexAtom = atom(0); // defining the state
export const finalErrCheckAtom = atom(false); // when the user clicks the review & submit for the first time,

interface ApplicationFormProps {
    appDataAtom: PrimitiveAtom<HackathonData | undefined>;
    submitApplication: (reponse: ApplicationQuestion[]) => void;
}

const RESPONSE_KEY = 'response_key';
const HACKATHON_VERSION_KEY = 'version_key';

const responseAtom = atomWithStorage<ApplicationPage[]>(RESPONSE_KEY, []);
const hackathonVersionAtom = atomWithStorage<number | undefined>(
    HACKATHON_VERSION_KEY,
    undefined
);

/**
 *
 * appData can be locally cached or a new empty one.
 */
export function ApplicationForm({ submitApplication }: ApplicationFormProps) {
    'use client';
    const { hackathon } = useHackathon();

    const [response, setResponse] = useAtom(responseAtom);

    const [hackathonVersion, setHackathonVerison] =
        useAtom(hackathonVersionAtom);

    useEffect(() => {
        if (!hackathon) {
            return;
        }

        if (hackathon.version !== hackathonVersion) {
            setResponse(hackathon.pages);
            setHackathonVerison(hackathon.version);
        }
    }, [hackathon, hackathonVersion, setHackathonVerison, setResponse]);

    // which page is currently displayed
    const currentPageIndex = useAtomValue(pageIndexAtom); // using the state to get the for reals value

    // states of each page.
    // create an atom containing a list of atoms, from a single atom containing a list
    const pagesAtomsAtom = splitAtom(responseAtom);
    // getting the list of atoms out of the previous ato
    const pagesAtoms = useAtomValue(pagesAtomsAtom);

    // page validations
    const pageStatesAtom = useMemo(() => {
        return atom(
            response.map(
                (item) =>
                    ({
                        title: item.title!,
                        state: 'not started',
                        error: false,
                    }) as PageFormState
            )
        );
    }, [response]);
    const pageStateAtomsAtom = splitAtom(pageStatesAtom);
    const [pageStateAtoms] = useAtom(pageStateAtomsAtom);

    // mobile conditional render
    const isMobile = useMediaQuery('only screen and (max-width: 767.5px');

    const pageContainerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (pageContainerRef.current) {
            setTimeout(() => {
                if (isMobile) {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth',
                    });
                } else {
                    pageContainerRef.current?.scrollTo({
                        behavior: 'smooth',
                        top: 0,
                    });
                }
            }, 0);
        }
    }, [currentPageIndex, isMobile]);

    const flattenResponse = useMemo(() => {
        return response.flatMap(({ questions }) => questions);
    }, [response]);

    return (
        <div className={style.appFormRoot}>
            {isMobile && (
                <button
                    className={cn(style.homeButton, 'md:hidden')}
                    onClick={() => {
                        redirect('/home');
                    }}
                >
                    <ArrowLeftIcon style={{ width: '24px' }}></ArrowLeftIcon>
                    Dashboard
                </button>
            )}
            <div className={style.appFormWrapper}>
                <div className={style.appFormContent} ref={pageContainerRef}>
                    {isMobile ? (
                        <MobilePageIndicator
                            pageStateAtoms={pageStatesAtom}
                            indexAtom={pageIndexAtom}
                        />
                    ) : (
                        <DesktopPageIndicator
                            pageStateAtoms={pageStatesAtom}
                            indexAtom={pageIndexAtom}
                        />
                    )}

                    <div className={style.formContainer}>
                        {currentPageIndex === pagesAtoms.length && (
                            <ReviewPage
                                response={response}
                                submit={() => {
                                    submitApplication(flattenResponse);
                                }}
                                mobileMode={isMobile}
                            ></ReviewPage>
                        )}

                        {pagesAtoms.map((pageAtom, index) => (
                            <Page
                                key={index}
                                pageAtom={pageAtom}
                                pageStateAtom={pageStateAtoms[index]}
                                hidden={index !== currentPageIndex}
                            ></Page>
                        ))}
                    </div>
                </div>
            </div>

            {
                // mobile page status indicator also includes buttons.
                !isMobile && (
                    <PageButtons
                        indexAtom={pageIndexAtom}
                        pageCount={pagesAtoms.length}
                        pageStatesAtom={pageStatesAtom}
                        submit={() => {
                            submitApplication(flattenResponse);
                        }}
                    />
                )
            }
        </div>
    );
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

    const finalErrCheck = useAtomValue(finalErrCheckAtom);

    const updateFormStatus = useCallback(
        (extraCheck = false) => {
            if (formRef.current) {
                // check and report if user is trying to submit
                let error = finalErrCheck
                    ? !formRef.current.reportValidity()
                    : !formRef.current.checkValidity();

                // when page content changes, check if everything in the page is filled
                let atLeastOneFilled = false;
                let allFilled = true;

                for (const question of page.questions) {
                    const filled = isApplicationQuestionFilled(question);

                    atLeastOneFilled ||= filled;
                    allFilled &&= filled;

                    if (atLeastOneFilled && !allFilled) {
                        break;
                    }
                }

                let state: PageFormState['state'] = 'not started';
                if (allFilled) {
                    state = 'completed';
                } else if (atLeastOneFilled) {
                    state = 'started';
                }

                // extra check during initial load when the form is filled, to fix some strange bug.
                if (error && extraCheck && state === 'completed') {
                    error = formRef.current.reportValidity();
                }

                setPageState({
                    title: page.title!,
                    error,
                    state,
                });
            }
        },
        [finalErrCheck, page.questions, page.title, setPageState]
    );

    useEffect(() => {
        updateFormStatus();
    }, [page, updateFormStatus]);

    useEffect(() => {
        updateFormStatus(true);
    }, [updateFormStatus]);

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
        [pageAtom]
    );
    const questionAtomsAtom = splitAtom(questionsAtom);
    const [questionAtoms] = useAtom(questionAtomsAtom);

    return (
        <form
            ref={formRef}
            className={cn(style.page, 'md:pb-0')}
            style={hidden ? { display: 'none' } : {}}
            noValidate
        >
            {page.title && <h2 className={style.mainTitle}>{page.title}</h2>}
            {page.description && (
                <p className={style.description}>{page.description}</p>
            )}
            {questionAtoms.map((item, index) => (
                <Question questionAtom={item} key={index}></Question>
            ))}
        </form>
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

            case 'number':
                return (
                    <NumberInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionNumberInput>
                        }
                    />
                );

            case 'multiple-choice':
                return (
                    <RadioInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionMultipleChoice>
                        }
                    />
                );

            case 'checkbox':
                return (
                    <CheckBoxInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionCheckBoxInput>
                        }
                    ></CheckBoxInput>
                );
            case 'multiple-checkbox':
                return (
                    <CheckBoxGroupInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionMultipleCheckBox>
                        }
                    ></CheckBoxGroupInput>
                );

            case 'text-area':
                return (
                    <TextAreaInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionTextAreaInput>
                        }
                    ></TextAreaInput>
                );
            default:
                throw new Error(`unexpected input type: ${type}`);
        }
    }

    return (
        <div className={cn(style.ver)} style={{ width: '100%' }}>
            {question.title && (
                <Label required={question.required}>{question.title}</Label>
            )}
            {question.description && (
                <span className={cn(style.description, 'mb-1.5 max-w-96')}>
                    {question.description}
                </span>
            )}
            {getInnerInput(question.type, questionAtom, error)}
        </div>
    );
}

/**
 * Present Prev, Next page buttons.
 * Button to review application when on last page.
 * Button to submit when in the review page.
 */
function PageButtons({
    indexAtom,
    pageCount,
    pageStatesAtom,
    submit,
}: {
    indexAtom: PrimitiveAtom<number>;
    pageCount: number;
    pageStatesAtom: PrimitiveAtom<PageFormState[]>;
    submit?: () => void;
}) {
    const [index, setIndex] = useAtom(indexAtom);
    const pageStates = useAtomValue(pageStatesAtom);
    const setErrCheck = useSetAtom(finalErrCheckAtom);

    function tryReview() {
        let valid = true;

        for (const pageState of pageStates) {
            valid &&= !pageState.error;
        }

        if (!valid) {
            alert('Not all pages are valid!');
            setErrCheck(true);
        } else {
            setIndex(pageCount); // the lastpage + 1 is the review page.
        }
    }

    return (
        <div className={style.pageButtons}>
            <span
                style={{
                    color: 'var( --text-secondary)',
                    marginRight: 'auto',
                }}
                className="text-sm"
            >
                Progress saved locally.
            </span>
            {index > 0 && (
                <SkewmorphicButton
                    onClick={() => {
                        if (index > 0) {
                            setIndex(index - 1);
                        }
                    }}
                    className={style.prevButton}
                >
                    Previous
                </SkewmorphicButton>
            )}

            {index < pageCount - 1 && (
                <SkewmorphicButton
                    onClick={() => {
                        if (index < pageCount) {
                            setIndex(index + 1);
                        }
                    }}
                    className={style.nextButton}
                >
                    Next
                </SkewmorphicButton>
            )}
            {index === pageCount - 1 && (
                <SkewmorphicButton
                    onClick={tryReview}
                    className={style.nextButton}
                >
                    Review Application
                </SkewmorphicButton>
            )}
            {index === pageCount && (
                <SkewmorphicButton
                    className={cn(style.nextButton)}
                    onClick={() => {
                        submit && submit();
                    }}
                >
                    Submit!
                </SkewmorphicButton>
            )}
        </div>
    );
}
