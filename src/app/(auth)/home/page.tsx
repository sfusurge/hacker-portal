import DiscordCard from '@/components/home/DiscordCard';

export default function Home() {
    return (
        <div className="flex flex-col gap-6 md:gap-8">
            <h1 className="text-3xl text-white font-semibold">
                Hi, really long username!
            </h1>
            <div>
                <DiscordCard></DiscordCard>
            </div>
        </div>
    );
}
