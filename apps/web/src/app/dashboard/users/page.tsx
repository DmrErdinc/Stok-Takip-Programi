'use client';

import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { Users, Plus, Edit, Trash2, Shield, ShoppingCart, Eye, EyeOff } from 'lucide-react';

export default function UsersPage() {
    const { isAdmin } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState<any>(null);

    // Form state
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formPassword, setFormPassword] = useState('');
    const [formRole, setFormRole] = useState('CASHIER');
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);

    const loadUsers = async () => {
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (e: any) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadUsers(); }, []);

    const openCreate = () => {
        setEditUser(null);
        setFormName('');
        setFormEmail('');
        setFormPassword('');
        setFormRole('CASHIER');
        setShowModal(true);
    };

    const openEdit = (u: any) => {
        setEditUser(u);
        setFormName(u.name);
        setFormEmail(u.email);
        setFormPassword('');
        setFormRole(u.role);
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editUser) {
                const data: any = { name: formName, role: formRole };
                if (formPassword) data.password = formPassword;
                await api.updateUser(editUser.id, data);
            } else {
                await api.createUser({ email: formEmail, password: formPassword, name: formName, role: formRole });
            }
            setShowModal(false);
            loadUsers();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (u: any) => {
        try {
            await api.updateUser(u.id, { active: !u.active });
            loadUsers();
        } catch (e: any) {
            alert(e.message);
        }
    };

    const roleLabel = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'Yönetici';
            case 'CASHIER': return 'Kasiyer';
            case 'AUDITOR': return 'Denetçi';
            default: return role;
        }
    };

    const roleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'CASHIER': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'AUDITOR': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            default: return 'bg-gray-500/10 text-gray-400';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Kullanıcı Yönetimi</h1>
                        <p className="text-sm text-muted-foreground">Admin ve kasiyer hesaplarını yönetin</p>
                    </div>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg"
                >
                    <Plus className="w-4 h-4" />
                    Yeni Kullanıcı
                </button>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {users.map((u) => (
                    <div key={u.id} className={`bg-card border border-border rounded-xl p-5 transition-all hover:shadow-lg ${!u.active ? 'opacity-50' : ''}`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${u.role === 'ADMIN' ? 'bg-gradient-to-br from-purple-600 to-pink-500 text-white' : 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white'}`}>
                                    {u.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">{u.name}</h3>
                                    <p className="text-xs text-muted-foreground">{u.email}</p>
                                </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${roleColor(u.role)}`}>
                                {u.role === 'ADMIN' && <Shield className="w-3 h-3 inline mr-1" />}
                                {u.role === 'CASHIER' && <ShoppingCart className="w-3 h-3 inline mr-1" />}
                                {roleLabel(u.role)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${u.active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                <span className="text-xs text-muted-foreground">{u.active ? 'Aktif' : 'Pasif'}</span>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => openEdit(u)}
                                    className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                    title="Düzenle"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleToggleActive(u)}
                                    className={`p-2 rounded-lg transition-colors ${u.active ? 'hover:bg-red-500/10 text-muted-foreground hover:text-red-400' : 'hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-400'}`}
                                    title={u.active ? 'Pasif yap' : 'Aktif yap'}
                                >
                                    {u.active ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
                        <h2 className="text-lg font-bold text-foreground mb-6">
                            {editUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Ad Soyad</label>
                                <input
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Ad Soyad"
                                />
                            </div>
                            {!editUser && (
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">E-posta</label>
                                    <input
                                        value={formEmail}
                                        onChange={(e) => setFormEmail(e.target.value)}
                                        type="email"
                                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="ornek@email.com"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                    {editUser ? 'Yeni Şifre (boş bırakılırsa değişmez)' : 'Şifre'}
                                </label>
                                <div className="relative">
                                    <input
                                        value={formPassword}
                                        onChange={(e) => setFormPassword(e.target.value)}
                                        type={showPassword ? 'text' : 'password'}
                                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
                                        placeholder={editUser ? '••••••' : 'Şifre girin'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Rol</label>
                                <select
                                    value={formRole}
                                    onChange={(e) => setFormRole(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="ADMIN">Yönetici (Admin)</option>
                                    <option value="CASHIER">Kasiyer</option>
                                    <option value="AUDITOR">Denetçi</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-medium text-foreground hover:bg-accent transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !formName || (!editUser && (!formEmail || !formPassword))}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {saving ? 'Kaydediliyor...' : editUser ? 'Güncelle' : 'Oluştur'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
