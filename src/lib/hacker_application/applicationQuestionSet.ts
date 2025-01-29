/**
 * initial testing application question set.
 */

import { ApplicationData } from './types';

export const applicationSet: ApplicationData = {
    hackathonName: 'demo_hackathon', // this should match the internal name of the hackathon, will not be displayed.
    title: 'Demo Hackathon Application',
    submissionTime: undefined, // no initial time set.
    version: 10,
    pages: [
        {
            title: 'First page',
            description: 'The first page with bunch of input fields',
            questions: [
                {
                    questionId: 5,
                    type: 'multiple-choice',
                    title: 'T-Shirt Size',
                    description: 'Select your T-shirt size.',
                    required: true,
                    allowCustom: true,
                    allowDeselect: true,
                    value: 'large', // No choice selected by default
                    choices: [
                        { data: 'small', name: 'Small' },
                        { data: 'medium', name: 'Medium' },
                        { data: 'large', name: 'Large' },
                    ],
                },
                {
                    questionId: 0,
                    type: 'text-line',
                    title: 'Type something',
                    description: 'Any text is fine',
                    maxCount: 50,
                    placeHolder: 'bleh',
                    required: false,
                    value: 'default text',
                },
                {
                    questionId: 2313,
                    type: 'number',
                    title: 'Age',
                    description: 'How old are you?',
                    min: 10,
                    max: 99,
                    required: false,
                    value: 10,
                },
                {
                    questionId: 10, // questionId can be anything, as long as they are all unique.
                    type: 'text-line',
                    title: 'Postal Code',
                    description:
                        'Text with validation, Canadian or US postal code',
                    maxCount: 7,
                    placeHolder: 'A1C 2B3',
                    required: true,
                    validator: {
                        pattern:
                            '([a-zA-Z]\\d[a-zA-Z]\\s?\\d[a-zA-Z]\\d)|(\\d{5}(?:-\\d{4})?)',
                        errorMsg:
                            'Not a valid canadian postal code, nor a US zip code!',
                    },
                },

                {
                    questionId: 21312312,
                    type: 'checkbox',
                    title: 'Do you like React',
                    description: 'You must be a react enjoyer to proceed',
                    label: 'I love React!!!',
                    value: false,
                    required: true,
                },
                {
                    questionId: 90909090,
                    type: 'text-area',
                    description:
                        'Write down a cookie recipe from memory please.',
                    title: 'cookie recipe',
                    maxCount: 200,
                    placeHolder: '>_...',
                    value: 'Blah blah',
                    required: true,
                },
                // {
                //     questionId: 1,
                //     type: "name",
                //     title: "Name",
                //     description: "Please enter your first and last name.",
                //     required: true,
                //     firstName: "",
                //     lastName: "",
                //     maxCount: 50, // Max length for combined name input
                // },
                // {
                //     questionId: 2,
                //     type: "text-area",
                //     title: "Comments",
                //     description: "Share your thoughts or feedback.",
                //     required: false,
                //     placeHolder: "Enter your thoughts...",
                //     value: "",
                //     maxCount: 500, // Max character count
                // },
                // {
                //     questionId: 3,
                //     type: "number",
                //     title: "Age",
                //     description: "Please enter your age.",
                //     required: true,
                //     placeHolder: 18,
                //     value: undefined,
                //     min: 1,
                //     max: 120, // Valid age range
                // },
                // {
                //     questionId: 4,
                //     type: "checkbox",
                //     title: "Subscribe to Newsletter",
                //     description: "Check this box if you want to receive updates.",
                //     required: false,
                //     value: false, // Default unchecked
                // },

                {
                    questionId: 6,
                    type: 'multiple-checkbox',
                    title: 'Preferred Foods',
                    description:
                        'Select all the foods you like. (At least 1, at most 2)',
                    required: true,
                    min: 1,
                    max: 2,
                    choices: [
                        { data: 'pizza', name: 'Pizza', value: false },
                        { data: 'burger', name: 'Burger', value: false },
                        { data: 'pasta', name: 'Pasta', value: false },
                    ],
                },
            ],
        },

        {
            title: 'Second page',
            description: 'The first page with bunch of input fields',
            questions: [
                {
                    questionId: 9,
                    type: 'text-line',
                    title: 'Type something',
                    description: 'Any text is fine',
                    maxCount: 50,
                    placeHolder: 'bleh',
                    required: true,
                    value: '',
                },
                {
                    questionId: 92423,
                    type: 'text-line',
                    title: 'Type something 2',
                    description: 'Any text is fine',
                    maxCount: 50,
                    placeHolder: 'bleh',
                    required: false,
                    value: 'default text',
                },

                {
                    questionId: 99292,
                    type: 'text-line',
                    title: 'Type something',
                    description: '(optional)',
                    maxCount: 50,
                    placeHolder: 'bleh',
                    required: false,
                    value: '',
                },
            ],
        },

        {
            title: 'Third page',
            description: 'The first page with bunch of input fields',
            questions: [
                {
                    questionId: 9,
                    type: 'text-line',
                    title: 'Type something',
                    description: 'Any text is fine',
                    maxCount: 50,
                    placeHolder: 'bleh',
                    required: true,
                    value: 'default text',
                },
            ],
        },

        {
            title: 'Final page',
            description: 'The first page with bunch of input fields',
            questions: [
                {
                    questionId: 999,
                    type: 'text-line',
                    title: 'Type something',
                    description: 'Any text is fine',
                    maxCount: 50,
                    placeHolder: 'bleh',
                    required: true,
                    value: 'default text',
                },
            ],
        },
    ],
};

export const JOURNEY_HACK_QUESTIONS: ApplicationData = {
    title: 'First page',
    version: 1111,
    hackathonName: 'JourneyHacks 2025',
    pages: [
        {
            title: 'JourneyHacks 2025',
            description: '',
            questions: [
                {
                    questionId: 1,
                    type: 'text-line',
                    title: 'Full Name',
                    placeHolder: 'Name...',
                    required: true,
                    maxCount: 50,
                },
                {
                    questionId: 2,
                    type: 'text-line',
                    title: 'SFU email',
                    placeHolder: 'name@sfu.ca',
                    required: true,
                    validator: {
                        pattern: '[\\w-.]+@([\\w-]+.)+[\\w-]{2,4}',
                        errorMsg: 'Not a valid email',
                    },
                    maxCount: 100,
                },
                {
                    questionId: 3,
                    type: 'text-line',
                    title: 'Student Number',
                    validator: {
                        errorMsg: 'Not a valid student number!',
                        pattern: '[0-9]{9}',
                    },
                    maxCount: 9,
                    required: true,
                },
                {
                    questionId: 4,
                    type: 'multiple-choice',
                    title: 'Major',
                    allowCustom: true,
                    choices: [
                        {
                            data: 'Business',
                            name: 'Business',
                        },
                        {
                            data: 'Computing Science',
                            name: 'Computing Science',
                        },
                        {
                            data: 'Data Science',
                            name: 'Data Science',
                        },
                        {
                            data: 'Engineering',
                            name: 'Engineering',
                        },
                        {
                            data: 'Health Science',
                            name: 'Health Science',
                        },
                        {
                            data: 'Math',
                            name: 'Math',
                        },
                        {
                            data: 'SIAT',
                            name: 'SIAT',
                        },
                    ],
                },
                {
                    questionId: 5,
                    type: 'text-line',
                    title: 'Year of Study',
                    placeHolder: '(e.g. 1st year, 2nd year)',
                    required: true,
                },
                {
                    questionId: 6,
                    type: 'multiple-choice',
                    title: 'Participant type (each member must fill out their own form)',
                    required: true,
                    choices: [
                        {
                            data: 'Individual',
                            name: 'Individual',
                        },
                        {
                            data: 'Individual looking for a team',
                            name: 'Individual looking for a team',
                        },
                        {
                            data: 'Team (4 people max)',
                            name: 'Team (4 people max)',
                        },
                    ],
                },
                {
                    questionId: 7,
                    type: 'text-line',
                    title: 'Full name of team members',
                    description: 'Please use commas to separate names.',
                    required: false,
                    maxCount: 150,
                },
                {
                    questionId: 8,
                    type: 'multiple-checkbox',
                    title: 'Please fill out any dietary restrictions.',
                    description:
                        ' Please email us at sfusurge@gmail.com if you have any restrictions that are not included on this list, and include your First Name, Last Name, and Student Number.',
                    required: false,
                    choices: [
                        {
                            data: 'Halal',
                            name: 'Halal',
                            value: false,
                        },
                        {
                            data: 'Vegetarian',
                            name: 'Vegetarian',
                            value: false,
                        },
                        {
                            data: 'Vegan',
                            name: 'Vegan',
                            value: false,
                        },
                        {
                            data: 'Pescetarian',
                            name: 'Pescetarian',
                            value: false,
                        },
                        {
                            data: 'Gluten-free',
                            name: 'Gluten-free',
                            value: false,
                        },
                        {
                            data: 'Kosher',
                            name: 'Kosher',
                            value: false,
                        },
                        {
                            data: 'Dairy Free',
                            name: 'Dairy Free',
                            value: false,
                        },
                        {
                            data: 'Egg Allergy',
                            name: 'Egg Allergy',
                            value: false,
                        },
                        {
                            data: 'Nut Allergy',
                            name: 'Nut Allergy',
                            value: false,
                        },
                        {
                            data: 'Seafood Allergy',
                            name: 'Seafood Allergy',
                            value: false,
                        },
                    ],
                },
                {
                    questionId: 9,
                    type: 'multiple-choice',
                    title: 'Do you consent to having your photo taken during the event?',
                    required: true,
                    choices: [
                        {
                            data: 'Yes',
                            name: 'Yes',
                        },
                        {
                            data: 'No',
                            name: 'No',
                        },
                    ],
                },
            ],
        },
    ],
};
