import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
    title: 'Stok Takip - Kurumsal Stok ve Satış Yönetimi',
    description: 'Modern, barkod destekli stok takip ve POS satış sistemi',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="tr" suppressHydrationWarning>
            <body>
                <AuthProvider>
                    {children}
                    <Toaster />
                </AuthProvider>
            </body>
        </html>
    );
}
