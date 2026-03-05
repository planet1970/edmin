import React, { useState, useEffect } from 'react';
import {
    Plus, Trash2, Save, XCircle, FileText, ArrowRight, Filter, AlertCircle, User as UserIcon, Shield
} from 'lucide-react';
import {
    Category, SubCategory, User, Place, FoodPlace
} from '../types';
import { categoriesService } from '../services/categories';
import { subcategoriesService } from '../services/subcategories';
import { pageAuthoritiesService, AssignedCustomer } from '../services/pageAuthorities';
import { placesService } from '../services/places';
import { foodPlacesService } from '../services/foodPlaces';
import { toast } from 'react-hot-toast';

const PageContentManager: React.FC = () => {
    // --- DATA STATES ---
    const [categories, setCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [allCustomers, setAllCustomers] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<AssignedCustomer[]>([]);

    // For Assignment Form
    const [places, setPlaces] = useState<Place[]>([]);
    const [foodPlaces, setFoodPlaces] = useState<FoodPlace[]>([]);

    // --- UI STATE ---
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    // Filters (List View)
    const [filterCatId, setFilterCatId] = useState<string>('');
    const [filterSubCatId, setFilterSubCatId] = useState<string>('');

    // Form State (Assignment)
    const [selectedCatId, setSelectedCatId] = useState<string>('');
    const [selectedSubCatId, setSelectedSubCatId] = useState<string>('');
    const [selectedPage, setSelectedPage] = useState<{ id: string | number, type: 'PLACE' | 'FOOD_PLACE' } | null>(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

    // --- INITIAL LOAD ---
    useEffect(() => {
        loadBasicData();
        loadAssignments();
    }, []);

    const loadBasicData = async () => {
        try {
            const [cats, custs] = await Promise.all([
                categoriesService.list(),
                pageAuthoritiesService.getCustomers()
            ]);
            setCategories(cats);
            setAllCustomers(custs);

            // Fetch all subcategories for filtering
            const allSubs = await subcategoriesService.list();
            setSubCategories(allSubs);
        } catch (e) {
            console.error("Data load error:", e);
        }
    };

    const loadAssignments = async () => {
        setLoading(true);
        try {
            const data = await pageAuthoritiesService.getAssignedCustomers();
            setAssignments(data);
        } catch (e) {
            toast.error('Yetkilendirmeler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    // --- FORM LOGIC ---
    useEffect(() => {
        if (selectedSubCatId) {
            loadPagesForSubCategory(selectedSubCatId);
        } else {
            setPlaces([]);
            setFoodPlaces([]);
        }
    }, [selectedSubCatId]);

    const loadPagesForSubCategory = async (subId: string) => {
        try {
            const [p, f] = await Promise.all([
                placesService.list(subId),
                foodPlacesService.list(Number(subId))
            ]);
            setPlaces(p);
            setFoodPlaces(f);
        } catch (e) {
            console.error("Pages list error:", e);
        }
    };

    // --- ACTIONS ---
    const handleAddAssignment = async () => {
        if (!selectedPage || !selectedCustomerId) {
            toast.error('Lütfen bir sayfa ve bir müşteri seçiniz');
            return;
        }

        try {
            setLoading(true);
            await pageAuthoritiesService.addAuthority(
                selectedPage.type,
                Number(selectedPage.id),
                Number(selectedCustomerId)
            );
            toast.success('Yetki başarıyla atandı');
            setIsAdding(false);
            resetForm();
            loadAssignments();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Yetkili zaten atanmış veya bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bu yetkiyi kaldırmak istediğinize emin misiniz?')) return;

        try {
            await pageAuthoritiesService.removeAuthority(id);
            toast.success('Yetki kaldırıldı');
            loadAssignments();
        } catch (error) {
            toast.error('Yetki kaldırılamadı');
        }
    };

    const resetForm = () => {
        setSelectedCatId('');
        setSelectedSubCatId('');
        setSelectedPage(null);
        setSelectedCustomerId('');
    };

    // --- FILTERED LIST ---
    const filteredAssignments = assignments.filter(a => {
        if (filterCatId && String(a.categoryId) !== filterCatId) return false;
        if (filterSubCatId && String(a.subCategoryId) !== filterSubCatId) return false;
        return true;
    });

    const getCategoryTitle = (id: any) => {
        if (!id) return "Yükleniyor...";
        return categories.find(c => String(c.id) === String(id))?.title || `Kategori ${id}`;
    };
    const getSubCategoryTitle = (id: any) => {
        if (!id) return "Yükleniyor...";
        return subCategories.find(s => String(s.id) === String(id))?.title || `Alt Kategori ${id}`;
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Sayfa Yetkili Yönetimi</h1>
                    <p className="text-sm text-gray-500">Müşterilerin yöneteceği sayfaları eşleştirin.</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-md"
                    >
                        <Plus size={18} /> Yeni Yetki Ata
                    </button>
                )}
            </div>

            {isAdding ? (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-primary/20 mb-8 animate-fadeIn max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                            <Shield className="text-primary" />
                            <h2 className="text-lg font-bold text-gray-800">Yeni Yetkilendirme</h2>
                        </div>
                        <button onClick={() => { setIsAdding(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                            <XCircle size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">1. Kategori</label>
                            <select
                                value={selectedCatId}
                                onChange={(e) => {
                                    setSelectedCatId(e.target.value);
                                    setSelectedSubCatId('');
                                    setSelectedPage(null);
                                }}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-primary bg-white"
                            >
                                <option value="">Kategori Seçin...</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">2. Alt Kategori</label>
                            <select
                                value={selectedSubCatId}
                                onChange={(e) => {
                                    setSelectedSubCatId(e.target.value);
                                    setSelectedPage(null);
                                }}
                                disabled={!selectedCatId}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-primary bg-white disabled:bg-gray-50"
                            >
                                <option value="">Alt Kategori Seçin...</option>
                                {subCategories
                                    .filter(s => String(s.categoryId) === selectedCatId)
                                    .map(s => <option key={s.id} value={s.id}>{s.title}</option>)
                                }
                            </select>
                        </div>
                        <div className="col-span-full">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">3. Sayfa / Mekan Seçin</label>
                            <select
                                value={selectedPage ? `${selectedPage.type}:${selectedPage.id}` : ''}
                                onChange={(e) => {
                                    const [type, id] = e.target.value.split(':');
                                    setSelectedPage({ type: type as any, id });
                                }}
                                disabled={!selectedSubCatId}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-primary bg-white disabled:bg-gray-50"
                            >
                                <option value="">Bir Sayfa Seçin...</option>
                                {places.length > 0 && <optgroup label="Standart Mekanlar">
                                    {places.map(p => <option key={`P-${p.id}`} value={`PLACE:${p.id}`}>{p.title}</option>)}
                                </optgroup>}
                                {foodPlaces.length > 0 && <optgroup label="Yeme & İçme">
                                    {foodPlaces.map(f => <option key={`F-${f.id}`} value={`FOOD_PLACE:${f.id}`}>{f.title}</option>)}
                                </optgroup>}
                            </select>
                        </div>
                        <div className="col-span-full">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                                <UserIcon size={14} /> 4. Müşteri (Yetkili)
                            </label>
                            <select
                                value={selectedCustomerId}
                                onChange={(e) => setSelectedCustomerId(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-primary bg-white"
                            >
                                <option value="">Bir Müşteri Seçin...</option>
                                {allCustomers.map(u => (
                                    <option key={u.id} value={u.id}>{u.name || u.email}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            onClick={() => { setIsAdding(false); resetForm(); }}
                            className="px-6 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleAddAssignment}
                            disabled={loading || !selectedPage || !selectedCustomerId}
                            className={`flex items-center gap-2 px-8 py-2 rounded-lg font-medium transition-all ${(!loading && selectedPage && selectedCustomerId)
                                ? 'bg-primary text-white hover:bg-orange-600 shadow-md'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <Save size={18} /> {loading ? 'Atanıyor...' : 'Yetki Ata'}
                        </button>
                    </div>
                </div>
            ) : (
                /* LIST VIEW */
                <div className="space-y-4">
                    {/* Filter Bar */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center animate-fadeIn">
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                            <Filter size={18} /> Filtrele:
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            <select
                                value={filterCatId}
                                onChange={(e) => { setFilterCatId(e.target.value); setFilterSubCatId(''); }}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-primary bg-white"
                            >
                                <option value="">Tüm Kategoriler</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                            <select
                                value={filterSubCatId}
                                onChange={(e) => setFilterSubCatId(e.target.value)}
                                disabled={!filterCatId}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-primary bg-white disabled:bg-gray-50"
                            >
                                <option value="">Tüm Alt Kategoriler</option>
                                {subCategories
                                    .filter(s => String(s.categoryId) === filterCatId)
                                    .map(s => <option key={s.id} value={s.id}>{s.title}</option>)
                                }
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Müşteri (Owner)</th>
                                    <th className="px-6 py-4">Kategori / Alt Kategori</th>
                                    <th className="px-6 py-4">Atanan Sayfa</th>
                                    <th className="px-6 py-4">Tip</th>
                                    <th className="px-6 py-4 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">Yükleniyor...</td>
                                    </tr>
                                ) : filteredAssignments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center">
                                                <Shield size={48} className="text-gray-100 mb-3" />
                                                <p>Görüntülenecek yetkilendirme bulunamadı.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAssignments.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                        {item.userName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-800">{item.userName}</div>
                                                        <div className="text-[10px] text-gray-400 font-mono">ID: {item.userId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-medium text-gray-500">{getCategoryTitle(item.categoryId)}</span>
                                                    <div className="flex items-center gap-1 text-sm text-gray-700 font-semibold">
                                                        <ArrowRight size={14} className="text-gray-300" />
                                                        {getSubCategoryTitle(item.subCategoryId)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-800">
                                                {item.pageTitle}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold border ${item.pageType === 'FOOD_PLACE' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                    {item.pageType === 'FOOD_PLACE' ? 'YEME/İÇME' : 'MEKAN'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Yetkiyi Kaldır"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 italic">
                <AlertCircle size={14} />
                <span>Bir müşteri birden fazla sayfaya yetkili olarak atanabilir.</span>
            </div>
        </div>
    );
};

export default PageContentManager;
