import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DateControls({
    onPrevious,
    onToday,
    onNext,
    className,
}: {
    onPrevious?: () => void;
    onToday?: () => void;
    onNext?: () => void;
    className?: string;
}) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <Button
                type="button"
                variant="default"
                hierarchy="secondary"
                onClick={onPrevious}
                disabled={!onPrevious}
                aria-label="Previous date range"
                className="h-8 w-8 [&>span]:p-0"
            >
                <ChevronLeftIcon style={{ width: '20px' }} />
            </Button>
            <Button
                type="button"
                variant="default"
                hierarchy="secondary"
                style={{ padding: '0.25rem' }}
                onClick={onToday}
                disabled={!onToday}
                className="h-8 [&>span]:px-2 [&>span]:py-0"
            >
                Today
            </Button>
            <Button
                type="button"
                variant="default"
                hierarchy="secondary"
                onClick={onNext}
                disabled={!onNext}
                aria-label="Next date range"
                className="h-8 w-8 [&>span]:p-0"
            >
                <ChevronRightIcon style={{ width: '20px' }} />
            </Button>
        </div>
    );
}
