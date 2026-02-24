import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Shield, AlertCircle, XCircle, Save } from 'lucide-react';
import { UserRole } from '../types';

const STORAGE_KEY = 'ems_user_roles';

const UserTypeManager: React.FC = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setRoles(JSON.parse(stored));
    } else {
      // Default initialization
      const defaults: UserRole[] = [
        { id: 'role_super_admin', title: 'Super Admin', description: 'Tam yetkili sistem yöneticisi', isSystem: true },
        { id: 'role_admin', title: 'Admin', description: 'Yönetim paneli erişimi', isSystem: true },
        { id: 'role_user', title: 'User', description: 'Standart son kullanıcı', isSystem: true },
        { id: 'role_customer', title: 'Customer', description: 'Müşteri hesabı', isSystem: true },
      ];
      setRoles(defaults);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    }
  }, []);

  useEffect(() => {
    if (roles.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
    }
  }, [roles]);

  const handleCreateNew = () => {
    setEditingRole({
      id: '',
      title: '',
      description: '',
      isSystem: false
    });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu kullanıcı tipini silmek istediğinize emin misiniz?')) {
      const newRoles = roles.filter(r => r.id !== id);
      setRoles(newRoles);
    }
  };

  const handleSave = () => {
    if (!editingRole || !editingRole.title) return;

    if (editingRole.id) {
        // Edit existing (Not implemented fully in UI but handled here)
        setRoles(prev => prev.map(r => r.id === editingRole.id ? editingRole : r));
    } else {
        const newRole = { 
            ...editingRole, 
            id: `role_${Date.now()}`
        };
        setRoles([...roles, newRole]);
    }
    setIsEditing(false);
    setEditingRole(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kullanıcı Tipleri</h1>
          <p className="text-sm text-gray-500">Sistemdeki kullanıcı yetki ve rollerini yönetin.</p>
        </div>
        {!isEditing && (
            <button 
                onClick={handleCreateNew}
                className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
            >
                <Plus size={18} /> Yeni Tip Ekle
            </button>
        )}
      </div>

      {isEditing && editingRole && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8 animate-fadeIn max-w-2xl">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                 <h2 className="font-bold text-gray-800">Yeni Kullanıcı Tipi Ekle</h2>
                 <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                    <XCircle size={20} />
                 </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tip Adı</label>
                      <input 
                        type="text"
                        value={editingRole.title}
                        onChange={(e) => setEditingRole({...editingRole, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-primary"
                        placeholder="Örn: Editor"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                      <input 
                        type="text"
                        value={editingRole.description}
                        onChange={(e) => setEditingRole({...editingRole, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-primary"
                        placeholder="Örn: İçerik düzenleyici"
                      />
                  </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-50">
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">İptal</button>
                  <button onClick={handleSave} className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors">
                      <Save size={16}/> Kaydet
                  </button>
              </div>
          </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm max-w-4xl">
        <table className="w-full text-left">
           <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase border-b border-gray-100">
               <tr>
                   <th className="px-6 py-4 w-10"></th>
                   <th className="px-6 py-4">Tip Adı</th>
                   <th className="px-6 py-4">Açıklama</th>
                   <th className="px-6 py-4">Sistem Rolü</th>
                   <th className="px-6 py-4 text-right">İşlemler</th>
               </tr>
           </thead>
           <tbody className="divide-y divide-gray-100">
               {roles.map((role) => (
                   <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                       <td className="px-6 py-4 text-primary"><Shield size={18}/></td>
                       <td className="px-6 py-4 font-bold text-gray-800">{role.title}</td>
                       <td className="px-6 py-4 text-gray-600 text-sm">{role.description}</td>
                       <td className="px-6 py-4">
                           {role.isSystem ? (
                               <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded border border-blue-100 font-medium">SİSTEM</span>
                           ) : (
                               <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200">ÖZEL</span>
                           )}
                       </td>
                       <td className="px-6 py-4 text-right">
                           {!role.isSystem && (
                               <button onClick={() => handleDelete(role.id)} className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors">
                                   <Trash2 size={18}/>
                               </button>
                           )}
                       </td>
                   </tr>
               ))}
           </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
         <AlertCircle size={14} />
         <span>Bu sayfadaki veriler tarayıcınızın yerel hafızasında (localStorage) saklanmaktadır.</span>
      </div>
    </div>
  );
};

export default UserTypeManager;