import { redirect } from 'next/navigation';
import { createCaller } from '@/server/appRouter';
import SubmissionInfoCard from '@/components/team/submit/SubmissionInfoCard';
import SubmissionCard from '@/components/team/submit/SubmissionCard';
import TeamListSubmit from '@/components/team/submit/TeamListSubmit';

import { getUserData } from '@/server/routers/usersRouter';
import { SubmitFormCard } from '@/components/team/InTeam/SubmitFormCard';

import { GoHome } from '@/components/home/GoHome';

export default async function SubmitPage() {
    const user = await getUserData();

    if (!user) {
        redirect('/login');
    }

    const now = new Date();
    const pstNow = new Date(
        now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
    );
    const deadline = new Date('2025-05-29T00:30:00');

    if (pstNow > deadline) {
        return <GoHome title="Submission deadline has passed!" />;
    }

    const trpcClient = createCaller({});
    const hackathon = await trpcClient.hackathons.getActiveHackathon();

    const application = await trpcClient.applications.getCurrentApplication({
        hackathonId: hackathon.id,
    });

    const currentTeam = await trpcClient.teams.getCurrentTeam({
        hackathonId: hackathon.id,
    });

    if (!currentTeam) {
        return <GoHome title="You are not in a team yet!" />;
    }

    if (!application || application.currentStatus !== 'Accepted') {
        return <GoHome title="You were not accepted in this event!" />;
    }

    const teamPictureUrl = currentTeam?.teamPictureUrl;

    // const image = teamPictureUrl
    //               .getFile({
    //               key: teamPictureUrl,
    //               bucketName: 'team-pictures',
    //           })
    //           .catch((error) => {
    //               console.error('Error fetching image:', error);
    //               return null;
    //           })
    //     : null;

    const questions = await trpcClient.submissions.getSubmissionQuestions({
        hackathonId: hackathon.id,
    });

    const submitted = await trpcClient.submissions.getHasSubmissions({
        userId: user.id,
    });
    if (submitted.hasSubmission) {
        return <GoHome title="Your team submitted a project already!" />;
    }

    // const presignurl = await trpcClient.files.getFile({
    //     key: "77386352-1c41-4c0b-acb8-f2a17215fe41",
    //     bucketName: "team-pictures"
    // })
    //
    // console.log(presignurl)
    //

    // just to be safe
    if (!currentTeam) {
        return false;
    }

    return (
        <div className="flex w-full flex-col gap-6 md:flex-row md:items-start">
            <div className="flex w-full flex-col gap-6 lg:flex-row">
                <div className="flex flex-col gap-8 lg:max-w-1/4 lg:self-start">
                    <SubmissionInfoCard />
                    <TeamListSubmit
                        currentUserEmail={user!.email}
                        team={currentTeam}
                    />
                </div>

                <div className="flex flex-1 flex-col">
                    <div className="flex-1 md:max-h-[calc(100vh)] md:overflow-y-auto">
                        <SubmitFormCard teamId={currentTeam.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
