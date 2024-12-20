import Mail from '../../public/components/mail.png';
import Warning from '../../public/components/warning-red.png';
import Image from 'next/image';
import { useState } from 'react';

export default function TextField() {
  const [isError, setIsError] = useState(true);

  return (
    <div className="space-y-1 bg-black p-4 w-2/5">
      <p className="text-sm font-medium text-gray-300 py-1">Label</p>
      <div
        className={`flex items-center rounded-lg px-3 py-2 border 
                ${isError ? 'border-red-500' : 'border-gray-400'} `}
      >
        <Image src={Mail} className="h-5 w-5 mr-2" alt="mail" />
        <input
          className={`h-6 bg-transparent text-gray-700 placeholder-gray-500 outline-none text-lg 
                    focus-visible:caret-blue-500`}
          placeholder="Placeholder"
        />
      </div>
      {isError ? (
        <div className="flex items-center space-x-2">
          <Image src={Warning} className="h-5 w-5" alt="warning" />
          <p className="text-red-500 text-sm py-1">Something went wrong.</p>
        </div>
      ) : (
        <p className="text-gray-300 text-sm py-1">This is a caption.</p>
      )}
    </div>
  );
}
