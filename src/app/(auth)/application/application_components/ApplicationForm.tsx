'use client';

import {
    atom,
    type PrimitiveAtom,
    useAtom,
    useAtomValue,
    useSetAtom,
} from 'jotai';
import type {
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
    type ComponentProps,
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
    type PageFormState,
    DesktopPageIndicator,
    MobilePageIndicator,
} from './PageStatus/ApplicationPageIndicator';

import { ArrowLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SkewmorphicButton } from '@/components/ui/SkewmorphicButton/SkewmorphicButton';
import { cn } from '@/lib/utils';
import { useHackathon } from '@/hooks/use-hackathon';

function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);

        // Initial check
        setMatches(media.matches);

        // Update matches when the media query changes
        const listener = (e: MediaQueryListEvent) => {
            setMatches(e.matches);
        };

        // Add listener
        media.addEventListener('change', listener);

        // Clean up
        return () => {
            media.removeEventListener('change', listener);
        };
    }, [query]);

    return matches;
}

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
    submitApplication: (response: ApplicationQuestion[]) => void;
}

const RESPONSE_KEY = 'response_key';
const HACKATHON_VERSION_KEY = 'version_key';

const responseAtom = atomWithStorage<ApplicationPage[]>(RESPONSE_KEY, []);
const hackathonVersionAtom = atomWithStorage<number | undefined>(
    HACKATHON_VERSION_KEY,
    1
);

/**
 *
 * appData can be locally cached or a new empty one.
 */
export function ApplicationForm({ submitApplication }: ApplicationFormProps) {
    const { hackathon } = useHackathon();
    const [response, setResponse] = useAtom(responseAtom);
    const [pgs, setPgs] = useState<ApplicationPage[]>([]);
    const router = useRouter();

    const [hackathonVersion, setHackathonVersion] =
        useAtom(hackathonVersionAtom);

    // Initialize pages from hackathon data
    useEffect(() => {
        if (!hackathon) {
            return;
        }

        if (
            hackathon.pages &&
            (hackathon.version !== hackathonVersion || pgs.length === 0)
        ) {
            setPgs(hackathon.pages);
            setHackathonVersion(hackathon.version);

            // Initialize response with hackathon pages if empty
            if (response.length === 0) {
                setResponse(hackathon.pages);
            }
        }
    }, [
        hackathon,
        hackathonVersion,
        setHackathonVersion,
        setResponse,
        response.length,
        pgs.length,
    ]);

    // which page is currently displayed
    const currentPageIndex = useAtomValue(pageIndexAtom);

    // states of each page.
    // create an atom containing a list of atoms, from a single atom containing a list
    const pagesAtomsAtom = splitAtom(responseAtom);
    // getting the list of atoms out of the previous atom
    const pagesAtoms = useAtomValue(pagesAtomsAtom);

    // page validations
    const pageStatesAtom = useMemo(() => {
        return atom(
            (pgs || []).map(
                (item) =>
                    ({
                        title: item.title || '',
                        state: 'not started',
                        error: false,
                    }) as PageFormState
            )
        );
    }, [pgs]);

    const pageStateAtomsAtom = splitAtom(pageStatesAtom);
    const [pageStateAtoms] = useAtom(pageStateAtomsAtom);

    // mobile conditional render
    const isMobile = useMediaQuery('(max-width: 767.5px)');

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

    // Make sure we're passing the response atom data to ReviewPage, not just the original pages
    const responseData = useAtomValue(responseAtom);

    // Get the actual user responses from responseAtom instead of pgs
    const flattenResponse = useMemo(() => {
        // Get the actual user responses from responseAtom instead of pgs
        return response.flatMap(({ questions }) => questions || []);
    }, [response]);

    // Guard against empty pages
    if (!pgs || pgs.length === 0) {
        return (
            <div className="p-8 text-center">Loading application form...</div>
        );
    }

    return (
        <div className={style.appFormRoot}>
            {isMobile && (
                <button
                    className={cn(style.homeButton, 'md:hidden')}
                    onClick={() => {
                        router.push('/home');
                    }}
                >
                    <ArrowLeftIcon className="h-6 w-6" />
                    <span>Dashboard</span>
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
                                response={
                                    responseData.length > 0 ? responseData : pgs
                                }
                                submit={() => {
                                    submitApplication(flattenResponse);
                                }}
                                mobileMode={isMobile}
                            />
                        )}

                        {pagesAtoms.map((pageAtom, index) => (
                            <Page
                                key={index}
                                pageAtom={pageAtom}
                                pageStateAtom={pageStateAtoms[index]}
                                hidden={index !== currentPageIndex}
                            />
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
                // Check form validity
                let error = finalErrCheck
                    ? !formRef.current.reportValidity()
                    : !formRef.current.checkValidity();

                // Count required questions and filled required questions
                let requiredQuestions = 0;
                let filledRequiredQuestions = 0;
                let atLeastOneFilled = false;

                for (const question of page.questions || []) {
                    // Only consider required questions for completion status
                    if (question.required) {
                        requiredQuestions++;
                        const filled = isApplicationQuestionFilled(question);
                        if (filled) {
                            filledRequiredQuestions++;
                        }
                    }

                    // Track if any question (required or not) is filled
                    if (isApplicationQuestionFilled(question)) {
                        atLeastOneFilled = true;
                    }
                }

                // Determine page state based on filled questions
                let state: PageFormState['state'] = 'not started';

                // Only mark as completed if ALL required questions are filled
                if (
                    requiredQuestions > 0 &&
                    filledRequiredQuestions === requiredQuestions
                ) {
                    state = 'completed';
                } else if (atLeastOneFilled) {
                    state = 'started';
                }

                // Extra validation check
                if (error && extraCheck && state === 'completed') {
                    error = !formRef.current.reportValidity();
                }

                // Update page state
                setPageState({
                    title: page.title || '',
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
                (get) => get(pageAtom).questions || [],
                (get, set, newQuestion: ApplicationQuestion[]) => {
                    set(pageAtom, (prev) => {
                        return { ...prev, questions: newQuestion };
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
                <Question questionAtom={item} key={index} />
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
                    />
                );
            case 'multiple-checkbox':
                return (
                    <CheckBoxGroupInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionMultipleCheckBox>
                        }
                    />
                );

            case 'text-area':
                return (
                    <TextAreaInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionTextAreaInput>
                        }
                    />
                );
            default:
                return <div>Unsupported input type: {type}</div>;
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

    const [validationPerformed, setValidationPerformed] = useState(false);
    function tryReview() {
        setErrCheck(true);

        setTimeout(() => {
            setValidationPerformed(true);
        }, 0);
    }

    useEffect(() => {
        if (validationPerformed) {
            let valid = true;
            let idx = 0;
            for (; idx < pageStates.length; idx++) {
                valid &&= !pageStates[idx].error;
                if (!valid) {
                    break;
                }
            }

            if (!valid) {
                alert('Not all pages are valid!');
                setIndex(idx);
            } else {
                setIndex(pageCount); // the lastpage + 1 is the review page.
            }
        }
    }, [validationPerformed]);

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
