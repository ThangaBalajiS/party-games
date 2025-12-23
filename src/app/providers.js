'use client';

import { PartyProvider } from '@/context/PartyContext';
import AppLayout from '@/components/AppLayout';

export default function Providers({ children }) {
    return (
        <PartyProvider>
            <AppLayout>
                {children}
            </AppLayout>
        </PartyProvider>
    );
}

