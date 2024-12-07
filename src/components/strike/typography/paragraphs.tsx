import conditionalClasses from '@/utils/conditionalClasses';
import { PropsWithChildren } from 'react';
import { TypographyProps } from './types';

export function ParagraphLg({
  align,
  color,
  children,
  emphasized = false,
}: PropsWithChildren<TypographyProps>) {
  const className = conditionalClasses(
    ['font-sans', 'text-lg', 'leading-normal', 'tracking-tight'],
    {
      'font-semibold': emphasized,
      [`text-${color}`]: color != undefined,
      [`text-${align}`]: align != undefined,
    }
  );
  return <p className={className}>{children}</p>;
}

export function ParagraphBase({
  align,
  color,
  children,
  emphasized = false,
}: PropsWithChildren<TypographyProps>) {
  const className = conditionalClasses(
    ['font-sans', 'text-base', 'leading-normal', 'tracking-tight'],
    {
      'font-semibold': emphasized,
      [`text-${color}`]: color != undefined,
      [`text-${align}`]: align != undefined,
    }
  );
  return <p className={className}>{children}</p>;
}

export function ParagraphSm({
  align,
  color,
  children,
  emphasized = false,
}: PropsWithChildren<TypographyProps>) {
  const className = conditionalClasses(
    ['font-sans', 'text-sm', 'leading-normal', 'tracking-tight'],
    {
      'font-semibold': emphasized,
      [`text-${color}`]: color != undefined,
      [`text-${align}`]: align != undefined,
    }
  );
  return <p className={className}>{children}</p>;
}
