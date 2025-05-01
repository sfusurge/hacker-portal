import { userInfoAtom } from '@/app/(auth)/ClientAuthContext.jsx';
import ElementsForm from '@/app/(auth)/stripe/components/ElementsForm';
import { useAtomValue } from 'jotai';

export default function PaymentElementPage() {
    const userInfo = useAtomValue(userInfoAtom);
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-lg bg-neutral-800 p-8 shadow-lg">
                <ElementsForm />
            </div>
        </div>
    );
}
