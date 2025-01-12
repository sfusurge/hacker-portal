/**
 * initial testing application question set.
 */

import { ApplicationData } from './types';

export const applicationSet: ApplicationData = {
    hackathonName: 'demo_hackathon', // this should match the internal name of the hackathon, will not be displayed.
    title: 'Demo Hackathon Application',
    submissionTime: undefined, // no initial time set.
    version: 1211011,
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
                    description: 'Text with validation, Canadian or US postal code',
                    maxCount: 7,
                    placeHolder: 'A1C 2B3',
                    required: true,
                    validator: {
                        pattern: '([a-zA-Z]\\d[a-zA-Z]\\s?\\d[a-zA-Z]\\d)|(\\d{5}(?:-\\d{4})?)',
                        errorMsg: 'Not a valid canadian postal code, nor a US zip code!',
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
                    description: 'Write down a cookie recipe from memory please.',
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
                    description: 'Select all the foods you like.',
                    required: false,
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
