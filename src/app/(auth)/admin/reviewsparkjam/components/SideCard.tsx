import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useAtomValue } from 'jotai/index';
import { sideCardAtomSJ } from '@/app/(auth)/admin/reviewsparkjam/components/ReviewApplicationsTable';
import { Button } from '@/components/ui/button';

import { trpc } from '@/trpc/client';
import { useHackathon } from '@/hooks/use-hackathon';
import { FormTextInput } from '@/components/ui/input/input';

type SideCardProps = {
    toggleSideCard: () => void;
    setRefreshTable: React.Dispatch<React.SetStateAction<{}>>;
};

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

export const YEAR_OF_STUDY_OPTIONS = ['1', '2', '3', '4', '5-7', '8+'];

export const DESIGN_TOPICS_OPTIONS = [
    'User Interface Design',
    'User Experience Design',
    'Interaction Design',
    'User Experience Research',
    'Product Design',
    'Branding',
    'Motion Design',
    'Graphic Design',
    'Service Design',
    'Design Engineering',
    'Design Systems',
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

export const HEARD_ABOUT_OPTIONS = [
    'Social media (Instagram, Discord, etc.)',
    'Word of mouth',
    'Website',
    'Flyer or poster',
    'Collaborating organization',
    'Online community (e.g., Reddit, LinkedIn)',
];

export default function SideCard({
    toggleSideCard,
    setRefreshTable,
}: SideCardProps) {
    const { hackathon } = useHackathon();

    const sideCardInfo = useAtomValue(sideCardAtomSJ);

    console.log(sideCardInfo);

    const [userId, setUserId] = useState<number>(sideCardInfo?.id || 0);

    const [firstName, setFirstName] = useState(sideCardInfo?.firstName || '');
    const [lastName, setLastName] = useState(sideCardInfo?.lastName || '');
    const [pronouns, setPronouns] = useState(sideCardInfo?.pronouns || '');
    const [email, setEmail] = useState(sideCardInfo?.email || '');
    const [phoneNumber, setPhoneNumber] = useState(
        sideCardInfo?.phoneNumber || ''
    );
    const [school, setSchool] = useState(sideCardInfo?.school || '');
    const [major, setMajor] = useState(sideCardInfo?.major || '');
    const [yearOfStudy, setYearOfStudy] = useState(
        sideCardInfo?.yearOfStudy || ''
    );
    const [attendedDesignJam, setAttendedDesignJam] = useState(
        sideCardInfo?.attendedDesignJam || ''
    );
    const [howManyJams, setHowManyJams] = useState(
        sideCardInfo?.howManyJams || ''
    );
    const [passionateAreas, setPassionateAreas] = useState(
        sideCardInfo?.passionateAreas || []
    );
    const [whyInterested, setWhyInterested] = useState(
        sideCardInfo?.whyInterested || ''
    );
    const [whatHopeLearn, setWhatHopeLearn] = useState(
        sideCardInfo?.whatHopeLearn || ''
    );
    const [dietaryRestrictions, setDietaryRestrictions] = useState(
        sideCardInfo?.dietaryRestrictions || []
    );
    const [howHeardAbout, setHowHeardAbout] = useState(
        sideCardInfo?.howHeardAbout || []
    );
    const [photoConsent, setPhotoConsent] = useState(
        sideCardInfo?.photoConsent || false
    );

    const updateApplication =
        trpc.applications.updateApplicationStatus.useMutation();

    const handleChangeApplicationStatus = (
        status:
            | 'Awaiting Review'
            | 'Accepted'
            | 'Declined'
            | 'Wait List'
            | 'Accepted - Pending Payment'
    ) => {
        try {
            updateApplication.mutate({
                hackathonId: hackathon!.id,
                userId: userId,
                status: status,
                pendingStatus: status,
            });
            console.log('Application status updated successfully!');
        } catch (error) {
            console.error('Failed to update application:', error);
        }
        setRefreshTable({
            userId: userId,
            status: status,
            pendingStatus: status,
        });
        toggleSideCard();
    };

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
                            <Label
                                className="text-white/60"
                                htmlFor="firstName"
                            >
                                First Name
                            </Label>
                            <Input
                                type="text"
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-1/2 border border-neutral-700/18 bg-neutral-800 text-white"
                            />
                        </div>

                        <div>
                            <Label className="text-white/60" htmlFor="lastName">
                                Last Name
                            </Label>
                            <Input
                                type="text"
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-1/2 border border-neutral-700/18 bg-neutral-800 text-white"
                            />
                        </div>

                        <div>
                            <Label className="text-white/60" htmlFor="pronouns">
                                Pronouns
                            </Label>
                            <Input
                                type="text"
                                id="pronouns"
                                value={pronouns}
                                onChange={(e) => setPronouns(e.target.value)}
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

                        <div>
                            <Label
                                className="text-white/60"
                                htmlFor="phoneNumber"
                            >
                                Phone Number
                            </Label>
                            <Input
                                type="number"
                                id="phoneNumber"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-1/2 border border-neutral-700/18 bg-neutral-800 text-white"
                            />
                        </div>

                        <div>
                            <Label className="text-white/60" htmlFor="school">
                                School
                            </Label>
                            <Input
                                type="text"
                                id="school"
                                value={school}
                                onChange={(e) => setSchool(e.target.value)}
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

                        <RadioGroup
                            value={yearOfStudy}
                            onValueChange={setYearOfStudy}
                        >
                            <Label className="text-white/60">
                                Current Year of Study
                            </Label>
                            <div className="flex w-1/2 flex-col gap-2">
                                {YEAR_OF_STUDY_OPTIONS.map(
                                    (yearOfStudyOption) => (
                                        <div
                                            className={`flex cursor-pointer items-center space-x-2 rounded-lg border pt-3 pr-2 pb-3 pl-2 ${
                                                yearOfStudy ===
                                                yearOfStudyOption
                                                    ? 'bg-brand-950/60 border-brand-900'
                                                    : 'border border-neutral-600/60 bg-neutral-800/60'
                                            }`}
                                            key={yearOfStudyOption}
                                            onClick={() =>
                                                setMajor(yearOfStudyOption)
                                            }
                                        >
                                            <RadioGroupItem
                                                value={yearOfStudyOption}
                                                id={yearOfStudyOption}
                                                onChange={() =>
                                                    setMajor(yearOfStudyOption)
                                                }
                                                className={`h-5 w-5 appearance-none rounded-full border ${
                                                    yearOfStudy ===
                                                    yearOfStudyOption
                                                        ? 'bg-brand-500 border-blue-800'
                                                        : 'border-neutral-500 bg-neutral-700'
                                                }`}
                                            />
                                            <Label
                                                htmlFor={yearOfStudyOption}
                                                className="cursor-pointer font-light text-white"
                                            >
                                                {yearOfStudyOption}
                                            </Label>
                                        </div>
                                    )
                                )}
                            </div>
                        </RadioGroup>
                    </div>

                    <header className="text-lg font-bold text-white">
                        Design Skills and Experience
                    </header>

                    <RadioGroup
                        value={attendedDesignJam}
                        onValueChange={(value) => setAttendedDesignJam(value)}
                    >
                        <Label className="text-white/60">Photo Consent</Label>
                        <div className="flex w-fit flex-col gap-2">
                            {['Yes', 'No'].map((option) => (
                                <div
                                    className={`flex cursor-pointer items-center space-x-2 rounded-lg border pt-3 pr-4 pb-3 pl-4 ${
                                        attendedDesignJam === option
                                            ? 'bg-brand-950/60 border-brand-900'
                                            : 'border border-neutral-600/60 bg-neutral-800/60'
                                    }`}
                                    key={option}
                                    onClick={() => setAttendedDesignJam(option)}
                                >
                                    <RadioGroupItem
                                        value={option}
                                        id={option}
                                        onChange={() =>
                                            setAttendedDesignJam(option)
                                        }
                                        className={`h-5 w-5 appearance-none rounded-full border ${
                                            attendedDesignJam === option
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

                    <div>
                        <Label
                            className="text-white/60"
                            htmlFor="attendedDesignJam"
                        >
                            Number of Design Jams Attended
                        </Label>
                        <Input
                            type="text"
                            id="attendedDesignJam"
                            value={howManyJams}
                            onChange={(e) => setHowManyJams(e.target.value)}
                            className="w-1/2 border border-neutral-700/18 bg-neutral-800 text-white"
                        />
                    </div>

                    <div>
                        <Label
                            className="text-white/60"
                            htmlFor="passionateAreas"
                        >
                            Passionate Areas
                        </Label>
                        <Input
                            type="text"
                            id="passionateAreas"
                            value={passionateAreas.join(', ')}
                            onChange={(e) =>
                                setPassionateAreas(e.target.value?.split(', '))
                            }
                            className="w-1/2 border border-neutral-700/18 bg-neutral-800 text-white"
                        />
                    </div>

                    <header className="text-lg font-bold text-white">
                        Personal Statement
                    </header>

                    <div>
                        <Label
                            className="text-white/60"
                            htmlFor="whyInterested"
                        >
                            Why are you interested in participating in this
                            design jam?
                        </Label>
                        <FormTextInput
                            type="text"
                            id="whyInterested"
                            value={whyInterested}
                            onChange={(e) => setWhyInterested(e.target.value)}
                            className="w-1/2 border border-neutral-700/18 bg-neutral-800 text-white"
                        />
                    </div>

                    <div>
                        <Label
                            className="text-white/60"
                            htmlFor="whatHopeLearn"
                        >
                            What do you hope to learn or achieve during this
                            event?
                        </Label>
                        <FormTextInput
                            type="text"
                            id="whatHopeLearn"
                            value={whatHopeLearn}
                            onChange={(e) => setWhatHopeLearn(e.target.value)}
                            className="w-1/2 border border-neutral-700/18 bg-neutral-800 text-white"
                        />
                    </div>

                    <header className="text-lg font-bold text-white">
                        Additional Information
                    </header>

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

                        <div className="flex flex-col gap-4">
                            <Label className="text-white/60">
                                How did you hear about us?
                            </Label>

                            <div className="ml-3 flex flex-col gap-5">
                                {HEARD_ABOUT_OPTIONS.map((heardAboutOption) => (
                                    <div
                                        className="flex items-center space-x-2"
                                        key={heardAboutOption}
                                    >
                                        <Checkbox
                                            id={heardAboutOption}
                                            checked={howHeardAbout.includes(
                                                heardAboutOption
                                            )}
                                            onCheckedChange={(isChecked) => {
                                                if (isChecked) {
                                                    setHowHeardAbout([
                                                        ...howHeardAbout,
                                                        heardAboutOption,
                                                    ]);
                                                } else {
                                                    setHowHeardAbout(
                                                        howHeardAbout.filter(
                                                            (item) =>
                                                                item !==
                                                                heardAboutOption
                                                        )
                                                    );
                                                }
                                            }}
                                            className="border-brand-500 size-5 data-[state=checked]:bg-blue-500"
                                        />
                                        <Label
                                            htmlFor={heardAboutOption}
                                            className="font-light text-white"
                                        >
                                            {heardAboutOption}
                                        </Label>
                                    </div>
                                ))}
                            </div>
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
                            handleChangeApplicationStatus(
                                'Accepted - Pending Payment'
                            )
                        }
                    >
                        Accept
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
