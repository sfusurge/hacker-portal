'use client';

import { Scanner } from '@yudiel/react-qr-scanner';
import { redirect } from 'next/navigation';
import { ChevronDown, ChevronLeft, QrCode } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Scan() {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-neutral-900 p-4">
      <div className="relative w-full aspect-[3/4] max-w-sm min-h-screen">
        <div className="absolute inset-0 overflow-hidden">
          <Scanner
            onScan={(result) => redirect('/qr/' + result[0].rawValue)}
            components={{
              audio: false,
              torch: false,
              finder: false,
            }}
            styles={{
              container: { width: '100%', height: '100%' },
              video: { objectFit: 'cover', width: '100%', height: '100%' },
            }}
          />
        </div>

        <div className="absolute inset-0 bg-black/85 mask" />

        <Image
          src="/qrfinder.svg"
          width={500}
          height={500}
          alt="QR Finder"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[74.5%] aspect-square"
        />

        <div className="absolute top-4 left-4">
          <Link href="/">
            <button className="text-white flex flex-row gap-x-2 hover:shadow-lg transition-shadow duration-300">
              <ChevronLeft />
              <p className="">Back</p>
            </button>
          </Link>
        </div>
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
          <Link href="/">
            <button className="text-white/80 text-sm flex flex-row gap-x-2 hover:shadow-lg bg-neutral-900/50 items-center min-w-40 justify-center border border-neutral-750 pt-2 pb-2 rounded-full transition-shadow duration-300">
              <p className="">Event Check-In</p>
              <ChevronDown />
            </button>
          </Link>
        </div>

        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <Link href="/" className="mt-4">
            <button className="text-white bg-neutral-900/50 justify-center min-w-64 border border-neutral-750 items-center pr-7 pl-7 pt-2 pb-2 rounded-lg flex flex-row gap-x-2 hover:shadow-lg transition-shadow duration-300">
              <QrCode />
              <p className="font-light">Input code manually</p>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
