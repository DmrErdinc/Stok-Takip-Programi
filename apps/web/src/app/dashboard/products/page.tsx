'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import {
    Package, Plus, Search, Edit, Trash2, X, Loader2, ChevronLeft, ChevronRight, Tag,
} from 'lucide-react';

export default function ProductsPage() {
    const { isAdmin } = useAuth();
    const [products, setProducts] = useState<any>({ items: [], total: 0, page: 1, totalPages: 1 });
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        sku: '', name: '', brand: '', categoryId: '', salePrice: '', costPrice: '',
        shelfLocation: '', barcodeCode: '', stockQuantity: '0',
    });

    const fetchProducts = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const data = await api.getProducts({ search, page, limit: 20 });
            setProducts(data);
        } catch (err: any) {
            toast({ title: 'Hata', description: err.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(() => fetchProducts(), 300);
        return () => clearTimeout(timer);
    }, [fetchProducts]);

    useEffect(() => {
        api.getCategories().then(setCategories).catch(() => { });
    }, []);

    const resetForm = () => {
        setForm({ sku: '', name: '', brand: '', categoryId: '', salePrice: '', costPrice: '', shelfLocation: '', barcodeCode: '', stockQuantity: '0' });
        setEditing(null);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editing) {
                // Don't send sku on update — UpdateProductDto rejects it
                await api.updateProduct(editing.id, {
                    name: form.name,
                    brand: form.brand || undefined,
                    categoryId: form.categoryId || undefined,
                    salePrice: parseFloat(form.salePrice),
                    costPrice: parseFloat(form.costPrice) || 0,
                    shelfLocation: form.shelfLocation || undefined,
                });
                toast({ title: '✅ Ürün güncellendi' });
            } else {
                const qty = parseInt(form.stockQuantity) || 0;
                const createData: any = {
                    sku: form.sku,
                    name: form.name,
                    brand: form.brand || undefined,
                    categoryId: form.categoryId || undefined,
                    salePrice: parseFloat(form.salePrice),
                    costPrice: parseFloat(form.costPrice) || 0,
                    minStock: 5,
                    initialStock: qty,
                };
                if (form.barcodeCode) createData.barcodes = [{ code: form.barcodeCode }];
                if (form.shelfLocation) createData.shelfLocation = form.shelfLocation;

                await api.createProduct(createData);
                toast({ title: '✅ Ürün oluşturuldu' });
            }
            resetForm();
            fetchProducts();
        } catch (err: any) {
            toast({ title: 'Hata', description: err.message, variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (product: any) => {
        setEditing(product);
        setForm({
            sku: product.sku,
            name: product.name,
            brand: product.brand || '',
            categoryId: product.categoryId || '',
            salePrice: String(product.salePrice),
            costPrice: String(product.costPrice),
            shelfLocation: product.shelfLocation || '',
            barcodeCode: '',
            stockQuantity: '0',
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
        try {
            await api.deleteProduct(id);
            toast({ title: '🗑️ Ürün silindi' });
            fetchProducts();
        } catch (err: any) {
            toast({ title: 'Hata', description: err.message, variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Ürün Yönetimi</h1>
                        <p className="text-sm text-muted-foreground">{products.total} ürün kayıtlı</p>
                    </div>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <Plus className="w-4 h-4" />
                        Yeni Ürün
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Ürün adı, SKU veya barkod ile ara..."
                    className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                />
            </div>

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    {editing ? <Edit className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-white" />}
                                </div>
                                <h2 className="font-semibold text-foreground">{editing ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h2>
                            </div>
                            <button onClick={resetForm} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">SKU *</label>
                                    <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required disabled={!!editing}
                                        className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:ring-2 focus:ring-violet-500/40 focus:outline-none disabled:opacity-50 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Marka</label>
                                    <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:ring-2 focus:ring-violet-500/40 focus:outline-none transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Ürün Adı *</label>
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:ring-2 focus:ring-violet-500/40 focus:outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Kategori</label>
                                <select
                                    value={form.categoryId}
                                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:ring-2 focus:ring-violet-500/40 focus:outline-none transition-all"
                                >
                                    <option value="">Kategori seçin...</option>
                                    {categories.map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Satış Fiyatı (₺) *</label>
                                    <input type="number" step="0.01" min="0" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} required
                                        className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:ring-2 focus:ring-violet-500/40 focus:outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Alış Fiyatı (₺)</label>
                                    <input type="number" step="0.01" min="0" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:ring-2 focus:ring-violet-500/40 focus:outline-none transition-all" />
                                </div>
                            </div>
                            {!editing && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Stok Adedi</label>
                                        <input type="number" min="0" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                                            className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:ring-2 focus:ring-violet-500/40 focus:outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Barkod</label>
                                        <input value={form.barcodeCode} onChange={(e) => setForm({ ...form, barcodeCode: e.target.value })} placeholder="Opsiyonel"
                                            className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:ring-2 focus:ring-violet-500/40 focus:outline-none transition-all" />
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Raf Konumu</label>
                                <input value={form.shelfLocation} onChange={(e) => setForm({ ...form, shelfLocation: e.target.value })} placeholder="Örn: A-1-01"
                                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:ring-2 focus:ring-violet-500/40 focus:outline-none transition-all" />
                            </div>
                            <button type="submit" disabled={submitting}
                                className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2">
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {editing ? 'Güncelle' : 'Oluştur'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Product Grid */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-7 h-7 animate-spin text-violet-500" />
                    </div>
                ) : products.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <Package className="w-14 h-14 mb-4 opacity-15" />
                        <p className="text-lg font-medium">Ürün bulunamadı</p>
                        <p className="text-sm mt-1">Arama kriterlerinizi değiştirin veya yeni ürün ekleyin</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">SKU</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ürün</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Kategori</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Barkod</th>
                                        <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fiyat</th>
                                        {isAdmin && <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">İşlem</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {products.items.map((p: any) => (
                                        <tr key={p.id} className="hover:bg-accent/30 transition-colors group">
                                            <td className="px-5 py-4 text-sm font-mono text-muted-foreground">{p.sku}</td>
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-semibold text-foreground">{p.name}</p>
                                                {p.brand && <p className="text-xs text-muted-foreground mt-0.5">{p.brand}</p>}
                                            </td>
                                            <td className="px-5 py-4 hidden md:table-cell">
                                                {p.category ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-500/10 text-violet-400 rounded-lg text-xs font-medium">
                                                        <Tag className="w-3 h-3" />
                                                        {p.category.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground/50">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-muted-foreground hidden lg:table-cell font-mono">{p.barcodes?.[0]?.code || '—'}</td>
                                            <td className="px-5 py-4 text-right">
                                                <p className="text-sm font-bold text-foreground">{formatCurrency(p.salePrice)}</p>
                                                <p className="text-xs text-muted-foreground">{formatCurrency(p.costPrice)}</p>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleEdit(p)} className="p-2 rounded-lg hover:bg-violet-500/10 text-muted-foreground hover:text-violet-400 transition-all">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {products.totalPages > 1 && (
                            <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-muted/20">
                                <p className="text-sm text-muted-foreground">Sayfa {products.page} / {products.totalPages}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => fetchProducts(products.page - 1)} disabled={products.page <= 1}
                                        className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-30 transition-all">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => fetchProducts(products.page + 1)} disabled={products.page >= products.totalPages}
                                        className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-30 transition-all">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
