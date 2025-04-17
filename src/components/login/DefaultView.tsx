'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import LinkLogin from './LinkLogin';
import { OAUTH_PROVIDERS, OAuthProvider } from './constants';

interface DefaultViewProps {
    loginWithNodeMail: (
        formData: FormData
    ) => Promise<{ success: boolean; email: string } | void>;
    loginWithProvider: (provider: OAuthProvider) => Promise<void>;
}

export default function DefaultView({
    loginWithNodeMail,
    loginWithProvider,
}: DefaultViewProps) {
    return (
        <div className="flex w-full flex-col items-start gap-10">
            <Image
                src="/login/journeyhacks-logo.webp"
                width={100}
                height={100}
                className="h-16 w-16 rounded-lg sm:h-25 sm:w-25"
                alt="Sparky wearing a chef's hat"
            />
            <div className="space-y-3 text-white">
                <h1 className="text-3xl leading-tight font-semibold">
                    Login or sign up to get started.
                </h1>
                <p className="">Continue to the Surge portal with:</p>
            </div>

            <div className="grid w-full grid-cols-2 gap-3">
                {OAUTH_PROVIDERS.map((provider) => (
                    <form
                        key={provider}
                        action={() =>
                            loginWithProvider(provider.toLowerCase() as any)
                        }
                        className="w-full"
                    >
                        <Button
                            type="submit"
                            variant="social"
                            hierarchy="primary"
                            size="cozy"
                            className={`w-full`}
                            leadingIcon={`/icons/${provider}.svg`}
                            leadingIconAlt={`${provider.charAt(0).toUpperCase() + provider.slice(1)} logo`}
                        >
                            {provider.charAt(0).toUpperCase() +
                                provider.slice(1)}
                        </Button>
                    </form>
                ))}
            </div>

            <div className="relative my-4 flex w-full items-center">
                <div className="flex-grow border-t border-neutral-600/60"></div>
                <span className="mx-2 flex-shrink text-xs text-white/60">
                    or continue with email
                </span>
                <div className="flex-grow border-t border-neutral-600/60"></div>
            </div>

            <LinkLogin action={loginWithNodeMail} />
        </div>
    );
}
