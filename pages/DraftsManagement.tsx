import React, { useState, useEffect } from 'react';
import {
    FilePlus, CheckCircle, Eye, AlertCircle, Loader2, ArrowRight, XCircle, UserCheck, Trash2
} from 'lucide-react';
import { tempPagesService } from '../services/tempPages';
import { categoriesService } from '../services/categories';
import { subcategoriesService } from '../services/subcategories';
import { Category, SubCategory } from '../types';
import FoodPlaceForm from '../components/FoodPlaceForm';
import { getImageUrl } from '../services/api';
import { toast } from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';

const DraftsManagement: React.FC = () => {
    const [drafts, setDrafts] = useState<any[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [loading, setLoading] = useState(true);

    // Viewer states
    const [viewingDraft, setViewingDraft] = useState<any>(null);
    const [isViewing, setIsViewing] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

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
        type: 'info',
        onConfirm: () => { },
        confirmText: 'Onayla'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [draftList, cats, subs] = await Promise.all([
                tempPagesService.getAllDrafts(),
                categoriesService.list(),
                subcategoriesService.list()
            ]);
            setDrafts(Array.isArray(draftList) ? draftList : []);
            setCategories(cats);
            setSubCategories(subs);
        } catch (error) {
            console.error('Veri yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (draft: any) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Taslak Onayı',
            message: `"${draft.title}" sayfasındaki değişiklikleri onaylıyor musunuz? Bu işlem gerçek verileri güncelleyecektir.`,
            type: 'info',
            confirmText: 'Evet, Onayla',
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                setActionLoading(draft.id + '-' + draft.pageType);
                try {
                    await tempPagesService.approveDraft(draft.pageType, draft.id);
                    toast.success('Taslak başarıyla onaylandı ve canlıya alındı.');
                    loadData();
                    if (isViewing) closeViewer();
                } catch (error) {
                    console.error('Onaylanırken hata oluştu:', error);
                    toast.error('Taslak onaylanırken bir hata oluştu.');
                } finally {
                    setActionLoading(null);
                }
            }
        });
    };

    const handleReject = (draft: any) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Taslağı Reddet',
            message: `"${draft.title}" taslağını reddetmek ve silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
            type: 'danger',
            confirmText: 'Evet, Reddet',
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                setActionLoading(draft.id + '-' + draft.pageType);
                try {
                    await tempPagesService.deleteDraft(draft.pageType, draft.id);
                    toast.success('Taslak başarıyla reddedildi ve silindi.');
                    loadData();
                    if (isViewing) closeViewer();
                } catch (error) {
                    console.error('Silinirken hata oluştu:', error);
                    toast.error('Taslak silinirken bir hata oluştu.');
                } finally {
                    setActionLoading(null);
                }
            }
        });
    };

    const closeViewer = () => {
        setIsViewing(false);
        setViewingDraft(null);
    };

    const getCategoryTitle = (id?: number) => categories.find(c => c.id === id)?.title || 'Bilinmiyor';
    const getSubCategoryTitle = (id?: number) => subCategories.find(s => s.id === id)?.title || 'Bilinmiyor';

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <Loader2 className="animate-spin text-primary mb-2" size={48} />
                <p className="text-gray-500 font-medium">Taslaklar yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Taslak Yönetimi</h1>
                    <p className="text-sm text-gray-500">Kullanıcılardan gelen düzenleme taleplerini inceleyin ve onaylayın.</p>
                </div>
            </div>

            {isViewing && viewingDraft && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 md:p-8 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl relative">
                        <div className="absolute top-4 right-4 z-10">
                            <button onClick={closeViewer} className="p-2 bg-white/80 hover:bg-white rounded-full shadow-md text-gray-500 hover:text-red-500 transition-all">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <div className="p-1 max-h-[90vh] overflow-y-auto">
                            <div className="p-6 bg-gray-50 border-b flex items-center justify-between rounded-t-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                        <Eye size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">Taslak İnceleme</h2>
                                        <p className="text-xs text-gray-500">Düzenleyen: {viewingDraft.updatedBy?.name || viewingDraft.updatedBy?.username || 'Bilinmeyen Kullanıcı'}</p>
                                    </div>
                                </div>
                                <div className="mr-12 flex gap-3">
                                    <button
                                        onClick={() => handleApprove(viewingDraft)}
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-all"
                                    >
                                        <CheckCircle size={18} /> Onayla
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {viewingDraft.pageType === 'FOOD_PLACE' ? (
                                    <FoodPlaceForm
                                        data={viewingDraft}
                                        onSave={async () => { }}
                                        onCancel={closeViewer}
                                        loading={false}
                                        showActiveToggle={false}
                                        isReadOnly={true}
                                    />
                                ) : (
                                    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                                        <div className="p-6 space-y-6 opacity-80 pointer-events-none grayscale-[0.2]">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Ana Sayfa Görsel</label>
                                                    <img src={getImageUrl(viewingDraft.pic_url)} className="w-full h-40 object-cover rounded-lg border" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Arka Sayfa Görsel</label>
                                                    <img src={getImageUrl(viewingDraft.back_pic_url)} className="w-full h-40 object-cover rounded-lg border" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Başlık</label>
                                                    <div className="p-3 bg-gray-50 border rounded-lg font-medium">{viewingDraft.title}</div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Açıklama</label>
                                                    <div className="p-3 bg-gray-50 border rounded-lg min-h-[100px]">{viewingDraft.description}</div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Çalışma Saatleri</label>
                                                        <div className="p-3 bg-gray-50 border rounded-lg">{viewingDraft.info1 || '-'}</div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Konum</label>
                                                        <div className="p-3 bg-gray-50 border rounded-lg">{viewingDraft.area1 || '-'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-amber-50 border-t border-amber-100 flex items-center gap-2 text-amber-700 text-sm italic">
                                            <AlertCircle size={16} />
                                            <span>Bu sayfa salt-okunur modda görüntülenmektedir. Değişiklik yapmak için customer paneline yönlendirin veya onaylayın.</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-400 font-bold text-xs uppercase border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Kullanıcı</th>
                            <th className="px-6 py-4">Tarih</th>
                            <th className="px-6 py-4">Sayfa / Mekan</th>
                            <th className="px-6 py-4">Kategori</th>
                            <th className="px-6 py-4">Durum</th>
                            <th className="px-6 py-4 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {drafts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                                    <div className="flex flex-col items-center gap-2">
                                        <FilePlus size={48} className="text-gray-200" />
                                        <span>Bekleyen taslak düzenleme bulunmamaktadır.</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            drafts.map(draft => (
                                <tr key={draft.id + draft.pageType} className={`hover:bg-gray-50/50 transition-colors ${draft.status === 'APPROVED' ? 'opacity-60' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                {(draft.updatedBy?.name || draft.updatedBy?.username || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-800">{draft.updatedBy?.name || draft.updatedBy?.username || 'Kullanıcı'}</div>
                                                <div className="text-[10px] text-gray-400 hover:text-primary transition-colors cursor-help">@{draft.updatedBy?.username || 'unknown'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-gray-500 font-medium">{new Date(draft.createdAt).toLocaleDateString('tr-TR')}</div>
                                        <div className="text-[10px] text-gray-400">{new Date(draft.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-800">{draft.title}</span>
                                            <span className={`w-fit px-1.5 py-0.5 rounded text-[9px] font-bold mt-1 ${draft.pageType === 'PLACE' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                                                {draft.pageType === 'PLACE' ? 'MEKAN' : 'YEME/İÇME'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] text-gray-500">{getCategoryTitle(draft.categoryId)}</span>
                                            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-700">
                                                <ArrowRight size={10} className="text-gray-300" />
                                                {getSubCategoryTitle(draft.subCategoryId)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${draft.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                            {draft.status === 'PENDING' ? 'ONAY BEKLİYOR' : 'ONAYLANDI'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => { setViewingDraft(draft); setIsViewing(true); }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all border border-blue-100"
                                            >
                                                <Eye size={14} /> Göster
                                            </button>

                                            {draft.status === 'PENDING' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(draft)}
                                                        disabled={!!actionLoading}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50"
                                                    >
                                                        {actionLoading === (draft.id + '-' + draft.pageType) ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                                        Onayla
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(draft)}
                                                        disabled={!!actionLoading}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Reddet ve Sil"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-[10px] text-gray-400 font-medium italic">
                                                    Onaylandı: {new Date(draft.updatedAt).toLocaleDateString('tr-TR')}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

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

export default DraftsManagement;
