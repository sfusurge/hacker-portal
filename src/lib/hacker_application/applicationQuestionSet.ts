/**
 * initial testing application question set.
 */

import { ApplicationData } from './types';

export const applicationSet: ApplicationData = {
  hackathonName: 'demo_hackathon', // this should match the internal name of the hackathon, will not be displayed.
  title: 'Apply to Demo Hackathon!',
  description: `Just a set of questions to test the application workflow.

    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    `,
  submissionTime: undefined, // no initial time set.
  version: 0,
  pages: [
    {
      title: 'First page',
      description: 'The first page with bunch of input fields',
      questions: [
        {
          questionId: 0,
          type: 'text-line',
          title: 'Type something',
          description: 'Any text is fine',
          maxCount: 50,
          placeHolder: 'bleh',
          required: true,
          value: 'default text',
        },
        {
          questionId: 10, // questionId can be anything, as long as they are all unique.
          type: 'text-line',
          title: 'Postal Code',
          description: 'Text with validation, Canadian or US postal code',
          maxCount: 7,
          placeHolder: 'A1C 2B3',
          required: true,
          validationPatterns: {
            pattern:
              '([a-zA-Z]\\d[a-zA-Z]\\s?\\d[a-zA-Z]d)|(\\d{5}(?:-\\d{4})?)',
            errorMsg: 'Not a valid canadian postal code, nor a US zip code!',
          },
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
        // {
        //     questionId: 5,
        //     type: "multiple-choice",
        //     title: "T-Shirt Size",
        //     description: "Select your T-shirt size.",
        //     required: true,
        //     value: undefined, // No choice selected by default
        //     choices: [
        //         { data: "small", name: "Small" },
        //         { data: "medium", name: "Medium" },
        //         { data: "large", name: "Large" },
        //     ],
        // },
        // {
        //     questionId: 6,
        //     type: "multiple-checkbox",
        //     title: "Preferred Foods",
        //     description: "Select all the foods you like.",
        //     required: false,
        //     choices: [
        //         { data: "pizza", name: "Pizza", value: false },
        //         { data: "burger", name: "Burger", value: false },
        //         { data: "pasta", name: "Pasta", value: false },
        //     ],
        // },
      ],
    },
  ],
};
