import conditionalClasses from '@/utils/conditionalClasses';
import { TypographyProps } from './types';
import { PropsWithChildren } from 'react';

export function Display({
    align,
    color,
    children,
}: PropsWithChildren<TypographyProps>) {
    const className = conditionalClasses(
        [
            'font-sans',
            'text-4xl',
            'font-semibold',
            'leading-tighter',
            'tracking-tightest',
        ],
        {
            [`text-${color}`]: color != undefined,
            [`text-${align}`]: align != undefined,
        }
    );

    return <h1 className={className}>{children}</h1>;
}

export function TitleLg({
    align,
    color,
    children,
}: PropsWithChildren<TypographyProps>) {
    const className = conditionalClasses(
        [
            'font-sans',
            'text-3xl',
            'font-semibold',
            'leading-tighter',
            'tracking-tightest',
        ],
        {
            [`text-${color}`]: color != undefined,
            [`text-${align}`]: align != undefined,
        }
    );

    return <h2 className={className}>{children}</h2>;
}

export function TitleMd({
    align,
    color,
    children,
}: PropsWithChildren<TypographyProps>) {
    const className = conditionalClasses(
        [
            'font-sans',
            'text-2xl',
            'font-semibold',
            'leading-tighter',
            'tracking-tightest',
        ],
        {
            [`text-${color}`]: color != undefined,
            [`text-${align}`]: align != undefined,
        }
    );

    return <h3 className={className}>{children}</h3>;
}

export function TitleSm({
    align,
    color,
    children,
}: PropsWithChildren<TypographyProps>) {
    const className = conditionalClasses(
        [
            'font-sans',
            'text-xl',
            'font-semibold',
            'leading-tighter',
            'tracking-tighter',
        ],
        {
            [`text-${color}`]: color != undefined,
            [`text-${align}`]: align != undefined,
        }
    );

    return <h4 className={className}>{children}</h4>;
}

export function Label({
    align,
    color,
    children,
}: PropsWithChildren<TypographyProps>) {
    const className = conditionalClasses(
        [
            'font-sans',
            'text-base',
            'font-semibold',
            'leading-tight',
            'tracking-tighter',
        ],
        {
            [`text-${color}`]: color != undefined,
            [`text-${align}`]: align != undefined,
        }
    );

    return <h5 className={className}>{children}</h5>;
}

export function LabelSm({
    align,
    color,
    children,
}: PropsWithChildren<TypographyProps>) {
    const className = conditionalClasses(
        [
            'font-sans',
            'text-sm',
            'font-semibold',
            'leading-tight',
            'tracking-tighter',
        ],
        {
            [`text-${color}`]: color != undefined,
            [`text-${align}`]: align != undefined,
        }
    );

    return <h6 className={className}>{children}</h6>;
}
