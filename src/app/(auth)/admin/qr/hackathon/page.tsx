import ScanPage from '@/app/(auth)/admin/qr/checkin_components/ScanPage';

export default async function HackathonScan() {
    return (
        <ScanPage
            event={true}
            meal={false}
            mealType={''}
            workshop={false}
            workshopType={''}
        />
    );
}
