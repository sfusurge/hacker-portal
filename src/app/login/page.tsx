import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function Login() {
  return (
    <div id="auth" className="w-screen bg-neutral-925 h-screen p-6">
      <a
        href=""
        className="h-11 text-white block text-center flex items-center bg-neutral-800/60 hover:bg-neutral-750/60 w-full justify-center rounded-lg border border-box border-neutral-600/60 transition-colors active:bg-neutral/700/60"
      >
        <div className="trailing-icon pl-3">
          <Image
            src="/icons/github.svg"
            alt="Github logo"
            width={20}
            height={20}
          ></Image>
        </div>
        <span className="px-4 font-medium">Continue with GitHub</span>
      </a>
    </div>
  );
}
