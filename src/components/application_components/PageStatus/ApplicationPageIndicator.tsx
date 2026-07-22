import { PrimitiveAtom, useAtomValue, Atom } from 'jotai';
import style from './ApplicationPageIndicator.module.css';
import { useFormPageNavigation } from '../hooks/useFormPageNavigation';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ChevronUpIcon,
    CheckIcon,
} from '@heroicons/react/24/solid';
import {
    EllipsisHorizontalCircleIcon,
    ArrowUpCircleIcon,
} from '@heroicons/react/24/outline';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { SkewmorphicButton } from '@/components/ui/SkewmorphicButton/SkewmorphicButton';
import { cn } from '@/lib/utils';

/**
 * completed: every form field that is required is filled.
 * started: at least one of the field is filled.
 * error: the form the page has validation error. Error should only be displayed if the user tries to submit at least once.
 */
export interface PageFormState {
    title: string;
    state: 'completed' | 'started' | 'not started';
    error: boolean;
}

function IconHolder({ children }: { children: ReactNode }) {
    return <div className={style.iconHolder}>{children}</div>;
}

function getPageStatus(pageState: PageFormState) {
    if (pageState.error) {
        return (
            <IconHolder>
                <ExclamationCircleIcon color="red" />
            </IconHolder>
        );
    }

    switch (pageState.state) {
        case 'completed':
            return (
                <IconHolder>
                    <CheckCircleIcon color="var(--brand-500)" />
                </IconHolder>
            );
        case 'not started':
            return <div className={style.circle}></div>;
        case 'started':
            return (
                <EllipsisHorizontalCircleIcon
                    color="white"
                    style={{ minWidth: '28px', width: '28px' }}
                />
            );

        default:
            throw 'unexpected page status';
    }
}

function getMobilePageStatus(pageState: PageFormState, isCurrent: boolean) {
    if (isCurrent) {
        return (
            <span
                className={cn(
                    style.mobileHorizontalCircle,
                    style.mobileHorizontalCircleCurrent
                )}
            >
                <span className={style.mobileHorizontalStartedDot} />
            </span>
        );
    }

    if (pageState.error) {
        return (
            <span
                className={cn(
                    style.mobileHorizontalCircle,
                    style.mobileHorizontalCircleError
                )}
            >
                <span className={style.mobileHorizontalErrorGlyph}>!</span>
            </span>
        );
    }

    if (pageState.state === 'completed') {
        return (
            <span
                className={cn(
                    style.mobileHorizontalCircle,
                    style.mobileHorizontalCircleDone
                )}
            >
                <CheckIcon />
            </span>
        );
    }

    return (
        <span
            className={cn(style.mobileHorizontalCircle, {
                [style.mobileHorizontalCircleStarted]:
                    pageState.state === 'started',
            })}
        >
            {pageState.state === 'started' && (
                <span className={style.mobileHorizontalStartedDot} />
            )}
        </span>
    );
}

/**
 * For showing which page the user is currently on.
 */
export function DesktopPageIndicator({
    pageStateAtoms,
    indexAtom,
}: {
    pageStateAtoms: Atom<PageFormState[]>;
    indexAtom: PrimitiveAtom<number>;
}) {
    const pageStates = useAtomValue(pageStateAtoms);
    const { setIndex, tryReview } = useFormPageNavigation({
        indexAtom,
        pageStatesAtom: pageStateAtoms,
        pageCount: pageStates.length,
    });

    return (
        <div className={style.pageStatusContainer}>
            {pageStates.map((item, stepIndex) => {
                return (
                    <div key={stepIndex}>
                        <button
                            key={stepIndex}
                            onClick={() => {
                                setIndex(stepIndex);
                            }}
                            className={cn(
                                style.pageStatusItem,
                                'flex items-start text-left'
                            )}
                        >
                            <span className="mr-2 flex-shrink-0">
                                {getPageStatus(item)}
                            </span>
                            <span className="flex-grow">{item.title}</span>
                        </button>

                        <div
                            className={`${style.ladderBar} ${item.state === 'completed' && !item.error ? style.done : ''}`}
                        />
                    </div>
                );
            })}
            <button
                onClick={tryReview}
                className={cn(style.pageStatusItem, 'flex items-start')}
            >
                <span className="mr-2 flex-shrink-0">
                    <ArrowUpCircleIcon
                        style={{
                            minWidth: '28px',
                            width: '28px',
                            height: '28px',
                        }}
                    />
                </span>
                <span className="flex-grow">Review</span>
            </button>
        </div>
    );
}

export function MobileHorizontalStepper({
    pageStateAtoms,
    indexAtom,
}: {
    pageStateAtoms: Atom<PageFormState[]>;
    indexAtom: PrimitiveAtom<number>;
}) {
    const pageStates = useAtomValue(pageStateAtoms);
    const { index, setIndex, tryReview } = useFormPageNavigation({
        indexAtom,
        pageStatesAtom: pageStateAtoms,
        pageCount: pageStates.length,
    });
    const currentStepRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        currentStepRef.current?.scrollIntoView({
            block: 'nearest',
            inline: 'center',
        });
    }, [index]);

    const steps: PageFormState[] = [
        ...pageStates,
        { title: 'Review', state: 'not started', error: false },
    ];

    function handleStepClick(stepIndex: number) {
        if (stepIndex === pageStates.length) {
            tryReview();
            return;
        }

        setIndex(stepIndex);
    }

    return (
        <nav className={style.mobileHorizontalStepper} aria-label="Pages">
            <div className={style.mobileHorizontalSteps}>
                {steps.map((item, stepIndex) => {
                    const isCurrent = stepIndex === index;
                    const isConnectorActive =
                        item.state === 'completed' && !item.error;
                    const title =
                        item.title ||
                        (stepIndex === pageStates.length
                            ? 'Review'
                            : `Step ${stepIndex + 1}`);

                    return (
                        <button
                            key={`${title}-${stepIndex}`}
                            ref={(node) => {
                                if (isCurrent) currentStepRef.current = node;
                            }}
                            type="button"
                            className={cn(style.mobileHorizontalStep, {
                                [style.mobileHorizontalStepCurrent]: isCurrent,
                            })}
                            aria-current={isCurrent ? 'step' : undefined}
                            aria-label={`Go to ${title}`}
                            onClick={() => handleStepClick(stepIndex)}
                        >
                            <span className={style.mobileHorizontalMarkerRow}>
                                {stepIndex < steps.length - 1 && (
                                    <span
                                        className={cn(
                                            style.mobileHorizontalConnector,
                                            {
                                                [style.mobileHorizontalConnectorActive]:
                                                    isConnectorActive,
                                            }
                                        )}
                                    />
                                )}
                                {getMobilePageStatus(item, isCurrent)}
                            </span>
                            <span className={style.mobileHorizontalLabel}>
                                {title}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}

export function MobilePageIndicator({
    pageStateAtoms,
    indexAtom,
}: {
    pageStateAtoms: Atom<PageFormState[]>;
    indexAtom: PrimitiveAtom<number>;
}) {
    const pageStates = useAtomValue(pageStateAtoms);
    const { index, setIndex, tryNext, tryReview } = useFormPageNavigation({
        indexAtom,
        pageStatesAtom: pageStateAtoms,
        pageCount: pageStates.length,
    });

    const [showPages, setShowPages] = useState(false);

    function getPageTitle(_index: number) {
        if (_index === pageStates.length) {
            return 'Review & Submit';
        }

        return (
            <span className="line-clamp-1 leading-none">
                {_index + 1}. {pageStates[_index].title}
            </span>
        );
    }

    function incrementIndex(incre: number) {
        if (incre > 0) {
            if (index + incre === pageStates.length) {
                return tryReview();
            }
            return tryNext();
        }
        if (index + incre >= 0) {
            setIndex(index + incre);
        }
    }

    // click outside detection
    const pageContainerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        function clickOutside(e: MouseEvent | TouchEvent) {
            const container = pageContainerRef.current;

            if (
                container &&
                !container.contains(e.target as Node) &&
                !e.defaultPrevented
            ) {
                setShowPages(false);
            }
        }
        // third arg is true, "useCapture"
        // detects events from topdown instead of bottom up of the dom tree
        document.addEventListener('mousedown', clickOutside, true);
        document.addEventListener('touchstart', clickOutside, true);
        return () => {
            document.removeEventListener('mousedown', clickOutside, true);
            document.removeEventListener('touchstart', clickOutside, true);
        };
    }, []);

    return (
        <div className={style.navContainer}>
            <SkewmorphicButton
                icon
                style={{ backgroundColor: 'var(--neutral-700)' }}
                onClick={() => {
                    incrementIndex(-1);
                }}
                disabled={index === 0}
            >
                <ArrowLeftIcon style={{ width: '24px' }}></ArrowLeftIcon>
            </SkewmorphicButton>

            <div ref={pageContainerRef} className={style.currentPage}>
                <button
                    onClick={() => {
                        setShowPages(!showPages);
                    }}
                >
                    {getPageTitle(index)}{' '}
                    {
                        <ChevronUpIcon
                            style={{
                                width: '20px',
                                transform: showPages ? '' : 'rotate(-180deg)',
                                transition: 'transform 300ms ease-out',
                            }}
                        ></ChevronUpIcon>
                    }
                </button>

                <div
                    className={cn(style.buttonContainer, {
                        [style.visible]: showPages,
                    })}
                >
                    {pageStates.map((item, _index) => (
                        <button
                            key={_index}
                            className={cn(
                                {
                                    [style.pageButton]: true,
                                    [style.focus]: _index === index,
                                },
                                'flex items-start'
                            )}
                            onClick={() => {
                                setIndex(_index);
                            }}
                        >
                            <span className="mr-2 flex-shrink-0">
                                {getPageStatus(item)}
                            </span>
                            <span className="flex-grow">
                                {getPageTitle(_index)}
                            </span>
                        </button>
                    ))}

                    <button
                        className={cn(
                            {
                                [style.pageButton]: true,
                                [style.focus]: index === pageStates.length,
                            },
                            'flex items-start'
                        )}
                        onClick={() => {
                            tryReview();
                        }}
                    >
                        <span className="mr-2 flex-shrink-0">
                            <div style={{ width: '28px', height: '28px' }} />
                        </span>
                        <span className="flex-grow">
                            {pageStates.length + 1}.{' '}
                            {getPageTitle(pageStates.length)}
                        </span>
                    </button>
                </div>
            </div>
            <SkewmorphicButton
                icon
                style={{ backgroundColor: 'var(--neutral-700)' }}
                onClick={() => {
                    incrementIndex(1);
                }}
                disabled={index === pageStates.length}
            >
                <ArrowRightIcon style={{ width: '24px' }}></ArrowRightIcon>
            </SkewmorphicButton>
        </div>
    );
}
