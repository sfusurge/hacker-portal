import {
    PrimitiveAtom,
    useAtomValue,
    useSetAtom,
    useAtom,
    Atom,
    WritableAtom,
} from 'jotai';
import style from './ApplicationPageIndicator.module.css';
import { finalErrCheckAtom } from '../InputForm';
import type { InputFormPageData } from '../types';
import { findFirstInvalidPageIndex } from '../InputFormComponents/shared';
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

import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
    pagesAtom,
    indexAtom,
}: {
    pageStateAtoms: Atom<PageFormState[]>;
    pagesAtom: WritableAtom<InputFormPageData[], [InputFormPageData[]], void>;
    indexAtom: PrimitiveAtom<number>;
}) {
    const pageStates = useAtomValue(pageStateAtoms);
    const pages = useAtomValue(pagesAtom);
    const setIndex = useSetAtom(indexAtom);
    const [errCheck, setErrCheck] = useAtom(finalErrCheckAtom);

    const [pendingReview, setPendingReview] = useState(false);

    function tryReview() {
        setErrCheck(true);
        setPendingReview(true);
    }

    useLayoutEffect(() => {
        if (!pendingReview || !errCheck) return;

        const missingPageIdx = findFirstInvalidPageIndex(pages);
        if (missingPageIdx >= 0) {
            toast({
                title: 'Invalid form',
                description:
                    'Please complete all required fields, including file uploads.',
                variant: 'error',
            });
            setIndex(missingPageIdx);
            setPendingReview(false);
            return;
        }

        const htmlErrorIdx = pageStates.findIndex((state) => state.error);
        if (htmlErrorIdx >= 0) {
            toast({
                title: 'Invalid form',
                description: 'Some of the questions are not filled correctly.',
                variant: 'error',
            });
            setIndex(htmlErrorIdx);
            setPendingReview(false);
            return;
        }

        setIndex(pageStates.length);
        setPendingReview(false);
    }, [pendingReview, errCheck, pages, pageStates, setIndex]);

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
    pagesAtom,
    indexAtom,
}: {
    pageStateAtoms: Atom<PageFormState[]>;
    pagesAtom: WritableAtom<InputFormPageData[], [InputFormPageData[]], void>;
    indexAtom: PrimitiveAtom<number>;
}) {
    const pageStates = useAtomValue(pageStateAtoms);
    const pages = useAtomValue(pagesAtom);
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

    const [pendingReview, setPendingReview] = useState(false);

    function tryReview() {
        setErrCheck(true);
        setPendingReview(true);
    }

    useLayoutEffect(() => {
        if (!pendingReview || !errCheck) return;

        const missingPageIdx = findFirstInvalidPageIndex(pages);
        if (missingPageIdx >= 0) {
            toast({
                title: 'Invalid form',
                description:
                    'Please complete all required fields, including file uploads.',
                variant: 'error',
            });
            setIndex(missingPageIdx);
            setPendingReview(false);
            return;
        }

        const htmlErrorIdx = pageStates.findIndex((state) => state.error);
        if (htmlErrorIdx >= 0) {
            toast({
                title: 'Invalid form',
                description: 'Some of the questions are not filled correctly.',
                variant: 'error',
            });
            setIndex(htmlErrorIdx);
            setPendingReview(false);
            return;
        }

        setIndex(pageStates.length);
        setPendingReview(false);
    }, [pendingReview, errCheck, pages, pageStates, setIndex]);

    function incrementIndex(incre: number) {
        if (index + incre === pageStates.length) {
            return tryReview();
        }
        setIndex(index + incre);
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
