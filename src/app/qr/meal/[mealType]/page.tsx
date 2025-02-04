import ScanPage from '@/app/qr/checkin_components/ScanPage';

type MealScanProps = {
    params: Promise<{ mealType: string }>;
};

export default async function MealScan({ params }: MealScanProps) {
    const { mealType } = await params;
    return (
        <ScanPage
            event={false}
            meal={true}
            mealType={mealType}
            workshop={false}
            workshopType={''}
        />
    );
}
