import React, { useState, useEffect } from 'react';
import {
    Plus, Trash2, Edit2, Save, XCircle, FileText, ArrowRight, Filter, AlertCircle, User as UserIcon
} from 'lucide-react';
import {
    Category, SubCategory, PageContent, User
} from '../types';
import { categoriesService } from '../services/categories';
import { subcategoriesService } from '../services/subcategories';

const STORAGE_KEY_CONTENTS = 'ems_contents';
const STORAGE_KEY_USERS = 'ems_users';

const PAGE_DESIGN_LABELS: Record<string, string> = {
    'historical-places': 'Tarihi Mekan',
    'museums': 'Müzeler'
};

const PageContentManager: React.FC = () => {
    // --- LOADED DATA STATES ---
    const [categories, setCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    // --- CONTENT DATA STATE ---
    const [contents, setContents] = useState<PageContent[]>([]);

    // --- UI STATE ---
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [filterCatId, setFilterCatId] = useState<string>('');
    const [filterSubCatId, setFilterSubCatId] = useState<string>('');

    // --- FORM STATE ---
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>('');
    const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');

    // Derived Info
    const [activePageDesign, setActivePageDesign] = useState<string | null>(null);

    // Actual Form Data (Key-Value) - kept for compatibility if needed, mostly unused now?
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [editingContentId, setEditingContentId] = useState<string | null>(null);
    const [editingStatus, setEditingStatus] = useState<'draft' | 'published'>('draft');

    // --- INITIAL LOAD ---
    useEffect(() => {
        const loadData = async () => {
            try {
                const cats = await categoriesService.list();
                setCategories(cats);

                // Fetch all subcategories? Or fetch when category selected?
                // For filter lists, we might need all. Or iterate categories.
                // subcategoriesService.list() takes categoryId.
                // Let's fetch all by iterating cats? Or fetch lazily.
                // For now, let's just load categories. Subcategories loaded when category selected.
                // But wait, for the LIST view, we need subcategory names.
                // We can fetch subcategories for the selected filter or all.
                // To simplify, let's fetch all subcategories flat list if possible, or fetch active ones.
                // Actually, subcategoriesService.list takes optional categoryId.
                // If API supports listing all without ID, good. If not, we might miss some in list view names.
                // Let's assume we fetch all for now or handle it.
                // Checking service: list(categoryId?: string). If API handles no param -> all.
                const allSubs = await subcategoriesService.list();
                setSubCategories(allSubs);

            } catch (e) {
                console.error("Failed to load categories/subcategories", e);
            }
        };
        loadData();

        const loadLS = (key: string, setter: React.Dispatch<React.SetStateAction<any>>) => {
            const item = localStorage.getItem(key);
            if (item) setter(JSON.parse(item));
        };

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
    const getUser = (id: string) => users.find(u => u.id === id);

    // Filter users to get only Customers
    const customerUsers = users.filter(u => u.roleId === 'role_customer');

    // --- FORM LOGIC ---

    // Detect Page Design when SubCategory changes
    useEffect(() => {
        if (selectedSubCategoryId) {
            const sub = subCategories.find(s => s.id === selectedSubCategoryId);
            if (sub && sub.pageDesign) {
                setActivePageDesign(sub.pageDesign);
            } else {
                setActivePageDesign(null);
            }
        } else {
            setActivePageDesign(null);
        }
    }, [selectedSubCategoryId, subCategories]);

    // --- ACTIONS ---
    const handleAddNew = () => {
        setIsEditing(true);
        setEditingContentId(null);
        setSelectedCategoryId('');
        setSelectedSubCategoryId('');
        setSelectedOwnerId('');
        setEditingStatus('draft');
        setFormData({});
    };

    const handleEdit = (content: PageContent) => {
        setIsEditing(true);
        setEditingContentId(content.id);
        setSelectedCategoryId(content.categoryId);
        // Ensure subcategories are loaded for this category?
        // We loaded all subs in init, hopefully.
        setSelectedSubCategoryId(content.subCategoryId);
        setSelectedOwnerId(content.ownerId || '');
        setEditingStatus(content.status || 'draft');
        setFormData(content.data);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Bu yetkilendirmeyi silmek istediğinize emin misiniz?')) {
            const newContents = contents.filter(c => c.id !== id);
            setContents(newContents);
            localStorage.setItem(STORAGE_KEY_CONTENTS, JSON.stringify(newContents));
        }
    };

    const handleSave = () => {
        if (!selectedCategoryId || !selectedSubCategoryId) {
            alert('Kategori ve Alt Kategori seçilmelidir.');
            return;
        }

        const newContent: PageContent = {
            id: editingContentId || Date.now().toString(),
            categoryId: selectedCategoryId,
            subCategoryId: selectedSubCategoryId,
            pageDefinitionId: activePageDesign || '', // Storing pageDesign string here
            ownerId: selectedOwnerId,
            status: editingStatus,
            data: formData, // Keeping data just in case, though maybe unused
            createdAt: new Date().toISOString()
        };

        if (editingContentId) {
            setContents(prev => prev.map(c => c.id === editingContentId ? newContent : c));
        } else {
            setContents(prev => [...prev, newContent]);
        }

        setIsEditing(false);
        setEditingContentId(null);
        setFormData({});
    };

    // --- FILTERED LIST ---
    const filteredContents = contents.filter(c => {
        if (filterCatId && c.categoryId !== filterCatId) return false;
        if (filterSubCatId && c.subCategoryId !== filterSubCatId) return false;
        return true;
    });

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Sayfa Yetkili</h1>
                    <p className="text-sm text-gray-500">Ticari sayfalar için yetkili tanımlama.</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
                    >
                        <Plus size={18} /> Yeni
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-primary/20 mb-8 animate-fadeIn max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
                        <h2 className="text-lg font-bold text-gray-800">
                            {editingContentId ? 'Yetkilendirmeyi Düzenle' : 'Yeni Yetkilendirme'}
                        </h2>
                        <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                            <XCircle size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">1. Kategori</label>
                            <select
                                value={selectedCategoryId}
                                onChange={(e) => {
                                    setSelectedCategoryId(e.target.value);
                                    setSelectedSubCategoryId('');
                                }}
                                disabled={!!editingContentId}
                                className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-primary bg-white ${!!editingContentId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            >
                                <option value="">Seçiniz...</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">2. Alt Kategori</label>
                            <select
                                value={selectedSubCategoryId}
                                onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                                disabled={!selectedCategoryId || !!editingContentId}
                                className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-primary bg-white ${(!selectedCategoryId || !!editingContentId) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            >
                                <option value="">Seçiniz...</option>
                                {subCategories
                                    .filter(s => s.categoryId.toString() === selectedCategoryId)
                                    .map(s => <option key={s.id} value={s.id}>{s.title}</option>)
                                }
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                                <UserIcon size={14} /> Sayfa Yetkilisi
                            </label>
                            <select
                                value={selectedOwnerId}
                                onChange={(e) => setSelectedOwnerId(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-primary bg-white"
                            >
                                <option value="">Yetkili Yok</option>
                                {customerUsers.map(u => (
                                    <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-gray-400 mt-1">Sadece 'Customer' tipindeki kullanıcılar listelenir.</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Durum</label>
                            <select
                                value={editingStatus}
                                onChange={(e) => setEditingStatus(e.target.value as 'draft' | 'published')}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-primary bg-white"
                            >
                                <option value="draft">Taslak</option>
                                <option value="published">Yayında</option>
                            </select>
                        </div>
                    </div>

                    {/* Assigned Page Info */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-700">Atanan Sayfa:</span>
                            {activePageDesign ? (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1">
                                    <FileText size={14} /> {PAGE_DESIGN_LABELS[activePageDesign] || activePageDesign}
                                </span>
                            ) : (
                                <span className="text-gray-400 italic text-sm">
                                    {selectedCategoryId && selectedSubCategoryId
                                        ? 'Bu alt kategori için bir tasarım atanmamış.'
                                        : 'Kategori seçimi bekleniyor...'}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-50">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!selectedSubCategoryId}
                            className={`flex items-center gap-2 px-8 py-2 rounded-lg font-medium transition-all ${selectedSubCategoryId
                                    ? 'bg-primary text-white hover:bg-orange-600 shadow-md'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <Save size={18} /> Kaydet
                        </button>
                    </div>

                </div>
            ) : (
                /* LIST VIEW */
                <div className="space-y-4">
                    {/* Filter Bar */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                            <Filter size={18} /> Filtrele:
                        </div>
                        <select
                            value={filterCatId}
                            onChange={(e) => { setFilterCatId(e.target.value); setFilterSubCatId(''); }}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-primary"
                        >
                            <option value="">Tüm Kategoriler</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                        <select
                            value={filterSubCatId}
                            onChange={(e) => setFilterSubCatId(e.target.value)}
                            disabled={!filterCatId}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-primary disabled:bg-gray-100"
                        >
                            <option value="">Tüm Alt Kategoriler</option>
                            {subCategories
                                .filter(s => s.categoryId.toString() === filterCatId)
                                .map(s => <option key={s.id} value={s.id}>{s.title}</option>)
                            }
                        </select>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4">Alt Kategori</th>
                                    <th className="px-6 py-4">Yetkili</th>
                                    <th className="px-6 py-4">Atanan Sayfa</th>
                                    <th className="px-6 py-4">Durum</th>
                                    <th className="px-6 py-4 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredContents.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center">
                                                <FileText size={48} className="text-gray-200 mb-3" />
                                                <p>Görüntülenecek yetkilendirme bulunamadı.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredContents.map(content => {
                                        const cat = getCategory(content.categoryId);
                                        const sub = getSubCategory(content.subCategoryId);
                                        const owner = getUser(content.ownerId || '');
                                        const pageDesign = content.pageDefinitionId; // Using this field for pageDesign string

                                        return (
                                            <tr key={content.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-800">
                                                    {cat?.title || content.categoryId}
                                                </td>
                                                <td className="px-6 py-4 flex items-center gap-2 text-gray-600">
                                                    <ArrowRight size={14} className="text-gray-300" />
                                                    {sub?.title || content.subCategoryId}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {owner ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-orange-100 text-primary flex items-center justify-center text-xs font-bold">
                                                                {owner.fullName.charAt(0)}
                                                            </div>
                                                            <span className="text-sm text-gray-700">{owner.fullName}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-block px-2 py-1 rounded text-sm text-gray-600 bg-gray-100">
                                                        {PAGE_DESIGN_LABELS[pageDesign] || pageDesign || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${content.status === 'published' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'}`}>
                                                        {content.status === 'published' ? 'YAYINDA' : 'TASLAK'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => handleEdit(content)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button onClick={() => handleDelete(content.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <AlertCircle size={14} />
                <span>Bu sayfadaki veriler tarayıcınızın yerel hafızasında (localStorage) saklanmaktadır.</span>
            </div>
        </div>
    );
};

export default PageContentManager;
