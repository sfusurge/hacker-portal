'use client';

import { trpc } from '@/trpc/client';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { ApplicationForm } from './application_components/ApplicationForm';
import { hackathonAtom } from '@/hooks/use-hackathon';
import { useHackathon } from '@/hooks/use-hackathon';

/**
 * TODO
 * Currently this solutiion creates a slight flick during intial load.
 * todo: investigate in this potential solution
 * https://jotai.org/docs/utilities/storage#server-side-rendering
 */
export default function Application() {
    const { hackathon } = useHackathon();

    const submitApplication = trpc.applications.submitApplication.useMutation();

    const application = trpc.applications.getCurrentApplication.useQuery(
        {
            hackathonId: hackathon?.id!,
        },
        { enabled: hackathon !== undefined }
    );

    const session = useSession();

    useEffect(() => {
        if (session.data?.user?.email) {
            localStorage.setItem('email', session.data.user.email);
        }

        if (hackathon) {
            if (application.data) {
                redirect('/home');
            }
        }
    }, [session, hackathon, application.data]);

    useEffect(() => {
        document.body.style.setProperty('--paddingTop', '5rem');
    }, []);

    return (
        <ApplicationForm
            appDataAtom={hackathonAtom}
            submitApplication={(flattenResponse) => {
                if (application.data) {
                    return;
                }

                const response = flattenResponse
                    .map((question) => {
                        const questionId = question.questionId;
                        const type = question.type;

                        if (type === 'multiple-checkbox') {
                            return {
                                questionId,
                                value: question.choices
                                    .filter(({ value }) => value)
                                    .map(({ data }) => data),
                            };
                        }

                        if (type === 'name') {
                            return {
                                questionId,
                                value: `${question.firstName} ${question.lastName}`,
                            };
                        }

                        return {
                            questionId,
                            value: question.value,
                        };
                    })
                    .reduce(
                        (response, { questionId, value }) => {
                            response[questionId] = value;

                            return response;
                        },
                        {} as Record<string, any>
                    );

                console.log(`Submitting ${JSON.stringify(response)}`);

                submitApplication.mutate({
                    hackathonId: hackathon!.id,
                    response: response,
                });

                redirect('/application/submitted');
            }}
        ></ApplicationForm>
    );
}
