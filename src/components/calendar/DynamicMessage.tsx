import { ReactNode, useLayoutEffect, useMemo, useRef, useState } from 'react';
import style from './DynamicMessage.module.css';

// lower is always 0
function limitDimention(
  max: number,
  margin: number,
  length: number,
  center: number
) {
  if (center - length / 2 - margin < 0) {
    // low limit
    return margin;
  }

  if (center + length / 2 + margin > max) {
    // upper limit
    return max - margin - length;
  }

  return center - length / 2;
}

export function DynamicMessage({
  children,
  closeLabel,
}: {
  children: ReactNode;
  closeLabel: () => void;
}) {
  const margin = 12; // 12px margin between parent and message box

  const childRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const [width, height] = useWindowSize();

  const [top, left] = useMemo(() => {
    if (childRef.current && parentRef.current) {
      const child = childRef.current.getBoundingClientRect();
      const parent = parentRef.current.getBoundingClientRect();

      // try right side
      if (parent.right + margin + child.width < width) {
        // will fit in right side
        return [
          limitDimention(
            height,
            margin,
            child.height,
            parent.top + parent.height / 2
          ),
          parent.right + margin,
        ];
      }
    }
    return [0, 0];
  }, [width, height]);

  return (
    <div ref={parentRef} className={style.parentWrapper}>
      <div className={style.background} onClick={closeLabel} />
      <div ref={childRef} className={style.labelChildrenContainer}>
        {children}
      </div>
    </div>
  );
}

/*
https://stackoverflow.com/a/19014495/12471420
*/
function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize(); // update immediately for initial render
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
}
