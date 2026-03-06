'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { AlertTriangle, Loader2, Package } from 'lucide-react';

export default function CriticalStockPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getCriticalStock()
            .then(setItems)
            .catch((err) => toast({ title: 'Hata', description: err.message, variant: 'destructive' }))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Kritik Stok Raporu</h1>
                    <p className="text-sm text-muted-foreground">Minimum stok seviyesine ulaşmış ürünler</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : items.length === 0 ? (
                <div className="bg-card rounded-xl border border-border p-12 text-center">
                    <Package className="w-12 h-12 mx-auto mb-3 text-emerald-500/30" />
                    <p className="text-lg font-medium text-foreground">Tüm stoklar yeterli</p>
                    <p className="text-sm text-muted-foreground mt-1">Kritik seviyede ürün bulunmamaktadır</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {items.map((item: any) => (
                        <div key={item.id} className="bg-card rounded-xl border border-red-500/20 p-4 flex items-center gap-4 hover:border-red-500/40 transition-colors">
                            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground">{item.name}</p>
                                <p className="text-xs text-muted-foreground">{item.sku} · {item.category?.name} · {item.barcodes?.[0]?.code}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-2xl font-bold text-red-500">{item.currentStock}</p>
                                <p className="text-xs text-muted-foreground">Min: {item.minStock}</p>
                            </div>
                            <div className="text-right flex-shrink-0 hidden md:block">
                                <p className="text-sm text-muted-foreground">Raf</p>
                                <p className="text-sm font-medium text-foreground">{item.shelfLocation || '-'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
