'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import {
    ClipboardList, Loader2, ShoppingCart, TrendingUp, RotateCcw, Package,
    Banknote, CreditCard, Building2,
} from 'lucide-react';

export default function DailyReportPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await api.getDailySummary(date);
            setData(result);
        } catch (err: any) {
            toast({ title: 'Hata', description: err.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [date]);

    const paymentIcons: any = { CASH: Banknote, CARD: CreditCard, TRANSFER: Building2 };
    const paymentLabels: any = { CASH: 'Nakit', CARD: 'Kart', TRANSFER: 'Havale' };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Gün Sonu Raporu</h1>
                    <p className="text-sm text-muted-foreground">Günlük satış özeti</p>
                </div>
            </div>

            <div className="mb-6">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    className="px-4 py-2.5 bg-card border border-border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none" />
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : !data ? (
                <div className="bg-card rounded-xl border border-border p-12 text-center">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Veri bulunamadı</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-card rounded-xl border border-border p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <ShoppingCart className="w-4 h-4 text-blue-500" />
                                <span className="text-xs text-muted-foreground">Satış Adedi</span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{data.totalSales}</p>
                        </div>
                        <div className="bg-card rounded-xl border border-border p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <Package className="w-4 h-4 text-purple-500" />
                                <span className="text-xs text-muted-foreground">Ürün Adedi</span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{data.totalItems}</p>
                        </div>
                        <div className="bg-card rounded-xl border border-border p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs text-muted-foreground">Brüt Ciro</span>
                            </div>
                            <p className="text-2xl font-bold text-emerald-500">{formatCurrency(data.totalRevenue)}</p>
                        </div>
                        <div className="bg-card rounded-xl border border-border p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <RotateCcw className="w-4 h-4 text-red-500" />
                                <span className="text-xs text-muted-foreground">İade</span>
                            </div>
                            <p className="text-2xl font-bold text-red-500">{formatCurrency(data.totalRefunds)}</p>
                        </div>
                    </div>

                    {/* Net revenue */}
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-6 mb-6 text-white">
                        <p className="text-sm opacity-80">Net Ciro</p>
                        <p className="text-4xl font-bold mt-1">{formatCurrency(data.netRevenue)}</p>
                    </div>

                    {/* Payment breakdown */}
                    {data.byPaymentType && Object.keys(data.byPaymentType).length > 0 && (
                        <div className="bg-card rounded-xl border border-border p-5">
                            <h3 className="text-sm font-semibold text-foreground mb-4">Ödeme Tipi Dağılımı</h3>
                            <div className="space-y-3">
                                {Object.entries(data.byPaymentType).map(([key, val]: any) => {
                                    const Icon = paymentIcons[key] || Banknote;
                                    const pct = data.totalRevenue > 0 ? (val.total / data.totalRevenue) * 100 : 0;
                                    return (
                                        <div key={key}>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <Icon className="w-4 h-4 text-primary" />
                                                    <span className="text-sm text-foreground">{paymentLabels[key] || key}</span>
                                                </div>
                                                <span className="text-sm font-medium text-foreground">{formatCurrency(val.total)} ({val.count})</span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
