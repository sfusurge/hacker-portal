import { SkewmorphicButton } from '@/components/ui/SkewmorphicButton/SkewmorphicButton';
import style from 'styled-jsx/style';
import Image from 'next/image';

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
                onClick={returnHome}
                className={style.nextButton}
            >
                Back to Dashboard
            </SkewmorphicButton>
        </div>
    );
}
