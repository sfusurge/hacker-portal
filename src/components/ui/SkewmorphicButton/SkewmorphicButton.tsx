import { ComponentProps, forwardRef } from 'react';

import style from './SkewmorphicButton.module.css';
import { cn } from '@/lib/utils';

export const SkewmorphicButton = forwardRef<
    HTMLButtonElement,
    ComponentProps<'button'>
>(({ ...props }, ref) => {
    return (
        <button ref={ref} className={cn(props.className, style.button)}>
            {props.children}
        </button>
    );
});
