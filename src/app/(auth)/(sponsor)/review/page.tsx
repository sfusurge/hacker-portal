import { createCaller } from '@/server/appRouter';
import ResumeTable from './table/resumeBank';

export default async function ResumeBankPage() {
    const trpcClient = createCaller({});

    const activeHackathon = await trpcClient.hackathons.getActiveHackathon();

    if (!activeHackathon) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-white">No active hackathon found.</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <ResumeTable hackathonId={activeHackathon.id} />
        </div>
    );
}
