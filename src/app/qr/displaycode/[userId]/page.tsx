import QRTicket from '@/app/components/QRTicket';

type QRPageProps = {
    params: Promise<{ userId: string }>;
};

export default async function QRView({ params }: QRPageProps) {
    const { userId } = await params;
    return (
        <div className="bg-black flex justify-center items-center min-h-screen min-w-screen h-full">
            <QRTicket userId={userId} />
        </div>
    );
}
