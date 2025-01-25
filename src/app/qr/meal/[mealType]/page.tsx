import ScanPage from '@/app/qr/components/ScanPage';

type MealScanProps = {
    params: { mealType: string };
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
