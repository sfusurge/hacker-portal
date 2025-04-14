/**
 * initial testing application question set.
 */

import { ApplicationData } from './types';

export const JOURNEY_HACK_QUESTIONS: ApplicationData = {
    title: 'First page',
    version: 11111,
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
                        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Character_class#v-mode_character_class
                        // "-" must now be escaped in character sets
                        pattern: '^[\\w\\-\\.]+@([\\w\\-]+\\.)+[\\w\\-]{2,4}$',
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
                        'Please email us at sfusurgelogistics@gmail.com if you have any restrictions that are not included on this list, and include your First Name, Last Name, and Student Number.',
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
