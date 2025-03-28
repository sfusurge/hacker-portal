import { redirect } from 'next/navigation';
import { createCaller } from '@/server/appRouter';
import { Button } from '@/components/ui/button';
import CurrentStateUI from '@/components/team/NoTeam/CurrentState';
import Link from 'next/link';
import JoinTeamButton from '@/components/team/NoTeam/JoinTeamButton';

export default async function InvitePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const displayId = id;

    // Validate display ID
    if (!displayId || displayId.length !== 6) {
        redirect('/team');
    }

    const trpcClient = createCaller({});

    // TODO: Join Team, Team Full, already in a Team, Team not found (ex. Invite is referencing an inactive hackathon or id is invalid), Team joining is disabled,
    try {
        const team = await trpcClient.teams.getTeamByDisplayId({
            teamDisplayId: displayId,
        });

        if (!team) {
            return (
                <CurrentStateUI
                    title="Team Not Found"
                    description="The team you're trying to join doesn't exist or the invite link is invalid."
                />
            );
        }

        const actionButtons = (
            <div className="grid w-full gap-3 sm:grid-cols-2">
                <Link href="/team">
                    <Button
                        variant="default"
                        size="cozy"
                        hierarchy="secondary"
                        className="w-full"
                    >
                        Cancel
                    </Button>
                </Link>

                <JoinTeamButton teamDisplayId={displayId} className="w-full" />
            </div>
        );

        return (
            <CurrentStateUI
                title="Team Invitation!"
                description={`You've been invited to join the team, ${team.name}.`}
                buttons={actionButtons}
                imageSrc="/login/application-review.webp"
            />
        );
    } catch (error) {
        console.error('Error in invite page:', error);
        return (
            <CurrentStateUI
                title="Team Not Found"
                description="The team you're trying to join doesn't exist or the invite link is invalid."
                buttons={
                    <>
                        <Link href="/team" className="w-full">
                            <Button
                                variant="default"
                                size="cozy"
                                hierarchy="secondary"
                                className="w-full"
                            >
                                Go back home
                            </Button>
                        </Link>
                    </>
                }
            />
        );
    }
}
