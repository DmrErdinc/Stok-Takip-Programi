'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
    Boxes, Search, Loader2, AlertTriangle, ArrowUpCircle, ArrowDownCircle, RefreshCw,
    ChevronLeft, ChevronRight,
} from 'lucide-react';

export default function StockPage() {
    const [tab, setTab] = useState<'levels' | 'movements'>('levels');
    const [stockData, setStockData] = useState<any>({ items: [], total: 0, page: 1, totalPages: 1 });
    const [movements, setMovements] = useState<any>({ items: [], total: 0, page: 1, totalPages: 1 });
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [moveType, setMoveType] = useState('');

    const fetchStockLevels = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const data = await api.getStockLevels({ search, page });
            setStockData(data);
        } catch (err: any) {
            toast({ title: 'Hata', description: err.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [search]);

    const fetchMovements = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const data = await api.getStockMovements({ type: moveType || undefined, page });
            setMovements(data);
        } catch (err: any) {
            toast({ title: 'Hata', description: err.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [moveType]);

    useEffect(() => {
        if (tab === 'levels') {
            const timer = setTimeout(() => fetchStockLevels(), 300);
            return () => clearTimeout(timer);
        } else {
            fetchMovements();
        }
    }, [tab, fetchStockLevels, fetchMovements]);

    const typeLabel = (type: string) => {
        switch (type) {
            case 'IN': return { label: 'Giriş', color: 'text-emerald-500', icon: ArrowUpCircle };
            case 'OUT': return { label: 'Çıkış', color: 'text-red-500', icon: ArrowDownCircle };
            case 'ADJUST': return { label: 'Düzeltme', color: 'text-amber-500', icon: RefreshCw };
            default: return { label: type, color: 'text-foreground', icon: Boxes };
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Boxes className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Stok Yönetimi</h1>
                        <p className="text-sm text-muted-foreground">Anlık stok durumu ve hareket geçmişi</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-muted/50 rounded-xl p-1 w-fit border border-border">
                <button onClick={() => setTab('levels')} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'levels' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                    📦 Stok Durumu
                </button>
                <button onClick={() => setTab('movements')} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'movements' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                    📋 Hareketler
                </button>
            </div>

            {tab === 'levels' && (
                <>
                    <div className="mb-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ürün ara..."
                            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>

                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        {loading ? (
                            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/50">
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Ürün</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">SKU</th>
                                                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Mevcut</th>
                                                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Min</th>
                                                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Durum</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase hidden lg:table-cell">Değer</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {stockData.items.map((item: any) => (
                                                <tr key={item.id} className={`hover:bg-accent/50 transition-colors ${item.isCritical ? 'bg-red-500/5' : ''}`}>
                                                    <td className="px-4 py-3">
                                                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                                                        <p className="text-xs text-muted-foreground">{item.category?.name} · {item.barcodes?.[0]?.code}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground font-mono hidden md:table-cell">{item.sku}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`text-lg font-bold ${item.isCritical ? 'text-red-500' : 'text-foreground'}`}>{item.currentStock}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-sm text-muted-foreground hidden md:table-cell">{item.minStock}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        {item.isCritical ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-medium">
                                                                <AlertTriangle className="w-3 h-3" /> Kritik
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-medium">
                                                                Yeterli
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm text-muted-foreground hidden lg:table-cell">
                                                        {formatCurrency(item.currentStock * item.costPrice)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {stockData.totalPages > 1 && (
                                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                                        <p className="text-sm text-muted-foreground">Sayfa {stockData.page} / {stockData.totalPages}</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => fetchStockLevels(stockData.page - 1)} disabled={stockData.page <= 1}
                                                className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                                            <button onClick={() => fetchStockLevels(stockData.page + 1)} disabled={stockData.page >= stockData.totalPages}
                                                className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}

            {tab === 'movements' && (
                <>
                    <div className="mb-4 flex gap-2">
                        {['', 'IN', 'OUT', 'ADJUST'].map((t) => (
                            <button key={t} onClick={() => setMoveType(t)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${moveType === t ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>
                                {t === '' ? 'Tümü' : t === 'IN' ? 'Giriş' : t === 'OUT' ? 'Çıkış' : 'Düzeltme'}
                            </button>
                        ))}
                    </div>

                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        {loading ? (
                            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                        ) : movements.items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Boxes className="w-12 h-12 mb-3 opacity-20" />
                                <p>Hareket bulunamadı</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {movements.items.map((move: any) => {
                                    const info = typeLabel(move.type);
                                    const Icon = info.icon;
                                    return (
                                        <div key={move.id} className="px-4 py-4 hover:bg-accent/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Icon className={`w-5 h-5 ${info.color}`} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-sm font-semibold ${info.color}`}>{info.label}</span>
                                                        <span className="text-xs text-muted-foreground font-mono">{move.documentNo}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{move.description} · {move.user?.name} · {formatDate(move.createdAt)}</p>
                                                </div>
                                            </div>
                                            <div className="ml-8 mt-2 space-y-1">
                                                {move.lines?.map((line: any) => (
                                                    <div key={line.id} className="flex items-center justify-between text-sm">
                                                        <span className="text-foreground">{line.product?.name}</span>
                                                        <span className={`font-medium ${info.color}`}>
                                                            {move.type === 'OUT' ? '-' : move.type === 'IN' ? '+' : '±'}{line.quantity} adet
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
