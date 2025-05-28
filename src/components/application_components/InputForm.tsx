'use client';

import {
    Atom,
    atom,
    type PrimitiveAtom,
    SetStateAction,
    useAtom,
    useAtomValue,
    useSetAtom,
    WritableAtom,
} from 'jotai';
import type {
    HackathonData,
    InputFormPageData,
    InputFormQuestion,
    QuestionCheckBoxInput,
    QuestionMultipleCheckBox,
    QuestionMultipleChoice,
    QuestionNumberInput,
    QuestionTextAreaInput,
    QuestionTextLineInput,
    QuestionFileUploads,
    InputFormData,
    QuestionRichTextInput,
    QuestionTextLinkInput,
} from './types';
import { splitAtom } from 'jotai/utils';
import style from './InputForm.module.css';
import { TextLineInput } from './InputFormComponents/TextLineInput';
import {
    type ComponentProps,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Label } from '@/components/ui/label/label';
import {
    isApplicationQuestionFilled,
    submittedAtom,
} from './InputFormComponents/shared';
import { NumberInput } from './InputFormComponents/NumberInput';
import { RadioInput } from './InputFormComponents/RadioInput';
import { CheckBoxInput } from './InputFormComponents/CheckboxInput';
import { CheckBoxGroupInput } from './InputFormComponents/CheckboxGroupInput';
import { TextAreaInput } from './InputFormComponents/TextAreaInput';
import { TextLinkInput } from './InputFormComponents/TextLinkInput';
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
import useMediaQuery from 'beautiful-react-hooks/useMediaQuery';
import { FileUploadInput } from '@/components/application_components/InputFormComponents/FileUploadInput';
import { RichTextInput } from '@/components/application_components/InputFormComponents/RichTextInput';

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

interface InputFormProps {
    appDataAtom: WritableAtom<InputFormData, [val: InputFormData], void>;
    onSubmit: () => void;
    disablePageTab?: boolean;
}

/**
 *
 * appData can be locally cached or a new empty one.
 */
export function InputForm({
    appDataAtom,
    onSubmit,
    disablePageTab = false,
}: InputFormProps) {
    const [submitted, setSubmitted] = useAtom(submittedAtom);
    const router = useRouter();
    const pagesAtom = useMemo(
        () =>
            atom(
                (get) => {
                    return get(appDataAtom).pages;
                },
                (get, set, val: InputFormPageData[]) => {
                    set(appDataAtom, {
                        ...get(appDataAtom),
                        pages: val,
                    });
                }
            ),
        []
    );

    const pages = useAtomValue(pagesAtom);

    // which page is currently displayed
    const currentPageIndex = useAtomValue(pageIndexAtom);

    // states of each page.
    // create an atom containing a list of atoms, from a single atom containing a list
    const pagesAtomsAtom = splitAtom(pagesAtom);

    // getting the list of atoms out of the previous atom
    const [pagesAtoms] = useAtom(pagesAtomsAtom);

    const _pageStateAtom = useRef(atom<PageFormState[]>([]));

    // page validations
    const pageStatesAtom = useMemo(() => {
        return atom(
            (get) => {
                const cur = get(_pageStateAtom.current);
                const latest = get(appDataAtom).pages;

                if (cur.length === latest.length) {
                    return cur;
                }

                return latest.map((item) => {
                    return {
                        title: item.title || '',
                        state: 'not started',
                        error: false,
                    } as PageFormState;
                });
            },
            (get, set, val: PageFormState[]) => {
                set(_pageStateAtom.current, val);
            }
        );
    }, []);

    const pageStateAtomsAtom = splitAtom(pageStatesAtom);
    const [pageStateAtoms] = useAtom(pageStateAtomsAtom);
    // mobile conditional render
    const isMobile = useMediaQuery('(max-width: 767.5px)');

    const pageContainerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        // if (pageContainerRef.current) {
        //     setTimeout(() => {
        //         if (isMobile) {
        //             window.scrollTo({
        //                 top: 0,
        //                 behavior: 'smooth',
        //             });
        //         } else {
        //             pageContainerRef.current?.scrollTo({
        //                 behavior: 'smooth',
        //                 top: 0,
        //             });
        //         }
        //     }, 0);
        // }
    }, [currentPageIndex, isMobile]);

    // Guard against empty pages
    if (!pages || pages.length === 0) {
        return (
            <div className="p-8 text-center">Loading application form...</div>
        );
    }

    return (
        <div className={style.appFormRoot}>
            {isMobile && !disablePageTab && (
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
                    {!disablePageTab &&
                        (isMobile ? (
                            <MobilePageIndicator
                                pageStateAtoms={pageStatesAtom}
                                indexAtom={pageIndexAtom}
                            />
                        ) : (
                            <DesktopPageIndicator
                                pageStateAtoms={pageStatesAtom}
                                indexAtom={pageIndexAtom}
                            />
                        ))}

                    <div className={style.formContainer}>
                        {currentPageIndex === pagesAtoms.length && (
                            <ReviewPage
                                response={pages}
                                submit={() => {
                                    onSubmit();
                                }}
                                mobileMode={isMobile}
                                disableSubmitBtn={disablePageTab}
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
                (!isMobile || disablePageTab) && !submitted && (
                    <PageButtons
                        indexAtom={pageIndexAtom}
                        pageCount={pagesAtoms.length}
                        pageStatesAtom={pageStatesAtom}
                        submit={() => {
                            onSubmit();
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
    pageAtom: PrimitiveAtom<InputFormPageData>;
    hidden: boolean;
    pageStateAtom: PrimitiveAtom<PageFormState>;
}) {
    const [page, setPage] = useAtom(pageAtom);

    const setPageState = useSetAtom(pageStateAtom);
    const formRef = useRef<HTMLFormElement>(null);

    const questionsAtom = useMemo(
        () =>
            atom(
                (get) => get(pageAtom).questions,
                (get, set, newQuestion: InputFormQuestion[]) => {
                    set(pageAtom, { ...get(pageAtom), questions: newQuestion });
                }
            ),
        []
    );

    const finalErrCheck = useAtomValue(finalErrCheckAtom);

    function updateFormStatus(extraCheck = false) {
        if (formRef.current) {
            // Check form validity
            let error = finalErrCheck
                ? !formRef.current.checkValidity() // was report
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
    }
    useEffect(() => {
        updateFormStatus();
    }, [page, finalErrCheck]);

    useEffect(() => {
        updateFormStatus(true);
    }, []);

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
    questionAtom: PrimitiveAtom<InputFormQuestion>;
}) {
    const question = useAtomValue(questionAtom);
    const error = useMemo(() => atom<string | undefined>(undefined), []);

    function getInnerInput(
        type: InputFormQuestion['type'],
        _questionAtom: PrimitiveAtom<InputFormQuestion>,
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

            case 'link':
                return (
                    <TextLinkInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionTextLinkInput>
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

            case 'file-upload':
                return (
                    <FileUploadInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionFileUploads>
                        }
                    />
                );
            case 'rich-text':
                return (
                    <RichTextInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionRichTextInput>
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
                <span className={cn(style.description, 'max-w-96')}>
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
    pageStatesAtom: Atom<PageFormState[]>;
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
            setValidationPerformed(false);
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
                    Review
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
