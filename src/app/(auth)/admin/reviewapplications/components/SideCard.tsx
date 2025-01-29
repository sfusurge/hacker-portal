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
                hackathonId: 1,
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
        <div className="flex flex-col z-20 w-5/12 h-screen bg-neutral-850 p-8 rounded-lg gap-4 shadow-lg border border-neutral-600/60">
            <div className="flex flex-row items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-white">
                    Hacker Application
                </h1>
                <button onClick={toggleSideCard} className="">
                    <XMarkIcon className="h-6 w-6 text-white" />
                </button>
            </div>
            <ScrollArea className="flex flex-col p-2 h-4/12 w-full bg-neutral-900 rounded-lg shadow-inner border border-neutral-600/60">
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
                                className="bg-neutral-800 text-white border border-neutral-700/18 w-1/2"
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
                                className="bg-neutral-800 text-white border border-neutral-700/18 w-1/2"
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
                                className="bg-neutral-800 text-white border border-neutral-700/18 w-1/2"
                            />
                        </div>

                        <RadioGroup value={major} onValueChange={setMajor}>
                            <Label className="text-white/60">Major</Label>
                            <div className="flex flex-col gap-2 w-1/2">
                                {allMajors.map((majorOption) => (
                                    <div
                                        className={`flex items-center space-x-2 pl-2 pr-2 pt-3 pb-3 rounded-lg cursor-pointer border ${
                                            major === majorOption
                                                ? 'bg-brand-950/60 border-brand-900'
                                                : 'bg-neutral-800/60 border border-neutral-600/60'
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
                                            className={`appearance-none w-5 h-5 rounded-full border ${
                                                major === majorOption
                                                    ? 'bg-brand-500 border-blue-800'
                                                    : 'bg-neutral-700 border-neutral-500'
                                            }`}
                                        />
                                        <Label
                                            htmlFor={majorOption}
                                            className="cursor-pointer text-white font-light"
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
                                className="bg-neutral-800 text-white border border-neutral-700/18 w-1/2"
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
                            className="bg-neutral-800 text-white border border-neutral-700/18 w-1/2"
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
                        <div className="flex flex-col gap-2 w-fit">
                            {[
                                'Individual',
                                'Individual looking for a team',
                                'Team (4 max)',
                            ].map((type) => (
                                <div
                                    className={`flex items-center space-x-2 pl-4 pr-4 pt-3 pb-3 rounded-lg cursor-pointer border ${
                                        participantType === type
                                            ? 'bg-brand-950/60 border-brand-900'
                                            : 'bg-neutral-800/60 border border-neutral-600/60'
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
                                        className={`appearance-none w-5 h-5 rounded-full border ${
                                            participantType === type
                                                ? 'bg-brand-500 border-blue-800'
                                                : 'bg-neutral-700 border-neutral-500'
                                        }`}
                                    />
                                    <Label
                                        htmlFor={type}
                                        className="cursor-pointer text-white font-light"
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

                        <div className="flex flex-col gap-5 ml-3">
                            {allDietaryRestrictions.map((restriction) => (
                                <div
                                    className="flex items-center space-x-2 "
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
                                        className="data-[state=checked]:bg-blue-500 border-brand-500 size-5"
                                    />
                                    <Label
                                        htmlFor={restriction}
                                        className="text-white font-light"
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
                        <div className="flex flex-col gap-2 w-fit">
                            {['Yes', 'No'].map((option) => (
                                <div
                                    className={`flex items-center space-x-2 pl-4 pr-4 pt-3 pb-3 rounded-lg cursor-pointer border ${
                                        (photoConsent ? 'Yes' : 'No') === option
                                            ? 'bg-brand-950/60 border-brand-900'
                                            : 'bg-neutral-800/60 border border-neutral-600/60'
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
                                        className={`appearance-none w-5 h-5 rounded-full border ${
                                            (photoConsent ? 'Yes' : 'No') ===
                                            option
                                                ? 'bg-brand-500 border-blue-800'
                                                : 'bg-neutral-700 border-neutral-500'
                                        }`}
                                    />
                                    <Label
                                        htmlFor={option}
                                        className="cursor-pointer text-white font-light"
                                    >
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </RadioGroup>
                </div>
            </ScrollArea>

            <section className="mt-6 p-4 border border-neutral-600/30 rounded-xl">
                <header className="text-lg font-bold mb-4">
                    Change Application Status
                </header>
                <div className="flex flex-wrap gap-5">
                    <Button
                        key={'Accept'}
                        className={`h-7 bg-success-950 text-success-300`}
                        onClick={() =>
                            handleChangeApplicationStatus('Accepted')
                        }
                    >
                        Accepted
                    </Button>
                    <Button
                        key={'Decline'}
                        className={`h-7 bg-danger-950 text-danger-300`}
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
