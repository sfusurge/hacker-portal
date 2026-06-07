import { getCachedUserData } from '@/server/getCachedUserData';
import ProfileContent from './ProfileContent';
import { PageHeader } from '@/components/PageHeader';

export default async function ProfilePage() {
    const userData = await getCachedUserData();

    if (!userData) {
        return (
            <div className="flex flex-col gap-6 md:gap-8">
                <PageHeader title="Account detail" />
                <p className="text-white/60">User not found</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 md:gap-8">
            <PageHeader title="Account detail" />
            <ProfileContent userData={userData} />
        </div>
    );
}
