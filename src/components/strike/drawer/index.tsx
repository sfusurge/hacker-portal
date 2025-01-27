import {
  ComponentProps,
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  HTMLAttributes,
} from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';

import { cn } from '@/lib/utils';
import { XCircle } from 'lucide-react';

// Copy from shadcn/ui
function Drawer({
  shouldScaleBackground = true,
  children,
  ...props
}: ComponentProps<typeof DrawerPrimitive.Root>) {
  return (
    <DrawerPrimitive.Root
      shouldScaleBackground={shouldScaleBackground}
      {...props}
    >
      {children}
    </DrawerPrimitive.Root>
  );
}
Drawer.displayName = 'Drawer';

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = forwardRef<
  ElementRef<typeof DrawerPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, children, ...props }, ref) => {
  return (
    <DrawerPrimitive.Overlay
      ref={ref}
      className={cn('fixed inset-0 z-50 bg-black/80', className)}
      {...props}
    >
      {children}
    </DrawerPrimitive.Overlay>
  );
});
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = forwardRef<
  ElementRef<typeof DrawerPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(
          // 'bg-gray-900 text-white p-6 rounded-t-lg fixed bottom-0 w-full max-w-md mx-auto',
          'fixed inset-x-0 bottom-0 z-50 mt-24 px-6 pb-10 flex h-auto flex-col rounded-t-[10px] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950',
          className
        )}
        {...props}
      >
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
});
DrawerContent.displayName = 'DrawerContent';

const DrawerHeader = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn('flex gap-2 pt-2 flex-col self-stretch', className)}
      {...props}
    >
      {/* empty div to show the gutter */}
      <div className="mx-auto h-[6px] w-9 rounded-full bg-neutral-750 dark:bg-neutral-750"></div>

      <div className="relative px-6">
        {children}

        <DrawerClose className="absolute top-2 right-2 text-gray-400 hover:text-white">
          <XCircle className="size-5"></XCircle>
        </DrawerClose>
      </div>
    </div>
  );
};
DrawerHeader.displayName = 'DrawerHeader';

const DrawerFooter = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn('mt-auto flex flex-col gap-2', className)} {...props}>
      {children}
    </div>
  );
};
DrawerFooter.displayName = 'DrawerFooter';

const DrawerTitle = forwardRef<
  ElementRef<typeof DrawerPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ children, ...props }, ref) => {
  return (
    <DrawerPrimitive.Title ref={ref} {...props}>
      {children}
    </DrawerPrimitive.Title>
  );
});
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
};
