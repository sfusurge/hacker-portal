import { ExclamationCircleIcon, QrCodeIcon } from '@heroicons/react/24/solid';

type UserNotFoundProps = {
    userId: string;
    closeAll: () => void;
    backToManual: () => void;
    show: boolean;
};

export default function UserNotFound({
    userId,
    closeAll,
    backToManual,
    show,
}: UserNotFoundProps) {
    if (!show) {
        return false;
    }

    return (
        <div
            className={`bg-opacity-50 fixed inset-0 z-50 bg-black opacity-100 transition-opacity duration-300`}
            onClick={closeAll}
        >
            <div
                className={`fixed right-0 bottom-0 left-0 translate-y-0 transform transition-transform duration-300 ease-in-out`}
            >
                <div className="flex items-center justify-center overflow-hidden">
                    <div className="inline-flex h-96 max-w-sm flex-col items-start justify-start self-stretch overflow-hidden rounded-tl-xl rounded-tr-xl border-t border-neutral-600/30 bg-neutral-900">
                        <div className="flex flex-col items-start justify-start gap-1 self-stretch p-2">
                            <div className="ml-3 inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#7f1c1d]/30">
                                <ExclamationCircleIcon className="size-6 fill-red-600" />
                            </div>
                        </div>

                        <div className="flex h-80 flex-col items-start justify-start gap-8 self-stretch bg-neutral-900 px-6 pb-10">
                            <div className="flex h-28 flex-col items-start justify-start gap-2 self-stretch">
                                <div className="self-stretch text-base font-semibold text-white">
                                    User not found
                                </div>

                                <div className="self-stretch">
                                    <span className="text-sm leading-tight font-normal text-white/60">
                                        No user was found with the ID
                                    </span>
                                    <span className="text-sm leading-none font-medium text-white">
                                        {' ' + userId + '. '}
                                    </span>
                                    <span className="text-sm leading-tight font-normal text-white/60">
                                        Try scanning the QR code again or input
                                        the ID manually. If this issue persists,
                                        contact an organizer.
                                    </span>
                                </div>
                            </div>

                            <div className="flex h-32 flex-col items-end justify-end gap-4 self-stretch">
                                <div className="inline-flex items-center justify-center self-stretch overflow-hidden rounded-lg border border-neutral-600/60 bg-neutral-800/60 px-1 py-2">
                                    <button
                                        className="flex flex-row items-center justify-center gap-2 px-3 text-base font-medium text-white"
                                        onClick={closeAll}
                                    >
                                        <QrCodeIcon className="size-6" />
                                        Scan QR code
                                    </button>
                                </div>

                                <div className="inline-flex items-start justify-center gap-2 self-stretch">
                                    <div className="text-center text-xs leading-3 font-medium text-white/30">
                                        OR
                                    </div>
                                </div>

                                <button
                                    className="inline-flex items-center justify-center self-stretch overflow-hidden rounded-lg border border-neutral-600/60 bg-neutral-800/60 px-1 py-2 text-base font-medium text-white"
                                    onClick={backToManual}
                                >
                                    Check in manually
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
