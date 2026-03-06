'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import {
    ShoppingCart, Search, Barcode, Trash2, Plus, Minus, CreditCard,
    Banknote, Building2, Check, X, Loader2, Keyboard,
} from 'lucide-react';

interface CartItem {
    productId: string;
    name: string;
    sku: string;
    barcode: string;
    unitPrice: number;
    vatRate: number;
    quantity: number;
}

export default function POSPage() {
    const { user } = useAuth();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showSearch, setShowSearch] = useState(false);
    const [loading, setLoading] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [paymentType, setPaymentType] = useState<string>('CASH');
    const barcodeRef = useRef<HTMLInputElement>(null);

    // Auto-focus barcode input
    useEffect(() => {
        barcodeRef.current?.focus();
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'F2') {
                e.preventDefault();
                barcodeRef.current?.focus();
            }
            if (e.key === 'Delete' && cart.length > 0) {
                // Remove last item
                setCart((prev) => prev.slice(0, -1));
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [cart]);

    const addProductToCart = useCallback((product: any) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.productId === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                );
            }
            return [
                ...prev,
                {
                    productId: product.id,
                    name: product.name,
                    sku: product.sku,
                    barcode: product.barcodes?.[0]?.code || '',
                    unitPrice: product.salePrice,
                    vatRate: product.vatRate,
                    quantity: 1,
                },
            ];
        });
    }, []);

    const handleBarcodeScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!barcodeInput.trim()) return;

        setLoading(true);
        try {
            const product = await api.getProductByBarcode(barcodeInput.trim());
            addProductToCart(product);
            toast({ title: `${product.name} eklendi`, variant: 'success' });
        } catch {
            toast({ title: 'Ürün bulunamadı', description: `Barkod: ${barcodeInput}`, variant: 'destructive' });
        } finally {
            setBarcodeInput('');
            setLoading(false);
            barcodeRef.current?.focus();
        }
    };

    const handleSearch = async (q: string) => {
        setSearchQuery(q);
        if (q.length < 2) { setSearchResults([]); return; }
        try {
            const results = await api.searchProducts(q);
            setSearchResults(results);
        } catch {
            setSearchResults([]);
        }
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart((prev) =>
            prev
                .map((item) =>
                    item.productId === productId
                        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
                        : item,
                )
                .filter((item) => item.quantity > 0),
        );
    };

    const removeItem = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.productId !== productId));
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const cartVat = cart.reduce(
        (sum, item) => sum + (item.unitPrice * item.quantity * item.vatRate) / (100 + item.vatRate),
        0,
    );

    const completeSale = async () => {
        if (cart.length === 0) return;
        setCompleting(true);
        try {
            const result = await api.createSale({
                lines: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
                paymentType,
            });
            toast({ title: '✅ Satış tamamlandı!', description: `Fiş No: ${result.receiptNo}`, variant: 'success' });
            setCart([]);
            setBarcodeInput('');
            barcodeRef.current?.focus();
        } catch (err: any) {
            toast({ title: 'Satış hatası', description: err.message, variant: 'destructive' });
        } finally {
            setCompleting(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
            {/* Left: Barcode + Search + Results */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
                {/* Barcode Input */}
                <div className="bg-card rounded-xl border border-border p-4">
                    <form onSubmit={handleBarcodeScan} className="flex gap-3">
                        <div className="relative flex-1">
                            <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                ref={barcodeRef}
                                id="barcode-input"
                                value={barcodeInput}
                                onChange={(e) => setBarcodeInput(e.target.value)}
                                placeholder="Barkod okutun veya yazın... (F2 odak)"
                                className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-lg font-mono"
                                autoComplete="off"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ekle'}
                        </button>
                    </form>

                    {/* Search toggle */}
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className="mt-3 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Search className="w-4 h-4" />
                        {showSearch ? 'Aramayı kapat' : 'Ürün ara (isim/SKU)'}
                    </button>

                    {showSearch && (
                        <div className="mt-3">
                            <input
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Ürün adı veya SKU giriniz..."
                                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                            {searchResults.length > 0 && (
                                <div className="mt-2 max-h-60 overflow-y-auto border border-border rounded-lg divide-y divide-border">
                                    {searchResults.map((p: any) => (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                addProductToCart(p);
                                                setSearchQuery('');
                                                setSearchResults([]);
                                                toast({ title: `${p.name} eklendi`, variant: 'success' });
                                                barcodeRef.current?.focus();
                                            }}
                                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors text-left"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{p.name}</p>
                                                <p className="text-xs text-muted-foreground">{p.sku} · {p.barcodes?.[0]?.code}</p>
                                            </div>
                                            <span className="text-sm font-semibold text-primary">{formatCurrency(p.salePrice)}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Cart */}
                <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                        <h2 className="font-semibold text-foreground">Sepet</h2>
                        <span className="ml-auto text-sm text-muted-foreground">{cart.length} ürün</span>
                    </div>

                    {cart.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                            <Barcode className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">Sepet boş</p>
                            <p className="text-sm mt-1">Barkod okutarak veya arayarak ürün ekleyin</p>
                            <div className="mt-4 flex items-center gap-2 text-xs">
                                <Keyboard className="w-4 h-4" />
                                <span>F2: Barkod odak · Enter: Ekle · Del: Son kalem sil</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto divide-y divide-border">
                            {cart.map((item) => (
                                <div key={item.productId} className="flex items-center gap-4 px-4 py-3 hover:bg-accent/50 transition-colors animate-fade-in">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">{item.sku} · {formatCurrency(item.unitPrice)}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => updateQuantity(item.productId, -1)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-background border border-border hover:bg-accent transition-colors"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.productId, 1)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-background border border-border hover:bg-accent transition-colors"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <p className="w-24 text-right text-sm font-semibold text-foreground">
                                        {formatCurrency(item.unitPrice * item.quantity)}
                                    </p>
                                    <button
                                        onClick={() => removeItem(item.productId)}
                                        className="text-red-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Payment */}
            <div className="w-full lg:w-80 flex flex-col gap-4">
                {/* Payment Type */}
                <div className="bg-card rounded-xl border border-border p-4">
                    <p className="text-sm font-medium text-foreground mb-3">Ödeme Tipi</p>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { value: 'CASH', label: 'Nakit', icon: Banknote },
                            { value: 'CARD', label: 'Kart', icon: CreditCard },
                            { value: 'TRANSFER', label: 'Havale', icon: Building2 },
                        ].map((pt) => (
                            <button
                                key={pt.value}
                                onClick={() => setPaymentType(pt.value)}
                                className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border transition-all ${paymentType === pt.value
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                                    }`}
                            >
                                <pt.icon className="w-5 h-5" />
                                <span className="text-xs font-medium">{pt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-card rounded-xl border border-border p-4 flex-1 flex flex-col">
                    <div className="space-y-3 flex-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Ara Toplam</span>
                            <span className="text-foreground font-medium">{formatCurrency(cartTotal - cartVat)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">KDV</span>
                            <span className="text-foreground font-medium">{formatCurrency(cartVat)}</span>
                        </div>
                        <div className="h-px bg-border" />
                        <div className="flex justify-between">
                            <span className="text-lg font-semibold text-foreground">Toplam</span>
                            <span className="text-2xl font-bold text-primary">{formatCurrency(cartTotal)}</span>
                        </div>
                    </div>

                    <div className="mt-6 space-y-2">
                        <button
                            onClick={completeSale}
                            disabled={cart.length === 0 || completing}
                            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                        >
                            {completing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Check className="w-5 h-5" />
                            )}
                            {completing ? 'İşleniyor...' : 'Satışı Tamamla'}
                        </button>
                        <button
                            onClick={() => { setCart([]); barcodeRef.current?.focus(); }}
                            disabled={cart.length === 0}
                            className="w-full py-2.5 border border-border text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                        >
                            <X className="w-4 h-4" />
                            Sepeti Temizle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
