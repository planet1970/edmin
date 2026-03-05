import React, { useState, useEffect } from 'react';
import {
    UserCheck, Edit2, Save, XCircle, FileText, ArrowRight, AlertCircle, Eye, Loader2, Upload
} from 'lucide-react';
import {
    Category, SubCategory, User
} from '../types';
import { pageAuthoritiesService, AssignedCustomer } from '../services/pageAuthorities';
import { placesService } from '../services/places';
import { foodPlacesService } from '../services/foodPlaces';
import { getImageUrl } from '../services/api';
import SearchableSelect from '../components/SearchableSelect';
import FoodPlaceForm from '../components/FoodPlaceForm';

// Storage Keys matching other files
const STORAGE_KEY_CATS = 'ems_categories';
const STORAGE_KEY_SUBS = 'ems_sub_categories';
const STORAGE_KEY_USERS = 'ems_users';

const MyPagesManager: React.FC = () => {
    // --- LOADED DATA STATES ---
    const [categories, setCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    const [assignedCustomers, setAssignedCustomers] = useState<AssignedCustomer[]>([]);

    // --- UI STATE ---
    const [currentUser, setCurrentUser] = useState<string | number | null>(null); // Acts as "Logged In User"

    // --- EDITING STATE ---
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editingType, setEditingType] = useState<'PLACE' | 'FOOD_PLACE' | null>(null);
    const [editingData, setEditingData] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    // File states for PLACE form
    const [placeFile, setPlaceFile] = useState<File | null>(null);
    const [placeBackFile, setPlaceBackFile] = useState<File | null>(null);

    // --- INITIAL LOAD ---
    useEffect(() => {
        const loadLS = (key: string, setter: React.Dispatch<React.SetStateAction<any>>) => {
            const item = localStorage.getItem(key);
            if (item) setter(JSON.parse(item));
        };

        loadLS(STORAGE_KEY_CATS, setCategories);
        loadLS(STORAGE_KEY_SUBS, setSubCategories);
        loadLS(STORAGE_KEY_USERS, setUsers);

        // Fetch Assigned Customers
        pageAuthoritiesService.getAssignedCustomers()
            .then(setAssignedCustomers)
            .catch(console.error);
    }, []);

    // --- HELPERS ---
    const getUser = (id: string | number) => users.find(u => String(u.id) === String(id));

    // --- ACTIONS ---
    const handleEditStart = async (assignedPage: AssignedCustomer) => {
        setIsEditing(true);
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

    const cancelEdit = () => {
        setIsEditing(false);
        setEditingType(null);
        setEditingData(null);
        setPlaceFile(null);
        setPlaceBackFile(null);
    };

    const handleSaveFoodPlace = async (payload: any, file?: File, backFile?: File) => {
        setSaving(true);
        try {
            await foodPlacesService.update(payload.id, payload, file, backFile);
            cancelEdit();
            // Refresh list if needed (title might be updated)
            const customers = await pageAuthoritiesService.getAssignedCustomers();
            setAssignedCustomers(customers);
        } catch (error) {
            console.error('Kaydedilmedi:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleSavePlaceSummary = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await placesService.update(editingData.id, editingData, placeFile || undefined, placeBackFile || undefined);
            cancelEdit();
            const customers = await pageAuthoritiesService.getAssignedCustomers();
            setAssignedCustomers(customers);
        } catch (error) {
            console.error('Kaydedilmedi:', error);
        } finally {
            setSaving(false);
        }
    };

    const myAssignedPages = assignedCustomers.filter(ac => String(ac.userId) === String(currentUser));

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
                <div className="flex-1 max-w-xl">
                    <SearchableSelect
                        label="Müşteri Seçimi (Simülasyon)"
                        options={assignedCustomers.map(ac => ({
                            id: String(ac.userId),
                            label: ac.userName,
                            subLabel: `Yetkili olduğu sayfa: ${ac.pageTitle} (${ac.pageType})`
                        }))}
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
                ) : editingType === 'FOOD_PLACE' ? (
                    <FoodPlaceForm
                        data={editingData}
                        onSave={handleSaveFoodPlace}
                        onCancel={cancelEdit}
                        loading={saving}
                    />
                ) : (
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-primary/20 mb-8 max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
                            <h2 className="text-lg font-bold text-gray-800">Mekan Düzenle (Temel Bilgiler)</h2>
                            <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSavePlaceSummary} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-gray-700">Ana Sayfa Görsel</label>
                                    {(placeFile || editingData.pic_url) && (
                                        <img
                                            src={placeFile ? URL.createObjectURL(placeFile) : getImageUrl(editingData.pic_url)}
                                            className="w-full h-48 object-cover rounded-xl border shadow-sm"
                                        />
                                    )}
                                    <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 bg-white rounded-xl cursor-pointer hover:border-primary hover:text-primary transition-all text-gray-500">
                                        <Upload size={20} /> <span>{placeFile ? placeFile.name : 'Görsel Seç'}</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setPlaceFile(e.target.files[0])} />
                                    </label>
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-gray-700">Arka Sayfa Görsel</label>
                                    {(placeBackFile || editingData.back_pic_url) && (
                                        <img
                                            src={placeBackFile ? URL.createObjectURL(placeBackFile) : getImageUrl(editingData.back_pic_url)}
                                            className="w-full h-48 object-cover rounded-xl border shadow-sm"
                                        />
                                    )}
                                    <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 bg-white rounded-xl cursor-pointer hover:border-primary hover:text-primary transition-all text-gray-500">
                                        <Upload size={20} /> <span>{placeBackFile ? placeBackFile.name : 'Görsel Seç'}</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setPlaceBackFile(e.target.files[0])} />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mekan Başlığı</label>
                                <input type="text" value={editingData.title || ''} onChange={(e) => setEditingData({ ...editingData, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-primary" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama / Hakkında</label>
                                <textarea rows={4} value={editingData.description || ''} onChange={(e) => setEditingData({ ...editingData, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-primary" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Çalışma Saatleri (Örn: 09:00 - 18:00)</label>
                                    <input type="text" value={editingData.info1 || ''} onChange={(e) => setEditingData({ ...editingData, info1: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Konum</label>
                                    <input type="text" value={editingData.area1 || ''} onChange={(e) => setEditingData({ ...editingData, area1: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:outline-primary" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 italic mt-2">* Detaylı mekan tasarımı ve alt içerik yönetimi panel yöneticisi tarafından Sayfa Tanım bölümünden yapılmaktadır.</p>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={cancelEdit} className="px-6 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">İptal</button>
                                <button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-8 py-2 rounded-lg font-medium shadow-md">
                                    <Save size={18} /> {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                )
            ) : (
                /* LIST VIEW */
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Sayfa Adı</th>
                                <th className="px-6 py-4">Sayfa Tipi</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {myAssignedPages.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center">
                                            <FileText size={48} className="text-gray-200 mb-3" />
                                            <p>Size atanmış herhangi bir sayfa bulunmamaktadır.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                myAssignedPages.map(page => (
                                    <tr key={`${page.pageType}-${page.pageId}`} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">{page.pageTitle}</div>
                                            <div className="text-xs text-gray-500">#{page.pageId}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200 font-bold">
                                                {page.pageType === 'PLACE' ? 'MEKAN İNCELEME' : 'YEME/İÇME'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleEditStart(page)}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors border border-orange-100"
                                            >
                                                <Edit2 size={14} /> Düzenle
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <AlertCircle size={14} />
                <span>Bu sayfadaki değişiklikler doğrudan gerçek verilere uygulanır.</span>
            </div>
        </div>
    );
};

export default MyPagesManager;