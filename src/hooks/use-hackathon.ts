'use client';

import {
    HackathonData,
    InputFormPageData,
    JudgeQuestion,
    SubmissionJudgeRubric,
} from '@/components/application_components/types';
import { trpc } from '@/trpc/client';
import dayjs from 'dayjs';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useEffect } from 'react';

const QUESTIONS: InputFormPageData[] = [
    {
        questions: [
            {
                type: 'text-line',
                title: 'Title',
                maxCount: 50,
                required: true,
                questionId: 1,
                placeHolder: 'Title',
            },
            {
                type: 'multiple-choice',
                title: 'Which project track does your submission fall under?',
                choices: [
                    {
                        data: 'Digitize the Past',
                        name: 'Digitize the Past',
                    },
                    {
                        data: 'Improve the Present',
                        name: 'Improve the Present',
                    },
                    {
                        data: 'Envision the Future',
                        name: 'Envision the Future',
                    },
                ],
                required: true,
                questionId: 2,
                allowCustom: false,
            },
            {
                type: 'file-upload',
                title: 'Header Image',
                allowMultiple: false,
                singleFileName: 'banner',
                allowedTypes: ['image/png', 'image/jpeg'],
                maxSize: 4,
                required: true,
                questionId: 3,
                description: 'Recommended: 16:9 aspect ratio',
            },
            {
                type: 'rich-text',
                title: 'Description of your project',
                required: true,
                questionId: 4,
                description:
                    'A short summary (2–3 sentences) of what your project is, what problem it solves, and who its intended target audience is.',
            },
            {
                type: 'file-upload',
                title: 'Process documentation',
                allowMultiple: false,
                singleFileName: 'documentation',
                allowedTypes: ['application/pdf'],
                maxSize: 16,
                required: true,
                questionId: 5,
            },
            {
                type: 'link',
                title: 'Video pitch',
                required: true,
                validator: {
                    pattern:
                        '^(https?:\\/\\/)?(www\\.)?(youtube\\.com\\/watch\\?v=|youtu\\.be\\/)[\\w\\-]{11}$',
                    errorMsg:
                        'Please enter a valid YouTube video link (e.g. https://youtu.be/abc123defgh).',
                },
                questionId: 6,
                description:
                    'A link to your video pitch presenting your project, no longer than 5 minutes.',
            },
            {
                type: 'link',
                title: 'Prototype link',
                required: true,
                validator: {
                    pattern:
                        '^(https?:\\/\\/)?([\\w\\-]+\\.)+[\\w\\-]+(\\/[\\w\\-./?%&=]*)?$',
                    errorMsg:
                        'Please enter a valid URL (e.g. https://example.com)',
                },
                questionId: 7,
            },
            {
                type: 'file-upload',
                title: 'Slide Deck (optional)',
                allowMultiple: false,
                singleFileName: 'slide_deck',
                allowedTypes: ['application/pdf'],
                maxSize: 8,
                questionId: 8,
            },
            {
                type: 'rich-text',
                title: 'Comments (Optional)',
                questionId: 9,
                description:
                    '(e.g. any instructions for navigating the prototype, any passwords to the prototype link, if applicable)',
            },
            {
                type: 'multiple-choice',
                title: 'Did the team use Protopie to create their interactive prototype?',
                choices: [
                    {
                        data: 'Yes',
                        name: 'Yes, the team used Protopie',
                    },
                    {
                        data: 'No',
                        name: 'No, the team did not use Protopie',
                    },
                ],
                required: true,
                questionId: 10,
            },
            {
                type: 'multiple-choice',
                title: 'Did the team use AI to generate any visuals for this project?',
                choices: [
                    {
                        data: 'Yes',
                        name: 'Yes, we used AI to generate some or all visuals',
                    },
                    {
                        data: 'No',
                        name: 'No, all visuals were created without AI',
                    },
                ],
                required: true,
                questionId: 11,
            },
            {
                type: 'multiple-choice',
                title: 'Did the team properly cite all external resources (e.g. fonts, icon libraries, component libraries) used for this project in the process documentation deliverable?',
                choices: [
                    {
                        data: 'Yes',
                        name: 'Yes, all external resources are properly cited',
                    },
                    {
                        data: 'Some',
                        name: 'Some resources are cited, but not all',
                    },
                    {
                        data: 'No',
                        name: 'No, external resources were not cited',
                    },
                    {
                        data: 'N/A',
                        name: 'Not applicable, the team did not use external resources in this project',
                    },
                ],
                required: true,
                questionId: 12,
            },
            {
                type: 'multiple-choice',
                title: 'Did the team clearly cite all AI tools or services used in this project and identify what they were used for (e.g. ideation, brainstorming)?',
                choices: [
                    {
                        data: 'Yes',
                        name: 'Yes, all AI tools are cited and their usage is clearly explained',
                    },
                    {
                        data: 'Some',
                        name: 'Some AI tools or usage contexts are cited, but not all',
                    },
                    {
                        data: 'No',
                        name: 'No, AI tools or their usage are not cited',
                    },
                    {
                        data: 'N/A',
                        name: 'Not applicable, no AI tools were used in the creation of this project',
                    },
                ],
                required: true,
                questionId: 13,
            },
            {
                type: 'multiple-choice',
                title: 'Do you consent to us sharing your project title, description, and visuals on our website and social media platforms to showcase your work? Don’t worry, SFU Surge will always credit you and your team when sharing your project!',
                choices: [
                    {
                        data: 'Yes',
                        name: 'Yes, I give permission to share our project and credit my team',
                    },
                    {
                        data: 'No',
                        name: 'No, I do not give permission to share our project',
                    },
                ],
                required: true,
                questionId: 14,
            },
        ],
    },
];

const HACKATHON_KEY = 'active_hackathon';

export const hackathonAtom = atomWithStorage<HackathonData | undefined>(
    HACKATHON_KEY,
    undefined,
    {
        getItem(key, initialValue) {
            const item = sessionStorage.getItem(key);

            if (!item) {
                return initialValue;
            }

            const hackathon: HackathonData = JSON.parse(item);

            if (!hackathon) {
                return undefined;
            }

            const foo = {
                ...hackathon,
                startDate: dayjs(hackathon.startDate),
                endDate: dayjs(hackathon.endDate),
                submissionDeadline: dayjs(hackathon.submissionTime),
            };

            return foo;
        },

        setItem(key, newValue) {
            sessionStorage.setItem(key, JSON.stringify(newValue));
        },

        removeItem(key) {
            sessionStorage.removeItem(key);
        },
    }
);

export function useHackathon() {
    const getActiveHackathon = trpc.hackathons.getActiveHackathon.useQuery(
        undefined,
        { enabled: false }
    );

    const [hackathon, setHackathon] = useAtom(hackathonAtom);
    useEffect(() => {
        const item = sessionStorage.getItem(HACKATHON_KEY);

        if (item) {
            const hackathon: HackathonData = JSON.parse(item);

            const foo = {
                ...hackathon,
                startDate: dayjs(hackathon.startDate),
                endDate: dayjs(hackathon.endDate),
                submissionDeadline: dayjs(hackathon.submissionTime),
            };

            setHackathon(foo);
        }
    }, []);

    useEffect(() => {
        const fetchActiveHackathon = async () => {
            if (hackathon) {
                return;
            }

            const { data } = await getActiveHackathon.refetch();

            if (data) {
                setHackathon({
                    hackathonName: data.name,
                    id: data.id,
                    applicationQuestionPages: data.applicationQuestions ?? [],
                    submissionQuestionPages: data.submissionQuestions ?? [],
                    submissionDeadline: dayjs(data.submissionDeadline),
                    judgeQuestions: data.judgeQuestions
                        ? (data.judgeQuestions as JudgeQuestion[])
                        : [],
                    judgeRubric: data.judgeRubric
                        ? (data.judgeRubric as SubmissionJudgeRubric[])
                        : [],
                    startDate: dayjs(data.startDate),
                    endDate: dayjs(data.endDate),
                    version: data.version,
                });
            }
        };

        fetchActiveHackathon();
    }, [getActiveHackathon, hackathon, setHackathon]);

    return {
        hackathon,
        setHackathon,
        hackathonLoaded: hackathon !== undefined,
    };
}
