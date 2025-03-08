import { REGEXP_ONLY_DIGITS } from 'input-otp';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

type InputOtpProps = {
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    onSubmit?: () => void;
};

function InputOTPItemSlot({
    index,
    className,
    ...props
}: {
    index: number;
    className?: string;
    [key: string]: any;
}) {
    return (
        <InputOTPSlot
            index={index}
            className={cn(
                `relative my-3 border border-neutral-600 bg-neutral-900 text-center text-white focus:border-2 focus:border-blue-500`,
                className
            )}
            {...props}
        />
    );
}

export default function InputOtp({ input, setInput, onSubmit }: InputOtpProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && input.length === 6 && onSubmit) {
                e.preventDefault();
                onSubmit();
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            if (container) {
                container.removeEventListener('keydown', handleKeyDown);
            }
        };
    }, [input, onSubmit]);

    return (
        <div ref={containerRef}>
            <InputOTP
                maxLength={6}
                value={input}
                onChange={(value) => setInput(value)}
                pattern={REGEXP_ONLY_DIGITS}
            >
                <InputOTPGroup>
                    <InputOTPItemSlot
                        index={0}
                        className="rounded-l-lg focus:outline-hidden"
                    />
                    <InputOTPItemSlot index={1} />
                    <InputOTPItemSlot index={2} />
                    <InputOTPItemSlot index={3} />
                    <InputOTPItemSlot index={4} />
                    <InputOTPItemSlot index={5} className="rounded-r-lg" />
                </InputOTPGroup>
            </InputOTP>
        </div>
    );
}
