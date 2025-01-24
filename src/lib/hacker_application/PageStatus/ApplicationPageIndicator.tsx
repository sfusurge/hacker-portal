import { PrimitiveAtom, useAtomValue, useSetAtom, useAtom } from 'jotai';
import style from './ApplicationPageIndicator.module.css';
import { finalErrCheckAtom } from '../ApplicationForm';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
} from '@heroicons/react/24/solid';
import {
    EllipsisHorizontalCircleIcon,
    ArrowUpCircleIcon,
} from '@heroicons/react/24/outline';

import { ReactNode, useState } from 'react';
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
                {index + 1}. {pageStates[index].title}
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

    return (
        <div className={style.navContainer}>
            <SkewmorphicButton
                style={{ backgroundColor: 'var(--neutral-700)' }}
                onClick={() => {
                    incrementIndex(-1);
                }}
                disabled={index === 0}
            >
                <ArrowLeftIcon style={{ width: '36px' }}></ArrowLeftIcon>
            </SkewmorphicButton>

            <div className={style.currentPage}>
                <button
                    onClick={() => {
                        setShowPages(!showPages);
                    }}
                >
                    {getPageTitle(index)}
                </button>
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
                            {getPageTitle(_index)}
                        </button>
                    ))}

                    <button>{getPageTitle(pageStates.length)}</button>
                </div>
            </div>
            <SkewmorphicButton
                style={{ backgroundColor: 'var(--neutral-700)' }}
                onClick={() => {
                    incrementIndex(1);
                }}
                disabled={index === pageStates.length}
            >
                <ArrowRightIcon style={{ width: '36px' }}></ArrowRightIcon>
            </SkewmorphicButton>
        </div>
    );
}
