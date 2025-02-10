import QRTicket from '@/app/qr/checkin_components/QRTicket';
import TicketLoader from '@/app/qr/checkin_components/TicketLoader';

type QRPageProps = {
    params: Promise<{ userId: string }>;
};

export default async function QRView({ params }: QRPageProps) {
    const { userId } = await params;
    return <TicketLoader userId={userId} />;
}
