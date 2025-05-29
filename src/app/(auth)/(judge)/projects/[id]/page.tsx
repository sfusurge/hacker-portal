import JudgingForm from '@/components/projects/judge/JudgingForm';
import { FullPageInfo } from '@/components/ui/FullPageInfo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SectionRenderer } from '@/components/projects/ProjectSection';
import { createCaller } from '@/server/appRouter';
import { getUserData } from '@/server/routers/usersRouter';
import JudgingDrawer from '@/components/projects/judge/JudgingDrawer';
// import JudgingSideDrawer from '@/components/projects/judge/JudgingSideDrawer';

interface PageProps {
    params: {
        id: string;
    };
}

export default async function ProjectPage({ params }: PageProps) {
    const teamId = parseInt(params.id);
    if (isNaN(teamId)) {
        return (
            <FullPageInfo
                src="/teams/alone-otter.webp"
                title={'Invalid team ID'}
                body="Please provide a valid team ID."
            >
                <Button size="cozy" variant="brand" hierarchy="primary">
                    <Link href="/projects">Return to home</Link>
                </Button>
            </FullPageInfo>
        );
    }

    const user = await getUserData();
    const trpcClient = createCaller({});
    const activeHackathon = await trpcClient.hackathons.getActiveHackathon();
    const hackathonId = activeHackathon.id;

    const submission = await trpcClient.judging.getTeamSubmission({
        hackathonId,
        teamId: teamId,
    });

    const judgedProject = await trpcClient.judging.getJudgedProject({
        hackathonId,
        teamId,
    });

    const didJudge = judgedProject?.status === 'judged';

    if (!submission) {
        return (
            <FullPageInfo
                src="/teams/alone-otter.webp"
                title={'No submission found'}
                body="This team has not submitted their project yet."
            >
                <Button size="cozy" variant="brand" hierarchy="primary">
                    <Link href="/projects">Return to home</Link>
                </Button>
            </FullPageInfo>
        );
    }

    if (!submission.response) {
        return (
            <FullPageInfo
                src="/teams/alone-otter.webp"
                title={'No submission data found'}
                body="This team's submission is empty."
            >
                <Button size="cozy" variant="brand" hierarchy="primary">
                    <Link href="/projects">Return to home</Link>
                </Button>
            </FullPageInfo>
        );
    }

    const submissionData = submission.response as Record<string, any>;

    const projectSections = [
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

    return (
        <div className="grid h-full grid-cols-1 xl:grid-cols-3">
            <div className="h-full overflow-y-auto pb-32 md:pb-10 xl:col-span-2 xl:pb-10">
                <div className="flex flex-col gap-10 md:pr-6 xl:pr-10">
                    {projectSections.map((section, index) => (
                        <SectionRenderer
                            key={index}
                            section={section}
                            data={submissionData}
                        />
                    ))}
                </div>
            </div>

            <div className="block xl:hidden">
                <JudgingDrawer
                    hackathonId={hackathonId}
                    user={user}
                    teamId={teamId}
                    projectTitle={submissionData[1] || `Team #${teamId}`}
                />
            </div>

            {/* <div className="hidden md:block xl:hidden">
                <JudgingSideDrawer
                    hackathonId={hackathonId}
                    user={user}
                    teamId={teamId}
                    projectTitle={submissionData[1] || `Team #${teamId}`}
                    didJudge={didJudge}
                />
            </div> */}

            <div className="h-fill relative m-0 hidden overflow-hidden bg-neutral-900 pt-10 pb-0 xl:-mt-10 xl:-mr-10 xl:-mb-10 xl:inline-flex">
                <div className="w-fill mb-20 h-full overflow-y-auto p-6 py-0 md:mb-0 xl:col-span-1 xl:p-10 xl:py-0">
                    <JudgingForm
                        hackathonId={hackathonId}
                        user={user}
                        teamId={teamId}
                        projectTitle={submissionData[1] || `Team #${teamId}`}
                        didJudge={didJudge}
                    />
                </div>
            </div>
        </div>
    );
}
