import React, { useState } from 'react';
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

const AdsManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'stories' | 'featured' | 'google'>('stories');
    const [saving, setSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // --- HANDLERS ---
    const handleSave = async () => {
        setSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
        setToastMessage('Değişiklikler başarıyla kaydedildi!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Reklam Yönetimi</h1>
                    <p className="text-sm text-gray-500">Hikaye reklamları, öne çıkan işletmeler ve Google reklam alanlarını yönetin.</p>
                </div>
                <div className="flex items-center gap-4">
                    {saving && <div className="flex items-center gap-2 text-primary font-medium animate-pulse"><Loader size={16} className="animate-spin" /> Kaydediliyor...</div>}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-orange-900/10 disabled:opacity-50"
                    >
                        <Save size={18} />
                        Tümünü Kaydet
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

                {/* --- HİKAYE REKLAM (BUSINESS STORIES) --- */}
                {activeTab === 'stories' && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-700">Hikaye Reklamları (EdWeb Business Stories)</h3>
                            <button className="text-sm bg-gray-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-black transition-colors flex items-center gap-2">
                                <Plus size={16} /> Yeni Hikaye Reklamı Ekle
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                                    <div className="aspect-[4/3] bg-gray-100 relative group">
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                            <ImageIcon size={48} strokeWidth={1} />
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="w-full bg-white/20 backdrop-blur-md text-white py-2 rounded-lg text-sm font-medium border border-white/30 hover:bg-white/30 transition-all flex items-center justify-center gap-2">
                                                <Upload size={14} /> Görsel Değiştir
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">İşletme Adı</label>
                                                <input type="text" className="w-full bg-transparent border-b border-gray-100 py-1 font-bold text-gray-800 focus:outline-none focus:border-primary transition-colors" defaultValue={`İşletme ${i}`} />
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" defaultChecked={i % 2 === 0} />
                                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                                    <span className="ml-2 text-[10px] font-bold text-gray-400 uppercase">Yeni</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Yönlendirme Linki</label>
                                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                                                <ExternalLink size={14} className="text-gray-400" />
                                                <input type="text" className="bg-transparent border-none w-full text-xs text-info focus:ring-0 p-0" defaultValue="/place/selimiye" />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-300 uppercase">ID: {234 + i}</span>
                                            <button className="text-gray-300 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- ÖNE ÇIKANLAR (FEATURED BUSINESSES) --- */}
                {activeTab === 'featured' && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-700">Öne Çıkan İşletmeler (EdWeb Featured Businesses)</h3>
                            <button className="text-sm bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center gap-2">
                                <Plus size={16} /> Yeni Öne Çıkan Ekle
                            </button>
                        </div>

                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-6 hover:shadow-md transition-all">
                                    <div className="w-64 aspect-[16/10] bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center text-gray-400 relative overflow-hidden group">
                                        <ImageIcon size={40} strokeWidth={1} />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                            <button className="bg-white text-gray-800 p-2 rounded-full shadow-lg">
                                                <Upload size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-4">
                                        <div className="col-span-1">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Mekan Adı</label>
                                            <input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-primary font-bold text-gray-800" defaultValue={i === 1 ? "Lalezar Restoran" : "Hilly Hotel"} />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kategori</label>
                                            <select className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-primary font-medium text-gray-700">
                                                <option>Yeme - İçme</option>
                                                <option>Konaklama</option>
                                                <option>Alışveriş</option>
                                            </select>
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">İndirim / Kampanya</label>
                                            <input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-primary font-medium text-info" defaultValue={i === 1 ? "%10 İndirim" : "Erken Rezervasyon"} />
                                        </div>
                                        <div className="col-span-1 flex gap-4">
                                            <div className="flex-1">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Puan</label>
                                                <input type="number" step="0.1" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-primary font-bold text-yellow-600" defaultValue="4.9" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Sıralama</label>
                                                <input type="number" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-primary font-bold" defaultValue={i} />
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kısa Açıklama</label>
                                            <textarea rows={2} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-primary text-sm text-gray-600 resize-none font-medium" defaultValue="Edirne'nin en meşhur yaprak ciğeri ve Osmanlı mutfağı lezzetleri." />
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-between items-end pl-4 border-l border-gray-50">
                                        <button className="text-gray-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-xl">
                                            <Trash2 size={20} />
                                        </button>
                                        <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Aktif</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- GOOGLE REKLAM --- */}
                {activeTab === 'google' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
                                <Layout size={20} className="text-primary" />
                                Google Adsense / Reklam Alanı Ayarları
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-bold text-sm text-gray-700">Birinci Reklam Alanı (Sol)</h4>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                                            </label>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Reklam ID / Kod</label>
                                                <textarea rows={4} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-primary font-mono text-[11px] text-gray-600" defaultValue={`<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-12345678"
     data-ad-slot="98765432"
     data-ad-format="auto"></ins>`} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Genişlik</label>
                                                    <input type="text" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" defaultValue="300px" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Yükseklik</label>
                                                    <input type="text" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" defaultValue="250px" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-bold text-sm text-gray-700">İkinci Reklam Alanı (Sağ)</h4>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:translate-x-full peer peer-checked:bg-success"></div>
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                                            </label>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Reklam ID / Kod</label>
                                                <textarea rows={4} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-primary font-mono text-[11px] text-gray-600" defaultValue={`<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-12345678"
     data-ad-slot="12345678"
     data-ad-format="auto"></ins>`} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Genişlik</label>
                                                    <input type="text" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" defaultValue="300px" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Yükseklik</label>
                                                    <input type="text" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" defaultValue="250px" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-orange-50 rounded-2xl border border-orange-100 flex items-start gap-4">
                                <div className="bg-orange-100 p-2 rounded-full text-primary shadow-sm shadow-orange-900/10">
                                    <AlertCircle size={24} />
                                </div>
                                <div className="space-y-2">
                                    <h5 className="font-bold text-orange-900">Google Ads Bilgilendirme</h5>
                                    <p className="text-sm text-orange-800/80 leading-relaxed font-medium">Bu alanlardaki kodlar EdWeb ana sayfasındaki reklam sütunlarında doğrudan render edilecektir. Kodları girerken script tag'leri hariç sadece AdSense birim kodlarını giriniz.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <CheckCircle size={14} className="text-success" />
                <span>Web Sitesi ile Anlık Senkronizasyon Aktif</span>
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
