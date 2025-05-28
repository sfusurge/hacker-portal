import {
    HackathonData,
    JudgeQuestion,
    SubmissionJudgeRubric,
} from '@/components/application_components/types';
import { trpc } from '@/trpc/client';
import dayjs from 'dayjs';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useEffect } from 'react';

// const QUESTIONS: ApplicationPage[] = [
//     {
//         title: 'Application Fee',
//         questions: [
//             {
//                 questionId: 1,
//                 type: 'checkbox',
//                 required: true,
//                 title: 'I understand that this design jam is a paid event, and upon acceptance, I agree to pay a fee of $15, excluding taxes and fees, to reserve my spot in the design jam',
//                 label: 'I agree',
//             },
//         ],
//     },
//     {
//         title: 'Basic Information',
//         questions: [
//             {
//                 questionId: 2,
//                 type: 'text-line',
//                 title: 'First Name',
//                 maxCount: 50,
//                 required: true,
//                 placeHolder: 'First Name',
//             },
//             {
//                 questionId: 3,
//                 type: 'text-line',
//                 title: 'Last Name',
//                 maxCount: 50,
//                 required: true,
//                 placeHolder: 'Last Name',
//             },
//             {
//                 questionId: 4,
//                 type: 'multiple-choice',
//                 title: 'Pronouns',
//                 choices: [
//                     {
//                         data: 'she/her/hers',
//                         name: 'she/her/hers',
//                     },
//                     {
//                         data: 'he/him/his',
//                         name: 'he/him/his',
//                     },
//                     {
//                         data: 'they/them/theirs',
//                         name: 'they/them/theirs',
//                     },
//                 ],
//                 allowCustom: true,
//             },
//             {
//                 questionId: 5,
//                 type: 'text-line',
//                 title: 'Email Address',
//                 placeHolder: 'Email Address',
//                 required: true,
//             },
//             {
//                 questionId: 6,
//                 type: 'text-line',
//                 title: 'Phone Number',
//                 placeHolder: 'Phone Number',
//                 required: true,
//             },
//             {
//                 questionId: 7,
//                 type: 'multiple-choice',
//                 title: 'School',
//                 choices: [
//                     {
//                         data: 'Simon Fraser University',
//                         name: 'Simon Fraser University',
//                     },
//                     {
//                         data: 'University of British Columbia',
//                         name: 'University of British Columbia',
//                     },
//                     {
//                         data: 'British Columbia Institute of Technology',
//                         name: 'British Columbia Institute of Technology',
//                     },
//                     {
//                         data: 'Capilano University',
//                         name: 'Capilano University',
//                     },
//                     {
//                         data: 'Emily Carr University of Art + Design',
//                         name: 'Emily Carr University of Art + Design',
//                     },
//                     {
//                         data: 'Kwantlen Polytechnic University',
//                         name: 'Kwantlen Polytechnic University',
//                     },
//                 ],
//                 required: true,
//                 allowCustom: true,
//             },
//             {
//                 questionId: 8,
//                 type: 'multiple-choice',
//                 title: 'Major',
//                 choices: [
//                     {
//                         name: 'Interactive Arts and Technology',
//                         data: 'Interactive Arts and Technology',
//                     },
//                     {
//                         name: 'Interaction Design',
//                         data: 'Interaction Design',
//                     },
//                     {
//                         name: 'Computer Science',
//                         data: 'Computer Science',
//                     },
//                     {
//                         name: 'Human-Computer Interaction',
//                         data: 'Human-Computer Interaction',
//                     },
//                     {
//                         name: 'Business',
//                         data: 'Business',
//                     },
//                     {
//                         name: 'Cognitive Science',
//                         data: 'Cognitive Science',
//                     },
//                     {
//                         name: 'Psychology',
//                         data: 'Psychology',
//                     },
//                 ],
//                 allowCustom: true,
//                 required: true,
//             },
//             {
//                 questionId: 9,
//                 type: 'multiple-choice',
//                 title: 'Current Year of Study',
//                 choices: [
//                     {
//                         name: '1',
//                         data: '1',
//                     },
//                     {
//                         name: '2',
//                         data: '2',
//                     },
//                     {
//                         name: '3',
//                         data: '3',
//                     },
//                     {
//                         name: '4',
//                         data: '4',
//                     },
//                     {
//                         name: '5-7',
//                         data: '5-7',
//                     },
//                     {
//                         name: '8+',
//                         data: '8+',
//                     },
//                 ],
//             },
//         ],
//     },
//     {
//         title: 'Design Skills and Experience',
//         questions: [
//             {
//                 questionId: 10,
//                 type: 'multiple-choice',
//                 required: true,
//                 title: 'Have you attended a design jam before?',
//                 choices: [
//                     {
//                         name: 'Yes',
//                         data: 'Yes',
//                     },
//                     {
//                         name: 'No',
//                         data: 'No',
//                     },
//                 ],
//             },
//             {
//                 questionId: 11,
//                 type: 'text-line',
//                 required: true,
//                 title: 'How many design jams have you previously attended',
//             },
//             {
//                 questionId: 12,
//                 type: 'multiple-checkbox',
//                 required: true,
//                 title: 'What design-related topics or areas are you most passionate about? Select all that apply.',
//                 choices: [
//                     {
//                         data: 'User Interface Design',
//                         name: 'User Interface Design',
//                     },
//                     {
//                         data: 'User Experience Design',
//                         name: 'User Experience Design',
//                     },
//                     {
//                         data: 'Interaction Design',
//                         name: 'Interaction Design',
//                     },
//                     {
//                         data: 'User Experience Research',
//                         name: 'User Experience Research',
//                     },
//                     {
//                         data: 'Product Design',
//                         name: 'Product Design',
//                     },
//                     {
//                         data: 'Branding',
//                         name: 'Branding',
//                     },
//                     {
//                         data: 'Motion Design',
//                         name: 'Motion Design',
//                     },
//                     {
//                         data: 'Graphic Design',
//                         name: 'Graphic Design',
//                     },
//                     {
//                         data: 'Service Design',
//                         name: 'Service Design',
//                     },
//                     {
//                         data: 'Design Engineering',
//                         name: 'Design Engineering',
//                     },
//                     {
//                         data: 'Design Systems',
//                         name: 'Design Systems',
//                     },
//                 ],
//                 allowOther: true,
//             },
//         ],
//     },
//     {
//         title: 'Personal Statement',
//         questions: [
//             {
//                 questionId: 13,
//                 type: 'text-area',
//                 title: 'Why are you interested in participating in this design jam? (max. 300 words)',
//                 required: true,
//             },
//             {
//                 questionId: 14,
//                 type: 'text-area',
//                 title: 'What do you hope to learn or achieve during this event? (max. 300 words)',
//                 required: true,
//             },
//         ],
//     },
//     {
//         title: 'Additional Information',
//         questions: [
//             {
//                 questionId: 15,
//                 type: 'multiple-checkbox',
//                 title: 'Do you have any dietary needs the organizing team should be aware of? Select all that apply. (Optional)',
//                 required: false,
//                 choices: [
//                     {
//                         data: 'Halal',
//                         name: 'Halal',
//                     },
//                     {
//                         data: 'Vegetarian',
//                         name: 'Vegetarian',
//                     },
//                     {
//                         data: 'Vegan',
//                         name: 'Vegan',
//                     },
//                     {
//                         data: 'Pescetarian',
//                         name: 'Pescetarian',
//                     },
//                     {
//                         data: 'Gluten-free',
//                         name: 'Gluten-free',
//                     },
//                     {
//                         data: 'Kosher',
//                         name: 'Kosher',
//                     },
//                     {
//                         data: 'Dairy Free',
//                         name: 'Dairy Free',
//                     },
//                     {
//                         data: 'Egg Allergy',
//                         name: 'Egg Allergy',
//                     },
//                     {
//                         data: 'Nut Allergy',
//                         name: 'Nut Allergy',
//                     },
//                     {
//                         data: 'Seafood Allergy',
//                         name: 'Seafood Allergy',
//                     },
//                 ],
//                 allowOther: true,
//             },
//             {
//                 questionId: 16,
//                 type: 'multiple-choice',
//                 title: 'Do you consent to being photographed, filmed, or recorded during this event for promotional and archival purposes?',
//                 required: true,
//                 choices: [
//                     {
//                         data: 'Yes',
//                         name: 'Yes',
//                     },
//                     {
//                         data: 'No',
//                         name: 'No',
//                     },
//                 ],
//             },
//             {
//                 questionId: 17,
//                 type: 'multiple-checkbox',
//                 title: 'How did you hear about us',
//                 choices: [
//                     {
//                         data: 'Social media (Instagram, LinkedIn, Discord, etc.)',
//                         name: 'Social media (Instagram, LinkedIn, Discord, etc.)',
//                     },
//                     {
//                         data: 'Word of mouth',
//                         name: 'Word of mouth',
//                     },
//                     {
//                         data: 'Website',
//                         name: 'Website',
//                     },
//                     {
//                         data: 'Flyer or poster',
//                         name: 'Flyer or poster',
//                     },
//                     {
//                         data: 'Collaborating organization (Partner or sponsor)',
//                         name: 'Collaborating organization (Partner or sponsor)',
//                     },
//                     {
//                         data: 'Online forum or community (e.g., Reddit, LinkedIn)',
//                         name: 'Online forum or community (e.g., Reddit, LinkedIn)',
//                     },
//                 ],
//                 allowOther: true,
//             },
//         ],
//     },
// ];

const HACKATHON_KEY = 'active_hackathon';

export const hackathonAtom = atomWithStorage<HackathonData | undefined>(
    HACKATHON_KEY,
    undefined,
    {
        getItem(key, initialValue) {
            const item = sessionStorage.getItem(key);

            const hackahton: HackathonData = item
                ? JSON.parse(item)
                : initialValue;

            hackahton.startDate = dayjs(hackahton.startDate);
            hackahton.endDate = dayjs(hackahton.endDate);
            hackahton.submissionDeadline = dayjs(hackahton.submissionDeadline);

            return hackahton;
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
        const fetchActiveHackathon = async () => {
            if (hackathon) {
                return;
            }

            const { data } = await getActiveHackathon.refetch();

            if (data) {
                setHackathon({
                    hackathonName: data.name,
                    id: data.id,
                    applicationQuestionPages: data.applicationQuestions,
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
                    version: 1,
                });
            }
        };

        fetchActiveHackathon();
    }, [getActiveHackathon, hackathon, setHackathon]);

    return {
        hackathon,
        setHackathon,
        hackathonLoaded: getActiveHackathon.isSuccess,
    };
}
