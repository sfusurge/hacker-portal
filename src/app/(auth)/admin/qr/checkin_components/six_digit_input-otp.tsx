import { REGEXP_ONLY_DIGITS } from 'input-otp';

import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';

type InputOtpProps = {
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
};

export default function InputOtp({ input, setInput }: InputOtpProps) {
    return (
        <InputOTP
            maxLength={6}
            value={input}
            onChange={(value) => setInput(value)}
            pattern={REGEXP_ONLY_DIGITS}
        >
            <InputOTPGroup className="flex">
                <InputOTPSlot
                    index={0}
                    className="relative my-3 ml-3 h-14 w-14 rounded-l-lg border border-neutral-600 bg-neutral-900 text-center text-white focus:border-2 focus:border-blue-500 focus:outline-hidden"
                />
                <InputOTPSlot
                    index={1}
                    className="relative my-3 h-14 w-14 border border-neutral-600 bg-neutral-900 text-center text-white focus:border-2 focus:border-blue-500"
                />
                <InputOTPSlot
                    index={2}
                    className="relative my-3 h-14 w-14 border border-neutral-600 bg-neutral-900 text-center text-white focus:border-2 focus:border-blue-500"
                />
                <InputOTPSlot
                    index={3}
                    className="relative my-3 h-14 w-14 border border-neutral-600 bg-neutral-900 text-center text-white focus:border-2 focus:border-blue-500"
                />
                <InputOTPSlot
                    index={4}
                    className="relative my-3 h-14 w-14 border border-neutral-600 bg-neutral-900 text-center text-white focus:border-2 focus:border-blue-500"
                />
                <InputOTPSlot
                    index={5}
                    className="relative my-3 mr-3 h-14 w-14 rounded-r-lg border border-neutral-600 bg-neutral-900 text-center text-white focus:border-2 focus:border-blue-500"
                />
            </InputOTPGroup>
        </InputOTP>
    );
}
