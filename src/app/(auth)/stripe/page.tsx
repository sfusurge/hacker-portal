import ElementsForm from '@/app/(auth)/stripe/components/ElementsForm';

export default function PaymentElementPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-4">
            <div className="w-full max-w-md rounded-lg bg-neutral-800 p-8 shadow-lg">
                <ElementsForm />
            </div>
        </div>
    );
}
