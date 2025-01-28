import ApplicationCard from '@/components/home/ApplicationCard';
import DiscordCard from '@/components/home/DiscordCard';

export default function Home() {
    return (
        <div className="flex flex-col gap-6 md:gap-8">
            {/* TODO RAY ADD THE USER NAME HERE */}
            <h1 className="text-3xl text-white font-semibold">
                Hi, really long username!
            </h1>

            <div className="grid gap-6 md:gap-8 pb-6 md:pb-0 xl:grid-cols-2">
                <ApplicationCard status="In Progress"></ApplicationCard>
                <DiscordCard></DiscordCard>
            </div>
        </div>
    );
}
