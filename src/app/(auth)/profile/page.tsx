import { getUserData } from '@/server/routers/usersRouter';
import ProfileContent from './ProfileContent';

export default async function ProfilePage() {
    const userData = await getUserData();

    if (!userData) {
        return (
            <div className="flex flex-col gap-6 md:gap-8">
                <h1 className="text-3xl font-semibold text-white">Profile</h1>
                <p className="text-white/60">User not found</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 md:gap-8">
            <h1 className="text-3xl font-semibold text-white">
                Account detail
            </h1>
            <ProfileContent userData={userData} />
        </div>
    );
}
