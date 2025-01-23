import { PrimitiveAtom, useAtomValue, useSetAtom, useAtom } from 'jotai';
import style from './ApplicationPageIndicator.module.css';
import { finalErrCheckAtom } from '../ApplicationForm';
import {
    CheckCircleIcon,
    ExclamationCircleIcon,
} from '@heroicons/react/24/solid';
import {
    EllipsisHorizontalCircleIcon,
    ArrowUpCircleIcon,
} from '@heroicons/react/24/outline';

import { ReactNode } from 'react';

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

    function getPageStatus(pageState: PageFormState) {
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
                    <>
                        <button
                            key={index}
                            onClick={() => {
                                setIndex(index);
                            }}
                            className={style.pageStatusItem}
                        >
                            {getPageStatus(item)} {item.title}
                        </button>

                        <div
                            className={`${style.ladderBar} ${item.state === 'completed' && !item.error ? style.done : ''}`}
                        />
                    </>
                );
            })}
            <button onClick={tryReview} className={style.pageStatusItem}>
                <ArrowUpCircleIcon
                    style={{
                        width: '28px',
                        height: '28px',
                    }}
                />{' '}
                Review
            </button>
        </div>
    );
}
