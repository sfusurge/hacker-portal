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

export const allDietaryRestrictions = [
    'Halal',
    'Vegetarian',
    'Vegan',
    'Pescatarian',
    'Gluten-free',
    'Kosher',
    'Other..',
];

const newApplicant = (): Applicant => {
    return {
        id: faker.number.int(6),
        status: faker.helpers.shuffle(['Pending', 'Accepted', 'Rejected'])[0]!,
        tempStatus: faker.helpers.shuffle([
            'Pending',
            'Accepted',
            'Rejected',
        ])[0]!,
        applicationDate: faker.date.anytime(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        studentNumber: faker.number.int(),
        major: faker.helpers.shuffle(allMajors)[0]!,
        enrollmentYear: faker.date
            .birthdate({ max: 4, min: 0, mode: 'age' })
            .getFullYear(),
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
        dietaryRestrictions: [
            faker.helpers.shuffle(allDietaryRestrictions)[0]!,
        ],
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
