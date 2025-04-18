import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useAtom } from 'jotai/index';
import { sideCardAtom } from '@/app/(auth)/admin/reviewapplications/components/ReviewApplicationsTable';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

import { trpc } from '@/trpc/client';
import { EmailUser } from '@/db/schema/emails';
import { useHackathon } from '@/hooks/use-hackathon';

type SideCardProps = {
    toggleSideCard: () => void;
    setRefreshTable: React.Dispatch<React.SetStateAction<{}>>;
};

export const allWorkshops = [
    'Intro to GitHub (1 - 1:30pm)',
    'Intro to React.js (2 - 3pm)',
    'Intro to Figma (3 - 4pm)',
];
export const allAttendancePeriods = [
    'Half Day Workshops (12:30 - 4pm)',
    'Half Day PM Build (4 - 8:30pm)',
    'Full Day (12:30 - 8:30pm)',
];
export const allMajors = [
    'Business',
    'Computing Science',
    'Data Science',
    'Engineering',
    'Health Science',
    'Math',
    'SIAT',
    'Other..',
];

export const allDietaryRestrictions = [
    'Halal',
    'Vegetarian',
    'Vegan',
    'Pescatarian',
    'Gluten-free',
    'Kosher',
    'Dairy Free',
    'Egg Allergy',
    'Nut Allergy',
    'Seafood Allergy',
];

export default function SideCard({
    toggleSideCard,
    setRefreshTable,
}: SideCardProps) {
    const { hackathon } = useHackathon();

    const [sideCardInfo] = useAtom(sideCardAtom) || {};
    const [id, setId] = useState<number>(sideCardInfo?.id || 0);
    const [name, setName] = useState(sideCardInfo?.name || '');
    const [email, setEmail] = useState(sideCardInfo?.email || '');
    const [studentNumber, setStudentNumber] = useState(
        sideCardInfo?.studentNumber || ''
    );
    const [major, setMajor] = useState(sideCardInfo?.major || '');
    const [enrollmentYear, setEnrollmentYear] = useState(
        sideCardInfo?.enrollmentYear || ''
    );
    const [participantType, setParticipantType] = useState(
        sideCardInfo?.participantType || ''
    );
    const [teamMemberNames, setTeamMemberNames] = useState(
        sideCardInfo?.teamMemberNames || ''
    );
    const [dietaryRestrictions, setDietaryRestrictions] = useState(
        sideCardInfo?.dietaryRestrictions || []
    );
    const [photoConsent, setPhotoConsent] = useState(
        sideCardInfo?.photoConsent || false
    );

    const updateApplication =
        trpc.applications.updateApplicationStatus.useMutation();

    const handleChangeApplicationStatus = (
        status: 'Awaiting Review' | 'Accepted' | 'Declined' | 'Wait List'
    ) => {
        try {
            updateApplication.mutate({
                hackathonId: hackathon!.id,
                userId: id,
                status: status,
                pendingStatus: status,
            });
            console.log('Application status updated successfully!');
        } catch (error) {
            console.error('Failed to update application:', error);
        }
        setRefreshTable({
            userId: id,
            status: status,
            pendingStatus: status,
        });
        toggleSideCard();
    };

    // const updateTeamMember = (index: number, value: string) => {
    //     const updatedTeamMembers = [...teamMemberNames];
    //     updatedTeamMembers[index] = value;
    //     setTeamMemberNames(updatedTeamMembers);
    // };

    const updateDietaryRestriction = (
        restriction: string,
        isChecked: boolean | string
    ) => {
        if (isChecked) {
            setDietaryRestrictions([...dietaryRestrictions, restriction]);
        } else {
            setDietaryRestrictions(
                dietaryRestrictions.filter((item) => item !== restriction)
            );
        }
    };

    return (
        <div className="bg-neutral-850 z-20 flex h-screen w-5/12 flex-col gap-4 rounded-lg border border-neutral-600/60 p-8 shadow-lg">
            <div className="mb-4 flex flex-row items-center justify-between">
                <h1 className="text-xl font-bold text-white">
                    Hacker Application
                </h1>
                <button onClick={toggleSideCard} className="">
                    <XMarkIcon className="h-6 w-6 text-white" />
                </button>
            </div>
            <ScrollArea className="flex h-4/12 w-full flex-col rounded-lg border border-neutral-600/60 bg-neutral-900 p-2 shadow-inner">
                <div className="space-y-6 p-5">
                    <header className="text-lg font-bold text-white">
                        Personal Information
                    </header>

                    <div className="grid gap-4">
                        <div>
                            <Label className="text-white/60" htmlFor="name">
                                Name
                            </Label>
                            <Input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-1/2 border border-neutral-700/18 bg-neutral-800 text-white"
                            />
                        </div>

                        <div>
                            <Label className="text-white/60" htmlFor="email">
                                Student Number
                            </Label>
                            <Input
                                type="studentNumber"
                                id="studentNumber"
                                value={studentNumber}
                                onChange={(e) =>
                                    setStudentNumber(e.target.value)
                                }
                                className="w-1/2 border border-neutral-700/18 bg-neutral-800 text-white"
                            />
                        </div>

                        <div>
                            <Label className="text-white/60" htmlFor="email">
                                Email
                            </Label>
                            <Input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-1/2 border border-neutral-700/18 bg-neutral-800 text-white"
                            />
                        </div>

                        <RadioGroup value={major} onValueChange={setMajor}>
                            <Label className="text-white/60">Major</Label>
                            <div className="flex w-1/2 flex-col gap-2">
                                {allMajors.map((majorOption) => (
                                    <div
                                        className={`flex cursor-pointer items-center space-x-2 rounded-lg border pt-3 pr-2 pb-3 pl-2 ${
                                            major === majorOption
                                                ? 'bg-brand-950/60 border-brand-900'
                                                : 'border border-neutral-600/60 bg-neutral-800/60'
                                        }`}
                                        key={majorOption}
                                        onClick={() => setMajor(majorOption)}
                                    >
                                        <RadioGroupItem
                                            value={majorOption}
                                            id={majorOption}
                                            onChange={() =>
                                                setMajor(majorOption)
                                            }
                                            className={`h-5 w-5 appearance-none rounded-full border ${
                                                major === majorOption
                                                    ? 'bg-brand-500 border-blue-800'
                                                    : 'border-neutral-500 bg-neutral-700'
                                            }`}
                                        />
                                        <Label
                                            htmlFor={majorOption}
                                            className="cursor-pointer font-light text-white"
                                        >
                                            {majorOption}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </RadioGroup>

                        <div>
                            <Label
                                className="text-white/60"
                                htmlFor="enrollmentYear"
                            >
                                Enrollment Year
                            </Label>
                            <Input
                                type="number"
                                id="enrollmentYear"
                                value={enrollmentYear}
                                onChange={(e) =>
                                    setEnrollmentYear(e.target.value)
                                }
                                className="w-1/2 border border-neutral-700/18 bg-neutral-800 text-white"
                            />
                        </div>
                    </div>

                    <header className="text-lg font-bold text-white">
                        Event Information
                    </header>

                    <div>
                        <Label className="text-white/60" htmlFor="email">
                            Team Member Names
                        </Label>
                        <Input
                            type="teamMemberNames"
                            id="teamMemberNames"
                            value={teamMemberNames}
                            onChange={(e) => setTeamMemberNames(e.target.value)}
                            className="w-1/2 border border-neutral-700/18 bg-neutral-800 text-white"
                        />
                    </div>

                    {/*<div className="grid gap-4">*/}
                    {/*    <Label className="text-white/60">Team Members</Label>*/}
                    {/*    {teamMemberNames.map((member, index) => (*/}
                    {/*        <Input*/}
                    {/*            key={index}*/}
                    {/*            type="text"*/}
                    {/*            value={member}*/}
                    {/*            onChange={(e) =>*/}
                    {/*                updateTeamMember(index, e.target.value)*/}
                    {/*            }*/}
                    {/*            placeholder={`Team Member ${index + 1}`}*/}
                    {/*            className="bg-neutral-800 text-white border border-neutral-700/18 w-1/2"*/}
                    {/*        />*/}
                    {/*    ))}*/}
                    {/*</div>*/}

                    <RadioGroup
                        value={participantType}
                        onValueChange={setParticipantType}
                    >
                        <Label className="text-white/60">
                            Participant Type
                        </Label>
                        <div className="flex w-fit flex-col gap-2">
                            {[
                                'Individual',
                                'Individual looking for a team',
                                'Team (4 max)',
                            ].map((type) => (
                                <div
                                    className={`flex cursor-pointer items-center space-x-2 rounded-lg border pt-3 pr-4 pb-3 pl-4 ${
                                        participantType === type
                                            ? 'bg-brand-950/60 border-brand-900'
                                            : 'border border-neutral-600/60 bg-neutral-800/60'
                                    }`}
                                    key={type}
                                    onClick={() => setParticipantType(type)}
                                >
                                    <RadioGroupItem
                                        value={type}
                                        id={type}
                                        onChange={() =>
                                            setParticipantType(type)
                                        }
                                        className={`h-5 w-5 appearance-none rounded-full border ${
                                            participantType === type
                                                ? 'bg-brand-500 border-blue-800'
                                                : 'border-neutral-500 bg-neutral-700'
                                        }`}
                                    />
                                    <Label
                                        htmlFor={type}
                                        className="cursor-pointer font-light text-white"
                                    >
                                        {type}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </RadioGroup>

                    <div className="flex flex-col gap-4">
                        <Label className="text-white/60">
                            Dietary Restrictions
                        </Label>

                        <div className="ml-3 flex flex-col gap-5">
                            {allDietaryRestrictions.map((restriction) => (
                                <div
                                    className="flex items-center space-x-2"
                                    key={restriction}
                                >
                                    <Checkbox
                                        id={restriction}
                                        checked={dietaryRestrictions.includes(
                                            restriction
                                        )}
                                        onCheckedChange={(isChecked) =>
                                            updateDietaryRestriction(
                                                restriction,
                                                isChecked
                                            )
                                        }
                                        className="border-brand-500 size-5 data-[state=checked]:bg-blue-500"
                                    />
                                    <Label
                                        htmlFor={restriction}
                                        className="font-light text-white"
                                    >
                                        {restriction}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <RadioGroup
                        value={photoConsent ? 'Yes' : 'No'}
                        onValueChange={(value) =>
                            setPhotoConsent(value === 'Yes')
                        }
                    >
                        <Label className="text-white/60">Photo Consent</Label>
                        <div className="flex w-fit flex-col gap-2">
                            {['Yes', 'No'].map((option) => (
                                <div
                                    className={`flex cursor-pointer items-center space-x-2 rounded-lg border pt-3 pr-4 pb-3 pl-4 ${
                                        (photoConsent ? 'Yes' : 'No') === option
                                            ? 'bg-brand-950/60 border-brand-900'
                                            : 'border border-neutral-600/60 bg-neutral-800/60'
                                    }`}
                                    key={option}
                                    onClick={() =>
                                        setPhotoConsent(option === 'Yes')
                                    }
                                >
                                    <RadioGroupItem
                                        value={option}
                                        id={option}
                                        onChange={() =>
                                            setPhotoConsent(option === 'Yes')
                                        }
                                        className={`h-5 w-5 appearance-none rounded-full border ${
                                            (photoConsent ? 'Yes' : 'No') ===
                                            option
                                                ? 'bg-brand-500 border-blue-800'
                                                : 'border-neutral-500 bg-neutral-700'
                                        }`}
                                    />
                                    <Label
                                        htmlFor={option}
                                        className="cursor-pointer font-light text-white"
                                    >
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </RadioGroup>
                </div>
            </ScrollArea>

            <section className="mt-6 rounded-xl border border-neutral-600/30 p-4">
                <header className="mb-4 text-lg font-bold">
                    Change Application Status
                </header>
                <div className="flex flex-wrap gap-5">
                    <Button
                        key={'Accept'}
                        className={`bg-success-950 text-success-300 h-7`}
                        onClick={() =>
                            handleChangeApplicationStatus('Accepted')
                        }
                    >
                        Accepted
                    </Button>
                    <Button
                        key={'Decline'}
                        className={`bg-danger-950 text-danger-300 h-7`}
                        onClick={() =>
                            handleChangeApplicationStatus('Declined')
                        }
                    >
                        Rejected
                    </Button>
                    <Button
                        key={'Waitlist'}
                        className={`h-7 bg-yellow-950 text-yellow-300`}
                        onClick={() =>
                            handleChangeApplicationStatus('Wait List')
                        }
                    >
                        Waitlisted
                    </Button>
                    <Button
                        key={'Awaiting Review'}
                        className={`h-7 bg-neutral-800 text-white`}
                        onClick={() =>
                            handleChangeApplicationStatus('Awaiting Review')
                        }
                    >
                        Await Review
                    </Button>
                </div>
            </section>
        </div>
    );
}
