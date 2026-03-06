'use client';

import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { ShoppingCart, Calendar, DollarSign, User, CreditCard, Banknote, ArrowRightLeft, RefreshCw, Package } from 'lucide-react';

const formatCurrency = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);
const formatDate = (d: string) => new Date(d).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function SalesHistoryPage() {
    const { isAdmin } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedCashier, setSelectedCashier] = useState<string | null>(null);
    const [view, setView] = useState<'cashiers' | 'all'>('cashiers');

    const loadData = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const result = await api.getSalesByCashier(params);
            setData(result);
        } catch (e: any) {
            console.error(e);
            toast({ title: 'Hata', description: e.message || 'Satış geçmişi yüklenemedi', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const paymentIcon = (type: string) => {
        switch (type) {
            case 'CASH': return <Banknote className="w-4 h-4" />;
            case 'CARD': return <CreditCard className="w-4 h-4" />;
            case 'TRANSFER': return <ArrowRightLeft className="w-4 h-4" />;
            default: return null;
        }
    };

    const paymentLabel = (type: string) => {
        switch (type) {
            case 'CASH': return 'Nakit';
            case 'CARD': return 'Kart';
            case 'TRANSFER': return 'Havale';
            default: return type;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const totalRevenue = data?.allSales?.reduce((s: number, sale: any) => s + sale.totalAmount, 0) || 0;
    const totalSales = data?.allSales?.length || 0;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                        <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Satış Geçmişi</h1>
                        <p className="text-sm text-muted-foreground">Tüm satışları kasiyerlere göre takip edin</p>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    <span className="text-muted-foreground text-sm">—</span>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    <button onClick={loadData} className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="text-sm text-muted-foreground">Toplam Ciro</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-sm text-muted-foreground">Toplam Satış</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{totalSales}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 bg-purple-500/10 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-sm text-muted-foreground">Aktif Kasiyer</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{data?.byCashier?.length || 0}</p>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
                <button onClick={() => { setView('cashiers'); setSelectedCashier(null); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${view === 'cashiers' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>
                    Kasiyerlere Göre
                </button>
                <button onClick={() => setView('all')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${view === 'all' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>
                    Tüm Satışlar
                </button>
            </div>

            {/* Cashier Cards */}
            {view === 'cashiers' && !selectedCashier && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {data?.byCashier?.map((c: any) => (
                        <button
                            key={c.user.id}
                            onClick={() => setSelectedCashier(c.user.id)}
                            className="bg-card border border-border rounded-xl p-5 text-left hover:shadow-lg hover:border-primary/30 transition-all group"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                    {c.user.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{c.user.name}</h3>
                                    <p className="text-xs text-muted-foreground">{c.user.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-background rounded-lg p-3">
                                    <p className="text-xs text-muted-foreground">Satış Sayısı</p>
                                    <p className="text-lg font-bold text-foreground">{c.saleCount}</p>
                                </div>
                                <div className="bg-background rounded-lg p-3">
                                    <p className="text-xs text-muted-foreground">Toplam Ciro</p>
                                    <p className="text-lg font-bold text-emerald-400">{formatCurrency(c.totalAmount)}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                    {(!data?.byCashier || data.byCashier.length === 0) && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>Henüz satış yapılmamış</p>
                        </div>
                    )}
                </div>
            )}

            {/* Selected Cashier's Sales */}
            {view === 'cashiers' && selectedCashier && (
                <div className="space-y-4">
                    <button onClick={() => setSelectedCashier(null)} className="text-sm text-primary hover:underline">
                        ← Kasiyerlere geri dön
                    </button>
                    <SalesTable
                        sales={data?.byCashier?.find((c: any) => c.user.id === selectedCashier)?.sales || []}
                        showUser={false}
                        onRefund={async (saleId) => {
                            await api.refundSale(saleId);
                            await loadData();
                        }}
                    />
                </div>
            )}

            {/* All Sales */}
            {view === 'all' && (
                <SalesTable
                    sales={data?.allSales || []}
                    showUser={true}
                    onRefund={async (saleId) => {
                        await api.refundSale(saleId);
                        await loadData();
                    }}
                />
            )}
        </div>
    );
}

function SalesTable({
    sales,
    showUser,
    onRefund,
}: {
    sales: any[];
    showUser: boolean;
    onRefund: (saleId: string) => Promise<void>;
}) {
    const formatCurrency = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);
    const formatDate = (d: string) => new Date(d).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const paymentLabel = (type: string) => {
        switch (type) { case 'CASH': return 'Nakit'; case 'CARD': return 'Kart'; case 'TRANSFER': return 'Havale'; default: return type; }
    };

    const paymentColor = (type: string) => {
        switch (type) { case 'CASH': return 'text-emerald-400'; case 'CARD': return 'text-blue-400'; case 'TRANSFER': return 'text-amber-400'; default: return ''; }
    };

    if (sales.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Satış bulunamadı</p>
            </div>
        );
    }

    const handleRefund = async (sale: any) => {
        if (sale.refunded) return;
        if (!confirm(`Bu satışı iade etmek istiyor musunuz? (${sale.receiptNo})`)) return;
        try {
            await onRefund(sale.id);
            toast({ title: 'İade alındı', description: `Satış iade edildi: ${sale.receiptNo}`, variant: 'success' });
        } catch (e: any) {
            toast({ title: 'Hata', description: e.message || 'İade işlemi başarısız', variant: 'destructive' });
        }
    };

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-background/50">
                            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Fiş No</th>
                            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Tarih</th>
                            {showUser && <th className="text-left px-4 py-3 text-muted-foreground font-medium">Kasiyer</th>}
                            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Ürünler</th>
                            <th className="text-left px-4 py-3 text-muted-foreground font-medium">Ödeme</th>
                            <th className="text-right px-4 py-3 text-muted-foreground font-medium">Tutar</th>
                            <th className="text-center px-4 py-3 text-muted-foreground font-medium">Durum</th>
                            <th className="text-right px-4 py-3 text-muted-foreground font-medium">İade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map((sale: any) => (
                            <tr key={sale.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                                <td className="px-4 py-3 font-mono text-xs text-foreground">{sale.receiptNo}</td>
                                <td className="px-4 py-3 text-muted-foreground">{formatDate(sale.createdAt)}</td>
                                {showUser && (
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                                {sale.user?.name?.charAt(0) || '?'}
                                            </div>
                                            <span className="text-foreground">{sale.user?.name || 'Bilinmiyor'}</span>
                                        </div>
                                    </td>
                                )}
                                <td className="px-4 py-3">
                                    <div className="flex flex-col gap-0.5">
                                        {sale.lines?.slice(0, 2).map((line: any, i: number) => (
                                            <div key={i} className="flex items-center gap-1 text-xs">
                                                <Package className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-foreground">{line.product?.name || 'Ürün'}</span>
                                                <span className="text-muted-foreground">x{line.quantity}</span>
                                            </div>
                                        ))}
                                        {sale.lines?.length > 2 && (
                                            <span className="text-xs text-muted-foreground">+{sale.lines.length - 2} daha...</span>
                                        )}
                                    </div>
                                </td>
                                <td className={`px-4 py-3 font-medium ${paymentColor(sale.paymentType)}`}>
                                    {paymentLabel(sale.paymentType)}
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-foreground">{formatCurrency(sale.totalAmount)}</td>
                                <td className="px-4 py-3 text-center">
                                    {sale.refunded ? (
                                        <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded-md text-xs">İade</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-xs">Tamamlandı</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => handleRefund(sale)}
                                        disabled={sale.refunded}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:hover:bg-primary/10 transition-colors"
                                    >
                                        İade Et
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
