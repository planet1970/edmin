import React, { useState, useEffect } from 'react';
import {
    UserCheck, Edit2, Save, XCircle, FileText, ArrowRight, AlertCircle, Eye, Loader2, Upload, Trash2
} from 'lucide-react';
import {
    Category, SubCategory, User
} from '../types';
import { pageAuthoritiesService, AssignedCustomer } from '../services/pageAuthorities';
import { placesService } from '../services/places';
import { foodPlacesService } from '../services/foodPlaces';
import { getImageUrl } from '../services/api';
import { categoriesService } from '../services/categories';
import { subcategoriesService } from '../services/subcategories';
import SearchableSelect from '../components/SearchableSelect';
import FoodPlaceForm from '../components/FoodPlaceForm';

import { tempPagesService } from '../services/tempPages';
import { toast } from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';

// Storage Keys matching other files
const STORAGE_KEY_CATS = 'ems_categories';
const STORAGE_KEY_SUBS = 'ems_sub_categories';
const STORAGE_KEY_USERS = 'ems_users';

const MyPagesManager: React.FC = () => {
    // --- LOADED DATA STATES ---
    const [categories, setCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [assignedCustomers, setAssignedCustomers] = useState<AssignedCustomer[]>([]);
    const [myDrafts, setMyDrafts] = useState<any[]>([]);

    // Confirm dialog state
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'info' | 'danger' | 'warning';
        onConfirm: () => void;
        confirmText: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'danger',
        onConfirm: () => { },
        confirmText: 'Sil'
    });

    // --- UI STATE ---
    const [currentUser, setCurrentUser] = useState<string | number | null>(null); // Acts as "Logged In User"

    // --- EDITING STATE ---
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isDraftEdit, setIsDraftEdit] = useState<boolean>(false);
    const [editingType, setEditingType] = useState<'PLACE' | 'FOOD_PLACE' | null>(null);
    const [editingData, setEditingData] = useState<any>(null);
    const [viewOnly, setViewOnly] = useState<boolean>(false);
    const [saving, setSaving] = useState(false);

    // File states for PLACE form
    const [placeFile, setPlaceFile] = useState<File | null>(null);
    const [placeBackFile, setPlaceBackFile] = useState<File | null>(null);

    // --- INITIAL LOAD ---
    useEffect(() => {
        loadBasicData();
        // Fetch Assigned Customers
        pageAuthoritiesService.getAssignedCustomers()
            .then(setAssignedCustomers)
            .catch(console.error);
    }, []);

    const loadBasicData = async () => {
        try {
            const [cats, subs] = await Promise.all([
                categoriesService.list(),
                subcategoriesService.list()
            ]);
            setCategories(cats);
            setSubCategories(subs);
        } catch (e) {
            console.error("Data load error:", e);
        }
    };

    const loadMyDrafts = async (userId: string | number) => {
        try {
            const drafts = await tempPagesService.getMyDrafts(userId);
            setMyDrafts(drafts);
        } catch (e) {
            console.error("Draft load error:", e);
        }
    };

    useEffect(() => {
        if (currentUser) {
            loadMyDrafts(currentUser);
        }
    }, [currentUser]);

    // --- HELPERS ---
    const getCategoryTitle = (id: any) => {
        if (!id) return "Yükleniyor...";
        return categories.find(c => String(c.id) === String(id))?.title || `Kategori ${id}`;
    };
    const getSubCategoryTitle = (id: any) => {
        if (!id) return "Yükleniyor...";
        return subCategories.find(s => String(s.id) === String(id))?.title || `Alt Kategori ${id}`;
    };

    // --- ACTIONS ---
    const handleEditStart = async (assignedPage: AssignedCustomer) => {
        setIsEditing(true);
        setIsDraftEdit(false);
        setViewOnly(false);
        setEditingType(assignedPage.pageType as 'PLACE' | 'FOOD_PLACE');
        setEditingData(null); // loading

        try {
            if (assignedPage.pageType === 'PLACE') {
                const data = await placesService.get(String(assignedPage.pageId));
                setEditingData(data);
            } else if (assignedPage.pageType === 'FOOD_PLACE') {
                const data = await foodPlacesService.get(Number(assignedPage.pageId));
                setEditingData(data);
            }
        } catch (error) {
            console.error('Kayıt yüklenemedi:', error);
            setIsEditing(false);
            setEditingType(null);
        }
    };

    const handleEditDraft = (draft: any, isView: boolean = false) => {
        setIsEditing(true);
        setIsDraftEdit(true);
        setViewOnly(isView);
        setEditingType(draft.pageType);

        // Prepare data for form
        const formData = { ...draft };
        if (draft.originalId) formData.id = draft.originalId;

        setEditingData(formData);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setIsDraftEdit(false);
        setViewOnly(false);
        setEditingType(null);
        setEditingData(null);
        setPlaceFile(null);
        setPlaceBackFile(null);
    };

    const handleSaveFoodPlaceDraft = async (payload: any) => {
        if (!currentUser) return;
        setSaving(true);
        try {
            const dataToSave = { ...payload };
            if (editingData?.originalId) dataToSave.id = editingData.originalId;

            await tempPagesService.saveFoodPlaceDraft(currentUser, dataToSave);
            toast.success('Değişiklikleriniz onay için taslak olarak kaydedildi.');
            cancelEdit();
            loadMyDrafts(currentUser);
        } catch (error) {
            console.error('Kaydedilmedi:', error);
            toast.error('Taslak kaydedilirken bir hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    const handleSavePlaceDraftSummary = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        setSaving(true);
        try {
            const dataToSave = { ...editingData };
            if (editingData.originalId) dataToSave.id = editingData.originalId;

            await tempPagesService.savePlaceDraft(currentUser, dataToSave);
            toast.success('Değişiklikleriniz onay için taslak olarak kaydedildi.');
            cancelEdit();
            loadMyDrafts(currentUser);
        } catch (error) {
            console.error('Kaydedilmedi:', error);
            toast.error('Taslak kaydedilirken bir hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    const myAssignedPages = assignedCustomers.filter(ac => String(ac.userId) === String(currentUser));

    const hasPendingDraft = (pageId: number, pageType: string) => {
        return myDrafts.some(d =>
            d.originalId === pageId &&
            d.pageType === pageType &&
            d.status === 'PENDING'
        );
    };

    const handleDeleteDraft = (id: number, pageType: string) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Düzenlemeyi Sil',
            message: 'Bu düzenlemeyi (taslağı) silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
            type: 'danger',
            confirmText: 'Evet, Sil',
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                try {
                    await tempPagesService.deleteDraft(pageType, id);
                    toast.success('Taslak başarıyla silindi.');
                    if (currentUser) loadMyDrafts(currentUser);
                } catch (error) {
                    console.error('Silinemedi:', error);
                    toast.error('Silme işlemi sırasında hata oluştu.');
                }
            }
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Sayfalarım</h1>
                    <p className="text-sm text-gray-500">Müşteri paneli üzerinden sayfa yönetimi.</p>
                </div>
            </div>

            {/* CUSTOMER SELECTOR (SIMULATION) */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 flex items-center gap-4">
                <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
                    <UserCheck size={24} />
                </div>
                <div className="flex-1 max-w-xl">
                    <SearchableSelect
                        label="Müşteri Seçimi (Simülasyon)"
                        options={Array.from(new Set(assignedCustomers.map(ac => ac.userId))).map(uid => {
                            const ac = assignedCustomers.find(a => a.userId === uid);
                            return {
                                id: String(uid),
                                label: ac?.userName || `Müşteri ${uid}`,
                                subLabel: `Toplam ${assignedCustomers.filter(a => a.userId === uid).length} sayfa yönetiyor`
                            };
                        })}
                        value={currentUser}
                        onChange={(id) => { setCurrentUser(id); setIsEditing(false); }}
                        placeholder="Bir Müşteri Seçin..."
                    />
                </div>
            </div>

            {!currentUser ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                    <UserCheck size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">Lütfen işlem yapmak için yukarıdan bir müşteri seçiniz.</p>
                </div>
            ) : isEditing ? (
                /* EDIT FORM */
                !editingData ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
                        <Loader2 className="animate-spin text-primary mb-2" size={32} />
                        <p className="text-gray-500 font-medium">İçerik yükleniyor, lütfen bekleyin...</p>
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto">
                        <div className="bg-white p-6 rounded-t-xl border border-gray-200 flex items-center justify-between shadow-sm border-b-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                                    <Edit2 size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {viewOnly ? 'Taslak Görüntüle' : (isDraftEdit ? 'Taslağı Düzenle' : 'Sayfayı Düzenle')}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {isDraftEdit ? 'Kayıtlı taslak üzerinde çalışıyorsunuz.' : 'Değişiklikleriniz taslak olarak kaydedilecektir.'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={cancelEdit} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                                <XCircle size={24} />
                            </button>
                        </div>

                        {/* Page Context Info */}
                        <div className="bg-gray-50 p-4 border-x border-gray-200 flex flex-wrap gap-4 items-center justify-between border-b">
                            <div className="flex items-center gap-4">
                                {(() => {
                                    const meta = assignedCustomers.find(ac =>
                                        ac.pageType === editingType &&
                                        String(ac.pageId) === String(editingData?.originalId || editingData?.id)
                                    );
                                    return (
                                        <>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kategori</span>
                                                <span className="text-sm font-semibold text-gray-700">{getCategoryTitle(meta?.categoryId)}</span>
                                            </div>
                                            <ArrowRight size={16} className="text-gray-300" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Alt Kategori</span>
                                                <span className="text-sm font-semibold text-gray-700">{getSubCategoryTitle(meta?.subCategoryId)}</span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                            <div className="px-3 py-1 bg-white rounded-lg text-xs font-bold text-gray-500 border border-gray-200 uppercase">
                                {editingType === 'PLACE' ? 'Mekan İnceleme' : 'Yeme / İçme'}
                            </div>
                        </div>

                        {editingType === 'FOOD_PLACE' ? (
                            <FoodPlaceForm
                                data={editingData}
                                onSave={handleSaveFoodPlaceDraft}
                                onCancel={cancelEdit}
                                loading={saving}
                                showActiveToggle={false}
                                saveButtonText={isDraftEdit ? "Taslağı Güncelle" : "Taslak Kaydet"}
                                isReadOnly={viewOnly}
                            />
                        ) : (
                            <div className="bg-white p-6 rounded-b-xl shadow-lg border-x border-b border-primary/20 mb-8">
                                <form onSubmit={handleSavePlaceDraftSummary} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-gray-700">Ana Sayfa Görsel</label>
                                            {(placeFile || editingData.pic_url) && (
                                                <img
                                                    src={placeFile ? URL.createObjectURL(placeFile) : getImageUrl(editingData.pic_url)}
                                                    className="w-full h-48 object-cover rounded-xl border shadow-sm"
                                                />
                                            )}
                                            {!viewOnly && (
                                                <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 bg-white rounded-xl cursor-pointer hover:border-primary hover:text-primary transition-all text-gray-500">
                                                    <Upload size={20} /> <span>{placeFile ? placeFile.name : 'Görsel Seç'}</span>
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setPlaceFile(e.target.files[0])} />
                                                </label>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-gray-700">Arka Sayfa Görsel</label>
                                            {(placeBackFile || editingData.back_pic_url) && (
                                                <img
                                                    src={placeBackFile ? URL.createObjectURL(placeBackFile) : getImageUrl(editingData.back_pic_url)}
                                                    className="w-full h-48 object-cover rounded-xl border shadow-sm"
                                                />
                                            )}
                                            {!viewOnly && (
                                                <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 bg-white rounded-xl cursor-pointer hover:border-primary hover:text-primary transition-all text-gray-500">
                                                    <Upload size={20} /> <span>{placeBackFile ? placeBackFile.name : 'Görsel Seç'}</span>
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setPlaceBackFile(e.target.files[0])} />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mekan Başlığı</label>
                                        <input
                                            type="text"
                                            disabled={viewOnly}
                                            value={editingData.title || ''}
                                            onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-primary disabled:bg-gray-50"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama / Hakkında</label>
                                        <textarea
                                            rows={4}
                                            disabled={viewOnly}
                                            value={editingData.description || ''}
                                            onChange={(e) => setEditingData({ ...editingData, description: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-primary disabled:bg-gray-50"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Çalışma Saatleri (Örn: 09:00 - 18:00)</label>
                                            <input
                                                type="text"
                                                disabled={viewOnly}
                                                value={editingData.info1 || ''}
                                                onChange={(e) => setEditingData({ ...editingData, info1: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-primary disabled:bg-gray-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Konum</label>
                                            <input
                                                type="text"
                                                disabled={viewOnly}
                                                value={editingData.area1 || ''}
                                                onChange={(e) => setEditingData({ ...editingData, area1: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-primary disabled:bg-gray-50"
                                            />
                                        </div>
                                    </div>

                                    {!viewOnly && (
                                        <>
                                            <p className="text-xs text-gray-500 italic mt-2">* Yaptığınız değişiklikler taslak olarak kaydedilir ve yönetici onayından sonra yayınlanır.</p>
                                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                                <button type="button" onClick={cancelEdit} className="px-6 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">İptal</button>
                                                <button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-8 py-2 rounded-lg font-medium shadow-md">
                                                    <Save size={18} /> {saving ? 'Kaydediliyor...' : (isDraftEdit ? 'Taslağı Güncelle' : 'Taslak Kaydet')}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </form>
                            </div>
                        )}
                    </div>
                )
            ) : (
                /* LIST VIEW */
                <div className="space-y-8">
                    {/* ASSIGNED PAGES */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-2">
                            <FileText size={18} className="text-blue-500" />
                            <h2 className="font-bold text-gray-700">Atanan Sayfalarım</h2>
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 text-gray-400 font-bold text-[10px] uppercase border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3">Kategori / Alt Kategori</th>
                                    <th className="px-6 py-3">Sayfa Adı</th>
                                    <th className="px-6 py-3">Sayfa Tipi</th>
                                    <th className="px-6 py-3 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {myAssignedPages.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center">
                                                <FileText size={48} className="text-gray-200 mb-3" />
                                                <p>Size atanmış herhangi bir sayfa bulunmamaktadır.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    myAssignedPages.map(page => {
                                        const pending = hasPendingDraft(page.pageId, page.pageType);
                                        return (
                                            <tr key={page.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs font-medium text-gray-500">{getCategoryTitle(page.categoryId)}</span>
                                                        <div className="flex items-center gap-1 text-sm text-gray-700 font-semibold">
                                                            <ArrowRight size={14} className="text-gray-300" />
                                                            {getSubCategoryTitle(page.subCategoryId)}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-800">{page.pageTitle}</div>
                                                    <div className="text-xs text-gray-500">#{page.pageId}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${page.pageType === 'FOOD_PLACE' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                        {page.pageType === 'PLACE' ? 'MEKAN İNCELEME' : 'YEME/İÇME'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {pending ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 rounded-lg border border-amber-100 opacity-80 cursor-not-allowed">
                                                            <AlertCircle size={14} /> Taslak Bekleniyor
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleEditStart(page)}
                                                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors border border-orange-100 shadow-sm"
                                                        >
                                                            <Edit2 size={14} /> Düzenle
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* DRAFTS / DÜZENLEMELERİM */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-2">
                            <Eye size={18} className="text-orange-500" />
                            <h2 className="font-bold text-gray-700">Düzenlemelerim (Onay Bekleyen Taslaklar)</h2>
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 text-gray-400 font-bold text-[10px] uppercase border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3">Durum ve Tarih</th>
                                    <th className="px-6 py-3">Sayfa Adı</th>
                                    <th className="px-6 py-3">Tip</th>
                                    <th className="px-6 py-3 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {myDrafts.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center">
                                                <Eye size={48} className="text-gray-200 mb-3" />
                                                <p>Henüz bir düzenleme (taslak) kaydınız bulunmamaktadır.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    myDrafts.map(draft => (
                                        <tr key={draft.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`w-fit px-2 py-0.5 rounded text-[10px] font-bold ${draft.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                                        {draft.status === 'PENDING' ? 'ONAY BEKLİYOR' : 'ONAYLANDI'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                                                        <AlertCircle size={10} />
                                                        {draft.status === 'PENDING' ? (
                                                            `${new Date(draft.createdAt).toLocaleString('tr-TR')} tarihinde kaydedildi`
                                                        ) : (
                                                            <div className="flex flex-col gap-0.5">
                                                                <span>{new Date(draft.createdAt).toLocaleString('tr-TR')} (Oluşturuldu)</span>
                                                                <span className="text-green-600 font-bold">{new Date(draft.updatedAt).toLocaleString('tr-TR')} (Onaylandı)</span>
                                                            </div>
                                                        )}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-800">
                                                {draft.title}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold border ${draft.pageType === 'FOOD_PLACE' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                    {draft.pageType === 'PLACE' ? 'MEKAN' : 'YEME/İÇME'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {draft.status === 'PENDING' ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleEditDraft(draft, false)}
                                                                className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded transition-all"
                                                                title="Düzenle"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteDraft(draft.id, draft.pageType)}
                                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                                                                title="Vazgeç (Sil)"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            disabled
                                                            className="p-1.5 text-gray-200 cursor-not-allowed"
                                                            title="Onaylanmış taslak üzerinde işlem yapılamaz"
                                                        >
                                                            <Edit2 size={16} />
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
            )}

            <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 border-t pt-4">
                <AlertCircle size={14} />
                <span>Customer kullanıcılarının yaptığı düzenlemeler önce yönetici onayına sunulur. Onaylanan değişiklikler ana sitede yayınlanır.</span>
            </div>

            {isEditing && (
                <div className="fixed bottom-6 right-6 z-50">
                    <button
                        onClick={cancelEdit}
                        className="flex items-center gap-2 bg-white text-gray-600 px-6 py-3 rounded-full shadow-2xl border border-gray-100 hover:bg-gray-50 transition-all font-bold group"
                    >
                        <XCircle size={20} className="text-red-500 group-hover:rotate-90 transition-transform duration-300" />
                        Düzenlemeyi Kapat
                    </button>
                </div>
            )}

            <ConfirmDialog
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
                confirmText={confirmConfig.confirmText}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

export default MyPagesManager;