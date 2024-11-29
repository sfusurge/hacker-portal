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
        return margin - parentReference;
    }

    if (center + childLength / 2 + margin > max) {
        // upper limit
        return max - margin - childLength - parentReference;
    }

    return center - childLength / 2 - parentReference;
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
    closeLabel,
}: Readonly<{
    children?: ReactNode;
    rootRef: HTMLDivElement;
    parentRef: HTMLDivElement;
    closeLabel: () => void;
}>) {
    const margin = 12; // 12px margin between parent and message box

    const childRef = useRef<HTMLDivElement>(null);

    const [width, height] = useDocumentSize();

    const [top, left] = useMemo(() => {
        let calcTop = 0;
        let calcLeft = 0;
        if (childRef.current && parentRef) {
            const root = rootRef.getBoundingClientRect();
            const child = childRef.current.getBoundingClientRect();
            const parent = parentRef.getBoundingClientRect();

            // try right side
            if (parent.right + margin + child.width < width) {
                // will fit in right side

                calcTop = limitDimention(
                    height,
                    margin,
                    child.height,
                    parent.top,
                    parent.height
                );
                calcLeft = parent.width + margin;
            } else if (parent.top - margin - child.height > 0) {
                // try fitting top side

                calcLeft = limitDimention(
                    width,
                    margin,
                    child.width,
                    parent.left,
                    parent.width
                );
                calcTop = -(child.height + margin);
            } else if (parent.bottom + margin + child.height > height) {
                // fitting bottom side
                calcLeft = limitDimention(
                    width,
                    margin,
                    child.width,
                    parent.left,
                    parent.width
                );
                calcTop = parent.height + margin;
            } else {
                // all the other sides dont work, just place it on the left.
                calcTop = limitDimention(
                    height,
                    margin,
                    child.height,
                    parent.top,
                    parent.height
                );
                calcLeft = -(child.width + margin);
            }

            // sicne this element isn't a direct child of "parent", calc and apply offset for position relative to root.
            calcTop += parent.top - root.top;
            calcLeft += parent.left - root.left;
        }

        return [calcTop, calcLeft];
    }, [width, height, childRef.current]);

    const clickedOutsideCallback = useCallback(
        (e: MouseEvent) => {
            if (
                !childRef.current?.contains(e.target as Node) &&
                !e.defaultPrevented
            ) {
                // clicked outside
                closeLabel();
            }
        },
        [closeLabel]
    );
    useEffect(() => {
        document.addEventListener('click', clickedOutsideCallback);
        return () => {
            document.removeEventListener('click', clickedOutsideCallback);
        };
    }, []);

    return (
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
    );
}

/*
https://stackoverflow.com/a/19014495/12471420
*/
function useDocumentSize() {
    const [size, setSize] = useState([
        document.documentElement.scrollWidth,
        document.documentElement.scrollHeight,
    ]);
    useLayoutEffect(() => {
        function updateSize() {
            setSize([
                document.documentElement.scrollWidth,
                document.documentElement.scrollHeight,
            ]);
        }
        window.addEventListener('resize', updateSize);
        updateSize(); // update immediately for initial render
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
}
