const API_BASE = '/api';

class ApiClient {
    private token: string | null = null;

    setToken(token: string | null) {
        this.token = token;
    }

    getToken() {
        return this.token;
    }

    private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const res = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers,
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: 'Bir hata oluştu' }));
            throw new Error(error.message || `HTTP ${res.status}`);
        }

        if (res.status === 204) return {} as T;
        return res.json();
    }

    // Auth
    login(email: string, password: string) {
        return this.request<any>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    getMe() {
        return this.request<any>('/auth/me');
    }

    // Products
    getProducts(params?: { search?: string; page?: number; limit?: number }) {
        const query = new URLSearchParams();
        if (params?.search) query.set('search', params.search);
        if (params?.page) query.set('page', String(params.page));
        if (params?.limit) query.set('limit', String(params.limit));
        return this.request<any>(`/products?${query}`);
    }

    getProductByBarcode(code: string) {
        return this.request<any>(`/products/barcode/${code}`);
    }

    searchProducts(q: string) {
        return this.request<any>(`/products/search?q=${encodeURIComponent(q)}`);
    }

    createProduct(data: any) {
        return this.request<any>('/products', { method: 'POST', body: JSON.stringify(data) });
    }

    updateProduct(id: string, data: any) {
        return this.request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    }

    deleteProduct(id: string) {
        return this.request<any>(`/products/${id}`, { method: 'DELETE' });
    }

    addBarcode(productId: string, code: string, label?: string) {
        return this.request<any>(`/products/${productId}/barcodes`, {
            method: 'POST',
            body: JSON.stringify({ code, label }),
        });
    }

    // Sales
    createSale(data: { lines: { productId: string; quantity: number }[]; paymentType?: string }) {
        return this.request<any>('/sales', { method: 'POST', body: JSON.stringify(data) });
    }

    getSales(params?: { page?: number; startDate?: string; endDate?: string }) {
        const query = new URLSearchParams();
        if (params?.page) query.set('page', String(params.page));
        if (params?.startDate) query.set('startDate', params.startDate);
        if (params?.endDate) query.set('endDate', params.endDate);
        return this.request<any>(`/sales?${query}`);
    }

    refundSale(id: string) {
        return this.request<any>(`/sales/${id}/refund`, { method: 'POST' });
    }

    // Stock
    getStockLevels(params?: { search?: string; page?: number }) {
        const query = new URLSearchParams();
        if (params?.search) query.set('search', params.search);
        if (params?.page) query.set('page', String(params.page));
        return this.request<any>(`/stock?${query}`);
    }

    getStockMovements(params?: { type?: string; page?: number }) {
        const query = new URLSearchParams();
        if (params?.type) query.set('type', params.type);
        if (params?.page) query.set('page', String(params.page));
        return this.request<any>(`/stock/movements?${query}`);
    }

    createStockMovement(data: { type: string; reason: string; description?: string; lines: { productId: string; quantity: number }[] }) {
        return this.request<any>('/stock/movement', { method: 'POST', body: JSON.stringify(data) });
    }

    // Reports
    getCriticalStock() {
        return this.request<any>('/reports/critical-stock');
    }

    getSalesSummary(params?: { startDate?: string; endDate?: string }) {
        const query = new URLSearchParams();
        if (params?.startDate) query.set('startDate', params.startDate);
        if (params?.endDate) query.set('endDate', params.endDate);
        return this.request<any>(`/reports/sales-summary?${query}`);
    }

    getTopSellers(params?: { limit?: number }) {
        const query = new URLSearchParams();
        if (params?.limit) query.set('limit', String(params.limit));
        return this.request<any>(`/reports/top-sellers?${query}`);
    }

    getDailySummary(date?: string) {
        const query = date ? `?date=${date}` : '';
        return this.request<any>(`/reports/daily-summary${query}`);
    }

    getStockValue() {
        return this.request<any>('/reports/stock-value');
    }

    // Categories
    getCategories() {
        return this.request<any>('/categories');
    }

    createCategory(name: string) {
        return this.request<any>('/categories', { method: 'POST', body: JSON.stringify({ name }) });
    }

    // Suppliers
    getSuppliers() {
        return this.request<any>('/suppliers');
    }

    // Users (Admin only)
    getUsers() {
        return this.request<any>('/users');
    }

    createUser(data: { email: string; password: string; name: string; role: string }) {
        return this.request<any>('/users', { method: 'POST', body: JSON.stringify(data) });
    }

    updateUser(id: string, data: { name?: string; role?: string; active?: boolean; password?: string }) {
        return this.request<any>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    }

    deleteUser(id: string) {
        return this.request<any>(`/users/${id}`, { method: 'DELETE' });
    }

    getSalesByCashier(params?: { startDate?: string; endDate?: string }) {
        const query = new URLSearchParams();
        if (params?.startDate) query.set('startDate', params.startDate);
        if (params?.endDate) query.set('endDate', params.endDate);
        return this.request<any>(`/users/sales?${query}`);
    }
}

export const api = new ApiClient();
