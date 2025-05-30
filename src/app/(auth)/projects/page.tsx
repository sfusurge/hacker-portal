import { createCaller } from '@/server/appRouter';
import PublicProjectList from '@/components/projects/PublicProjectList';
import { getUserData } from '@/server/routers/usersRouter';
import ProjectList from '@/components/projects/ProjectList';

function getPlainTextFromRichText(richText: any): string {
    if (!richText?.ops) return '';
    return richText.ops
        .map((op: any) => op.insert)
        .join('')
        .trim();
}

interface JudgeAssignedProject {
    hackathonId: number;
    teamId: number;
    userId: number;
    status: string;
    createdDate: Date;
    updatedDate: Date;
    teamName: string | null;
    response: unknown;
}

export default async function PublicProjectsPage() {
    const trpcClient = createCaller({});
    const activeHackathon = await trpcClient.hackathons.getActiveHackathon();
    const hackathonId = activeHackathon.id;
    const user = await getUserData();

    let projects = null;
    let judgedProjects: JudgeAssignedProject[] | null = null;

    if (user?.userRole === 'judge') {
        const assignedProjects = await trpcClient.judging.getJudgingProjects({
            hackathonId,
        });
        judgedProjects = assignedProjects || [];

        const projectPromises = assignedProjects.map(async (project) => {
            const submission =
                await trpcClient.submissions.getSubmissionForTeam({
                    teamId: project.teamId,
                });

            if (!submission) {
                return null;
            }

            const response =
                (submission?.response as Record<string, any>) || {};
            return {
                id: project.teamId,
                teamName: project.teamName || `Team #${project.teamId}`,
                displayId: project.displayId || project.teamId.toString(),
                0: project.teamId.toString(),
                1: response[1] || `Team #${project.teamId}`,
                2: response[2] || 'No track selected',
                3: response[3]?.[0] || '/hacker-portal-preview.webp',
                4: response[4]
                    ? getPlainTextFromRichText(response[4])
                    : 'No description available',
                fullSubmissionResponse: response,
            };
        });

        const allProjects = await Promise.all(projectPromises);
        projects = allProjects.filter((project) => project !== null);
    } else {
        const submissions = await trpcClient.submissions.getAllSubmissions({
            hackathonId,
        });

        projects = submissions.map((submission) => {
            const response = submission.response as Record<string, any>;
            return {
                id: submission.teamId,
                teamName: response[1] || `Team #${submission.teamId}`,
                displayId: response[0] || submission.teamId.toString(),
                0: submission.teamId.toString(),
                1: response[1] || `Team #${submission.teamId}`,
                2: response[2] || 'No track selected',
                3: response[3]?.[0] || '/hacker-portal-preview.webp',
                4:
                    getPlainTextFromRichText(response[4]) ||
                    'No description available',
            };
        });
        judgedProjects = null;
    }

    if (user?.userRole === 'judge') {
        return (
            <div className="flex h-full flex-col">
                {user && (
                    <ProjectList
                        projects={projects || []}
                        userData={user}
                        judgedProjects={judgedProjects || []}
                    />
                )}
            </div>
        );
    } else {
        return (
            <div className="flex h-full flex-col">
                {projects && <PublicProjectList projects={projects} />}
            </div>
        );
    }
}
