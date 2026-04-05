import { getCachedActiveHackathon } from '@/server/getCachedActiveHackathon';
import ResumeTable from './table/resumeBank';

export default async function ResumeBankPage() {
    const activeHackathon = await getCachedActiveHackathon();

    if (!activeHackathon) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-white">No active hackathon found.</p>
            </div>
        );
    }

    return (
        <div className="w-full pb-32 md:pb-0">
            <ResumeTable hackathonId={activeHackathon.id} />
        </div>
    );
}
