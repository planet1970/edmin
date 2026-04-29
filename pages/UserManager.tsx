import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Mail, Phone, RefreshCw, Search, CheckCircle, Shield, Clock, Fingerprint
} from 'lucide-react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import { useCrud } from '../hooks/useCrud';
import { DataTable, Column } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';

const UserManager: React.FC = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: users,
    loading,
    fetchData,
    updateItem,
    deleteItem,
    toggleStatus,
  } = useCrud<User>({ 
    endpoint: '/users',
    onSuccess: (data) => {
        // Mapping logic if needed
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<User> | null>(null);

  useEffect(() => {
    fetchData();
    api.get<UserRole[]>('/users/types').then(setRoles).catch(console.error);
  }, [fetchData]);

  const handleEdit = (user: User) => {
    setEditingItem(user);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingItem?.id) return;
    try {
      await updateItem(editingItem.id, {
        fullName: editingItem.fullName,
        email: editingItem.email,
        phone: editingItem.phone,
        roleId: editingItem.roleId,
        isActive: editingItem.isActive
      });
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      // Handled by useCrud
    }
  };

  const getRoleBadge = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    const title = role ? role.title : roleId;
    
    const colors: Record<string, string> = {
      ADMIN: 'bg-red-100 text-red-700 border-red-200',
      EDITOR: 'bg-blue-100 text-blue-700 border-blue-200',
      USER: 'bg-gray-100 text-gray-700 border-gray-200',
      MODERATOR: 'bg-purple-100 text-purple-700 border-purple-200'
    };

    return (
      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${colors[roleId] || colors.USER}`}>
        {title}
      </span>
    );
  };

  const columns: Column<User>[] = [
    {
      header: 'Kullanıcı',
      accessor: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shadow-sm border border-orange-200">
            {(item.fullName || item.email || '??').substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-gray-900">{item.fullName || 'İsimsiz'}</div>
            <div className="text-[10px] text-gray-400 font-mono">ID: {item.id}</div>
          </div>
        </div>
      )
    },
    {
      header: 'İletişim',
      accessor: (item) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Mail size={12} className="text-gray-400" /> {item.email}
          </div>
          {item.phone && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Phone size={12} className="text-gray-400" /> {item.phone}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Yetki',
      accessor: (item) => getRoleBadge(item.roleId)
    },
    {
      header: 'Etkinlik',
      accessor: (item) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600">
            <RefreshCw size={12} /> {item.visitCount || 0} Ziyaret
          </div>
          {item.lastVisitAt && (
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <Clock size={10} />
              {new Date(item.lastVisitAt).toLocaleDateString('tr-TR')}
            </div>
          )}
        </div>
      )
    },
    {
        header: 'Güvenlik',
        accessor: (item) => (
            <div className="space-y-1">
                {item.fingerprint ? (
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 w-fit max-w-[120px] truncate" title={item.fingerprint}>
                        <Fingerprint size={10} /> {item.fingerprint}
                    </div>
                ) : (
                    <span className="text-[10px] text-gray-300 italic">Anonim</span>
                )}
            </div>
        )
    }
  ];

  const filteredUsers = users.filter(user =>
    (user.fullName || user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Users className="text-orange-500" size={32} />
            Kullanıcı Yönetimi
          </h1>
          <p className="text-gray-500 mt-1">Platforma kayıtlı tüm kullanıcıları ve yetkilerini yönetin.</p>
        </div>
        <button
          onClick={() => fetchData()}
          className="p-2.5 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl border border-gray-200 bg-white transition-all shadow-sm"
          title="Listeyi Yenile"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group focus-within:ring-2 focus-within:ring-orange-500/20 transition-all max-w-md">
        <Search className="text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="İsim, e-posta veya ID ile ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium text-gray-700"
        />
      </div>

      <DataTable
        data={filteredUsers}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={deleteItem}
        onToggle={toggleStatus}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Kullanıcı Bilgilerini Düzenle"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Ad Soyad</label>
              <input
                type="text"
                value={editingItem?.fullName || ''}
                onChange={(e) => setEditingItem({ ...editingItem!, fullName: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">E-Posta Adresi</label>
              <input
                type="email"
                value={editingItem?.email || ''}
                onChange={(e) => setEditingItem({ ...editingItem!, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Telefon Numarası</label>
              <input
                type="tel"
                value={editingItem?.phone || ''}
                onChange={(e) => setEditingItem({ ...editingItem!, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none font-medium"
                placeholder="05XX XXX XX XX"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Kullanıcı Rolü</label>
              <div className="relative">
                <select
                  value={editingItem?.roleId}
                  onChange={(e) => setEditingItem({ ...editingItem!, roleId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none font-bold text-orange-600 appearance-none"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.title}</option>
                  ))}
                </select>
                <Shield className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={18} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
            <input
              type="checkbox"
              id="userActive"
              checked={editingItem?.isActive || false}
              onChange={(e) => setEditingItem({ ...editingItem!, isActive: e.target.checked })}
              className="w-5 h-5 text-orange-500 rounded-lg focus:ring-orange-500 transition-all cursor-pointer"
            />
            <div>
              <label htmlFor="userActive" className="text-sm font-bold text-orange-900 cursor-pointer block">
                Kullanıcı Hesabı Aktif
              </label>
              <p className="text-xs text-orange-600 mt-0.5">Pasif kullanıcılar sisteme giriş yapamazlar.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Vazgeç
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-100 transition-all font-bold text-sm"
            >
              Değişiklikleri Kaydet
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManager;
