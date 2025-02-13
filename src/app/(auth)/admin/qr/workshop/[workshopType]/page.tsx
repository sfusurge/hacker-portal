import ScanPage from '@/app/(auth)/admin/qr/checkin_components/ScanPage';

type WorkshopScanProps = {
    params: Promise<{ workshopType: string }>;
};

export default async function WorkshopScanProps({ params }: WorkshopScanProps) {
    const { workshopType } = await params;
    return (
        <ScanPage
            event={false}
            meal={false}
            mealType={''}
            workshop={true}
            workshopType={workshopType}
        />
    );
}
