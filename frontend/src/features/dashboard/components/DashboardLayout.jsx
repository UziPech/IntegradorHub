import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function DashboardLayout() {
    return (
        <div className="min-h-screen font-sans text-gray-900 bg-[#F0F0F3]">
            {/* Sidebar - Fixed */}
            <Sidebar />

            {/* Main Content Area - Padding Left */}
            <main className="min-h-screen overflow-y-auto scroll-smooth p-8 relative" style={{ paddingLeft: '16rem' }}>
                <Outlet />
            </main>
        </div>
    );
}
