'use client';

import { useState } from 'react';
import DefaultView from './DefaultView';
import EmailSent from './EmailSent';
import { OAuthProvider } from './constants';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AnimatePresence, motion } from 'motion/react';
import { Conditional } from '@/lib/Conditional';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function LoginContainer({
    loginWithNodeMail,
    loginWithProvider,
}: {
    loginWithNodeMail: (
        formData: FormData
    ) => Promise<{ success: boolean; email: string } | void>;
    loginWithProvider: (provider: OAuthProvider) => Promise<void>;
}) {
    const [emailSent, setEmailSent] = useState(false);
    const [sentEmail, setSentEmail] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const { data: session, status } = useSession();

    const handleEmailSuccess = async (formData: FormData) => {
        const result = await loginWithNodeMail(formData);
        if (result && result.success) {
            setSentEmail(result.email);
            setEmailSent(true);
        }
    };

    const handleResendEmail = async () => {
        const formData = new FormData();
        formData.append('email', sentEmail);
        const result = await loginWithNodeMail(formData);
        if (result && result.success) {
            setShowAlert(true);
            setTimeout(() => {
                setShowAlert(false);
            }, 2500);
        }
    };

    // Check session status to determine if user is logged in and has sent an email
    useEffect(() => {
        if (status === 'authenticated' && session) {
            setLoggedIn(true);
        } else if (status === 'unauthenticated') {
            setLoggedIn(false);
        }
    }, [session, status]);

    return (
        <>
            <Conditional showWhen={loggedIn}>
                <div className="w-full space-y-3 text-center">
                    <h1 className="leading-tighter px-2 text-3xl font-semibold text-balance">
                        You&apos;ve logged onto the portal in another tab! 🦦
                    </h1>
                    <p className="text-pretty text-white/60">
                        Feel free to close this tab now.
                    </p>
                </div>
            </Conditional>

            <Conditional showWhen={!loggedIn && !emailSent}>
                <DefaultView
                    loginWithNodeMail={handleEmailSuccess}
                    loginWithProvider={loginWithProvider}
                />
            </Conditional>

            <Conditional showWhen={!loggedIn && emailSent}>
                <div className="relative flex h-full flex-1 flex-col justify-between">
                    <EmailSent email={sentEmail} onResend={handleResendEmail} />
                    <AnimatePresence>
                        <Conditional showWhen={showAlert}>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Alert
                                    variant={'success'}
                                    className="absolute bottom-0 w-full"
                                    onClose={() => {
                                        setShowAlert(false);
                                    }}
                                >
                                    <AlertTitle>Email resent!</AlertTitle>
                                    <AlertDescription>
                                        A new magic link was sent to{' '}
                                        <span className="font-medium">
                                            {sentEmail}
                                        </span>
                                        .
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        </Conditional>
                    </AnimatePresence>
                </div>
            </Conditional>
        </>
    );
}
