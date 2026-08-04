'use client';

import {
    Atom,
    atom,
    type PrimitiveAtom,
    useAtom,
    useSetAtom,
    WritableAtom,
    useAtomValue,
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
    QuestionMarkdownInput,
    QuestionTextLinkInput,
    QuestionApiDropdown,
    QuestionDropdown,
    QuestionInline,
    QuestionDateYmd,
    QuestionMajorInput,
    QuestionTitleLineInput,
    QuestionPhoneInput,
} from './types';
import { splitAtom } from 'jotai/utils';
import style from './InputForm.module.css';
import { TextLineInput } from './InputFormComponents/TextLineInput';
import { TitleLineInput } from './InputFormComponents/TitleLineInput';
import { PhoneNumberInput } from './InputFormComponents/PhoneNumberInput';
import {
    type ComponentProps,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Label } from '@/components/ui/label/label';
import {
    computePageErrorState,
    submittedAtom,
} from './InputFormComponents/shared';
import { scrollToFirstInvalidInForm } from './formScroll';
import { useFormPageNavigation } from './hooks/useFormPageNavigation';
import { usePageScrollOnChange } from './hooks/usePageScrollOnChange';
import { NumberInput } from './InputFormComponents/NumberInput';
import { RadioInput } from './InputFormComponents/RadioInput';
import { CheckBoxInput } from './InputFormComponents/CheckboxInput';
import { CheckBoxGroupInput } from './InputFormComponents/CheckboxGroupInput';
import { TextAreaInput } from './InputFormComponents/TextAreaInput';
import { TextLinkInput } from './InputFormComponents/TextLinkInput';
import { ApiDropdownInput } from './InputFormComponents/ApiDropdownInput';
import { MajorInput } from './InputFormComponents/MajorInput';
import { ReviewPage } from './ReviewPage';
import { ReviewProject } from './ReviewProject';
import {
    type PageFormState,
    DesktopPageIndicator,
    MobilePageIndicator,
} from './PageStatus/ApplicationPageIndicator';

import { ArrowLeftIcon } from 'lucide-react';
import { HomeIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { SkewmorphicButton } from '@/components/ui/SkewmorphicButton/SkewmorphicButton';
import { cn } from '@/lib/utils';
import useMediaQuery from 'beautiful-react-hooks/useMediaQuery';
import { FileUploadInput } from '@/components/application_components/InputFormComponents/FileUploadInput';
import { RichTextInput } from '@/components/application_components/InputFormComponents/RichTextInput';
import { MarkdownInput } from '@/components/application_components/InputFormComponents/MarkdownInput';
import { DropdownInput } from '@/components/application_components/InputFormComponents/DropdownInput';
import { ChoiceConditionalAlert } from '@/components/application_components/InputFormComponents/ChoiceConditionalAlert';
import { InlineInput } from '@/components/application_components/InputFormComponents/InlineInput';
import { DateInput } from '@/components/application_components/InputFormComponents/DateInput';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import ReviewApplicationDialog from './ReviewApplicationDialog';
import { isSubmissionQuestionDisabled } from '@/lib/projects/submissionFormQuestions';
import { questionValueMatches } from '@/lib/applications/questionValueMatches';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { MobileTopNav } from './MobileTopHeader';

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
export const pageIndexAtom = atom(0);
export const finalErrCheckAtom = atom(false);
export const validatedPagesAtom = atom<number[]>([]);
export const focusInvalidOnPageAtom = atom<number | null>(null);
export const isReviewPageAtom = atom(false);

interface InputFormProps {
    appDataAtom: WritableAtom<InputFormData, [val: InputFormData], void>;
    onSubmit: () => Promise<void>;
    disablePageTab?: boolean;
    applicationType?: 'application' | 'submission';
}

/**
 *
 * appData can be locally cached or a new empty one.
 */
export function InputForm({
    appDataAtom,
    onSubmit,
    disablePageTab = false,
    applicationType = 'application',
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

    const appData = useAtomValue(appDataAtom);
    const pages = appData.pages;
    const hackathon = useAtomValue(hackathonAtom);

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

    const setIsReviewPage = useSetAtom(isReviewPageAtom);
    useEffect(() => {
        setIsReviewPage(currentPageIndex === pagesAtoms.length);
    }, [currentPageIndex, pagesAtoms.length, setIsReviewPage]);

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
    usePageScrollOnChange(currentPageIndex, pageContainerRef, isMobile);

    // Guard against empty pages
    if (!pages || pages.length === 0) {
        return (
            <div className="p-8 text-center">Loading application form...</div>
        );
    }

    return (
        <div
            className={cn(
                style.appFormRoot,
                applicationType === 'application' && 'max-md:-mt-20',
                applicationType === 'submission' && style.submissionForm
            )}
        >
            {applicationType === 'application' && isMobile && (
                <MobileTopNav
                    hackathonName={hackathon?.hackathonName}
                    savedAt={appData.savedAt}
                />
            )}
            {applicationType === 'application' && isMobile && (
                <div className={style.mobileFormNav}>
                    <button
                        type="button"
                        className={style.mobileHomeButton}
                        onClick={() => {
                            router.push('/home');
                        }}
                        aria-label="Go to dashboard"
                    >
                        <HomeIcon className="h-6 w-6" />
                    </button>
                </div>
            )}
            {applicationType === 'application' && (
                <div className="hidden flex-col gap-1 md:flex">
                    <button
                        className={cn(style.homeButton)}
                        onClick={() => {
                            router.push('/home');
                        }}
                    >
                        <ArrowLeftIcon className="h-6 w-6" />
                        <span>Dashboard</span>
                    </button>
                    <h1 className="text-xl font-semibold">
                        {hackathon?.hackathonName
                            ? `${hackathon.hackathonName} Application`
                            : 'Application'}
                    </h1>
                </div>
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
                        {applicationType === 'application' && isMobile && (
                            <p className={style.mobileStepLabel}>
                                Step {currentPageIndex + 1} of{' '}
                                {pagesAtoms.length + 1}
                            </p>
                        )}
                        {currentPageIndex === pagesAtoms.length && (
                            <>
                                {applicationType === 'application' ? (
                                    <ReviewPage
                                        response={pages}
                                        submit={async () => {
                                            await onSubmit();
                                        }}
                                        mobileMode={isMobile}
                                        disableSubmitBtn={disablePageTab}
                                    />
                                ) : (
                                    <ReviewProject
                                        response={pages}
                                        submit={async () => {
                                            await onSubmit();
                                        }}
                                        mobileMode={isMobile}
                                        disableSubmitBtn={disablePageTab}
                                    />
                                )}
                            </>
                        )}

                        {pagesAtoms.map((pageAtom, index) => (
                            <Page
                                key={index}
                                pageIndex={index}
                                pageAtom={pageAtom}
                                pageStateAtom={pageStateAtoms[index]}
                                hidden={index !== currentPageIndex}
                                hideAlert={
                                    applicationType === 'application' &&
                                    isMobile
                                }
                            />
                        ))}
                    </div>
                </div>
            </div>

            {
                // mobile page status indicator also includes buttons.
                (!isMobile || disablePageTab) && (
                    <PageButtons
                        indexAtom={pageIndexAtom}
                        pageCount={pagesAtoms.length}
                        pageStatesAtom={pageStatesAtom}
                        applicationType={applicationType}
                        submit={async () => {
                            setSubmitted(true);
                            await onSubmit();
                            setSubmitted(false);
                        }}
                        submitted={submitted}
                        setSubmitted={setSubmitted}
                    />
                )
            }
        </div>
    );
}

function Page({
    pageIndex,
    pageAtom,
    hidden,
    pageStateAtom,
    hideAlert,
}: {
    pageIndex: number;
    pageAtom: PrimitiveAtom<InputFormPageData>;
    hidden: boolean;
    pageStateAtom: PrimitiveAtom<PageFormState>;
    hideAlert?: boolean;
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
    const validatedPages = useAtomValue(validatedPagesAtom);
    const focusInvalidOnPage = useAtomValue(focusInvalidOnPageAtom);
    const setFocusInvalidOnPage = useSetAtom(focusInvalidOnPageAtom);
    const shouldShowErrors =
        finalErrCheck || validatedPages.includes(pageIndex);

    function updateFormStatus(extraCheck = false) {
        if (!formRef.current) return;
        const { state, error } = computePageErrorState(
            formRef.current,
            page.questions || [],
            shouldShowErrors,
            extraCheck
        );
        setPageState({
            title: page.title || '',
            error,
            state,
        });
    }
    useEffect(() => {
        updateFormStatus();
    }, [page, shouldShowErrors]);

    useEffect(() => {
        updateFormStatus(true);
    }, []);

    useEffect(() => {
        if (focusInvalidOnPage !== pageIndex) return;
        const timer = setTimeout(() => {
            scrollToFirstInvalidInForm(
                formRef.current,
                page.questions ?? [],
                formRef.current?.closest(
                    `.${style.appFormContent}`
                ) as HTMLElement | null
            );
            setFocusInvalidOnPage(null);
        }, 50);
        return () => clearTimeout(timer);
    }, [focusInvalidOnPage, pageIndex, page.questions, setFocusInvalidOnPage]);

    const questionAtomsAtom = splitAtom(questionsAtom);
    const [questionAtoms] = useAtom(questionAtomsAtom);

    return (
        <form
            ref={formRef}
            className={cn(style.page, 'md:pb-0')}
            style={hidden ? { display: 'none' } : {}}
            noValidate
            data-validated={shouldShowErrors || undefined}
        >
            <div className="flex flex-col gap-4">
                {page.title && (
                    <h2 className={style.mainTitle}>{page.title}</h2>
                )}
                {page.description && (
                    <p
                        className={`${style.mainDescription} ${style.description}`}
                    >
                        {page.description}
                    </p>
                )}
            </div>
            {page.alert && !hideAlert && (
                <Alert variant={'info'} className="-mt-4 max-w-[480px]">
                    <AlertTitle>{page.alert.title}</AlertTitle>
                    <AlertDescription>
                        {page.alert.description}
                    </AlertDescription>
                </Alert>
            )}
            {questionAtoms.map((item, index) => (
                <Question
                    questionAtom={item}
                    key={index}
                    {...(page.questions.some(
                        (q) => q.visibleWhen || q.disabledWhen
                    )
                        ? { siblings: page.questions }
                        : {})}
                />
            ))}
        </form>
    );
}

function Question({
    questionAtom,
    siblings = [],
}: {
    questionAtom: PrimitiveAtom<InputFormQuestion>;
    siblings?: InputFormQuestion[];
}) {
    const question = useAtomValue(questionAtom);
    const error = useMemo(() => atom<string | undefined>(undefined), []);
    const hackathon = useAtomValue(hackathonAtom);

    // hide question unless a sibling has the expected value.
    // when the question is hidden, clear its value so the the answers are not submitted.
    const setQuestion = useSetAtom(questionAtom);
    const { visibleWhen } = question;

    const isVisible = visibleWhen
        ? questionValueMatches(
              (
                  siblings.find(
                      (q) => q.questionId === visibleWhen.questionId
                  ) as { value?: unknown } | undefined
              )?.value,
              visibleWhen.value
          )
        : true;

    const isDisabled = isSubmissionQuestionDisabled(question, siblings);
    const isRequired = (question.required ?? false) && !isDisabled;

    useEffect(() => {
        if (!isVisible && 'value' in question && question.value != null) {
            setQuestion({ ...question, value: undefined } as any);
        }
    }, [isVisible]);

    useEffect(() => {
        if (!isDisabled) return;

        if (question.type === 'file-upload') {
            const fileQuestion = question as QuestionFileUploads;
            if (
                (fileQuestion.fileList?.length ?? 0) > 0 ||
                (fileQuestion.fileLinks?.length ?? 0) > 0
            ) {
                setQuestion({
                    ...fileQuestion,
                    fileList: [],
                    fileLinks: [],
                } as any);
            }
            return;
        }

        if ('value' in question && question.value != null) {
            setQuestion({ ...question, value: undefined } as any);
        }
    }, [isDisabled]);

    function getInnerInput(
        type: InputFormQuestion['type'],
        _questionAtom: PrimitiveAtom<InputFormQuestion>,
        _errorAtom: PrimitiveAtom<string | undefined>,
        inputDisabled: boolean
    ) {
        switch (type) {
            case 'text-line':
                return (
                    <TextLineInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionTextLineInput>
                        }
                        disabled={inputDisabled}
                    />
                );
            case 'phone':
                return (
                    <PhoneNumberInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionPhoneInput>
                        }
                        disabled={inputDisabled}
                    />
                );
            case 'title-line':
                return (
                    <TitleLineInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionTitleLineInput>
                        }
                        disabled={inputDisabled}
                    />
                );

            case 'link':
                return (
                    <TextLinkInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionTextLinkInput>
                        }
                        disabled={inputDisabled}
                    />
                );

            case 'number':
                return (
                    <NumberInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionNumberInput>
                        }
                        disabled={inputDisabled}
                    />
                );

            case 'multiple-choice':
                return (
                    <RadioInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionMultipleChoice>
                        }
                        disabled={inputDisabled}
                    />
                );

            case 'checkbox':
                return (
                    <CheckBoxInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionCheckBoxInput>
                        }
                        disabled={inputDisabled}
                    />
                );
            case 'multiple-checkbox':
                return (
                    <CheckBoxGroupInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionMultipleCheckBox>
                        }
                        disabled={inputDisabled}
                    />
                );

            case 'text-area':
                return (
                    <TextAreaInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionTextAreaInput>
                        }
                        disabled={inputDisabled}
                    />
                );

            case 'file-upload':
                return (
                    <FileUploadInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionFileUploads>
                        }
                        disabled={inputDisabled}
                    />
                );
            case 'rich-text':
                return (
                    <RichTextInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionRichTextInput>
                        }
                        disabled={inputDisabled}
                    />
                );
            case 'markdown':
                return (
                    <MarkdownInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionMarkdownInput>
                        }
                        disabled={inputDisabled}
                    />
                );
            case 'api-dropdown':
                return (
                    <ApiDropdownInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionApiDropdown>
                        }
                        disabled={inputDisabled}
                    />
                );
            case 'dropdown':
                return (
                    <DropdownInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionDropdown>
                        }
                        disabled={inputDisabled}
                    />
                );
            case 'inline':
                return (
                    <InlineInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionInline>
                        }
                        disabled={inputDisabled}
                    />
                );
            case 'date-ymd':
                return (
                    <DateInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionDateYmd>
                        }
                        disabled={inputDisabled}
                    />
                );

            case 'major':
                return (
                    <MajorInput
                        dataAtom={
                            _questionAtom as PrimitiveAtom<QuestionMajorInput>
                        }
                        disabled={inputDisabled}
                    />
                );
            default:
                return <div>Unsupported input type: {type}</div>;
        }
    }

    const showNonCanadaWarning = useMemo(() => {
        if (question.type !== 'api-dropdown') return false;
        const apiDropdownQuestion = question as QuestionApiDropdown;
        const isCountryQuestion =
            apiDropdownQuestion.apiUrl.includes('country') ||
            apiDropdownQuestion.title.toLowerCase().includes('country');
        const selection =
            typeof apiDropdownQuestion.selection === 'string'
                ? apiDropdownQuestion.selection
                : '';
        if (!isCountryQuestion || !selection) return false;
        return selection.trim().toLowerCase() !== 'canada';
    }, [question]);

    if (!isVisible) return null;

    return (
        <div
            className={cn(style.ver, isDisabled && 'opacity-50')}
            style={{ width: '100%' }}
            {...(question.questionId != null
                ? { 'data-question-id': question.questionId }
                : {})}
        >
            {showNonCanadaWarning && (
                <Alert variant="warning" className="mb-4 max-w-[480px]">
                    <AlertTitle>
                        This event requires in-person attendance
                    </AlertTitle>
                    <AlertDescription>
                        {hackathon?.hackathonName} is an in-person event and
                        requires attendance at SFU Burnaby. For questions about
                        travel reimbursements, please{' '}
                        <a
                            className="underline"
                            href={`${hackathon?.eventPagePayload?.websiteHref}#faq`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Read our FAQ
                        </a>
                        .
                    </AlertDescription>
                </Alert>
            )}
            {question.type === 'multiple-choice' && (
                <ChoiceConditionalAlert
                    questionAtom={questionAtom}
                    placement="above-title"
                />
            )}
            {question.title &&
                !question.hideTitle &&
                question.type !== 'title-line' && (
                    <Label required={isRequired}>
                        <div
                            className={style.htmlHolder}
                            dangerouslySetInnerHTML={{ __html: question.title }}
                        ></div>
                    </Label>
                )}
            {question.description && (
                <span className={cn(style.description, 'max-w-96')}>
                    <div
                        className={style.htmlHolder}
                        dangerouslySetInnerHTML={{
                            __html: question.description,
                        }}
                    ></div>
                </span>
            )}
            {getInnerInput(question.type, questionAtom, error, isDisabled)}
            {question.type === 'multiple-choice' && (
                <ChoiceConditionalAlert
                    questionAtom={questionAtom}
                    placement="below-fieldset"
                />
            )}
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
    submitted,
    setSubmitted,
    applicationType,
}: {
    indexAtom: PrimitiveAtom<number>;
    pageCount: number;
    pageStatesAtom: Atom<PageFormState[]>;
    submit?: () => void | Promise<void>;
    submitted: boolean;
    setSubmitted: (val: boolean) => void;
    applicationType: 'application' | 'submission';
}) {
    const { index, setIndex, tryNext, tryReview } = useFormPageNavigation({
        indexAtom,
        pageStatesAtom,
        pageCount,
    });
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <>
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
                        onClick={tryNext}
                        className={style.nextButton}
                    >
                        Next Section
                    </SkewmorphicButton>
                )}
                {index === pageCount - 1 && (
                    <SkewmorphicButton
                        onClick={tryReview}
                        className={style.nextButton}
                    >
                        Preview Submission
                    </SkewmorphicButton>
                )}
                {index === pageCount && (
                    <SkewmorphicButton
                        className={cn(style.nextButton)}
                        onClick={() => {
                            if (submitted) return;
                            setDialogOpen(true);
                        }}
                    >
                        Submit
                    </SkewmorphicButton>
                )}
            </div>

            <ReviewApplicationDialog
                isOpen={dialogOpen}
                closeDialog={() => setDialogOpen(false)}
                onSubmit={async () => {
                    if (submit) {
                        setSubmitted(true);
                        try {
                            await submit();
                        } finally {
                            setSubmitted(false);
                        }
                    }
                }}
                isSubmitting={submitted}
                applicationType={applicationType}
            />
        </>
    );
}
