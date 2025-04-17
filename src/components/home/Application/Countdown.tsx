import { useEffect, useState } from 'react';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface CountdownTimerProps {
    targetDate: Date; // ISO string for the target date
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
    const calculateTimeLeft = (): TimeLeft | null => {
        const difference = Math.max(
            0,
            new Date(targetDate).getTime() - new Date().getTime()
        );

        if (difference >= 0) {
            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / (1000 * 60)) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return null;
    };

    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(
        calculateTimeLeft()
    );

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft) {
        return <div>Countdown complete!</div>;
    }

    const formatTime = (time: number): string => {
        return String(time).padStart(2, '0');
    };

    return (
        <div className="grid w-full max-w-96 grid-cols-3 gap-4">
            <div className="bg-neutral-850 rounded-lg border border-neutral-600/30">
                <div className="bg-neutral-750 mx-auto flex h-10 items-center justify-center rounded-md rounded-br-none rounded-bl-none font-mono text-sm font-medium text-white">
                    <span className="block leading-none">DAYS</span>
                </div>
                <div className="mx-auto w-[2ch] py-4 text-center text-4xl font-semibold text-white sm:text-5xl">
                    {formatTime(timeLeft.days)}
                </div>
            </div>

            <div className="bg-neutral-850 rounded-lg border border-neutral-600/30">
                <div className="bg-neutral-750 mx-auto flex h-10 items-center justify-center rounded-md rounded-br-none rounded-bl-none font-mono text-sm font-medium text-white">
                    <span className="block leading-none">HOURS</span>
                </div>
                <div className="mx-auto w-[2ch] py-4 text-center text-4xl font-semibold text-white sm:text-5xl">
                    {formatTime(timeLeft.hours)}
                </div>
            </div>

            <div className="bg-neutral-850 rounded-lg border border-neutral-600/30">
                <div className="bg-neutral-750 mx-auto flex h-10 items-center justify-center rounded-md rounded-br-none rounded-bl-none font-mono text-sm font-medium text-white">
                    <span className="block leading-none">MINS</span>
                </div>
                <div className="mx-auto w-[2ch] py-4 text-center text-4xl font-semibold text-white sm:text-5xl">
                    {formatTime(timeLeft.minutes)}
                </div>
            </div>
        </div>
    );
};

export default CountdownTimer;
