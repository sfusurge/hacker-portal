'use client';

import Image from 'next/image';

export default function EmailSent({
    email,
    onResend,
}: {
    email: string;
    onResend?: () => void;
}) {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-10 text-center">
            <Image
                src="/login/otter-mail.webp"
                width={320}
                height={320}
                className="w-full rounded-2xl md:max-w-100 lg:max-w-90"
                alt="Otter with mail illustration"
            />
            <div className="space-y-3">
                <h1 className="leading-tighter text-3xl font-semibold">
                    Check your email!
                </h1>
                <p className="max-w-84 text-pretty text-white/60">
                    We just sent an email to{' '}
                    <span className="text-white">{email}</span> with a magic
                    link that&apos;ll log you into the SFU Surge portal. 🦦
                </p>
            </div>
            <p className="w-full text-center text-white/60">
                Didn&apos;t receive an email?
                <span
                    onClick={onResend}
                    className="text-brand-400 hover:text-brand-300 ml-1 cursor-pointer font-semibold underline"
                >
                    Resend email
                </span>
            </p>
        </div>
    );
}
