'use client';
import Image from 'next/image';
import { SkewmorphicButton } from '@/components/ui/SkewmorphicButton/SkewmorphicButton';
import { redirect } from 'next/navigation';

export default function Maintenance() {
    return (
        <>
            <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0C0C0D]">
                <div className="absolute z-0 h-screen w-screen flex-shrink-0 -translate-y-1/2 bg-[radial-gradient(50%_50%_at_50%_50%,_#364FB8_0%,_rgba(24,35,82,0)_100%)] opacity-60 blur-[500px]"></div>

                <div className="z-10 flex max-w-96 min-w-96 flex-col items-center justify-center gap-10 rounded-xl border border-neutral-600/30 bg-neutral-900 p-8 text-center">
                    <Image
                        src={'/cooking.webp'}
                        alt={'Cooking'}
                        width="244"
                        height="180"
                    />
                    <div className="flex w-full flex-col gap-2">
                        <h1 className="leading-tightest text-xl font-medium text-balance text-white">
                            We’ve got something cooking
                        </h1>
                        <h3 className="tracking-tightest pr-3 pl-3 text-sm leading-5 font-light text-balance text-white/60">
                            Thank you for being a part of JourneyHacks! Our
                            team’s back in the kitchen, cooking up something
                            exciting for our next hackathon. Follow us on social
                            media to be the first to hear about upcoming events!
                        </h3>
                    </div>

                    <div className="flex w-full flex-col gap-4 md:flex-row">
                        <SkewmorphicButton
                            style={{
                                backgroundColor: 'var(--neutral-700)',
                            }}
                            onClick={() => {
                                redirect('https://discord.gg/Rg4mwHvKjd');
                            }}
                            className="h-10 w-full gap-2"
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
                            className="flex h-10 w-full gap-2"
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
