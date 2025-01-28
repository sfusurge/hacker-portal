interface CountdownProps {
    label: string;
    time: string;
}

export default function Countdown(props: CountdownProps) {
    return (
        <div className="bg-neutral-850 border border-neutral-600/30 rounded-lg">
            <div className="bg-neutral-750 font-mono text-white text-sm font-medium h-10 mx-auto flex items-center justify-center rounded-md rounded-bl-none rounded-br-none">
                <span className="block leading-none">{props.label}</span>
            </div>
            <div className="text-4xl sm:text-5xl text-white font-semibold w-[2ch] mx-auto text-center py-4">
                {props.time}
            </div>
        </div>
    );
}
