'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { TrendingUp, Loader2, ShoppingCart, Banknote, CreditCard, Building2, RotateCcw } from 'lucide-react';

export default function SalesReportPage() {
    const [data, setData] = useState<any>(null);
    const [topSellers, setTopSellers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [summary, sellers] = await Promise.all([
                api.getSalesSummary({ startDate: startDate || undefined, endDate: endDate || undefined }),
                api.getTopSellers({ limit: 10 }),
            ]);
            setData(summary);
            setTopSellers(sellers);
        } catch (err: any) {
            toast({ title: 'Hata', description: err.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const paymentIcons: any = { CASH: Banknote, CARD: CreditCard, TRANSFER: Building2 };
    const paymentLabels: any = { CASH: 'Nakit', CARD: 'Kart', TRANSFER: 'Havale' };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Satış Raporu</h1>
                    <p className="text-sm text-muted-foreground">Satış verileri ve en çok satan ürünler</p>
                </div>
            </div>

            {/* Date filter */}
            <div className="flex gap-3 mb-6 flex-wrap">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                <button onClick={fetchData} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                    Filtrele
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
                <>
                    {/* Summary cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-card rounded-xl border border-border p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                    <ShoppingCart className="w-4 h-4 text-blue-500" />
                                </div>
                                <span className="text-sm text-muted-foreground">Toplam Satış</span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{data?.totalSales || 0}</p>
                        </div>
                        <div className="bg-card rounded-xl border border-border p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                </div>
                                <span className="text-sm text-muted-foreground">Toplam Ciro</span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{formatCurrency(data?.totalRevenue || 0)}</p>
                        </div>
                        <div className="bg-card rounded-xl border border-border p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 bg-amber-500/10 rounded-lg flex items-center justify-center">
                                    <RotateCcw className="w-4 h-4 text-amber-500" />
                                </div>
                                <span className="text-sm text-muted-foreground">KDV</span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{formatCurrency(data?.totalVat || 0)}</p>
                        </div>
                    </div>

                    {/* Payment breakdown */}
                    {data?.byPaymentType && Object.keys(data.byPaymentType).length > 0 && (
                        <div className="bg-card rounded-xl border border-border p-5 mb-6">
                            <h3 className="text-sm font-semibold text-foreground mb-4">Ödeme Tipi Kırılımı</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Object.entries(data.byPaymentType).map(([key, val]: any) => {
                                    const Icon = paymentIcons[key] || Banknote;
                                    return (
                                        <div key={key} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                                            <Icon className="w-5 h-5 text-primary" />
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{paymentLabels[key] || key}</p>
                                                <p className="text-xs text-muted-foreground">{val.count} satış · {formatCurrency(val.total)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Top sellers */}
                    {topSellers.length > 0 && (
                        <div className="bg-card rounded-xl border border-border overflow-hidden">
                            <div className="px-5 py-4 border-b border-border">
                                <h3 className="font-semibold text-foreground">En Çok Satan Ürünler</h3>
                            </div>
                            <div className="divide-y divide-border">
                                {topSellers.map((item: any, i: number) => (
                                    <div key={item.product?.id || i} className="flex items-center gap-4 px-5 py-3 hover:bg-accent/50 transition-colors">
                                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground">{item.product?.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.product?.sku}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-foreground">{item.totalQuantity} adet</p>
                                            <p className="text-xs text-muted-foreground">{formatCurrency(item.totalRevenue)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
