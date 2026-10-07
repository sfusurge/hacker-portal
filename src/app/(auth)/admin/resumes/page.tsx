import { getCachedActiveHackathon } from '@/server/getCachedActiveHackathon';
import ResumeTable from '@/components/sponsor/resume-bank/resumeBank';

export default async function AdminResumeBankPage() {
    const activeHackathon = await getCachedActiveHackathon();

    if (!activeHackathon) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center rounded-xl border border-dashed border-neutral-600/40 bg-neutral-900 px-6 py-12">
                <p className="text-white/60">No active hackathon found.</p>
            </div>
        );
    }

    return (
        <div className="w-full pb-32 md:pb-6">
            <ResumeTable hackathonId={activeHackathon.id} />
        </div>
    );
}
