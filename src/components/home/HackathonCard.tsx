'use client';
import Image from 'next/image';
import {
    Card,
    CardContent,
    CardHeader,
    CardHeaderColumn,
    CardHeaderDescription,
    CardHeaderTitle,
} from '@/components/ui/card';
import ActiveHackathonCard from '@/components/home/ActiveHackathonCard';

type ActiveHackathon = {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    applicationOpen?: Date | null;
    applicationCloses?: Date | null;
};

export default function HackathonCard({
    hackathon,
    applicationStatus,
    applicationSubmitted,
    applicationOpen,
    applicationCloses,
    userEmail,
}: {
    hackathon: ActiveHackathon | null;
    applicationStatus?: string;
    applicationSubmitted: boolean;
    applicationOpen?: Date | null;
    applicationCloses?: Date | null;
    userEmail?: string;
}) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardHeaderColumn>
                    <CardHeaderDescription>
                        Current & Upcoming
                    </CardHeaderDescription>
                    <CardHeaderTitle>Hackathons</CardHeaderTitle>
                </CardHeaderColumn>
            </CardHeader>

            <CardContent>
                {hackathon ? (
                    <ActiveHackathonCard
                        hackathon={hackathon}
                        applicationStatus={undefined}
                        applicationSubmitted={false}
                        applicationOpen={applicationOpen}
                        applicationCloses={applicationCloses}
                        userEmail={userEmail}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-6 text-center md:px-10 md:py-4">
                        <div className="relative mx-auto flex h-[90px] w-full items-center justify-center sm:w-full md:w-[80%] md:max-w-none lg:w-[45%]">
                            <Image
                                src="/dashboard/sillyhackshead.svg"
                                width={48}
                                height={48}
                                alt="Sillyhacks Icon"
                                className="pointer-events-none absolute left-0 rotate-[8.74deg] rounded-lg"
                            />
                            <Image
                                src="/dashboard/sh25head.png"
                                width={48}
                                height={48}
                                alt="Stormforge Icon"
                                className="pointer-events-none absolute top-6 right-0 rotate-[16.85deg] rounded-lg"
                            />
                        </div>

                        <div className="flex flex-col justify-center gap-2 md:items-center">
                            <h3 className="text-lg font-semibold text-white">
                                No active hackathons right now
                            </h3>
                            <p className="text-pretty text-white/60 md:max-w-7/10">
                                We’re preparing our next event!
                                <br />
                                Stay tuned for announcements or check out our
                                events in the sidebar.
                            </p>
                        </div>

                        <div className="relative mx-auto flex h-[90px] w-full items-center justify-center sm:w-full md:w-[80%] md:max-w-none lg:w-[45%]">
                            <Image
                                src="/dashboard/jh26head.png"
                                width={64}
                                height={64}
                                alt="Journeyhacks Icon"
                                className="pointer-events-none absolute top-4 left-0 z-0 rotate-[-18.07deg] rounded-lg"
                            />
                            <Image
                                src="/dashboard/OtterHead.png"
                                width={48}
                                height={48}
                                alt="Otter Icon"
                                className="pointer-events-none absolute top-[52px] left-8 z-10 rotate-[-7.1deg] rounded-lg"
                            />
                            <Image
                                src="/dashboard/sf26icon.svg"
                                width={48}
                                height={48}
                                alt="Stormhacks Icon"
                                className="pointer-events-none absolute top-8 right-0 rotate-[16.85deg] rounded-lg"
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
