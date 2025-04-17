import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <p className="w-full text-center text-xs text-balance text-white/60">
            By continuing, you agree to our <br />
            <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-400 hover:text-brand-300 font-medium underline"
            >
                Terms of Service
            </Link>{' '}
            and{' '}
            <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-400 hover:text-brand-300 font-medium underline"
            >
                Privacy Policy
            </Link>
            .
        </p>
    );
}
