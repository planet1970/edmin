import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Shield, AlertCircle, XCircle, Save, RefreshCw } from 'lucide-react';
import { UserRole } from '../types';
import { userService } from '../services/users';

const UserTypeManager: React.FC = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await userService.getTypes();
      setRoles(data);
      // Update localStorage for other parts of the app that might still use it
      localStorage.setItem('ems_user_roles', JSON.stringify(data));
    } catch (error) {
      console.error('Kullanıcı tipleri yüklenirken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingRole({
      id: '',
      title: '',
      description: '',
      isSystem: false
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu kullanıcı tipini silmek istediğinize emin misiniz?')) {
      try {
        await userService.deleteType(id);
        loadRoles();
      } catch (error) {
        alert('Silme işlemi başarısız oldu.');
      }
    }
  };

  const handleSave = async () => {
    if (!editingRole || !editingRole.title) return;

    try {
      // If we don't have an ID, we'll let the backend generate one or use the title as basis
      // But based on our new DB schema, ID is required.
      const payload = {
        ...editingRole,
        id: editingRole.id || editingRole.title.toUpperCase().replace(/\s+/g, '_')
      };

      await userService.createType(payload);
      setIsEditing(false);
      setEditingRole(null);
      loadRoles();
    } catch (error) {
      alert('Kaydetme işlemi başarısız oldu.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kullanıcı Tipleri</h1>
          <p className="text-sm text-gray-500">Sistemdeki kullanıcı yetki ve rollerini yönetin.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadRoles}
            className="p-2 text-gray-400 hover:text-primary transition-colors bg-white rounded-lg border border-gray-200"
            title="Yenile"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          {!isEditing && (
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
            >
              <Plus size={18} /> Yeni Tip Ekle
            </button>
          )}
        </div>
      </div>

      {isEditing && editingRole && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8 animate-fadeIn max-w-2xl">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="font-bold text-gray-800">{editingRole.id ? 'Tipi Düzenle' : 'Yeni Kullanıcı Tipi Ekle'}</h2>
            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
              <XCircle size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID (Kod)</label>
              <input
                type="text"
                value={editingRole.id}
                onChange={(e) => setEditingRole({ ...editingRole, id: e.target.value.toUpperCase() })}
                disabled={!!editingRole.id && editingRole.isSystem}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-primary disabled:bg-gray-50"
                placeholder="Örn: EDITOR"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tip Adı</label>
              <input
                type="text"
                value={editingRole.title}
                onChange={(e) => setEditingRole({ ...editingRole, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-primary"
                placeholder="Örn: Editör"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
              <input
                type="text"
                value={editingRole.description || ''}
                onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-primary"
                placeholder="Örn: İçerik düzenleyici yetkileri"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-50">
            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">İptal</button>
            <button onClick={handleSave} className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors">
              <Save size={16} /> Kaydet
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm max-w-4xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-10"></th>
                <th className="px-6 py-4">ID / Kod</th>
                <th className="px-6 py-4">Tip Adı</th>
                <th className="px-6 py-4">Açıklama</th>
                <th className="px-6 py-4 text-center">Durum</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Yükleniyor...</td></tr>
              ) : roles.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Kayıt bulunamadı.</td></tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-primary"><Shield size={18} /></td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-gray-500">{role.id}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{role.title}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm truncate max-w-[200px]" title={role.description || ''}>{role.description}</td>
                    <td className="px-6 py-4 text-center">
                      {role.isSystem ? (
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] rounded border border-blue-100 font-bold uppercase">SİSTEM</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] rounded border border-gray-200 font-bold uppercase">ÖZEL</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => { setEditingRole(role); setIsEditing(true); }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                          title="Düzenle"
                        >
                          <Save size={16} />
                        </button>
                        {!role.isSystem && (
                          <button
                            onClick={() => handleDelete(role.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
        <AlertCircle size={14} />
        <span>Kullanıcı tipleri doğrudan veritabanından yönetilmektedir.</span>
      </div>
    </div>
  );
};

export default UserTypeManager;