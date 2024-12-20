import Mail from '../../public/components/mail.png';
import Warning from '../../public/components/warning-red.png';
import Image from 'next/image';
import { useState } from 'react';

export default function TextField() {
  const [isError, setIsError] = useState(false);

  return (
    <div className="space-y-1 bg-black p-6 w-4/6">
      <p className="text-lg font-medium text-gray-300 text-lg py-1">Label</p>
      <div
        className={`flex items-center rounded-lg px-4 py-4 border 
                ${isError ? 'border-red-500' : 'border-gray-400'} `}
      >
        <Image src={Mail} className="h-6 w-6 mr-2" alt="mail" />
        <input
          className={`flex-1 bg-transparent text-gray-700 placeholder-gray-500 outline-none text-xl 
                    focus-visible:caret-blue-500`}
          placeholder="Placeholder"
        />
      </div>
      {isError ? (
        <div className="flex items-center space-x-2">
          <Image src={Warning} className="h-6 w-6" alt="warning" />
          <p className="text-red-500 text-md py-1">Something went wrong.</p>
        </div>
      ) : (
        <p className="text-gray-300 text-md py-1">This is a caption.</p>
      )}
    </div>
  );
}
