import { ExclamationCircleIcon, QrCodeIcon } from '@heroicons/react/24/solid';

type UserNotFoundProps = {
  userId: string;
  closeAll: () => void;
  backToManual: () => void;
};

export default function UserNotFound({
  userId,
  closeAll,
  backToManual,
}: UserNotFoundProps) {
  return (
    <div className="flex justify-center items-center overflow-hidden">
      <div className="self-stretch bg-neutral-900 max-w-sm h-96 flex-col justify-start items-start inline-flex rounded-tl-xl rounded-tr-xl border-t border-neutral-600/30  overflow-hidden">
        <div className="self-stretch flex-col justify-start items-start gap-1 flex p-2">
          <div className="w-12 h-12 ml-3 bg-[#7f1c1d]/30 rounded-full justify-center items-center inline-flex overflow-hidden">
            <ExclamationCircleIcon className="size-6 fill-red-600" />
          </div>
        </div>

        <div className="self-stretch h-80 px-6 pb-10 bg-neutral-900 flex-col justify-start items-start gap-8 flex">
          <div className="self-stretch h-28 flex-col justify-start items-start gap-2 flex">
            <div className="self-stretch text-white text-base font-semibold">
              User not found
            </div>

            <div className="self-stretch">
              <span className="text-white/60 text-sm font-normal leading-tight">
                No user was found with the ID
              </span>
              <span className="text-white text-sm font-medium leading-none">
                {' ' + userId + '. '}
              </span>
              <span className="text-white/60 text-sm font-normal leading-tight">
                Try scanning the QR code again or input the ID manually. If this
                issue persists, contact an organizer.
              </span>
            </div>
          </div>

          <div className="self-stretch h-32 flex-col justify-end items-end gap-4 flex">
            <div className="self-stretch px-1 py-2 bg-neutral-800/60 rounded-lg border border-neutral-600/60 justify-center items-center inline-flex overflow-hidden">
              <button
                className="px-3 justify-center items-center flex text-white text-base font-medium flex-row gap-2"
                onClick={closeAll}
              >
                <QrCodeIcon className="size-6" />
                Scan QR code
              </button>
            </div>

            <div className="self-stretch justify-center items-start gap-2 inline-flex">
              <div className="text-center text-white/30 text-xs font-medium leading-3">
                OR
              </div>
            </div>

            <button
              className="self-stretch px-1 py-2 bg-neutral-800/60 rounded-lg border border-neutral-600/60 justify-center items-center inline-flex overflow-hidden text-white text-base font-medium"
              onClick={backToManual}
            >
              Check in manually
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
