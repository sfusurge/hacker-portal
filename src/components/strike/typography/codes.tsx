import conditionalClasses from '@/utils/conditionalClasses';
import { PropsWithChildren } from 'react';
import { TypographyProps } from './types';

export function CodeLg({
  align,
  color,
  children,
  emphasized = false,
}: PropsWithChildren<TypographyProps>) {
  const className = conditionalClasses(
    ['font-mono', 'text-lg', 'leading-none', 'tracking-normal'],
    {
      'font-semibold': emphasized,
      [`text-${color}`]: color != undefined,
      [`text-${align}`]: align != undefined,
    }
  );
  return <code className={className}>{children}</code>;
}

export function CodeBase({
  align,
  color,
  children,
  emphasized = false,
}: PropsWithChildren<TypographyProps>) {
  const className = conditionalClasses(
    ['font-mono', 'text-base', 'leading-none', 'tracking-normal'],
    {
      'font-semibold': emphasized,
      [`text-${color}`]: color != undefined,
      [`text-${align}`]: align != undefined,
    }
  );
  return <code className={className}>{children}</code>;
}

export function CodeSm({
  align,
  color,
  children,
  emphasized = false,
}: PropsWithChildren<TypographyProps>) {
  const className = conditionalClasses(
    ['font-mono', 'text-sm', 'leading-none', 'tracking-normal'],
    {
      'font-semibold': emphasized,
      [`text-${color}`]: color != undefined,
      [`text-${align}`]: align != undefined,
    }
  );
  return <code className={className}>{children}</code>;
}
