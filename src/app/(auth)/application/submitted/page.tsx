import { SkewmorphicButton } from '@/components/ui/SkewmorphicButton/SkewmorphicButton';
import style from 'styled-jsx/style';
import Image from 'next/image';
import { redirect } from 'next/navigation';

export default function SubmitPage() {
    return (
        <div className="flex flex-col items-center justify-center gap-10">
            <Image
                src={'/login/team.svg'}
                alt={'The Surge Team!'}
                width={430}
                height={317}
            />
            <div className="flex flex-col gap-1 justify-center items-center">
                <h1 className="text-white font-sans text-3xl font-semibold">
                    Application Submitted!
                </h1>
                <h2 className="text-white/60 text-sm font-sans">
                    Your application has been submitted and will go under review
                    by the JourneyHacks team soon.
                </h2>
            </div>

            <SkewmorphicButton
                onClick={() => {
                    redirect('/');
                }}
                style={{
                    background: 'var(--brand-500)',
                }}
            >
                Back to Dashboard
            </SkewmorphicButton>
        </div>
    );
}
