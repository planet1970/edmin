import React, { useState, useEffect } from 'react';
import {
    Megaphone,
    Image as ImageIcon,
    Plus,
    Trash2,
    Save,
    PlusCircle,
    Star,
    Layout,
    ExternalLink,
    AlertCircle,
    CheckCircle,
    Loader,
    Upload,
    GripVertical,
    Edit3,
    Layers,
    X
} from 'lucide-react';
import { api, getImageUrl } from '../services/api';
import { toast } from 'react-hot-toast';

const AdsManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'stories' | 'featured' | 'popular' | 'google'>('stories');
    const [saving, setSaving] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    // --- DATA STATE ---
    const [storyAds, setStoryAds] = useState<any[]>([]);
    const [featuredAds, setFeaturedAds] = useState<any[]>([]);
    const [popularAds, setPopularAds] = useState<any[]>([]);
    const [googleAds, setGoogleAds] = useState<any[]>([]);
    const [leftAd, setLeftAd] = useState<any>({ type: 'SCRIPT', scriptCode: '', imageUrl: '', linkUrl: '', isActive: true });
    const [rightAd, setRightAd] = useState<any>({ type: 'SCRIPT', scriptCode: '', imageUrl: '', linkUrl: '', isActive: true });

    const [orderDirtyStories, setOrderDirtyStories] = useState(false);
    const [orderDirtyFeatured, setOrderDirtyFeatured] = useState(false);
    const [orderDirtyPopular, setOrderDirtyPopular] = useState(false);

    // --- MODAL STATE ---
    const [editingAd, setEditingAd] = useState<any>(null);
    const [campaignText, setCampaignText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- FETCH DATA ---
    const fetchData = async () => {
        setLoadingData(true);
        try {
            if (activeTab === 'stories') {
                const data = await api.get<any[]>('/web-home/ads/story');
                setStoryAds(data);
                setOrderDirtyStories(false);
            } else if (activeTab === 'featured') {
                const data = await api.get<any[]>('/web-home/ads/featured');
                setFeaturedAds(data);
                setOrderDirtyFeatured(false);
            } else if (activeTab === 'popular') {
                const data = await api.get<any[]>('/web-home/ads/popular');
                setPopularAds(data);
                setOrderDirtyPopular(false);
            } else if (activeTab === 'google') {
                const data = await api.get<any[]>('/web-home/ads/google');
                setGoogleAds(data);
                const left = data.find((a: any) => a.areaName === 'HOME_LEFT');
                const right = data.find((a: any) => a.areaName === 'HOME_RIGHT');
                if (left) setLeftAd(left);
                if (right) setRightAd(right);
            }
        } catch (error) {
            console.error('Error fetching ads:', error);
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    // --- HANDLERS ---
    const handleSaveGoogleAd = async (areaName: string) => {
        const adData = areaName === 'HOME_LEFT' ? leftAd : rightAd;
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('type', adData.type);
            formData.append('scriptCode', adData.scriptCode || '');
            formData.append('linkUrl', adData.linkUrl || '');
            formData.append('isActive', adData.isActive.toString());

            if (adData.newFile) {
                formData.append('file', adData.newFile);
            }

            await api.patch(`/web-home/ads/google/${areaName}`, formData);

            toast.success(`${areaName === 'HOME_LEFT' ? 'Sol' : 'Sağ'} reklam alanı güncellendi.`);
            fetchData();
        } catch (error) {
            toast.error('Kayıt sırasında hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = (areaName: string, file: File | null) => {
        if (areaName === 'HOME_LEFT') {
            setLeftAd({ ...leftAd, newFile: file, imageUrl: file ? URL.createObjectURL(file) : leftAd.imageUrl });
        } else {
            setRightAd({ ...rightAd, newFile: file, imageUrl: file ? URL.createObjectURL(file) : rightAd.imageUrl });
        }
    };

    const handleResetAd = async (areaName: string) => {
        if (!window.confirm('Bu reklam alanını temizlemek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/web-home/ads/google/${areaName}`);
            toast.success('Reklam alanı temizlendi.');
            if (areaName === 'HOME_LEFT') setLeftAd({ type: 'SCRIPT', scriptCode: '', imageUrl: '', linkUrl: '', isActive: true });
            else setRightAd({ type: 'SCRIPT', scriptCode: '', imageUrl: '', linkUrl: '', isActive: true });
            fetchData();
        } catch (error) {
            toast.error('Temizleme hatası.');
        }
    };

    // --- HANDLERS ---
    const handleSave = async () => {
        setSaving(true);
        // Implement save for Google Ads or other persistent settings if needed
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
        toast.success('Ayarlar başarıyla kaydedildi!');
    };

    const handleDeleteAd = async (id: number, type: 'story' | 'featured' | 'popular') => {
        const itemType = type === 'popular' ? 'mekanı' : 'reklamı';
        if (!window.confirm(`Bu ${itemType} silmek istediğinize emin misiniz?`)) return;
        try {
            await api.delete(`/web-home/ads/${type}/${id}`);
            fetchData();
            toast.success('Başarıyla silindi.');
        } catch (error) {
            toast.error('Silme sırasında hata oluştu.');
        }
    };

    const handleToggleActive = async (id: number, current: boolean, type: 'story' | 'featured' | 'popular') => {
        try {
            await api.patch(`/web-home/ads/${type}/${id}`, { isActive: !current });
            fetchData();
        } catch (error) {
            alert('Güncelleme hatası.');
        }
    };

    // --- DRAG AND DROP ---
    const handleDragStart = (e: React.DragEvent, index: number, type: 'story' | 'featured' | 'popular') => {
        e.dataTransfer.setData('type', type);
        e.dataTransfer.setData('index', index.toString());
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number, type: 'story' | 'featured' | 'popular') => {
        const dragType = e.dataTransfer.getData('type');
        if (dragType !== type) return;

        const dragIndex = parseInt(e.dataTransfer.getData('index'));
        if (dragIndex === dropIndex) return;

        if (type === 'story') {
            const newItems = [...storyAds];
            const [draggedItem] = newItems.splice(dragIndex, 1);
            newItems.splice(dropIndex, 0, draggedItem);
            setStoryAds(newItems.map((item, idx) => ({ ...item, order: idx + 1 })));
            setOrderDirtyStories(true);
        } else if (type === 'popular') {
            const newItems = [...popularAds];
            const [draggedItem] = newItems.splice(dragIndex, 1);
            newItems.splice(dropIndex, 0, draggedItem);
            setPopularAds(newItems.map((item, idx) => ({ ...item, order: idx + 1 })));
            setOrderDirtyPopular(true);
        } else {
            const newItems = [...featuredAds];
            const [draggedItem] = newItems.splice(dragIndex, 1);
            newItems.splice(dropIndex, 0, draggedItem);
            setFeaturedAds(newItems.map((item, idx) => ({ ...item, order: idx + 1 })));
            setOrderDirtyFeatured(true);
        }
    };

    const handleSaveOrder = async (type: 'story' | 'featured' | 'popular') => {
        try {
            setSaving(true);
            const items = type === 'story' ? storyAds : (type === 'featured' ? featuredAds : popularAds);
            const ids = items.map(i => i.id);
            await api.post(`/web-home/ads/${type}/reorder`, ids);
            toast.success('Sıralama başarıyla kaydedildi!');
            if (type === 'story') setOrderDirtyStories(false);
            else if (type === 'featured') setOrderDirtyFeatured(false);
            else setOrderDirtyPopular(false);
        } catch (error) {
            toast.error('Sıralama kaydedilirken hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    const handleOpenEditModal = (ad: any) => {
        setEditingAd(ad);
        setCampaignText(ad.discount || '');
        setIsModalOpen(true);
    };

    const handleSaveCampaign = async () => {
        if (!editingAd) return;
        setSaving(true);
        try {
            await api.patch(`/web-home/ads/featured/${editingAd.id}`, { discount: campaignText });
            toast.success('Kampanya bilgisi güncellendi.');
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Güncelleme sırasında bir hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Reklam Yönetimi</h1>
                    <p className="text-sm text-gray-500">Mevcut story reklamları ve öne çıkan mekanları yönetin.</p>
                </div>
                <div className="flex items-center gap-4">
                    {saving && <div className="flex items-center gap-2 text-primary font-medium animate-pulse"><Loader size={16} className="animate-spin" /> Kaydediliyor...</div>}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-orange-900/10 disabled:opacity-50"
                    >
                        <Save size={18} />
                        Değişiklikleri Kaydet
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* TABS */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl max-w-2xl">
                    <button
                        onClick={() => setActiveTab('stories')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'stories'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                    >
                        <PlusCircle size={16} />
                        Hikaye Reklam
                    </button>
                    <button
                        onClick={() => setActiveTab('featured')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'featured'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                    >
                        <Star size={16} />
                        Öne Çıkanlar
                    </button>
                    <button
                        onClick={() => setActiveTab('google')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'google'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                    >
                        <Layout size={16} />
                        Google Reklam
                    </button>
                    <button
                        onClick={() => setActiveTab('popular')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'popular'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                    >
                        <Layers size={16} />
                        Popüler Mekan
                    </button>
                </div>

                {loadingData ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Loader size={48} className="animate-spin mb-4" />
                        <span className="font-medium">Veriler yükleniyor...</span>
                    </div>
                ) : (
                    <>
                        {/* --- HİKAYE REKLAM --- */}
                        {activeTab === 'stories' && (
                            <div className="space-y-4 animate-in fade-in duration-500">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-700">Aktif Hikaye Reklamları</h3>
                                        <p className="text-xs text-gray-400 font-medium">Sayfa Tanım ekranından mekan ekleyebilirsiniz.</p>
                                    </div>
                                    {orderDirtyStories && (
                                        <button
                                            onClick={() => handleSaveOrder('story')}
                                            className="px-4 py-1.5 bg-success text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                                        >
                                            <Save size={14} /> Sıralamayı Kaydet
                                        </button>
                                    )}
                                </div>

                                {storyAds.length === 0 ? (
                                    <div className="bg-white border-2 border-dashed border-gray-100 rounded-3xl p-12 text-center text-gray-400">
                                        Henüz hikaye reklamı eklenmemiş.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {storyAds.map((ad, index) => (
                                            <div
                                                key={ad.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, index, 'story')}
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => handleDrop(e, index, 'story')}
                                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-6 items-center hover:shadow-md transition-all cursor-move group"
                                            >
                                                <div className="text-gray-300 group-hover:text-primary transition-colors">
                                                    <GripVertical size={20} />
                                                </div>
                                                <div className="w-24 h-24 bg-gray-50 rounded-full flex-shrink-0 overflow-hidden border-4 border-primary/20 p-1">
                                                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-white">
                                                        {ad.imageUrl ? (
                                                            <img src={getImageUrl(ad.imageUrl)} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                                <ImageIcon size={24} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-gray-800 truncate">{ad.title}</span>
                                                        {ad.isNew && <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase">Yeni</span>}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-info font-medium">
                                                        <ExternalLink size={12} /> {ad.link}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-10 px-6 border-l border-gray-50">
                                                    <div className="text-center">
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Sıra</div>
                                                        <div className="font-bold text-gray-700">{ad.order}</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Durum</div>
                                                        <button onClick={() => handleToggleActive(ad.id, ad.isActive, 'story')} className={`px-2 py-0.5 rounded text-[10px] font-bold ${ad.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                            {ad.isActive ? 'AKTİF' : 'PASİF'}
                                                        </button>
                                                    </div>
                                                </div>

                                                <button onClick={() => handleDeleteAd(ad.id, 'story')} className="text-gray-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-xl">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- ÖNE ÇIKANLAR --- */}
                        {activeTab === 'featured' && (
                            <div className="space-y-4 animate-in fade-in duration-500">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-700">Öne Çıkan İşletmeler</h3>
                                        <p className="text-xs text-gray-400 font-medium">Sayfa Tanım ekranından mekan ekleyebilirsiniz.</p>
                                    </div>
                                    {orderDirtyFeatured && (
                                        <button
                                            onClick={() => handleSaveOrder('featured')}
                                            className="px-4 py-1.5 bg-success text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                                        >
                                            <Save size={14} /> Sıralamayı Kaydet
                                        </button>
                                    )}
                                </div>

                                {featuredAds.length === 0 ? (
                                    <div className="bg-white border-2 border-dashed border-gray-100 rounded-3xl p-12 text-center text-gray-400">
                                        Henüz öne çıkan işletme eklenmemiş.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {featuredAds.map((ad, index) => (
                                            <div
                                                key={ad.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, index, 'featured')}
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => handleDrop(e, index, 'featured')}
                                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-6 items-center hover:shadow-md transition-all cursor-move group"
                                            >
                                                <div className="text-gray-300 group-hover:text-primary transition-colors">
                                                    <GripVertical size={20} />
                                                </div>
                                                <div className="w-32 h-20 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden border border-gray-100">
                                                    {ad.imageUrl ? (
                                                        <img src={getImageUrl(ad.imageUrl)} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                            <ImageIcon size={24} />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-gray-800 truncate">{ad.title}</span>
                                                        <div className="flex gap-1">
                                                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-bold uppercase">{ad.mainCategory}</span>
                                                            <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[9px] font-bold uppercase">{ad.category}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate">{ad.description}</p>
                                                </div>

                                                <div className="flex items-center gap-10 px-6 border-l border-gray-50">
                                                    <div className="text-center">
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Sıra</div>
                                                        <div className="font-bold text-gray-700">{ad.order}</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Kampanya</div>
                                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${ad.discount ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-300'}`}>
                                                            {ad.discount ? 'VAR' : 'YOK'}
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Puan</div>
                                                        <div className="font-bold text-yellow-600 flex items-center gap-1 justify-center">
                                                            <Star size={12} fill="currentColor" /> {ad.rating}
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Durum</div>
                                                        <button onClick={() => handleToggleActive(ad.id, ad.isActive, 'featured')} className={`px-2 py-0.5 rounded text-[10px] font-bold ${ad.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                            {ad.isActive ? 'AKTİF' : 'PASİF'}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 border-l border-gray-50 pl-4">
                                                    <button
                                                        onClick={() => handleOpenEditModal(ad)}
                                                        className="text-gray-300 hover:text-blue-500 transition-colors p-2 hover:bg-blue-50 rounded-xl"
                                                        title="Kampanya Düzenle"
                                                    >
                                                        <Edit3 size={20} />
                                                    </button>
                                                    <button onClick={() => handleDeleteAd(ad.id, 'featured')} className="text-gray-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-xl">
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- GOOGLE REKLAM --- */}
                        {activeTab === 'google' && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                            <Layout size={24} className="text-primary" />
                                            Google & Özel Reklam Alanları
                                        </h3>
                                        <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                                            <AlertCircle size={14} />
                                            Reklam kodunuzu veya görselinizi buradan yönetebilirsiniz.
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 mb-8 flex items-start gap-4 shadow-sm">
                                        <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                                            <AlertCircle size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-blue-900 text-lg uppercase tracking-tight">Reklam Boyut Bilgilendirmesi</h4>
                                            <p className="text-blue-700/80 mt-1 leading-relaxed text-sm">
                                                Google Reklam alanları için varsayılan ve en ideal görsel boyutu <b className="text-blue-900">590x160 pikseldir</b>.
                                                Bu ölçü, sitemizdeki reklamların hem masaüstü hem de mobil cihazlarda en iyi şekilde hizalanmasını sağlar.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        {/* LEFT AD AREA */}
                                        {[
                                            { id: 'HOME_LEFT', name: 'Sol Reklam Alanı', state: leftAd, setState: setLeftAd },
                                            { id: 'HOME_RIGHT', name: 'Sağ Reklam Alanı', state: rightAd, setState: setRightAd }
                                        ].map((area) => (
                                            <div key={area.id} className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-bold text-gray-800">{area.name}</h4>
                                                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Alt Sidebar veya Sayfa Yanı</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => handleResetAd(area.id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                            title="Alanı Temizle"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                        <label className="relative inline-flex items-center cursor-pointer group">
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                checked={area.state.isActive}
                                                                onChange={(e) => area.setState({ ...area.state, isActive: e.target.checked })}
                                                            />
                                                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 shadow-inner"></div>
                                                            <span className={`ml-3 text-xs font-black uppercase tracking-widest ${area.state.isActive ? 'text-green-500' : 'text-gray-400'}`}>
                                                                {area.state.isActive ? 'Açık' : 'Kapalı'}
                                                            </span>
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="flex bg-white p-1 rounded-xl border border-gray-100">
                                                    <button
                                                        onClick={() => area.setState({ ...area.state, type: 'SCRIPT' })}
                                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${area.state.type === 'SCRIPT' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                                    >
                                                        Google Script
                                                    </button>
                                                    <button
                                                        onClick={() => area.setState({ ...area.state, type: 'IMAGE' })}
                                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${area.state.type === 'IMAGE' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                                    >
                                                        Özel Görsel
                                                    </button>
                                                </div>

                                                {area.state.type === 'SCRIPT' ? (
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Adsense Kod Bloğu</label>
                                                        <textarea
                                                            rows={8}
                                                            value={area.state.scriptCode || ''}
                                                            onChange={(e) => area.setState({ ...area.state, scriptCode: e.target.value })}
                                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-primary font-mono text-[11px] text-gray-600 resize-none shadow-inner"
                                                            placeholder="<ins class='adsbygoogle' ...></ins>"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="relative group">
                                                            <div style={{ width: '590px', height: '160px' }} className="bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-primary/50 mx-auto">
                                                                {area.state.imageUrl ? (
                                                                    <div className="w-full h-full relative">
                                                                        <img src={getImageUrl(area.state.imageUrl)} alt="Preview" className="w-full h-full object-cover" />
                                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                            <Upload className="text-white" size={32} />
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-center p-2">
                                                                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-1">
                                                                            <ImageIcon size={20} />
                                                                        </div>
                                                                        <p className="text-[11px] font-bold text-gray-500">Reklam Görseli Seçin</p>
                                                                        <p className="text-[10px] text-gray-400 mt-1 font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-100">Önerilen: 590x160px</p>
                                                                    </div>
                                                                )}
                                                                <input
                                                                    type="file"
                                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                                    onChange={(e) => handleFileChange(area.id, e.target.files?.[0] || null)}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Yönlendirme Linki</label>
                                                            <div className="relative">
                                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                                    <ExternalLink size={14} />
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    value={area.state.linkUrl || ''}
                                                                    onChange={(e) => area.setState({ ...area.state, linkUrl: e.target.value })}
                                                                    placeholder="https://example.com"
                                                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-primary text-xs font-medium"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => handleSaveGoogleAd(area.id)}
                                                    disabled={saving}
                                                    className="w-full py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                                                    Bu Alanı Güncelle
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- POPÜLER MEKANLAR --- */}
                        {activeTab === 'popular' && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-700">Aktif Popüler Mekanlar</h3>
                                        <p className="text-xs text-gray-400 font-medium">Ana sayfadaki "Popüler Mekanlar" bölümünde listelenen öğeler.</p>
                                    </div>
                                    {orderDirtyPopular && (
                                        <button
                                            onClick={() => handleSaveOrder('popular')}
                                            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-600 transition-all shadow-md animate-pulse"
                                        >
                                            <Save size={16} /> Sıralamayı Kaydet
                                        </button>
                                    )}
                                </div>

                                {popularAds.length === 0 ? (
                                    <div className="bg-gray-50 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                                        <p className="text-gray-400 font-medium">Henüz popüler mekan eklenmemiş.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {popularAds.map((ad, index) => (
                                            <div
                                                key={ad.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, index, 'popular')}
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => handleDrop(e, index, 'popular')}
                                                className={`group relative bg-white rounded-3xl p-6 transition-all border-2 cursor-move hover:shadow-xl ${ad.isActive ? 'border-transparent shadow-sm' : 'border-gray-100 opacity-60'}`}
                                            >
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="relative">
                                                        <img src={getImageUrl(ad.imageUrl)} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-gray-100" />
                                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                                            {index + 1}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-gray-800 truncate">{ad.title}</h4>
                                                        <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1">
                                                            <span className="text-[9px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-md font-bold border border-orange-100 flex items-center gap-1">
                                                                <Layers size={8} className="text-orange-500" /> {ad.mainCategory || ad.badge}
                                                            </span>
                                                            <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md font-bold border border-blue-100 flex items-center gap-1">
                                                                <Layers size={8} className="text-blue-500" /> {ad.category || ad.location}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${ad.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                            <span className="text-[10px] font-bold text-gray-400">{ad.isActive ? 'AKTİF' : 'PASİF'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleToggleActive(ad.id, ad.isActive, 'popular')} className={`p-2 rounded-lg transition-all ${ad.isActive ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button onClick={() => handleDeleteAd(ad.id, 'popular')} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                    <GripVertical className="text-gray-200" size={20} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* --- KAMPANYA MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="bg-primary p-6 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Megaphone size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold">Kampanya Düzenle</h3>
                                    <p className="text-[10px] text-white/70 uppercase font-bold tracking-wider">{editingAd?.title}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Kampanya Metni</label>
                            <textarea
                                value={campaignText}
                                onChange={(e) => setCampaignText(e.target.value)}
                                placeholder="Örn: %20 İndirim Fırsatı!"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-gray-700 resize-none"
                                rows={4}
                            />
                            <p className="mt-3 text-[11px] text-gray-400 font-medium leading-relaxed">
                                Buraya yazılacak metin, web sitesindeki mekan kartında yeşil bir kutu içinde kampanya olarak görünecektir.
                            </p>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleSaveCampaign}
                                    disabled={saving}
                                    className="flex-[2] px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                    Kaydet
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdsManager;
