import { HackathonData } from '@/app/(auth)/application/application_components/types';
import { trpc } from '@/trpc/client';
import dayjs from 'dayjs';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useEffect } from 'react';

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
                    pages: data.questions ?? [],
                    submissionDeadline: dayjs(data.submissionDeadline),
                    startDate: dayjs(data.startDate),
                    endDate: dayjs(data.endDate),
                    version: data.version,
                });
            }
        };

        fetchActiveHackathon();
    }, []);

    return {
        hackathon,
        setHackathon,
        hackathonLoaded: getActiveHackathon.isSuccess,
    };
}
