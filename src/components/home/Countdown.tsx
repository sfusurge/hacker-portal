import { useEffect, useState } from 'react';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface CountdownTimerProps {
    targetDate: string; // ISO string for the target date
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
    const calculateTimeLeft = (): TimeLeft | null => {
        const difference =
            new Date(targetDate).getTime() - new Date().getTime();
        if (difference > 0) {
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
        <div className="grid grid-cols-3 gap-4 max-w-96 w-full">
            <div className="bg-neutral-850 border border-neutral-600/30 rounded-lg">
                <div className="bg-neutral-750 font-mono text-white text-sm font-medium h-10 mx-auto flex items-center justify-center rounded-md rounded-bl-none rounded-br-none">
                    <span className="block leading-none">DAYS</span>
                </div>
                <div className="text-4xl sm:text-5xl text-white font-semibold w-[2ch] mx-auto text-center py-4">
                    {formatTime(timeLeft.days)}
                </div>
            </div>

            <div className="bg-neutral-850 border border-neutral-600/30 rounded-lg">
                <div className="bg-neutral-750 font-mono text-white text-sm font-medium h-10 mx-auto flex items-center justify-center rounded-md rounded-bl-none rounded-br-none">
                    <span className="block leading-none">HOURS</span>
                </div>
                <div className="text-4xl sm:text-5xl text-white font-semibold w-[2ch] mx-auto text-center py-4">
                    {formatTime(timeLeft.hours)}
                </div>
            </div>

            <div className="bg-neutral-850 border border-neutral-600/30 rounded-lg">
                <div className="bg-neutral-750 font-mono text-white text-sm font-medium h-10 mx-auto flex items-center justify-center rounded-md rounded-bl-none rounded-br-none">
                    <span className="block leading-none">MINS</span>
                </div>
                <div className="text-4xl sm:text-5xl text-white font-semibold w-[2ch] mx-auto text-center py-4">
                    {formatTime(timeLeft.minutes)}
                </div>
            </div>
        </div>
    );
};

export default CountdownTimer;
