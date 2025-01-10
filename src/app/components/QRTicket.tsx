import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import { databaseClient } from '@/db/client';
import { users } from '@/db/schema/users';
import generateQRCode, { QROptions } from '@/server/generateQRCode';

export type QRTicketProps = {
  userId: string;
};

export default async function QRTicket({ userId }: QRTicketProps) {
  const userList = await databaseClient.select().from(users);
  const pfp = '/pfp_placeholder.png';
  const opts: QROptions = {
    margin: 1,
    scale: 10,
    color: {
      dark: '#FFFFFF',
      light: '#0000',
    },
  };

  const user = userList.find((user) => user.id.toString() === userId);
  const firstname = user ? user.firstName : null;
  const lastname = user ? user.lastName : null;

  const qrcode: string = await generateQRCode(userId, opts);
  const role = 'Hacker';

  return (
    <section className="relative bg-neutral-900 border border-neutral-750 rounded-xl p-8 shadow-md h-full md:min-w-[608px] md:min-h-[454px] md:w-auto md:h-auto box-border">
      <button className="absolute top-2 left-1/2 transform -translate-x-1/2 rounded-full transition-colors duration-200 block md:hidden">
        <div className="w-9 h-1.5 bg-neutral-700 rounded-full"></div>
      </button>

      <Link href="/">
        <button className="absolute top-2 right-2 p-1 rounded-full md:hover:bg-neutral-800 transition-colors duration-200">
          <X className="w-5 h-5 text-neutral-400" />
        </button>
      </Link>

      <div className="mt-1 mb-3">
        <header className="flex flex-col justify-center items-center gap-0.5 self-stretch font-sans mb-6">
          <Image
            src={pfp}
            alt="Profile Picture"
            width={44}
            height={44}
            className="rounded-full mb-4 block md:hidden"
          />

          <h2 className="text-sm font-normal leading-5 text-[#ffffff99] tracking-tightest hidden md:block">
            Your Ticket to
          </h2>

          <h2 className="text-sm font-normal leading-5 text-[#ffffff99] tracking-tightest block md:hidden">
            {firstname + ' ' + lastname + "'s"} Ticket
          </h2>

          <h1 className="text-center text-xl font-semibold leading-5 tracking-tightest text-white">
            StormHacks 2024
          </h1>
        </header>

        <section className="flex flex-col md:flex-row rounded-xl bg-neutral-800">
          <div className="flex flex-1 pt-7 pb-7 pr-16 pl-16 md:p-6 items-center justify-center ">
            <div className="relative w-full aspect-square">
              <Image
                src={qrcode}
                alt="QR Code"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <div className="h-0 border-neutral-200 relative large-dashes">
            <div className="absolute w-5 h-5 bg-neutral-900 rounded-full -top-2.5 -left-2.5"></div>
            <div className="absolute w-5 h-5 bg-neutral-900 rounded-full -top-2.5 -right-2.5"></div>
          </div>

          <div className="w-0 border-neutral-200 relative hidden md:block large-dashes-vertical">
            <div className="absolute w-5 h-5 bg-neutral-900 rounded-full -left-2.5 -top-2.5"></div>
            <div className="absolute w-5 h-5 bg-neutral-900 rounded-full -left-2.5 -bottom-2.5"></div>
          </div>

          <section className="flex flex-1 font-sans flex-col p-6 gap-y-5 mt-3 md:mt-0 md:max-w-56 md:p-10">
            <div className="hidden md:block">
              <Image
                src={pfp}
                alt="Profile Picture"
                width={44}
                height={44}
                className="rounded-full"
              />
            </div>

            <div className="flex flex-col gap-y-1">
              <h2 className="text-sm font-light leading-5 text-[#ffffff99] tracking-tightest">
                Name
              </h2>
              <h1 className="text-left text-base font-light leading-4 tracking-tightest text-white">
                {firstname + ' ' + lastname}
              </h1>
            </div>
            <section className="flex flex-row md:flex-col gap-x-20 md:gap-y-5">
              <div className="flex flex-col gap-y-1">
                <h6 className="text-sm font-light leading-5 text-[#ffffff99] tracking-tightest">
                  Role
                </h6>
                <h4 className="text-left text-base font-light leading-4 tracking-tightest text-white">
                  {role}
                </h4>
              </div>

              <div className="flex flex-col gap-y-2">
                <h6 className="text-sm font-light leading-5 text-[#ffffff99] tracking-tightest">
                  Hacker ID
                </h6>
                <h4 className="text-left text-base font-light leading-4 tracking-tightest text-white break-all md:break-all">
                  {userId}
                </h4>
              </div>
            </section>
          </section>
        </section>
      </div>
    </section>
  );
}
