'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Package, ShoppingCart, BarChart3, Boxes, LogOut, Menu, X, Moon, Sun, ChevronDown,
    AlertTriangle, TrendingUp, ClipboardList, Truck, Users,
} from 'lucide-react';

const NAV_ITEMS = [
    { href: '/dashboard/pos', label: 'Satış (POS)', icon: ShoppingCart, roles: ['ADMIN', 'CASHIER'] },
    { href: '/dashboard/products', label: 'Ürünler', icon: Package, roles: ['ADMIN'] },
    { href: '/dashboard/stock', label: 'Stok', icon: Boxes, roles: ['ADMIN', 'CASHIER', 'AUDITOR'] },
    { href: '/dashboard/users', label: 'Kullanıcılar', icon: Users, roles: ['ADMIN'] },
    { href: '/dashboard/sales-history', label: 'Satış Geçmişi', icon: TrendingUp, roles: ['ADMIN'] },
    {
        label: 'Raporlar', icon: BarChart3, roles: ['ADMIN', 'AUDITOR'],
        children: [
            { href: '/dashboard/reports/critical-stock', label: 'Kritik Stok', icon: AlertTriangle },
            { href: '/dashboard/reports/sales', label: 'Satış Raporu', icon: TrendingUp },
            { href: '/dashboard/reports/daily', label: 'Gün Sonu', icon: ClipboardList },
        ],
    },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout, isAdmin } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dark, setDark] = useState(true);
    const [reportOpen, setReportOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) router.push('/');
    }, [user, loading, router]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
    }, [dark]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    const filteredNav = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-16 flex items-center gap-3 px-5 border-b border-border">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-foreground text-sm">Stok Takip</h1>
                            <p className="text-[10px] text-muted-foreground">v1.0</p>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-muted-foreground hover:text-foreground">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                        {filteredNav.map((item) =>
                            item.children ? (
                                <div key={item.label}>
                                    <button
                                        onClick={() => setReportOpen(!reportOpen)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.label}
                                        <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${reportOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {reportOpen && (
                                        <div className="ml-4 mt-1 space-y-1">
                                            {item.children.map((child) => (
                                                <Link
                                                    key={child.href}
                                                    href={child.href}
                                                    onClick={() => setSidebarOpen(false)}
                                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname === child.href
                                                        ? 'bg-primary/10 text-primary font-medium'
                                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                                        }`}
                                                >
                                                    <child.icon className="w-4 h-4" />
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    key={item.href}
                                    href={item.href!}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === item.href
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                        }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            ),
                        )}
                    </nav>

                    {/* User section */}
                    <div className="p-3 border-t border-border">
                        <div className="flex items-center gap-3 px-3 py-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                {user.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.role === 'ADMIN' ? 'Yönetici' : user.role === 'CASHIER' ? 'Kasiyer' : 'Denetçi'}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => setDark(!dark)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            >
                                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                {dark ? 'Aydınlık' : 'Karanlık'}
                            </button>
                            <button
                                onClick={() => { logout(); router.push('/'); }}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Çıkış
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Overlay */}
            {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* Main content */}
            <div className="flex-1 lg:ml-64">
                {/* Top bar */}
                <header className="h-16 border-b border-border bg-card/80 backdrop-blur-lg flex items-center px-4 sticky top-0 z-30">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4 text-muted-foreground hover:text-foreground">
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="hidden sm:inline">{user.name}</span>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-xs font-medium">
                            {user.role}
                        </span>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 md:p-6 lg:p-8 animate-fade-in">
                    {children}
                </main>
            </div>
        </div>
    );
}
