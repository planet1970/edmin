import React, { useState, useEffect } from 'react';
import {
    Layout, Plus, Trash2, Save, Edit3, Trash, Star, List,
    CheckCircle, Info, Loader, X, AlertCircle, GripVertical
} from 'lucide-react';
import { webHomeService, WebAboutSection, WebAboutCard } from '../services/web-home';
import IconPicker from '../components/IconPicker';
import { toast } from 'react-hot-toast';

const WebAboutManager: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [section, setSection] = useState<WebAboutSection>({ id: 0, title: '', description: '', cards: [] });
    const [editingCard, setEditingCard] = useState<Partial<WebAboutCard> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await webHomeService.getAboutSection();
            setSection(data);
        } catch (error) {
            console.error("Veriler yüklenemedi", error);
            toast.error("Veriler yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveSection = async () => {
        setSaving(true);
        try {
            await webHomeService.updateAboutSection({
                title: section.title,
                description: section.description
            });
            toast.success("Başlık ve açıklama güncellendi.");
        } catch (error) {
            toast.error("Kaydedilirken bir hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    const handleEditCard = (card: WebAboutCard) => {
        setEditingCard(card);
        setIsModalOpen(true);
    };

    const handleAddCard = () => {
        setEditingCard({
            icon: 'fas fa-star',
            title: '',
            summary: '',
            content: '',
            order: (section.cards?.length || 0) + 1,
            isActive: true
        });
        setIsModalOpen(true);
    };

    const handleSaveCard = async () => {
        if (!editingCard) return;
        setSaving(true);
        try {
            if (editingCard.id) {
                await webHomeService.updateAboutCard(editingCard.id, editingCard);
                toast.success("Kart güncellendi.");
            } else {
                await webHomeService.createAboutCard(editingCard);
                toast.success("Yeni kart eklendi.");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error("İşlem sırasında bir hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCard = async (id: number) => {
        if (!window.confirm("Bu kartı silmek istediğinize emin misiniz?")) return;
        try {
            await webHomeService.removeAboutCard(id);
            toast.success("Kart silindi.");
            fetchData();
        } catch (error) {
            toast.error("Silinirken bir hata oluştu.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <Loader className="animate-spin text-primary mb-4" size={48} />
                <p className="text-gray-500 font-medium">Veriler yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3">
                        <Layout className="text-primary" size={32} />
                        Ek Alan Yönetimi
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium italic">"Hakkımızda / Bilgi" bölümünü buradan yönetebilirsiniz.</p>
                </div>
            </div>

            {/* Main Section Settings */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary/20"></div>
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                        <Edit3 size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight">Üst Bilgi Ayarları</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-2">
                            Bölüm Başlığı (Üst Küçük Yazı)
                        </label>
                        <input
                            type="text"
                            value={section.title || ''}
                            onChange={(e) => setSection({ ...section, title: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-primary font-medium text-gray-700 transition-all focus:bg-white focus:shadow-sm"
                            placeholder="HADRİANOUPOLİS'TEN EDİRNE'YE"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-2">
                            Bölüm Açıklaması (Büyük Başlık)
                        </label>
                        <input
                            type="text"
                            value={section.description || ''}
                            onChange={(e) => setSection({ ...section, description: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-primary font-medium text-gray-700 transition-all focus:bg-white focus:shadow-sm"
                            placeholder="İlginç Bilgiler"
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSaveSection}
                        disabled={saving}
                        className="btn btn-primary px-8 py-4 rounded-2xl flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                        AYARLARI KAYDET
                    </button>
                </div>
            </div>

            {/* Cards Section */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 min-h-[400px]">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                            <List size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight">Bilgi Kartları</h2>
                    </div>
                    <button
                        onClick={handleAddCard}
                        className="btn btn-secondary px-6 py-3 rounded-2xl flex items-center gap-2 border-2 border-primary/20 text-primary hover:bg-primary/5 transition-all shadow-lg shadow-primary/5"
                    >
                        <Plus size={20} />
                        YENİ KART EKLE
                    </button>
                </div>

                {section.cards && section.cards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {section.cards.map((card) => (
                            <div key={card.id} className="group p-6 bg-gray-50/50 border border-gray-100 rounded-3xl hover:bg-white hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 relative">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                                        <i className={card.icon}></i>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditCard(card)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 size={18} /></button>
                                        <button onClick={() => handleDeleteCard(card.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-800 mb-2">{card.title}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{card.summary}</p>
                                {!card.isActive && <div className="mt-3 text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-50 px-2 py-1 rounded-lg inline-block">Pasif</div>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                            <Info size={32} />
                        </div>
                        <p className="text-gray-500 font-medium">Henüz bir bilgi kartı eklenmemiş.</p>
                    </div>
                )}
            </div>

            {/* Modal for Add/Edit Card */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                                    {editingCard?.id ? 'Kartı Düzenle' : 'Yeni Kart Ekle'}
                                </h2>
                                <p className="text-sm text-gray-500 font-medium italic mt-0.5">Lütfen kart bilgilerini eksiksiz doldurun.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-gray-700 rounded-2xl transition-all shadow-sm">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scroll">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">İkon Seçin</label>
                                    <IconPicker
                                        selectedIcon={editingCard?.icon || ''}
                                        onSelect={(icon) => setEditingCard({ ...editingCard, icon })}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Kart Başlığı</label>
                                        <input
                                            type="text"
                                            value={editingCard?.title || ''}
                                            onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-primary font-medium transition-all"
                                            placeholder="Örn: Edirne Adı"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={editingCard?.isActive}
                                                onChange={(e) => setEditingCard({ ...editingCard, isActive: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                        </label>
                                        <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Görünür Olsun</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Özet (Kart üzerinde görünür)</label>
                                <textarea
                                    rows={2}
                                    value={editingCard?.summary || ''}
                                    onChange={(e) => setEditingCard({ ...editingCard, summary: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-primary font-medium transition-all resize-none"
                                    placeholder="Kısa bir özet girin..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-400 uppercase ml-1 italic">Bilgi (Devamını Oku modalında görünecek uzun metin)</label>
                                <textarea
                                    rows={5}
                                    value={editingCard?.content || ''}
                                    onChange={(e) => setEditingCard({ ...editingCard, content: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-primary font-medium transition-all resize-none shadow-inner"
                                    placeholder="Detaylı bilgiyi buraya girin..."
                                />
                            </div>
                        </div>

                        <div className="p-8 bg-gray-50 flex gap-4">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-4 bg-white border-2 border-gray-200 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
                            >
                                İPTAL
                            </button>
                            <button
                                onClick={handleSaveCard}
                                disabled={saving}
                                className="flex-[2] py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                                DEĞİŞİKLİKLERİ KAYDET
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WebAboutManager;
