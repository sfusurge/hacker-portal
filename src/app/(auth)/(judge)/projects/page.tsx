import ProjectList from '@/components/projects/ProjectList';
import { projectsData } from './projects';
import { createCaller } from '@/server/appRouter';
import { getUserData } from '@/server/routers/usersRouter';

export default async function JudgePage() {
    const data = await getUserData();
    if (!data) {
        return <div>Loading...</div>;
    }

    const trpcClient = createCaller({});
    const activeHackathon = await trpcClient.hackathons.getActiveHackathon();

    // Fetch all projects that need to be judged
    // const projects = await trpcClient.projects.getProjectsForJudge({
    //     hackathonId: activeHackathon.id,
    //     judgeId: data.id
    // });

    const judgedProjects = await trpcClient.judging.getJudgedProjects({
        judgeId: data.id,
        hackathonId: activeHackathon.id,
    });

    return (
        <>
            <ProjectList
                projects={projectsData}
                userData={data}
                judgedProjects={judgedProjects}
                hackathonId={activeHackathon.id}
            />
        </>
    );
}
