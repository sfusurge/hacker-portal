'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import useMediaQuery from 'beautiful-react-hooks/useMediaQuery';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';

interface BaseProps {
    children: React.ReactNode;
}

interface RootResponsiveProps extends BaseProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

interface ResponsiveProps extends BaseProps {
    className?: string;
    asChild?: true;
}

const ResponsiveContext = React.createContext<{
    isDesktop: boolean;
}>({
    isDesktop: false,
});

const useResponsiveContext = () => {
    const context = React.useContext(ResponsiveContext);
    if (!context) {
        throw new Error(
            'Responsive components cannot be rendered outside the Responsive Context'
        );
    }
    return context;
};

const ResponsiveDialog = ({
    children,
    trigger,
    ...props
}: RootResponsiveProps) => {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [isOpen, setIsOpen] = React.useState(false);
    const DialogComponent = isDesktop ? Dialog : Drawer;
    const Trigger = isDesktop ? DialogTrigger : DrawerTrigger;

    React.useEffect(() => {
        if (props.open !== undefined) {
            setIsOpen(props.open);
        }
    }, [props.open]);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        props.onOpenChange?.(open);
    };

    return (
        <ResponsiveContext.Provider value={{ isDesktop }}>
            <DialogComponent
                {...props}
                open={props.open !== undefined ? props.open : isOpen}
                onOpenChange={handleOpenChange}
                {...(!isDesktop && { autoFocus: true })}
            >
                {trigger && <Trigger asChild>{trigger}</Trigger>}
                {children}
            </DialogComponent>
        </ResponsiveContext.Provider>
    );
};

const ResponsiveDialogTrigger = ({
    className,
    children,
    ...props
}: ResponsiveProps) => {
    const { isDesktop } = useResponsiveContext();
    const TriggerComponent = isDesktop ? DialogTrigger : DrawerTrigger;

    return (
        <TriggerComponent className={className} {...props}>
            {children}
        </TriggerComponent>
    );
};

const ResponsiveDialogClose = ({
    className,
    children,
    ...props
}: ResponsiveProps) => {
    const { isDesktop } = useResponsiveContext();
    const CloseComponent = isDesktop ? DialogClose : DrawerClose;

    return (
        <CloseComponent className={className} {...props}>
            {children}
        </CloseComponent>
    );
};

const ResponsiveDialogContent = ({
    className,
    children,
    ...props
}: ResponsiveProps) => {
    const { isDesktop } = useResponsiveContext();
    const ContentComponent = isDesktop ? DialogContent : DrawerContent;

    return (
        <ContentComponent className={className} {...props}>
            {children}
        </ContentComponent>
    );
};

const ResponsiveDialogDescription = ({
    className,
    children,
    ...props
}: ResponsiveProps) => {
    const { isDesktop } = useResponsiveContext();
    const DescriptionComponent = isDesktop
        ? DialogDescription
        : DrawerDescription;

    return (
        <DescriptionComponent className={className} {...props}>
            {children}
        </DescriptionComponent>
    );
};

const ResponsiveDialogHeader = ({
    className,
    children,
    ...props
}: ResponsiveProps) => {
    const { isDesktop } = useResponsiveContext();
    const HeaderComponent = isDesktop ? DialogHeader : DrawerHeader;

    return (
        <HeaderComponent className={className} {...props}>
            {children}
        </HeaderComponent>
    );
};

const ResponsiveDialogTitle = ({
    className,
    children,
    ...props
}: ResponsiveProps) => {
    const { isDesktop } = useResponsiveContext();
    const TitleComponent = isDesktop ? DialogTitle : DrawerTitle;

    return (
        <TitleComponent className={className} {...props}>
            {children}
        </TitleComponent>
    );
};

const ResponsiveDialogBody = ({
    className,
    children,
    ...props
}: ResponsiveProps) => {
    return (
        <div className={cn('px-4 md:px-0', className)} {...props}>
            {children}
        </div>
    );
};

const ResponsiveDialogFooter = ({
    className,
    children,
    ...props
}: ResponsiveProps) => {
    const { isDesktop } = useResponsiveContext();
    const FooterComponent = isDesktop ? DialogFooter : DrawerFooter;

    return (
        <FooterComponent className={className} {...props}>
            {children}
        </FooterComponent>
    );
};

export {
    ResponsiveDialog,
    ResponsiveDialogTrigger,
    ResponsiveDialogClose,
    ResponsiveDialogContent,
    ResponsiveDialogDescription,
    ResponsiveDialogHeader,
    ResponsiveDialogTitle,
    ResponsiveDialogBody,
    ResponsiveDialogFooter,
};
