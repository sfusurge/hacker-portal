import { REGEXP_ONLY_DIGITS } from 'input-otp';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { cn } from '@/lib/utils';

type InputOtpProps = {
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    onSubmit?: () => void;
    disabled?: boolean;
    readOnly?: boolean;
    className?: string;
    textColor?: string;
    error?: string;
};

function InputOTPItemSlot({
    index,
    className,
    textColor,
    error,
    ...props
}: {
    index: number;
    className?: string;
    textColor?: string;
    error?: string;
    [key: string]: any;
}) {
    return (
        <InputOTPSlot
            index={index}
            className={cn(
                `bg-neutral-850 relative my-3 border text-center focus:border-2 focus:border-blue-500`,
                error ? 'border-danger-500' : 'border-neutral-600',
                className
            )}
            textColor={textColor}
            {...props}
        />
    );
}

export default function InputOtp({
    input,
    setInput,
    onSubmit,
    disabled = false,
    className = '',
    textColor,
    error,
    readOnly = false,
}: InputOtpProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && input.length === 6 && onSubmit) {
            e.preventDefault();
            onSubmit();
        }
    };

    return (
        <div className={cn('w-full', className)}>
            <div onKeyDown={handleKeyDown}>
                <InputOTP
                    maxLength={6}
                    value={input}
                    onChange={(value) => !readOnly && setInput(value)}
                    pattern={REGEXP_ONLY_DIGITS}
                    disabled={disabled}
                    readOnly={readOnly}
                    autoFocus={!disabled && !readOnly}
                >
                    <InputOTPGroup>
                        <InputOTPItemSlot
                            index={0}
                            className="rounded-l-lg focus:outline-hidden"
                            textColor={textColor}
                            error={error}
                        />
                        <InputOTPItemSlot
                            index={1}
                            textColor={textColor}
                            error={error}
                        />
                        <InputOTPItemSlot
                            index={2}
                            textColor={textColor}
                            error={error}
                        />
                        <InputOTPItemSlot
                            index={3}
                            textColor={textColor}
                            error={error}
                        />
                        <InputOTPItemSlot
                            index={4}
                            textColor={textColor}
                            error={error}
                        />
                        <InputOTPItemSlot
                            index={5}
                            className="rounded-r-lg"
                            textColor={textColor}
                            error={error}
                        />
                    </InputOTPGroup>
                </InputOTP>
            </div>
            {error && <p className="text-danger-400 mt-1 text-xs">{error}</p>}
        </div>
    );
}
