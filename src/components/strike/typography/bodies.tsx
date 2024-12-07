import conditionalClasses from '@/utils/conditionalClasses';
import { PropsWithChildren } from 'react';
import { TypographyProps } from './types';

export function BodyLg({
  align,
  color,
  children,
  emphasized = false,
}: PropsWithChildren<TypographyProps>) {
  const className = conditionalClasses(
    ['font-sans', 'text-base', 'leading-none', 'tracking-tight'],
    {
      'font-semibold': emphasized,
      [`text-${color}`]: color != undefined,
      [`text-${align}`]: align != undefined,
    }
  );
  return <span className={className}>{children}</span>;
}

export function BodyBase({
  align,
  color,
  children,
  emphasized = false,
}: PropsWithChildren<TypographyProps>) {
  const className = conditionalClasses(
    ['font-sans', 'text-base', 'leading-none', 'tracking-tight'],
    {
      'font-semibold': emphasized,
      [`text-${color}`]: color != undefined,
      [`text-${align}`]: align != undefined,
    }
  );
  return <span className={className}>{children}</span>;
}

export function BodySm({
  align,
  color,
  children,
  emphasized = false,
}: PropsWithChildren<TypographyProps>) {
  const className = conditionalClasses(
    ['font-sans', 'text-sm', 'leading-none', 'tracking-tight'],
    {
      'font-semibold': emphasized,
      [`text-${color}`]: color != undefined,
      [`text-${align}`]: align != undefined,
    }
  );
  return <span className={className}>{children}</span>;
}
