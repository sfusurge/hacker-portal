import ScanPage from '@/app/qr/components/ScanPage';

type WorkshopScanProps = {
  params: { workshopType: string };
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
