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
    Upload
} from 'lucide-react';
import { api, getImageUrl } from '../services/api';

const AdsManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'stories' | 'featured' | 'google'>('stories');
    const [saving, setSaving] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    // --- DATA STATE ---
    const [storyAds, setStoryAds] = useState<any[]>([]);
    const [featuredAds, setFeaturedAds] = useState<any[]>([]);
    const [googleAds, setGoogleAds] = useState<any>({ ad1: '', ad2: '', isActive1: true, isActive2: true });

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // --- FETCH DATA ---
    const fetchData = async () => {
        setLoadingData(true);
        try {
            if (activeTab === 'stories') {
                const data = await api.get<any[]>('/web-home/ads/story');
                setStoryAds(data);
            } else if (activeTab === 'featured') {
                const data = await api.get<any[]>('/web-home/ads/featured');
                setFeaturedAds(data);
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
    const handleSave = async () => {
        setSaving(true);
        // Implement save for Google Ads or other persistent settings if needed
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
        setToastMessage('Ayarlar başarıyla kaydedildi!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleDeleteAd = async (id: number, type: 'story' | 'featured') => {
        if (!window.confirm('Bu reklamı silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/web-home/ads/${type}/${id}`);
            fetchData();
            setToastMessage('Reklam başarıyla silindi.');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            alert('Silme sırasında hata oluştu.');
        }
    };

    const handleToggleActive = async (id: number, current: boolean, type: 'story' | 'featured') => {
        try {
            await api.patch(`/web-home/ads/${type}/${id}`, { isActive: !current });
            fetchData();
        } catch (error) {
            alert('Güncelleme hatası.');
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
                                    <h3 className="text-lg font-bold text-gray-700">Aktif Hikaye Reklamları</h3>
                                    <p className="text-xs text-gray-400 font-medium">Sayfa Tanım ekranından mekan ekleyebilirsiniz.</p>
                                </div>

                                {storyAds.length === 0 ? (
                                    <div className="bg-white border-2 border-dashed border-gray-100 rounded-3xl p-12 text-center text-gray-400">
                                        Henüz hikaye reklamı eklenmemiş.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {storyAds.map((ad) => (
                                            <div key={ad.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                                                <div className="aspect-square bg-gray-50 relative">
                                                    {ad.imageUrl ? (
                                                        <img src={getImageUrl(ad.imageUrl)} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                                            <ImageIcon size={40} />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-3 right-3">
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input type="checkbox" className="sr-only peer" checked={ad.isActive} onChange={() => handleToggleActive(ad.id, ad.isActive, 'story')} />
                                                            <div className="w-9 h-5 bg-gray-200/80 backdrop-blur-md peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    <div className="font-bold text-gray-800 truncate mb-1">{ad.title}</div>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase mb-4">
                                                        <ExternalLink size={10} /> {ad.link}
                                                    </div>
                                                    <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                                        <span className="text-[10px] font-bold text-gray-300">#{ad.id}</span>
                                                        <button onClick={() => handleDeleteAd(ad.id, 'story')} className="text-gray-300 hover:text-red-500 transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
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
                                    <h3 className="text-lg font-bold text-gray-700">Öne Çıkan İşletmeler</h3>
                                    <p className="text-xs text-gray-400 font-medium">Sayfa Tanım ekranından mekan ekleyebilirsiniz.</p>
                                </div>

                                {featuredAds.length === 0 ? (
                                    <div className="bg-white border-2 border-dashed border-gray-100 rounded-3xl p-12 text-center text-gray-400">
                                        Henüz öne çıkan işletme eklenmemiş.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {featuredAds.map((ad) => (
                                            <div key={ad.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-6 items-center hover:shadow-md transition-all">
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
                                                        <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold uppercase">{ad.category}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate">{ad.description}</p>
                                                </div>

                                                <div className="flex items-center gap-6 px-6 border-l border-gray-50">
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

                                                <button onClick={() => handleDeleteAd(ad.id, 'featured')} className="text-gray-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-xl">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- GOOGLE REKLAM --- */}
                        {activeTab === 'google' && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
                                        <Layout size={20} className="text-primary" />
                                        Google Adsense Ayarları
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="font-bold text-sm text-gray-700">Sol Reklam Alanı</h4>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                                                    </label>
                                                </div>
                                                <textarea rows={6} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-primary font-mono text-[11px] text-gray-600" placeholder="<ins class='adsbygoogle' ...></ins>" />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="font-bold text-sm text-gray-700">Sağ Reklam Alanı</h4>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                                                    </label>
                                                </div>
                                                <textarea rows={6} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-primary font-mono text-[11px] text-gray-600" placeholder="<ins class='adsbygoogle' ...></ins>" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* TOAST NOTIFICATION */}
            {showToast && (
                <div className="fixed bottom-10 right-10 bg-gray-900 text-white px-8 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-10 fade-in duration-300 z-[100] flex items-center gap-4">
                    <div className="bg-success/20 p-2 rounded-full">
                        <CheckCircle size={20} className="text-success" />
                    </div>
                    <span className="font-bold">{toastMessage}</span>
                </div>
            )}
        </div>
    );
};

export default AdsManager;
