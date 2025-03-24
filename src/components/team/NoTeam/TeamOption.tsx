'use client';
import { Button } from '@/components/ui/button';
import { FormSeparator } from '@/components/ui/form-separator';
import {
    ResponsiveDialog,
    ResponsiveDialogTrigger,
} from '@/components/ui/responsive-dialog';
import JoinTeamForm from './JoinTeamForm';
import CreateTeamForm from './CreateTeamForm';

export default function JoinTeam({ hackathonId }: { hackathonId: number }) {
    return (
        <div className="grid w-full gap-3 lg:grid-cols-2">
            <ResponsiveDialog>
                <ResponsiveDialogTrigger asChild>
                    <Button
                        size="cozy"
                        variant="default"
                        hierarchy="secondary"
                        className="w-full px-5 text-sm"
                    >
                        Join existing team
                    </Button>
                </ResponsiveDialogTrigger>
                <JoinTeamForm />
            </ResponsiveDialog>

            <div className="lg:hidden">
                <FormSeparator separatorText="OR" />
            </div>

            <ResponsiveDialog>
                <ResponsiveDialogTrigger asChild>
                    <Button
                        size="cozy"
                        variant="default"
                        hierarchy="secondary"
                        className="w-full px-5 text-sm"
                    >
                        Create new team
                    </Button>
                </ResponsiveDialogTrigger>
                <CreateTeamForm hackathonId={hackathonId} />
            </ResponsiveDialog>
        </div>
    );
}
