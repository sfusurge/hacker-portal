'use client';
import { Button } from '@/components/ui/button';
import { FormSeparator } from '@/components/ui/form-separator';
import {
    ResponsiveDialog,
    ResponsiveDialogTrigger,
} from '@/components/ui/responsive-dialog';
import JoinTeamForm from './JoinTeamForm';
import CreateTeamForm from './CreateTeamForm';
import { cn } from '@/lib/utils';

export default function JoinTeam({
    hackathonId,
    compact = false,
}: {
    hackathonId: number;
    compact?: boolean;
}) {
    return (
        <div
            className={cn(
                'grid w-full gap-3',
                compact ? 'grid-cols-2' : 'lg:grid-cols-2'
            )}
        >
            <ResponsiveDialog>
                <ResponsiveDialogTrigger asChild>
                    <Button
                        size={compact ? 'compact' : 'cozy'}
                        variant="default"
                        hierarchy={compact ? 'primary' : 'secondary'}
                        className="w-full px-5 text-sm"
                    >
                        <span className="inline-flex items-center whitespace-nowrap">
                            Join
                            {compact ? (
                                <span className="hidden sm:inline">
                                    &nbsp;existing
                                </span>
                            ) : (
                                <span>&nbsp;existing</span>
                            )}
                            &nbsp;team
                        </span>
                    </Button>
                </ResponsiveDialogTrigger>
                <JoinTeamForm />
            </ResponsiveDialog>

            {!compact && (
                <div className="lg:hidden">
                    <FormSeparator separatorText="OR" />
                </div>
            )}

            <ResponsiveDialog>
                <ResponsiveDialogTrigger asChild>
                    <Button
                        size={compact ? 'compact' : 'cozy'}
                        variant="default"
                        hierarchy={compact ? 'primary' : 'secondary'}
                        className="w-full px-5 text-sm"
                    >
                        <span className="inline-flex items-center whitespace-nowrap">
                            Create
                            {compact ? (
                                <span className="hidden sm:inline">
                                    &nbsp;new
                                </span>
                            ) : (
                                <span>&nbsp;new</span>
                            )}
                            &nbsp;team
                        </span>
                    </Button>
                </ResponsiveDialogTrigger>
                <CreateTeamForm hackathonId={hackathonId} />
            </ResponsiveDialog>
        </div>
    );
}
