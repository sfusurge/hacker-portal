import Image from 'next/image';
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormTextInput, Input } from '@/components/ui/input/input';
import { useState, useRef } from 'react';

export default function CreateTeamForm({
    onSubmit,
}: {
    onSubmit: (teamInfo: { teamName: string; teamPicture: string }) => void;
}) {
    const [teamInfo, setTeamInfo] = useState({
        teamName: '',
        teamPicture: '',
    });
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [disabled, setDisabled] = useState(true);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setError('File size must be less than 2MB.');
            return;
        }

        // Validate image dimensions (at least 200x200)
        const img = new window.Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            if (img.width < 200 || img.height < 200) {
                setError('Image must be at least 200px x 200px.');
                URL.revokeObjectURL(img.src);
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setTeamInfo((prevState) => ({
                    ...prevState,
                    teamPicture: reader.result as string,
                }));
                setError(null);
                updateDisabledState(teamInfo.teamName, reader.result as string);
            };
            reader.readAsDataURL(file);
        };
        img.onerror = () => {
            setError('Invalid image file.');
            URL.revokeObjectURL(img.src);
        };
    };

    const handleTeamNameChange = (value: string | number) => {
        const newTeamName = value as string;
        setTeamInfo((prevState) => ({
            ...prevState,
            teamName: newTeamName,
        }));
        updateDisabledState(newTeamName, teamInfo.teamPicture);
    };

    const updateDisabledState = (teamName: string, teamPicture: string) => {
        setDisabled(!teamName || !teamPicture);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamInfo.teamName || !teamInfo.teamPicture) {
            setError('Please fill out all required fields.');
            return;
        }
        onSubmit(teamInfo);
    };

    return (
        <form onSubmit={handleFormSubmit}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create new team</DialogTitle>
                    <DialogDescription>
                        Help organizers identify your team with a name and icon.
                        Be warned - this information can&apos;t be changed.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-8">
                    <div className="flex gap-6 text-white/60">
                        <Image
                            src={teamInfo.teamPicture || '/teams/default.webp'}
                            alt="Team picture"
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded-xl"
                        />
                        <div className="flex flex-col gap-3">
                            <label className="block text-sm font-medium">
                                Team picture *
                            </label>
                            <Input
                                type="file"
                                id="file-upload"
                                className="hidden w-auto"
                                accept=".png, .jpeg"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                required
                            />
                            <div className="flex gap-1">
                                <label
                                    htmlFor="file-upload"
                                    className="cursor-pointer"
                                >
                                    <Button
                                        variant="default"
                                        hierarchy="primary"
                                        size="compact"
                                        className="w-max"
                                        onClick={handleButtonClick}
                                        type="button"
                                    >
                                        Upload
                                    </Button>
                                </label>
                                {teamInfo.teamPicture && (
                                    <Button
                                        variant="default"
                                        hierarchy="tertiary"
                                        size="compact"
                                        className="hover:bg-neutral-750/60 border-2 border-transparent underline underline-offset-4"
                                        onClick={() => {
                                            setTeamInfo((prevState) => ({
                                                ...prevState,
                                                teamPicture: '',
                                            }));
                                            updateDisabledState(
                                                teamInfo.teamName,
                                                ''
                                            );
                                        }}
                                        type="button"
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                            <p className="text-xs">
                                .png, jpeg files up to 2 MB <br /> At least
                                200px x 200px
                            </p>
                        </div>
                    </div>
                    <div className="relative flex flex-col gap-3">
                        <label
                            htmlFor="teamName"
                            className="text-sm font-medium text-white/60"
                        >
                            Team name *
                        </label>
                        <FormTextInput
                            type="text"
                            name="teamName"
                            defaultValue={teamInfo.teamName}
                            onLazyChange={handleTeamNameChange}
                            className="border border-neutral-600/60 bg-neutral-800/60"
                            maxLength={25}
                            required
                            lazy={true}
                            errorMsg={
                                teamInfo.teamName === '' &&
                                'Team name already taken. Please choose another name.'
                                    ? 'Team name is required.'
                                    : undefined
                            }
                        />
                        <p className="text-danger-400 absolute -bottom-6 text-xs">
                            {error}
                        </p>
                    </div>
                </div>
                <DialogFooter className="grid grid-cols-2 gap-3 text-base">
                    <DialogTrigger asChild className="w-full">
                        <Button
                            variant={'default'}
                            size={'cozy'}
                            hierarchy={'secondary'}
                            type="button"
                        >
                            Cancel
                        </Button>
                    </DialogTrigger>
                    <Button
                        type="submit"
                        variant="brand"
                        size="cozy"
                        hierarchy="primary"
                        disabled={disabled}
                        onClick={(event) => handleFormSubmit(event)}
                    >
                        Create team
                    </Button>
                </DialogFooter>
            </DialogContent>
        </form>
    );
}
