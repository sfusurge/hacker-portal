import { PrimitiveAtom, useAtomValue, useSetAtom, useAtom, Atom } from 'jotai';
import style from './ApplicationPageIndicator.module.css';
import { finalErrCheckAtom } from '../InputForm';
import { canAdvanceFromPageState } from '../InputFormComponents/shared';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ChevronUpIcon,
} from '@heroicons/react/24/solid';
import {
    EllipsisHorizontalCircleIcon,
    ArrowUpCircleIcon,
} from '@heroicons/react/24/outline';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { SkewmorphicButton } from '@/components/ui/SkewmorphicButton/SkewmorphicButton';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

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

function getPageStatus(pageState: PageFormState, errCheck: boolean) {
    if (pageState.error && errCheck) {
        return (
            <IconHolder>
                <ExclamationCircleIcon color="red"></ExclamationCircleIcon>
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
                ></EllipsisHorizontalCircleIcon>
            );

        default:
            throw 'unexpected page status';
    }
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
    const setIndex = useSetAtom(indexAtom);
    const [errCheck, setErrCheck] = useAtom(finalErrCheckAtom);

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
                valid &&= canAdvanceFromPageState(pageStates[idx]);
                if (!valid) {
                    break;
                }
            }
            if (!valid) {
                toast({
                    title: 'Invalid form',
                    description:
                        'Some of the questions are not filled correctly.',
                    variant: 'error',
                });
                setIndex(idx);
            } else {
                setIndex(pageStates.length);
            }
            setValidationPerformed(false);
        }
    }, [validationPerformed]);

    return (
        <div className={style.pageStatusContainer}>
            {pageStates.map((item, index) => {
                return (
                    <div key={index}>
                        <button
                            key={index}
                            onClick={() => {
                                setIndex(index);
                            }}
                            className={cn(
                                style.pageStatusItem,
                                'flex items-start text-left'
                            )}
                        >
                            <span className="mr-2 flex-shrink-0">
                                {getPageStatus(item, errCheck)}
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

export function MobilePageIndicator({
    pageStateAtoms,
    indexAtom,
}: {
    pageStateAtoms: Atom<PageFormState[]>;
    indexAtom: PrimitiveAtom<number>;
}) {
    const pageStates = useAtomValue(pageStateAtoms);
    const [index, setIndex] = useAtom(indexAtom);
    const [errCheck, setErrCheck] = useAtom(finalErrCheckAtom);

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

    const [pendingNav, setPendingNav] = useState<'next' | 'review' | null>(
        null
    );

    function queueValidation(action: 'next' | 'review') {
        setErrCheck(true);
        requestAnimationFrame(() => {
            setTimeout(() => setPendingNav(action), 0);
        });
    }

    function tryReview() {
        queueValidation('review');
    }

    function incrementIndex(incre: number) {
        if (incre > 0) {
            if (index + incre === pageStates.length) {
                return tryReview();
            }
            return queueValidation('next');
        }
        if (index + incre >= 0) {
            setIndex(index + incre);
        }
    }

    useEffect(() => {
        if (!pendingNav) return;

        if (pendingNav === 'next') {
            const current = pageStates[index];
            if (!current || !canAdvanceFromPageState(current)) {
                toast({
                    title: 'Incomplete section',
                    description:
                        'Answer all required questions on this page before continuing.',
                    variant: 'error',
                });
            } else {
                setIndex(index + 1);
            }
        } else {
            let valid = true;
            for (const pageState of pageStates) {
                valid &&= canAdvanceFromPageState(pageState);
            }

            if (!valid) {
                toast({
                    title: 'Invalid form',
                    description:
                        'Some of the questions are not filled correctly.',
                    variant: 'error',
                });
            } else {
                setIndex(pageStates.length);
            }
        }

        setPendingNav(null);
    }, [pendingNav, pageStates, index, setIndex]);

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
            document.removeEventListener('mousedown', clickOutside);
            document.removeEventListener('touchstart', clickOutside);
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
                                setShowPages(false);
                            }}
                        >
                            <span className="mr-2 flex-shrink-0">
                                {getPageStatus(item, errCheck)}
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
