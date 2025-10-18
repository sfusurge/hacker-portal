'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { FormTextInput, Input } from '@/components/ui/input/input';
import { Label } from '@/components/ui/label/label';
import { useState, useRef, useEffect, useMemo } from 'react';
import { trpc } from '@/trpc/client';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import {
    ResponsiveDialogContent,
    ResponsiveDialogHeader,
    ResponsiveDialogTitle,
    ResponsiveDialogDescription,
    ResponsiveDialogFooter,
    ResponsiveDialogClose,
} from '@/components/ui/responsive-dialog';
import { toast } from '@/hooks/use-toast';
import { UserGroupIcon } from '@heroicons/react/24/solid';
import { Conditional } from '@/lib/Conditional';
import useMediaQuery from 'beautiful-react-hooks/useMediaQuery';
import { uploadFileToBlob } from '@/utils/blobHelper';

export default function CreateTeamForm({
    hackathonId,
}: {
    hackathonId: number;
}) {
    const router = useRouter();
    const createTeam = trpc.teams.createTeam.useMutation();

    const isDesktop = useMediaQuery('(min-width: 768px)');

    const [teamInfo, setTeamInfo] = useState({
        teamName: '',
        teamPicture: '',
        isDirty: false,
    });
    const isTeamNameError = teamInfo.teamName === '' && teamInfo.isDirty;
    const errorMsg = isTeamNameError ? 'Team name is required.' : undefined;
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const disabled = useMemo(
        () => !teamInfo.teamName || !imageUrl || isCreating,
        [teamInfo, imageUrl, isCreating]
    );

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageUrl(URL.createObjectURL(file));
    };

    const handleTeamNameChange = (value: string | number) => {
        setTeamInfo((prevState) => ({
            ...prevState,
            teamName: value as string,
            isDirty: true,
        }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        setError(null);

        try {
            const file = fileInputRef.current?.files![0];

            if (!teamInfo.teamName || !file) {
                setError('Please fill out all required fields.');
                setIsCreating(false);
                return;
            }

            const fileName = await uploadFileToBlob(
                'team_icon',
                crypto.randomUUID(),
                file
            );

            const newTeam = await createTeam.mutateAsync({
                hackathonId,
                name: teamInfo.teamName,
                teamPictureUrl: fileName,
            });

            if (!newTeam) {
                throw new Error('Failed to create team');
            }

            toast({
                title: 'Team created!',
                description: `Your team ${newTeam.name} was successfully created.`,
                variant: 'default',
                icon: <UserGroupIcon />,
            });
            router.push(`/team`);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to create team. Please try again.');
        }
        setIsCreating(false);
    };

    const FormContent = (
        <form className="flex flex-col gap-8">
            {error && (
                <Alert variant={'warning'}>
                    <AlertTitle>Image upload failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <AvatarUpload
                type="team"
                size="sm"
                label="Team picture"
                currentImage={imageUrl || undefined}
                defaultImage="/teams/default.webp"
                helpText=".png, jpeg files up to 2 MB, at least 200px x 200px"
                required={true}
                disabled={isCreating}
                onFileChange={(file) => {
                    if (file) {
                        handleFileChange({
                            target: { files: [file] },
                        } as React.ChangeEvent<HTMLInputElement>);
                    } else {
                        setImageUrl(null);
                        if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                        }
                    }
                }}
                onImageUrlChange={(url) => setImageUrl(url || null)}
            />

            <div className="flex flex-col gap-3">
                <Label
                    required
                    htmlFor="teamName"
                    className="text-sm font-medium text-white/60"
                >
                    Team name
                </Label>
                <FormTextInput
                    type="search"
                    name="teamName"
                    lazy
                    defaultValue={teamInfo.teamName}
                    onLazyChange={handleTeamNameChange}
                    required
                    maxLength={25}
                    placeholder="Enter team name"
                    errorMsg={errorMsg}
                    disabled={isCreating}
                />
            </div>
        </form>
    );

    return (
        <ResponsiveDialogContent>
            <ResponsiveDialogHeader>
                <ResponsiveDialogTitle>Create new team</ResponsiveDialogTitle>
                <ResponsiveDialogDescription>
                    Help organizers identify your team with a name and icon. Be
                    warned – this information can&apos;t be changed.
                </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>

            {FormContent}

            <ResponsiveDialogFooter className="grid grid-cols-2 gap-3">
                <ResponsiveDialogClose asChild>
                    <Button
                        variant="default"
                        size="cozy"
                        hierarchy="secondary"
                        type="button"
                        disabled={isCreating}
                    >
                        Cancel
                    </Button>
                </ResponsiveDialogClose>
                <Button
                    type="submit"
                    variant="brand"
                    size="cozy"
                    hierarchy="primary"
                    disabled={disabled || isCreating}
                    onClick={handleFormSubmit}
                >
                    {isCreating ? 'Creating...' : 'Create team'}
                </Button>
            </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
    );
}
