import { getUserData } from '@/db/schema/users/users';
import ProjectList from '@/components/projects/ProjectList';
import { projectsData } from './projects';
import { createCaller } from '@/server/appRouter';

export default async function JudgePage() {
    const data = await getUserData();
    if (!data) {
        return <div>Loading...</div>;
    }

    const trpcClient = createCaller({});
    const activeHackathon = await trpcClient.hackathons.getActiveHackathon();
    const judgedProjects = await trpcClient.judging.getJudgedProjects({
        judgeId: data.id,
        hackathonId: activeHackathon.id,
    });

    // Todo: fetch only projects that need to be judged by current judge

    return (
        <ProjectList
            projects={projectsData}
            userData={data}
            judgedProjects={judgedProjects}
        />
    );
}
