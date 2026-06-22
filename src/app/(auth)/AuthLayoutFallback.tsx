export default function AuthLayoutFallback() {
    return (
        <div
            className="flex min-h-0 flex-col overflow-x-hidden bg-neutral-950 p-0 md:flex-row md:p-5"
            style={{ height: '100dvh' }}
        >
            <div className="hidden w-64 shrink-0 md:block" />
            <main className="md:bg-neutral-925 mt-20 flex min-h-0 w-full min-w-0 flex-1 flex-col p-6 md:mt-0 md:rounded-2xl md:border md:border-neutral-600/30 md:p-10" />
        </div>
    );
}
