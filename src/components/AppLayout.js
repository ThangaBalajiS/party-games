'use client';

import Sidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation';

export default function AppLayout({ children }) {
    const pathname = usePathname();

    // Pages that should show the admin layout (no sidebar, full width)
    const isAdminPage = pathname.includes('/admin');

    if (isAdminPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-60">
                {children}
            </main>
        </div>
    );
}
