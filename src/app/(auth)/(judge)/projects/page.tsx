import ProjectList from '@/components/projects/ProjectList';
import { projectsData } from './projects';
import { createCaller } from '@/server/appRouter';
import { getUserData } from '@/server/routers/usersRouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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

            return {
                ...assignment,
                submission,
            };
        })
    );

    const judgedProjects = await trpcClient.judging.getJudgedProjects({
        judgeId: data.id,
        hackathonId: activeHackathon.id,
    });

    const judgedProjectIds = new Set(judgedProjects.map((jp) => jp.teamId));

    return (
        <>
            <ProjectList
                projects={projectsData}
                userData={data}
                judgedProjects={judgedProjects}
            />
            <div className="container mx-auto py-6">
                <h1 className="mb-6 text-2xl font-bold">
                    Projects Assigned to Judge{' '}
                    {/* TODO: DONT DISPLAY UNSUBMITTED PROJECTS */}
                </h1>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projectsWithSubmissions.map((project) => (
                        <Card key={project.teamId} className="h-full">
                            <CardHeader>
                                <CardTitle>
                                    {project.teamName ||
                                        `Team #${project.teamId}`}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex h-full flex-col">
                                <div className="flex-1">
                                    <p className="mb-2">
                                        <span className="font-semibold">
                                            Status:
                                        </span>{' '}
                                        {project.status}
                                    </p>
                                    <p className="mb-4">
                                        <span className="font-semibold">
                                            Submission:
                                        </span>{' '}
                                        {project.submission
                                            ? 'Available'
                                            : 'Not submitted yet'}
                                    </p>
                                </div>

                                <div className="mt-auto">
                                    {project.submission ? (
                                        <Link
                                            href={`/projects/${project.teamId}`}
                                            passHref
                                        >
                                            <Button className="w-full">
                                                {judgedProjectIds.has(
                                                    project.teamId
                                                )
                                                    ? 'Review Judging'
                                                    : 'Judge Project'}
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button disabled className="w-full">
                                            Waiting for Submission
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {projectsWithSubmissions.length === 0 && (
                        <div className="col-span-full py-12 text-center">
                            <p className="text-lg text-neutral-500">
                                You don&apos;t have any projects assigned to
                                judge yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
