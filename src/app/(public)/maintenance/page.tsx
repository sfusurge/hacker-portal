'use client';
import Image from 'next/image';
import { SkewmorphicButton } from '@/components/ui/SkewmorphicButton/SkewmorphicButton';
import { redirect } from 'next/navigation';

export default function Maintenance() {
    return (
        <>
            <div className="w-full h-screen justify-center items-center flex flex-col rounded-full bg-[#0C0C0D]">
                <div
                    className="z-0 -translate-y-1/2 absolute w-screen h-screen flex-shrink-0 rounded-full opacity-60
                bg-[radial-gradient(50%_50%_at_50%_50%,_#364FB8_0%,_rgba(24,35,82,0)_100%)] blur-[500px]"
                ></div>

                <div
                    className="z-10 flex flex-col items-center justify-center text-center gap-10 p-8 rounded-xl
                border border-neutral-600/30 bg-neutral-900 min-w-96 max-w-96"
                >
                    <Image
                        src={'/login/application-review.webp'}
                        alt={'Cooking'}
                        width="244"
                        height="180"
                    />
                    <div className="flex flex-col w-full gap-2">
                        <h1 className="text-white text-xl font-medium leading-tightest">
                            We’ve got something cooking
                        </h1>
                        <h3 className="text-sm font-light leading-5 tracking-tightest text-white/60 pr-3 pl-3">
                            Thank you for being a part of JourneyHacks! Our
                            team’s back in the kitchen, cooking up something
                            exciting for our next hackathon. Follow us on social
                            media to be the first to hear about upcoming events!
                        </h3>
                    </div>

                    <div className="flex md:flex-row flex-col gap-4 w-full">
                        <SkewmorphicButton
                            style={{
                                backgroundColor: 'var(--neutral-700)',
                            }}
                            onClick={() => {
                                redirect('https://discord.gg/Rg4mwHvKjd');
                            }}
                            className="gap-2 h-10 w-full"
                        >
                            <Image
                                src={'/icons/discordlogo.svg'}
                                alt={'Discord'}
                                width="20"
                                height="20"
                            />
                            <div className="text-sm text-nowrap">
                                Join Discord
                            </div>
                        </SkewmorphicButton>
                        <SkewmorphicButton
                            style={{
                                backgroundColor: 'var(--neutral-700)',
                            }}
                            onClick={() => {
                                redirect('https://www.instagram.com/sfusurge');
                            }}
                            className="flex gap-2 h-10 w-full"
                        >
                            <Image
                                src={'/icons/instagramlogo.svg'}
                                alt={'Instagram'}
                                width="20"
                                height="20"
                            />
                            <div className="text-sm text-nowrap">
                                Follow Instagram
                            </div>
                        </SkewmorphicButton>
                    </div>
                </div>
            </div>
        </>
    );
}
