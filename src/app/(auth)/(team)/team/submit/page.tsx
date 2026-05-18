import { redirect } from 'next/navigation';
import { createCaller } from '@/server/appRouter';
import { getCachedActiveHackathon } from '@/server/getCachedActiveHackathon';

import { getUserData } from '@/server/routers/usersRouter';

import { GoHome } from '@/components/home/GoHome';
import { isSubmissionWindowOpen } from '@/lib/submissionWindow';
import SubmissionInfoCard from '@/app/(auth)/(team)/teamComponents/submit/SubmissionInfoCard';
import { SubmitFormCard } from '@/app/(auth)/(team)/teamComponents/InTeam/SubmitFormCard';
import TeamListSubmit from '@/app/(auth)/(team)/teamComponents/submit/TeamListSubmit';
import { SubmissionSideBar } from '@/components/application_components/SubmissionSideBar';

export default async function SubmitPage() {
    const user = await getUserData();

    if (!user) {
        redirect('/login');
    }

    const trpcClient = createCaller({});
    const hackathon = await getCachedActiveHackathon();

    if (!hackathon) {
        return <GoHome title="There is no active hackathon." />;
    }

    const nowMs = Date.now();
    if (
        !isSubmissionWindowOpen(
            nowMs,
            hackathon.submissionOpen,
            hackathon.submissionDeadline
        )
    ) {
        if (
            hackathon.submissionOpen == null ||
            nowMs < hackathon.submissionOpen.getTime()
        ) {
            return (
                <GoHome title="Project submissions are not open yet. Check back when the submission period starts." />
            );
        }
        return (
            <GoHome title="The submission deadline has passed — you can no longer submit a project." />
        );
    }

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
        return (
            <GoHome title="You can't submit a project because you were not accepted to this event." />
        );
    }

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
                <SubmissionSideBar>
                    <SubmissionInfoCard />
                    <TeamListSubmit
                        currentUserEmail={user!.email}
                        team={currentTeam}
                    />
                </SubmissionSideBar>

                <div className="flex flex-1 flex-col">
                    <div className="flex-1 md:max-h-[calc(100vh)] md:overflow-y-auto">
                        <SubmitFormCard
                            teamId={currentTeam.id}
                            teamName={currentTeam.name}
                            teamPictureUrl={currentTeam.teamPictureUrl}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
