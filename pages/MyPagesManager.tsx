import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Edit2, Save, XCircle, FileText, ArrowRight, AlertCircle, Eye, Loader2 
} from 'lucide-react';
import { 
  PageSchema, Category, SubCategory, PageDefinition, DbDefinition, PageContent, User
} from '../types';

// Storage Keys matching other files
const STORAGE_KEY_PLANS = 'ems_plans';
const STORAGE_KEY_CATS = 'ems_categories';
const STORAGE_KEY_SUBS = 'ems_sub_categories';
const STORAGE_KEY_PAGE_DEFS = 'ems_page_defs';
const STORAGE_KEY_DB_DEFS = 'ems_db_defs';
const STORAGE_KEY_CONTENTS = 'ems_contents';
const STORAGE_KEY_USERS = 'ems_users';

const MyPagesManager: React.FC = () => {
  // --- LOADED DATA STATES ---
  const [plans, setPlans] = useState<PageSchema[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [pageDefinitions, setPageDefinitions] = useState<PageDefinition[]>([]);
  const [dbDefinitions, setDbDefinitions] = useState<DbDefinition[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [contents, setContents] = useState<PageContent[]>([]);

  // --- UI STATE ---
  const [currentUser, setCurrentUser] = useState<string>(''); // Acts as "Logged In User"
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingContent, setEditingContent] = useState<PageContent | null>(null);
  
  // Actual Form Data
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [editingStatus, setEditingStatus] = useState<'draft' | 'published'>('draft');

  // --- INITIAL LOAD ---
  useEffect(() => {
    const loadLS = (key: string, setter: React.Dispatch<React.SetStateAction<any>>) => {
        const item = localStorage.getItem(key);
        if (item) setter(JSON.parse(item));
    };

    loadLS(STORAGE_KEY_PLANS, setPlans);
    loadLS(STORAGE_KEY_CATS, setCategories);
    loadLS(STORAGE_KEY_SUBS, setSubCategories);
    loadLS(STORAGE_KEY_PAGE_DEFS, setPageDefinitions);
    loadLS(STORAGE_KEY_DB_DEFS, setDbDefinitions);
    loadLS(STORAGE_KEY_CONTENTS, setContents);
    loadLS(STORAGE_KEY_USERS, setUsers);
  }, []);

  // --- SAVE CONTENTS ---
  useEffect(() => {
      if (contents.length > 0) {
          localStorage.setItem(STORAGE_KEY_CONTENTS, JSON.stringify(contents));
      }
  }, [contents]);

  // --- HELPERS ---
  const getCategory = (id: string) => categories.find(c => c.id === id);
  const getSubCategory = (id: string) => subCategories.find(s => s.id === id);
  const getDefinition = (id: string) => pageDefinitions.find(p => p.id === id);
  const getDb = (id: string) => dbDefinitions.find(d => d.id === id);
  const getUser = (id: string) => users.find(u => u.id === id);

  const customerUsers = users.filter(u => u.roleId === 'role_customer');

  // --- ACTIONS ---
  const handleEdit = (content: PageContent) => {
    setEditingContent(content);
    setFormData(content.data);
    setEditingStatus(content.status || 'draft');
    setIsEditing(true);
  };

  const handleSave = () => {
      if (!editingContent) return;

      const updatedContent: PageContent = {
          ...editingContent,
          status: editingStatus,
          data: formData
      };

      setContents(prev => prev.map(c => c.id === editingContent.id ? updatedContent : c));
      setIsEditing(false);
      setEditingContent(null);
      setFormData({});
  };

  const myContents = contents.filter(c => c.ownerId === currentUser);

  // --- RENDER FORM FIELDS ---
  const renderFieldInput = (label: string, dbFieldId: string) => {
      if (!editingContent) return null;
      const def = getDefinition(editingContent.pageDefinitionId);
      if (!def) return null;
      const db = getDb(def.dbId);
      if (!db) return null;

      const fieldDef = db.fields.find(f => f.id === dbFieldId);
      if (!fieldDef) return null;

      const value = formData[fieldDef.key] || '';
      const handleChange = (val: any) => setFormData(prev => ({ ...prev, [fieldDef.key]: val }));

      return (
          <div key={dbFieldId} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
              </label>
              
              {fieldDef.type === 'long-text' ? (
                  <textarea 
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-primary resize-y min-h-[100px]"
                  />
              ) : fieldDef.type === 'boolean' ? (
                  <div className="flex items-center gap-2 mt-2">
                      <input 
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => handleChange(e.target.checked)}
                        className="w-5 h-5 text-primary rounded focus:ring-primary"
                      />
                      <span className="text-sm text-gray-600">{!!value ? 'Evet' : 'Hayır'}</span>
                  </div>
              ) : fieldDef.type === 'number' ? (
                  <input 
                    type="number"
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-primary"
                  />
              ) : (
                  <input 
                    type="text"
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-primary"
                  />
              )}
          </div>
      );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sayfalarım</h1>
          <p className="text-sm text-gray-500">Müşteri paneli simülasyonu.</p>
        </div>
      </div>

      {/* CUSTOMER SELECTOR (SIMULATION) */}
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 flex items-center gap-4">
          <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
              <UserCheck size={24} />
          </div>
          <div className="flex-1">
              <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Müşteri Seçimi (Simülasyon)</label>
              <select 
                value={currentUser} 
                onChange={(e) => { setCurrentUser(e.target.value); setIsEditing(false); }}
                className="w-full md:w-1/2 px-3 py-2 border border-blue-200 rounded-lg text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                  <option value="">Bir Müşteri Seçin...</option>
                  {customerUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                  ))}
              </select>
          </div>
      </div>

      {!currentUser ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
              <UserCheck size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Lütfen işlem yapmak için yukarıdan bir müşteri seçiniz.</p>
          </div>
      ) : isEditing && editingContent ? (
          /* EDIT FORM */
          <div className="bg-white p-6 rounded-xl shadow-lg border border-primary/20 mb-8 animate-fadeIn max-w-4xl mx-auto">
             <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
                <h2 className="text-lg font-bold text-gray-800">Sayfa Düzenle</h2>
                <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                    <XCircle size={24} />
                </button>
            </div>

            {/* Read-Only Info Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">1. Kategori</label>
                    <div className="text-sm font-medium text-gray-700">{getCategory(editingContent.categoryId)?.title || '-'}</div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">2. Alt Kategori</label>
                    <div className="text-sm font-medium text-gray-700">{getSubCategory(editingContent.subCategoryId)?.title || '-'}</div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Sayfa Yetkilisi</label>
                    <div className="text-sm font-medium text-gray-700">{getUser(currentUser)?.fullName}</div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
                <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <Edit2 size={16} className="text-primary"/> İçerik Düzenle
                </h3>
                {getDefinition(editingContent.pageDefinitionId)?.fields.map(field => renderFieldInput(field.label, field.dbFieldId))}
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Yayın Durumu</label>
                    <select 
                        value={editingStatus} 
                        onChange={(e) => setEditingStatus(e.target.value as any)}
                        className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-primary bg-white"
                    >
                        <option value="draft">Taslak</option>
                        <option value="published">Yayında</option>
                    </select>
                 </div>
                 <div className="flex gap-3">
                    <button onClick={() => setIsEditing(false)} className="px-6 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium">İptal</button>
                    <button onClick={handleSave} className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-8 py-2 rounded-lg transition-colors font-medium shadow-md">
                        <Save size={18} /> Değişiklikleri Kaydet
                    </button>
                 </div>
            </div>
          </div>
      ) : (
          /* LIST VIEW */
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4">Kategori / Alt Kategori</th>
                        <th className="px-6 py-4">Sayfa Tipi</th>
                        <th className="px-6 py-4">Son Güncelleme</th>
                        <th className="px-6 py-4">Durum</th>
                        <th className="px-6 py-4 text-right">İşlemler</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {myContents.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                <div className="flex flex-col items-center">
                                    <FileText size={48} className="text-gray-200 mb-3" />
                                    <p>Size atanmış herhangi bir sayfa bulunmamaktadır.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        myContents.map(content => {
                            const cat = getCategory(content.categoryId);
                            const sub = getSubCategory(content.subCategoryId);
                            const def = getDefinition(content.pageDefinitionId);

                            return (
                                <tr key={content.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-800">{cat?.title}</div>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                            <ArrowRight size={10} /> {sub?.title}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200">
                                            {def?.title}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(content.createdAt).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="px-6 py-4">
                                         {/* Status Badge */}
                                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${content.status === 'published' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'}`}>
                                             {content.status === 'published' ? 'YAYINDA' : 'TASLAK'}
                                         </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleEdit(content)}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors border border-orange-100"
                                        >
                                            <Edit2 size={14} /> Düzenle
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
          </div>
      )}

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
         <AlertCircle size={14} />
         <span>Bu sayfadaki veriler tarayıcınızın yerel hafızasında (localStorage) saklanmaktadır.</span>
      </div>
    </div>
  );
};

export default MyPagesManager;