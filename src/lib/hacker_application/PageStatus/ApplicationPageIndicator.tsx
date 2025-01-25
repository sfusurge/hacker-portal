import { PrimitiveAtom, useAtomValue, useSetAtom, useAtom } from 'jotai';
import style from './ApplicationPageIndicator.module.css';
import { finalErrCheckAtom } from '../ApplicationForm';
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
                    style={{ width: '28px' }}
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
    pageStateAtoms: PrimitiveAtom<PageFormState[]>;
    indexAtom: PrimitiveAtom<number>;
}) {
    const pageStates = useAtomValue(pageStateAtoms);
    const setIndex = useSetAtom(indexAtom);
    const [errCheck, setErrCheck] = useAtom(finalErrCheckAtom);

    function tryReview() {
        let valid = true;

        for (const pageState of pageStates) {
            valid &&= !pageState.error;
        }

        if (!valid) {
            alert('Not all pages are valid!');
            setErrCheck(true);
        } else {
            setIndex(pageStates.length); // the lastpage + 1 is the review page.
        }
    }

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
                            className={style.pageStatusItem}
                        >
                            {getPageStatus(item, errCheck)} {item.title}
                        </button>

                        <div
                            className={`${style.ladderBar} ${item.state === 'completed' && !item.error ? style.done : ''}`}
                        />
                    </div>
                );
            })}
            <button onClick={tryReview} className={style.pageStatusItem}>
                <ArrowUpCircleIcon
                    style={{
                        width: '28px',
                        height: '28px',
                    }}
                />
                Review
            </button>
        </div>
    );
}

export function MobilePageIndicator({
    pageStateAtoms,
    indexAtom,
}: {
    pageStateAtoms: PrimitiveAtom<PageFormState[]>;
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
            <span>
                {_index + 1}. {pageStates[_index].title}
            </span>
        );
    }

    function tryReview() {
        let valid = true;

        for (const pageState of pageStates) {
            valid &&= !pageState.error;
        }

        if (!valid) {
            alert('Not all pages are valid!');
            setErrCheck(true);
        } else {
            setIndex(pageStates.length); // the lastpage + 1 is the review page.
        }
    }

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
                                width: '16px',
                                transform: showPages
                                    ? ''
                                    : 'transform:rotate(180deg)',
                            }}
                        ></ChevronUpIcon>
                    }
                </button>

                {showPages && (
                    <div className={style.buttonContainer}>
                        {pageStates.map((item, _index) => (
                            <button
                                key={_index}
                                className={cn({
                                    [style.pageButton]: true,
                                    [style.focus]: _index === index,
                                })}
                                onClick={() => {
                                    setIndex(_index);
                                    setShowPages(false);
                                }}
                            >
                                {getPageStatus(item, errCheck)}
                                {getPageTitle(_index)}
                            </button>
                        ))}

                        <button
                            className={cn({
                                [style.pageButton]: true,
                                [style.focus]: index === pageStates.length,
                            })}
                            onClick={() => {
                                tryReview();
                            }}
                        >
                            <div style={{ width: '28px' }} />{' '}
                            {pageStates.length + 1}.{' '}
                            {getPageTitle(pageStates.length)}
                        </button>
                    </div>
                )}
            </div>
            <SkewmorphicButton
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
