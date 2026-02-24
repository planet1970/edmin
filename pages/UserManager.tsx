import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, XCircle, Search, User as UserIcon, CheckCircle, AlertCircle, Phone, Mail } from 'lucide-react';
import { User, UserRole } from '../types';
import { userService } from '../services/users';

const UserManager: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<UserRole[]>([]);

    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Load Data
    useEffect(() => {
        loadRoles();
        loadUsers();
    }, []);

    const loadRoles = () => {
        const storedRoles = localStorage.getItem('ems_user_roles');
        if (storedRoles) {
            setRoles(JSON.parse(storedRoles));
        } else {
            setRoles([
                { id: 'VIEWER', title: 'Viewer', description: 'Standart Kullanıcı', isSystem: true },
                { id: 'ADMIN', title: 'Admin', description: 'Yönetici', isSystem: true }
            ]);
        }
    };

    const loadUsers = async () => {
        try {
            const data = await userService.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Kullanıcılar yüklenirken hata oluştu:', error);
        }
    };

    // --- ACTIONS ---
    const handleAddNew = () => {
        setEditingUser({
            id: '',
            fullName: '',
            email: '',
            phone: '',
            roleId: 'VIEWER',
            isActive: true,
            createdAt: ''
        });
        setIsEditing(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Kullanıcıyı silmek istediğinize emin misiniz?')) {
            try {
                await userService.delete(id);
                loadUsers();
            } catch (error) {
                alert('Silme işlemi başarısız oldu.');
            }
        }
    };

    const handleSave = async () => {
        if (!editingUser || !editingUser.fullName || !editingUser.email) {
            alert('Ad Soyad ve E-posta zorunludur.');
            return;
        }

        try {
            if (editingUser.id) {
                // Update
                const updateData = {
                    name: editingUser.fullName,
                    email: editingUser.email,
                    phone: editingUser.phone,
                    role: editingUser.roleId,
                    isActive: editingUser.isActive
                };
                await userService.update(editingUser.id, updateData);
            } else {
                // Create logic usually handled via register in this app, 
                // but if we need to create via Admin, we'd need another endpoint.
                alert('Admin üzerinden yeni kullanıcı ekleme özelliği henüz aktif değil, lütfen kayıt formunu kullanın.');
                return;
            }
            setIsEditing(false);
            setEditingUser(null);
            loadUsers();
        } catch (error) {
            alert('Kaydetme işlemi başarısız oldu.');
        }
    };

    // Filter
    const filteredUsers = users.filter(user =>
        (user.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Kullanıcılar</h1>
                    <p className="text-sm text-gray-500">Kayıtlı kullanıcıları listeleyin ve yönetin.</p>
                </div>
            </div>

            {isEditing && editingUser ? (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8 animate-fadeIn max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h2 className="text-lg font-bold text-gray-800">
                            {editingUser.id ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
                        </h2>
                        <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                            <XCircle size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                            <input
                                type="text"
                                value={editingUser.fullName}
                                onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta</label>
                            <input
                                type="email"
                                value={editingUser.email}
                                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                            <input
                                type="tel"
                                value={editingUser.phone || ''}
                                onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-primary"
                                placeholder="05XX XXX XX XX"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Tipi (Rolü)</label>
                            <select
                                value={editingUser.roleId}
                                onChange={(e) => setEditingUser({ ...editingUser, roleId: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-primary bg-white"
                            >
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${editingUser.isActive ? 'bg-primary' : 'bg-gray-300'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${editingUser.isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700">Kullanıcı Aktif</span>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={editingUser.isActive}
                                    onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-50">
                        <button onClick={() => setIsEditing(false)} className="px-6 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium">İptal</button>
                        <button onClick={handleSave} className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-8 py-2 rounded-lg transition-colors shadow-md">
                            <Save size={18} /> Kaydet
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Search */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3 max-w-lg">
                        <Search className="text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="İsim veya E-posta ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent focus:outline-none text-sm"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600"><XCircle size={16} /></button>
                        )}
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Kullanıcı</th>
                                    <th className="px-6 py-4">İletişim</th>
                                    <th className="px-6 py-4">Rol</th>
                                    <th className="px-6 py-4">Kayıt Tarihi</th>
                                    <th className="px-6 py-4">Durum</th>
                                    <th className="px-6 py-4 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                            Kullanıcı bulunamadı.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-orange-50 text-primary flex items-center justify-center font-bold text-sm">
                                                        {(user.fullName || user.email || '??').substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-800">{user.fullName || 'İsimsiz'}</div>
                                                        <div className="text-xs text-gray-500">ID: {user.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2"><Mail size={12} /> {user.email}</div>
                                                    {user.phone && <div className="flex items-center gap-2"><Phone size={12} /> {user.phone}</div>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs border border-gray-200 font-medium">
                                                    {user.roleId}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.isActive ? (
                                                    <span className="flex items-center gap-1 text-green-600 text-xs font-bold"><CheckCircle size={14} /> Aktif</span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-gray-400 text-xs font-bold"><XCircle size={14} /> Pasif</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleEdit(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <AlertCircle size={14} />
                <span>Bu veriler gerçek zamanlı olarak veritabanından çekilmektedir.</span>
            </div>
        </div>
    );
};

export default UserManager;
