import JudgingForm from '@/components/projects/judge/JudgingForm';
import { FullPageInfo } from '@/components/ui/FullPageInfo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { projectsData } from '../projects';
import { SectionRenderer } from '@/components/projects/ProjectSection';
import { createCaller } from '@/server/appRouter';
import { getUserData } from '@/server/routers/usersRouter';
import slugify from '@/utils/slugify';
interface PageProps {
    params: {
        id: string;
    };
}

const projectSections = [
    {
        type: 'title',
        title: 'Project Title',
        field: 1,
    },
    {
        type: 'badge',
        title: 'Project Track',
        field: 4,
    },
    {
        type: 'image',
        title: 'Project Header',
        src: '/hacker-portal-preview.webp',
        field: 1,
    },
    {
        type: 'text',
        title: 'Description',
        field: 2,
    },
    {
        type: 'video',
        title: 'Video Pitch',
        field: 3,
    },
    {
        type: 'pdf',
        title: 'Process Documentation',
        url: 'https://pub-65990e7b450b4832886d09e5cef12aff.r2.dev/SparkJam%20Submission%20Form.pdf',
    },
    {
        type: 'text',
        title: 'Did the team use AI to generate any visuals for this project?',
        field: 5,
    },
    {
        type: 'text',
        title: 'Did the team properly cite all external resources (e.g. fonts, icons libraries, component libraries) used for this project in the process documentation deliverable?',
        field: 6,
    },
    {
        type: 'text',
        title: 'Did the team clearly cite all AI tools or services used in this project and identify what they were used for (e.g. ideation, brainstorming)?',
        field: 7,
    },
];

export default async function ProjectPage({ params }: PageProps) {
    const { id } = await params;

    // TODO: Route to team name or team display Id or add team identifer
    const decodedId = slugify(id);
    const project = projectsData.find((p) => slugify(p[1]) === decodedId);

    if (!project) {
        return (
            <FullPageInfo
                src="/teams/alone-otter.webp"
                title={'Sorry, we cannot find this project.'}
                body="Stay tuned."
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

    return (
        <div className="grid h-full grid-cols-1 xl:grid-cols-3">
            <div className="h-full overflow-y-auto pb-20 md:pb-10 xl:col-span-2">
                <div className="flex flex-col gap-10 md:pr-6 xl:pr-10">
                    {projectSections.map((section, index) => (
                        <SectionRenderer
                            key={index}
                            section={section}
                            data={project}
                        />
                    ))}
                </div>
            </div>

            <div className="h-fill relative m-0 overflow-hidden bg-neutral-900 pt-10 pb-0 xl:-mt-10 xl:-mr-10 xl:-mb-10">
                <div className="w-fill mb-20 h-full overflow-y-auto p-6 py-0 md:mb-0 xl:col-span-1 xl:p-10 xl:py-0">
                    <JudgingForm
                        hackathonId={hackathonId}
                        user={user}
                        teamId={Number(project[0])}
                        projectTitle={project[1]}
                    />
                </div>
            </div>
        </div>
    );
}
