'use client';

import { useLayoutEffect, useState } from 'react';

export function useWindowSize() {
    const [[width, height], setSize] = useState([9999, 9999]);

    useLayoutEffect(() => {
        function updateSize() {
            setSize([window.innerWidth, window.innerHeight]);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => {
            window.removeEventListener('resize', updateSize);
        };
    }, []);

    return [width, height];
}
