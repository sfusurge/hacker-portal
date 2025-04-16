'use client';

import { useState } from 'react';
import DefaultView from './DefaultView';
import EmailSent from './EmailSent';
import { OAuthProvider } from './constants';

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
        await loginWithNodeMail(formData);
    };

    if (emailSent) {
        return <EmailSent email={sentEmail} onResend={handleResendEmail} />;
    }

    return (
        <DefaultView
            loginWithNodeMail={handleEmailSuccess}
            loginWithProvider={loginWithProvider}
        />
    );
}
