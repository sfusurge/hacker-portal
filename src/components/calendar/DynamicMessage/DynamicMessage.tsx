import {
    CSSProperties,
    ReactNode,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import style from './DynamicMessage.module.css';
import { motion, AnimatePresence } from 'motion/react';

// lower is always 0
function limitDimention(
    max: number,
    margin: number,
    childLength: number,
    parentReference: number,
    parentLength: number
) {
    const center = parentReference + parentLength / 2;

    if (center - childLength / 2 - margin < 0) {
        // low limit
        return margin;
    }

    if (center + childLength / 2 + margin > max) {
        // upper limit
        return max - margin - childLength;
    }

    return center - childLength / 2;
}

/**
 * Creates a message box that appears to float next to parentRef's element.
 * This message box will attempt to automatically position itself so that it doesn't go out of screen, or expand document.
 * **NOTE** The children of this messagebox must have a defined size.
 *
 * Expectation of the document:
 * body: position relative, overflow hidden, so that this div don't expand page.
 *
 * * **rootRef**: a root element which is effectively the direct parent of this message box
 * * **parentRef**: an element which is a child of rootRef, that this message box element will appear to be position next to.
 * * **closeLabel**: a function that will be called when user clicks outside of this message box, this callback should close this messagebox.
 */
export function DynamicMessage({
    children,
    rootRef,
    parentRef,
    onClose,
    onOpen,
}: Readonly<{
    children?: ReactNode;
    rootRef: HTMLDivElement;
    parentRef: Node;
    onClose: () => void;
    onOpen?: () => void;
}>) {
    const margin = 12; // 12px margin between parent and message box

    const childRef = useRef<HTMLDivElement>(null);

    const [width, height] = useDivSize(rootRef as HTMLDivElement);

    const [top, left] = useMemo(() => {
        let calcTop = 0;
        let calcLeft = 0;
        if (childRef.current && parentRef) {
            const root = rootRef.getBoundingClientRect();
            const child = childRef.current.getBoundingClientRect();
            const parent = (
                parentRef as HTMLDivElement
            ).getBoundingClientRect();

            const parentRight = parent.right - root.left;
            const parentTop = parent.top - root.top;
            const parentLeft = parent.left - root.left;
            const parentBottom = parent.bottom - root.top;

            // try right side
            if (parentRight + margin * 2 + child.width < width) {
                // will fit in right side

                calcTop = limitDimention(
                    height,
                    margin,
                    child.height,
                    parentTop,
                    parent.height
                );
                calcLeft = parentRight + margin;
            } else if (parentTop - margin * 2 - child.height > 0) {
                // try fitting top side

                calcLeft = limitDimention(
                    width,
                    margin,
                    child.width,
                    parentLeft,
                    parent.width
                );
                calcTop = parentTop - (child.height + margin);
            } else if (parentBottom + margin * 2 + child.height < height) {
                // fitting bottom side
                calcLeft = limitDimention(
                    width,
                    margin,
                    child.width,
                    parentLeft,
                    parent.width
                );
                calcTop = parentBottom + margin;
            } else if (parentLeft - margin * 2 - child.width > 0) {
                // fit left side
                calcTop = limitDimention(
                    height,
                    margin,
                    child.height,
                    parentTop,
                    parent.height
                );
                calcLeft = parentLeft - (child.width + margin);
            } else {
                calcLeft = (width - child.width) / 2;
                calcTop = (height - child.height) / 2;
            }
        }
        return [calcTop, calcLeft];
    }, [width, height, childRef.current, parentRef, rootRef]);

    useEffect(() => {
        onOpen && onOpen();
    }, []);

    return (
        <>
            <div
                className={style.backdrop}
                onClick={() => {
                    onClose();
                }}
            ></div>
            <motion.div
                ref={childRef}
                style={
                    {
                        '--top': `${top}px`,
                        '--left': `${left}px`,
                    } as CSSProperties
                }
                className={style.labelChildrenContainer}
                initial={{
                    x: -25,
                    opacity: 0,
                }}
                animate={{
                    x: 0,
                    opacity: 1,
                    transition: {
                        duration: 0.2,
                        ease: 'circOut',
                    },
                }}
                exit={{
                    x: 25,
                    opacity: 0,
                }}
            >
                {children}
            </motion.div>
        </>
    );
}

function useDivSize(div: HTMLDivElement) {
    const [size, setSize] = useState([0, 0]);

    useLayoutEffect(() => {
        const observer = new ResizeObserver((e) => {
            for (const item of e) {
                const contentSize = item.contentBoxSize[0];
                setSize([contentSize.inlineSize, contentSize.blockSize]);
                console.log({
                    width: contentSize.inlineSize,
                    height: contentSize.blockSize,
                });
            }
        });

        if (div) {
            observer.observe(div);
        }

        return () => {
            observer.disconnect();
        };
    }, [div]);

    return size;
}
