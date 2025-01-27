import MobileTopNav from '@/components/sidebar/MobileTopNav';
import MobileBottomNav from '@/components/sidebar/MobileBottomNav';

export default function Dashboard() {
    return (
        <div className="bg-neutral-950 h-screen w-screen p-5">
            <MobileTopNav className="absolute top-0 left-0 fixed"></MobileTopNav>
            <MobileBottomNav className="absolute bottom-0 left-0 fixed"></MobileBottomNav>
        </div>
    );
}
