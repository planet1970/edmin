import React, { useState, useEffect } from 'react';
import {
    Plus, Trash2, Edit2, CheckCircle, XCircle, GripVertical, Grid, Home, AlertCircle
} from 'lucide-react';
import { Category } from '../types';
import { categoriesService } from '../services/categories';
import { iconMap } from '../constants/iconMap';
import * as LucideIcons from 'lucide-react';
import IconPicker from '../components/IconPicker';
import WebIconPicker from '../components/WebIconPicker';
import { Globe, Smartphone } from 'lucide-react';

const ICON_MAP = LucideIcons;

const CategoriesManager: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [catLoading, setCatLoading] = useState(false);
    const [catError, setCatError] = useState<string | null>(null);
    const [catOrderDirty, setCatOrderDirty] = useState(false);
    const [showPassiveCategories, setShowPassiveCategories] = useState(false);

    // Edit/Add Mode States
    const [isEditingCategory, setIsEditingCategory] = useState<boolean>(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Fetch categories from backend
    const loadCategories = async () => {
        try {
            setCatLoading(true);
            setCatError(null);
            const res = await categoriesService.list();
            setCategories(res.sort((a, b) => (a.order || 0) - (b.order || 0)));
            setCatOrderDirty(false);
        } catch (err: any) {
            setCatError(err?.message || 'Kategoriler yüklenemedi');
        } finally {
            setCatLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    // --- DRAG AND DROP HANDLERS ---
    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData('type', 'category');
        e.dataTransfer.setData('index', index.toString());
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        const dragType = e.dataTransfer.getData('type');
        if (dragType !== 'category') return;

        const dragIndex = parseInt(e.dataTransfer.getData('index'));
        if (dragIndex === dropIndex) return;

        const newItems = [...categories];
        const [draggedItem] = newItems.splice(dragIndex, 1);
        newItems.splice(dropIndex, 0, draggedItem);
        // Re-assign order based on new index
        const reordered = newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
        setCategories(reordered);
        setCatOrderDirty(true);
    };

    // --- CATEGORY ACTIONS ---
    const handleAddCategory = () => {
        setEditingCategory({
            id: '',
            title: '',
            iconName: 'Home',
            webIcon: 'fas fa-map-marked-alt',
            description: '',
            order: categories.length + 1,
            isActive: true
        });
        setIsEditingCategory(true);
    };

    const handleSaveCategory = () => {
        if (!editingCategory) return;
        const payload = {
            title: editingCategory.title,
            description: editingCategory.description,
            iconName: editingCategory.iconName,
            webIcon: editingCategory.webIcon || 'fas fa-map-marked-alt',
            order: editingCategory.order || categories.length + 1,
            isActive: editingCategory.isActive
        };

        const run = async () => {
            if (editingCategory.id) {
                const updated = await categoriesService.update(editingCategory.id, payload);
                setCategories(prev => prev.map(c => c.id === editingCategory.id ? updated : c));
            } else {
                const created = await categoriesService.create(payload);
                setCategories(prev => [...prev, created]);
            }
            setIsEditingCategory(false);
            setEditingCategory(null);
            setCatOrderDirty(false);
        };

        run().catch(err => alert(err?.message || 'Kategori kaydedilemedi'));
    };

    const handleDeleteCategory = (id: string) => {
        if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
        categoriesService.remove(id)
            .then(() => {
                setCategories(prev => prev.filter(c => c.id !== id));
                setCatOrderDirty(true);
            })
            .catch(err => alert(err?.message || 'Kategori silinemedi'));
    };

    const toggleCategoryStatus = async (id: string, currentStatus: boolean) => {
        try {
            setCatLoading(true);
            await categoriesService.update(id, { isActive: !currentStatus });
            await loadCategories();
        } catch (err: any) {
            alert(err?.message || 'Durum güncellenemedi');
        } finally {
            setCatLoading(false);
        }
    };

    const handleSaveOrder = async () => {
        try {
            setCatLoading(true);
            await Promise.all(
                categories.map((c, idx) =>
                    categoriesService.update(c.id, {
                        title: c.title,
                        description: c.description,
                        iconName: c.iconName,
                        webIcon: c.webIcon,
                        order: c.order ?? idx + 1,
                        isActive: c.isActive
                    }),
                ),
            );
            await loadCategories();
            setCatOrderDirty(false);
        } catch (err: any) {
            alert(err?.message || 'Sıralama kaydedilemedi');
        } finally {
            setCatLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Kategori Yönetimi</h1>
                    <p className="text-sm text-gray-500">Uygulama kategorilerini buradan yönetebilirsiniz.</p>
                </div>
            </div>

            <div className="space-y-4">
                {isEditingCategory && editingCategory ? (
                    /* CATEGORY FORM */
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-4xl">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="font-bold text-gray-800">
                                {editingCategory.id ? 'Kategori Düzenle' : 'Yeni Kategori'}
                            </h3>
                            <button onClick={() => setIsEditingCategory(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Kategori Adı</label>
                                    <input
                                        value={editingCategory.title}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-primary"
                                        placeholder="Örn: Restoranlar"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Açıklama</label>
                                    <input
                                        value={editingCategory.description}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-primary"
                                        placeholder="Örn: En lezzetli yemekler"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                {/* MOBILE ICON */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-2">
                                        <Smartphone size={14} /> Mobil Uygulama İkonu (Lucide)
                                    </div>
                                    <IconPicker
                                        selectedIcon={editingCategory.iconName}
                                        onSelect={(iconName) => setEditingCategory({ ...editingCategory, iconName })}
                                    />
                                </div>

                                {/* WEB ICON */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-2">
                                        <Globe size={14} /> Web Sitesi İkonu (FontAwesome)
                                    </div>
                                    <WebIconPicker
                                        selectedIcon={editingCategory.webIcon || 'fas fa-map-marked-alt'}
                                        onSelect={(webIcon) => setEditingCategory({ ...editingCategory, webIcon })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 py-2">
                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={editingCategory.isActive}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, isActive: e.target.checked })}
                                        className="w-4 h-4 text-primary rounded focus:ring-primary"
                                    />
                                    Aktif Kategori
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button onClick={() => setIsEditingCategory(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">İptal</button>
                                <button onClick={handleSaveCategory} className="px-4 py-2 text-sm bg-primary text-white hover:bg-orange-600 rounded-lg">Kaydet</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* CATEGORY LIST */
                    <>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <h3 className="font-bold text-gray-700">Kategori Listesi</h3>
                                    <button
                                        onClick={() => setShowPassiveCategories(!showPassiveCategories)}
                                        className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${showPassiveCategories
                                            ? 'bg-gray-800 text-white border-gray-800'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        {showPassiveCategories ? 'Pasifleri Gizle' : 'Pasifleri Göster'}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleSaveOrder}
                                        disabled={!catOrderDirty || catLoading}
                                        className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${catOrderDirty
                                            ? 'bg-primary text-white hover:bg-orange-600'
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        Sıralamayı Kaydet
                                    </button>
                                    <button onClick={handleAddCategory} className="text-sm text-primary font-medium hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                        <Plus size={16} /> Yeni Ekle
                                    </button>
                                </div>
                            </div>
                            {catError && <div className="text-sm text-red-600">{catError}</div>}
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 w-10"></th>
                                        <th className="px-4 py-3 w-16 text-center">Mobil</th>
                                        <th className="px-4 py-3 w-16 text-center">Web</th>
                                        <th className="px-4 py-3">Kategori Bilgileri</th>
                                        <th className="px-4 py-3">Açıklama</th>
                                        <th className="px-4 py-3">Durum</th>
                                        <th className="px-4 py-3 w-16 text-center">Sıra</th>
                                        <th className="px-4 py-3 text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {categories.filter(c => showPassiveCategories || c.isActive).map((cat, index) => {
                                        // @ts-ignore
                                        const IconComp = ICON_MAP[cat.iconName] || Home;
                                        return (
                                            <tr
                                                key={cat.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, index)}
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => handleDrop(e, index)}
                                                className="hover:bg-gray-50 cursor-move group"
                                            >
                                                <td className="px-4 py-3 text-gray-400 text-center"><GripVertical size={16} className="mx-auto" /></td>
                                                <td className="px-4 py-3">
                                                    <div className="w-10 h-10 bg-orange-50 text-primary rounded-lg flex items-center justify-center mx-auto shadow-sm border border-orange-100" title={`Mobil: ${cat.iconName}`}>
                                                        {/* @ts-ignore */}
                                                        {ICON_MAP[cat.iconName] ? <IconComp size={20} /> : <span className="text-[10px]">?</span>}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mx-auto shadow-sm border border-blue-100" title={`Web: ${cat.webIcon}`}>
                                                        <i className={`${cat.webIcon || 'fas fa-map-marked-alt'} text-lg`} />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-800">{cat.title}</div>
                                                    <div className="text-xs text-gray-400 font-mono mt-1">Mobil: {cat.iconName} | Web: {cat.webIcon || 'Varsayılan'}</div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{cat.description}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${cat.isActive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                                                        {cat.isActive ? 'AKTİF' : 'PASİF'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-700">{cat.order ?? index + 1}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => toggleCategoryStatus(cat.id, cat.isActive)} className={`p-1.5 rounded transition-colors ${cat.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`} title={cat.isActive ? 'Pasife Al' : 'Aktife Al'}>
                                                            {cat.isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                                        </button>
                                                        <button onClick={() => { setEditingCategory(cat); setIsEditingCategory(true); }} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><GripVertical size={12} /> Sıralamayı değiştirmek için satırları sürükleyip bırakabilirsiniz.</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default CategoriesManager;
