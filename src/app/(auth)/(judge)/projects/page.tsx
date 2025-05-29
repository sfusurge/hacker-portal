import ProjectList from '@/components/projects/ProjectList';
import { createCaller } from '@/server/appRouter';
import { getUserData } from '@/server/routers/usersRouter';

interface Project {
    [key: number]: string;
    id: number;
}

function getPlainTextFromRichText(richText: any): string {
    if (!richText?.ops) return '';
    return richText.ops
        .map((op: any) => op.insert)
        .join('')
        .trim();
}

export default async function JudgeProjectsPage() {
    const data = await getUserData();
    if (!data) {
        return <div>Loading...</div>;
    }

    const trpcClient = createCaller({});
    const activeHackathon = await trpcClient.hackathons.getActiveHackathon();

    const assignments = await trpcClient.judging.getJudgingProjects({
        hackathonId: activeHackathon.id,
    });

    const projectsWithSubmissions = await Promise.all(
        assignments.map(async (assignment) => {
            const submission = await trpcClient.judging.getTeamSubmission({
                hackathonId: activeHackathon.id,
                teamId: assignment.teamId,
            });

            if (!submission?.response) {
                return null;
            }

            const response = submission.response as Record<string, any>;

            const project: Project = {
                id: assignment.teamId,
                0: assignment.teamId.toString(),
                1: assignment.teamName || `Team #${assignment.teamId}`,
                2: response[2] || 'No track selected',
                3: response[3]?.[0] || '/hacker-portal-preview.webp',
                4:
                    getPlainTextFromRichText(response[4]) ||
                    'No description available',
            };

            return project;
        })
    );

    const validProjects = projectsWithSubmissions.filter(
        (project): project is Project => project !== null
    );

    const judgedProjects = await trpcClient.judging.getJudgedProjects({
        judgeId: data.id,
        hackathonId: activeHackathon.id,
    });

    return (
        <ProjectList
            projects={validProjects}
            userData={data}
            judgedProjects={judgedProjects}
        />
    );
}
