import { faker } from '@faker-js/faker';
import { Applicant } from '@/app/reviewapplications/components/ReviewApplicationsTable';

const range = (len: number) => {
    const arr: number[] = [];
    for (let i = 0; i < len; i++) {
        arr.push(i);
    }
    return arr;
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
    'Computer Science',
    'Data Science',
    'Engineering',
    'Health Science',
    'Math',
    'SIAT',
    'Other..',
];

const newApplicant = (): Applicant => {
    return {
        id: faker.number.int(6),
        name: faker.person.fullName(),
        status: faker.helpers.shuffle(['Pending', 'Accepted', 'Rejected'])[0]!,
        applicationDate: faker.date.anytime(),
        email: faker.internet.email(),
        major: faker.helpers.shuffle(allMajors)[0]!,
        enrollmentYear: faker.number.int(4),
        participantType: faker.helpers.shuffle([
            'Individual',
            'Individual looking for a team',
            'Team (4 max)',
        ])[0]!,
        teamMemberNames: [
            faker.person.firstName(),
            faker.person.firstName(),
            faker.person.firstName(),
        ],
        discordUsername: faker.internet.username(),
        attendancePeriod: faker.helpers.shuffle(allAttendancePeriods)[0]!,
        attendingWorkshops: [
            faker.helpers.shuffle(allWorkshops)[0]!,
            faker.helpers.shuffle(allWorkshops)[0]!,
            faker.helpers.shuffle(allWorkshops)[0]!,
        ],
        questions: faker.lorem.words(4),
        photoConsent: faker.datatype.boolean(),
    };
};

export function makeData(...lens: Applicant[]) {
    const makeDataLevel = (depth = 0): Applicant[] => {
        const len = lens[depth]!;
        return range(len).map((d): Applicant => {
            return {
                ...newApplicant(),
            };
        });
    };

    return makeDataLevel();
}
