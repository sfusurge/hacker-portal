import { connection } from 'next/server';
import { getCachedActiveHackathon } from '@/server/getCachedActiveHackathon';
import { requireSponsorPublicAccessForPath } from '@/lib/sponsor/publicSponsorAccess';
import ResumeTable from '@/components/sponsor/resume-bank/resumeBank';
import type { InputFormPageData } from '@/components/application_components/types';
import PublicSponsorShell from '@/components/sponsor/PublicSponsorShell';

// Allow blocking render (token/cookie gated).
export const instant = false;

export default async function PublicSponsorResumesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    await connection();
    const params = await searchParams;
    const session = await requireSponsorPublicAccessForPath(
        params,
        '/sponsor/resumes'
    );

    const activeHackathon = await getCachedActiveHackathon();
    if (!activeHackathon) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">
                <p className="text-white/60">No active hackathon found.</p>
            </div>
        );
    }

    const applicationQuestions = (activeHackathon.applicationQuestions ??
        []) as InputFormPageData[];

    return (
        <PublicSponsorShell
            sponsorName={session.name}
            hackathonData={activeHackathon}
        >
            <ResumeTable
                hackathonId={activeHackathon.id}
                publicAccess
                hackathonName={activeHackathon.name}
                initialApplicationQuestions={applicationQuestions}
            />
        </PublicSponsorShell>
    );
}
