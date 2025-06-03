import { createCaller, AppRouter } from '@/server/appRouter';
import { FullPageInfo } from '@/components/ui/FullPageInfo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SectionRenderer } from '@/components/projects/ProjectSection';
import { getUserData } from '@/server/routers/usersRouter';
import JudgingForm from '@/components/projects/judge/JudgingForm';
import JudgingDrawer from '@/components/projects/judge/JudgingDrawer';
import { inferProcedureOutput } from '@trpc/server';
import VoteButton from '@/components/projects/VoteButton';
import TeamCard from './TeamCard';

type GetSubmissionForTeamOutput = inferProcedureOutput<
    AppRouter['submissions']['getSubmissionForTeam']
>;
type GetTeamByIdOutput = inferProcedureOutput<
    AppRouter['teams']['getTeamById']
>;

interface PageProps {
    params: {
        id: string;
    };
}

export default async function ProjectPage({ params }: PageProps) {
    const trpcClient = createCaller({});
    const user = await getUserData();
    const activeHackathon = await trpcClient.hackathons.getActiveHackathon();
    const hackathonId = activeHackathon.id;

    let teamId: number;
    try {
        const team = await trpcClient.teams.resolveTeamIdentifier({
            identifier: params.id,
            hackathonId,
        });
        teamId = team.id;
    } catch (error) {
        return (
            <FullPageInfo
                src="/teams/alone-otter.webp"
                title={'Team not found'}
                body="The team you're looking for doesn't exist."
            >
                <Button size="cozy" variant="brand" hierarchy="primary">
                    <Link href="/projects">Return to projects</Link>
                </Button>
            </FullPageInfo>
        );
    }

    const userId = user?.id;

    let submission: GetSubmissionForTeamOutput | undefined;
    let judgedProject;
    let didJudge = false;
    let teamData: GetTeamByIdOutput | undefined;
    let isAssignedToJudge = false;

    submission = await trpcClient.submissions.getSubmissionForTeam({
        teamId,
    });
    const voted = await trpcClient.userVote.getHasUserVoted({
        userId: userId || 0,
        hackathonId,
    });

    if (user?.userRole === 'judge') {
        judgedProject = await trpcClient.judging.getJudgedProject({
            hackathonId,
            teamId,
        });

        didJudge = judgedProject?.status === 'judged';

        const assignedProjects = await trpcClient.judging.getJudgingProjects({
            hackathonId,
        });
        isAssignedToJudge = assignedProjects.some(
            (project) => project.teamId === teamId
        );
    }

    try {
        teamData = await trpcClient.teams.getTeamById({ teamId });
    } catch (error) {
        console.error('Error fetching team data:', error);
    }

    if (!submission) {
        return (
            <FullPageInfo
                src="/teams/alone-otter.webp"
                title={'No submission found'}
                body="This team has not submitted their project yet."
            >
                <Link
                    href="/projects"
                    className="flex w-full items-center justify-center"
                >
                    <Button size="cozy" variant="brand" hierarchy="primary">
                        Return to projects
                    </Button>
                </Link>
            </FullPageInfo>
        );
    }

    const membersWithImages = teamData?.members || [];

    const response = submission.response as Record<string, any>;
    response[0] = `${teamData?.name || 'Unnamed Team'}\n${
        teamData?.members
            .map((member) =>
                `${member.firstName || ''} ${member.lastName || ''}`.trim()
            )
            .filter(Boolean)
            .join(', ') || 'No members'
    }`;

    const baseSections = [
        {
            type: 'title' as const,
            title: 'Project Title',
            field: 1,
        },
        {
            type: 'badge' as const,
            title: 'Project Track',
            field: 2,
        },
        {
            type: 'text' as const,
            title: 'Team',
            field: 0,
        },
        {
            type: 'image' as const,
            title: 'Project Header',
            field: 3,
        },
        {
            type: 'rich-text' as const,
            title: 'Description',
            field: 4,
        },
        {
            type: 'embed' as const,
            title: 'Video Pitch',
            field: 6,
        },
        {
            type: 'pdf' as const,
            title: 'Process Documentation',
            field: 5,
        },
        {
            type: 'embed' as const,
            title: 'Prototype Link',
            field: 7,
        },
        {
            type: 'pdf' as const,
            title: 'Slide Deck',
            field: 8,
        },
        {
            type: 'rich-text' as const,
            title: 'Additional comments',
            field: 9,
        },
    ];

    const judgeOnlySections = [
        {
            type: 'text' as const,
            title: 'Did the team use Protopie to create their interactive prototype?',
            field: 10,
        },
        {
            type: 'text' as const,
            title: 'Did the team use AI to generate any visuals for this project?',
            field: 11,
        },
        {
            type: 'text' as const,
            title: 'Did the team properly cite all external resources (e.g. fonts, icon libraries, component libraries) used for this project in the process documentation deliverable?',
            field: 12,
        },
        {
            type: 'text' as const,
            title: 'Did the team clearly cite all AI tools or services used in this project and identify what they were used for (e.g. ideation, brainstorming)?',
            field: 13,
        },
        {
            type: 'text' as const,
            title: 'Do you consent to us sharing your project title, description, and visuals on our website and social media platforms to showcase your work?',
            field: 14,
        },
    ];

    const projectSections =
        user?.userRole === 'judge' || user?.userRole === 'admin'
            ? [...baseSections, ...judgeOnlySections]
            : baseSections;

    const isOwnProject = teamData?.members.some(
        (member) => member.userId === user?.id
    );

    if (user?.userRole === 'judge') {
        return (
            <div className="grid h-full grid-cols-1 xl:grid-cols-3">
                <div className="h-full overflow-y-auto pb-48 md:pb-10 xl:col-span-2 xl:pb-10">
                    <div className="flex flex-col gap-10 md:pr-6 xl:pr-10">
                        <Link href="/projects" className="block md:hidden">
                            <Button
                                variant={'default'}
                                hierarchy={'secondary'}
                                size="cozy"
                            >
                                Return to Projects
                            </Button>
                        </Link>
                        {projectSections.map((section, index) => (
                            <SectionRenderer
                                key={index}
                                section={section}
                                data={response}
                            />
                        ))}
                    </div>
                </div>

                <div className="block xl:hidden">
                    <JudgingDrawer
                        didJudge={didJudge}
                        hackathonId={hackathonId}
                        user={user}
                        teamId={teamId}
                        projectTitle={response[1] || `Team #${teamId}`}
                        isAssignedToJudge={isAssignedToJudge}
                    />
                </div>

                <div className="h-fill relative m-0 hidden overflow-hidden bg-neutral-900 pt-10 pb-0 xl:-mt-10 xl:-mr-10 xl:-mb-10 xl:inline-flex">
                    <div className="w-fill mb-20 h-full overflow-y-auto p-6 py-0 md:mb-0 xl:col-span-1 xl:p-10 xl:py-0">
                        <JudgingForm
                            hackathonId={hackathonId}
                            user={user}
                            teamId={teamId}
                            projectTitle={response[1] || `Team #${teamId}`}
                            didJudge={didJudge}
                            isAssignedToJudge={isAssignedToJudge}
                        />
                    </div>
                </div>
            </div>
        );
    }

    const alreadyVoted = voted?.hasVoted || false;

    const application = await trpcClient.applications.getCurrentApplication({
        hackathonId: hackathonId,
    });

    return (
        <div className="flex h-full flex-col">
            <div className="m-0 flex flex-grow flex-col overflow-hidden md:-m-10 lg:m-0 lg:flex-row lg:gap-10">
                <div className="hidden flex-shrink-0 lg:block lg:w-1/4">
                    {teamData && (
                        <TeamCard
                            teamData={teamData}
                            isOwnProject={isOwnProject || false}
                        />
                    )}
                </div>

                <div className="lg:border-neutral-750 flex-grow overflow-y-auto p-0 md:mb-0 md:p-10 lg:rounded-xl lg:border lg:bg-neutral-900 lg:pb-0">
                    <div className="space-y-8 pb-32 md:pb-8">
                        <Link href="/projects" className="mb-8 block md:hidden">
                            <Button
                                variant={'default'}
                                hierarchy={'secondary'}
                                size="cozy"
                            >
                                Return to Projects
                            </Button>
                        </Link>
                        {projectSections.map((section, index) => (
                            <SectionRenderer
                                key={index}
                                section={section}
                                data={response}
                            />
                        ))}
                    </div>
                    <div className="fixed bottom-0 left-0 z-[105] block w-full bg-neutral-800/60 px-10 py-6 backdrop-blur-lg md:sticky md:-mx-6 md:hidden lg:-mx-10 lg:block lg:w-auto">
                        <div className="mx-auto flex w-full flex-col items-center justify-between gap-4">
                            <div className="flex w-full items-center justify-end">
                                <VoteButton
                                    projectTitle={
                                        response[1] || `Team #${teamId}`
                                    }
                                    teamId={teamId}
                                    hackathonId={hackathonId}
                                    userId={user?.id || 0}
                                    alreadyVoted={alreadyVoted}
                                    applicationStatus={
                                        application?.currentStatus
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="sticky bottom-0 left-0 z-[105] hidden w-full bg-neutral-800/60 px-10 py-6 backdrop-blur-lg md:-mx-6 md:block lg:-mx-10 lg:hidden lg:w-auto">
                    <div className="mx-auto flex w-full flex-col items-center justify-between gap-4">
                        <div className="flex w-full items-center justify-end">
                            <VoteButton
                                projectTitle={response[1] || `Team #${teamId}`}
                                teamId={teamId}
                                hackathonId={hackathonId}
                                userId={user?.id || 0}
                                alreadyVoted={alreadyVoted}
                                applicationStatus={application?.currentStatus}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
