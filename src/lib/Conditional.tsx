import { ReactNode } from 'react';

export const Conditional = ({
    showWhen,
    children,
}: {
    showWhen: boolean;
    children: ReactNode;
}) => {
    if (showWhen) return <>{children}</>;
    return <></>;
};
