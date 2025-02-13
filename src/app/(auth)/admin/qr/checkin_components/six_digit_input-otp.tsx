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
                    className="relative w-14 h-14 my-3 ml-3 bg-neutral-900 text-white text-center border border-neutral-600 focus:outline-none focus:border-2 focus:border-blue-500 rounded-l-lg"
                />
                <InputOTPSlot
                    index={1}
                    className="relative w-14 h-14 my-3 bg-neutral-900 text-white text-center border border-neutral-600 focus:border-2 focus:border-blue-500"
                />
                <InputOTPSlot
                    index={2}
                    className="relative w-14 h-14 my-3 bg-neutral-900 text-white text-center border border-neutral-600 focus:border-2 focus:border-blue-500"
                />
                <InputOTPSlot
                    index={3}
                    className="relative w-14 h-14 my-3 bg-neutral-900 text-white text-center border border-neutral-600 focus:border-2 focus:border-blue-500"
                />
                <InputOTPSlot
                    index={4}
                    className="relative w-14 h-14 my-3 bg-neutral-900 text-white text-center border border-neutral-600 focus:border-2 focus:border-blue-500"
                />
                <InputOTPSlot
                    index={5}
                    className="relative w-14 h-14 my-3 mr-3 bg-neutral-900 text-white text-center border border-neutral-600 focus:border-2 focus:border-blue-500 rounded-r-lg"
                />
            </InputOTPGroup>
        </InputOTP>
    );
}
