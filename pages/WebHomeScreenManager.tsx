import React, { useState, useEffect, useRef } from 'react';
import {
    Layout, Image as ImageIcon, Plus, Trash2, Save,
    Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Globe,
    AlertCircle, Upload, CheckCircle, Loader, ImagePlus, Newspaper,
    Eye, EyeOff, MessageSquare, Calendar, ChevronRight, Link2
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import { HeroSlide } from '../types';
import { webHomeService, WebHeroSlide, WebSocialInfo, WebNavbar } from '../services/web-home';
import { API_BASE_URL, getImageUrl as getServiceImageUrl } from '../services/api';

import ImageUploadField from '../components/ImageUploadField';

// Extended HeroSlide with optional file for upload
interface ExtendedHeroSlide extends WebHeroSlide {
    file?: File;
    previewUrl?: string;
    isNew?: boolean;
}


const WebHomeScreenManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'hero' | 'social' | 'navbar' | 'news'>('hero');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

    // --- HERO SLIDER STATE ---
    const [heroSlides, setHeroSlides] = useState<ExtendedHeroSlide[]>([]);

    // --- SOCIAL BAR STATE ---
    const [socialInfo, setSocialInfo] = useState<WebSocialInfo>({
        id: 0,
        phone: '',
        email: '',
        address: '',
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
    });

    // --- NAVBAR STATE ---
    const [navbarInfo, setNavbarInfo] = useState<WebNavbar>({
        id: 0,
        title: '',
        titleColor: '#333333',
        fontFamily: 'Inter',
        fontSize: 24,
        logoUrl: '',
        bgColor: '#1A1A2E',
        iconColor: '#FFB627'
    });
    const [navbarLogoFile, setNavbarLogoFile] = useState<File | null>(null);
    const [navbarLogoPreview, setNavbarLogoPreview] = useState<string | null>(null);

    // --- NEWS STATE ---
    const [newsSettings, setNewsSettings] = useState<{ isNewsActive: boolean }>({ isNewsActive: true });
    const [newsItems, setNewsItems] = useState<any[]>([]);
    const [showAddNews, setShowAddNews] = useState(false);
    const [newNews, setNewNews] = useState({ title: '', source: '', link: '', contentSnippet: '' });

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Load Hero
                const slides = await webHomeService.findAllHero();
                setHeroSlides(slides.map(s => ({ ...s, isNew: false })));

                // Load Social
                const social = await webHomeService.getSocialInfo();
                if (social) setSocialInfo(social);

                // Load Navbar
                const navbar = await webHomeService.getNavbar();
                if (navbar && Object.keys(navbar).length > 0) {
                    setNavbarInfo(prev => ({ ...prev, ...navbar }));
                }

                // Load News
                const nSettings = await webHomeService.getNewsSettings();
                setNewsSettings(nSettings || { isNewsActive: true });
                const nItems = await webHomeService.getAllNewsItems();
                setNewsItems(Array.isArray(nItems) ? nItems : []);
            } catch (error) {
                console.error("Failed to load data", error);
                // alert("Veriler yüklenirken bir hata oluştu."); // Removed alert to prevent interruption if some parts load fine
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // --- HERO HANDLERS ---
    const addHero = () => setHeroSlides([...heroSlides, {
        id: `new-${Date.now()}`,
        title: '',
        subtitle: '',
        description: '',
        imageUrl: '',
        titleColor: '#FFB627',
        subtitleColor: '#FFFFFF',
        descriptionColor: '#FFFFFF',
        titleShadowColor: 'rgba(0,0,0,0.9)',
        order: heroSlides.length + 1,
        createdAt: new Date().toISOString(),
        isNew: true
    }]);

    const updateHero = (id: string, field: keyof ExtendedHeroSlide, value: any) => {
        setHeroSlides(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleFileChange = (id: string, file: File | null) => {
        if (file) {
            const url = URL.createObjectURL(file);
            setHeroSlides(prev => prev.map(item => item.id === id ? { ...item, file, previewUrl: url } : item));
        } else {
            setHeroSlides(prev => prev.map(item => item.id === id ? { ...item, file: undefined, previewUrl: undefined } : item));
        }
    };

    const handleDeleteHero = (id: string) => {
        setConfirmDelete({ isOpen: true, id });
    };

    const confirmDeleteAction = async () => {
        if (!confirmDelete.id) return;

        try {
            const id = confirmDelete.id;
            // If it's not new, delete from backend
            const slide = heroSlides.find(s => s.id === id);
            if (slide && !slide.isNew) {
                await webHomeService.removeHero(id);
            }
            setHeroSlides(prev => prev.filter(i => i.id !== id));
            setToastMessage('Slayt başarıyla silindi.');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error(error);
            setToastMessage('Silme işlemi başarısız oldu.');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } finally {
            setConfirmDelete({ isOpen: false, id: null });
        }
    };

    const handleSaveHero = async () => {
        setSaving(true);
        try {
            for (const slide of heroSlides) {
                const formData = new FormData();
                if (slide.title) formData.append('title', slide.title);
                if (slide.subtitle) formData.append('subtitle', slide.subtitle);
                if (slide.description) formData.append('description', slide.description);
                if (slide.order) formData.append('order', slide.order.toString());
                if (slide.titleColor) formData.append('titleColor', slide.titleColor);
                if (slide.subtitleColor) formData.append('subtitleColor', slide.subtitleColor);
                if (slide.descriptionColor) formData.append('descriptionColor', slide.descriptionColor);
                if (slide.titleShadowColor) formData.append('titleShadowColor', slide.titleShadowColor);
                if (slide.file) formData.append('file', slide.file);
                // Currently backend doesn't support generic imageUrl update if not file, but let's send it anyway
                if (slide.imageUrl && !slide.file) formData.append('imageUrl', slide.imageUrl);

                if (slide.isNew) {
                    const created = await webHomeService.createHero(formData);
                    // Update local state with real ID
                    setHeroSlides(prev => prev.map(s => s.id === slide.id ? { ...created, isNew: false } : s));
                } else {
                    const updated = await webHomeService.updateHero(slide.id, formData);
                    setHeroSlides(prev => prev.map(s => s.id === slide.id ? { ...updated, file: undefined, previewUrl: undefined } : s));
                }
            }
            setToastMessage('Hero slider değişiklikleri başarıyla kaydedildi!');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error("Save failed", error);
            setToastMessage('Kaydetme sırasında bir hata oluştu.');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } finally {
            setSaving(false);
        }
    };

    // --- SOCIAL HANDLERS ---
    const updateSocial = (field: keyof WebSocialInfo, value: string) => {
        setSocialInfo(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveSocial = async () => {
        setSaving(true);
        try {
            await webHomeService.updateSocialInfo(socialInfo);
            setToastMessage('Sosyal medya ve iletişim bilgileri başarıyla kaydedildi!');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error("Save social failed", error);
            setToastMessage('Kaydetme başarısız oldu.');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } finally {
            setSaving(false);
        }
    };

    // --- NAVBAR HANDLERS ---
    const updateNavbar = (field: keyof WebNavbar, value: any) => {
        setNavbarInfo(prev => ({ ...prev, [field]: value }));
    };

    const handleLogoChange = (file: File) => {
        setNavbarLogoFile(file);
        setNavbarLogoPreview(URL.createObjectURL(file));
    };

    const handleSaveNavbar = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('title', navbarInfo.title || '');
            formData.append('titleColor', navbarInfo.titleColor || '#333333');
            formData.append('fontFamily', navbarInfo.fontFamily || 'Inter');
            formData.append('fontSize', (navbarInfo.fontSize || 24).toString());
            formData.append('bgColor', navbarInfo.bgColor || '#1A1A2E');
            formData.append('iconColor', navbarInfo.iconColor || '#FFB627');

            if (navbarLogoFile) {
                formData.append('file', navbarLogoFile);
            } else if (navbarInfo.logoUrl) {
                formData.append('logoUrl', navbarInfo.logoUrl);
            }

            const updated = await webHomeService.updateNavbar(formData);
            setNavbarInfo(updated);
            setNavbarLogoFile(null);
            setNavbarLogoPreview(null);

            setToastMessage('Navbar ayarları başarıyla kaydedildi!');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error("Save navbar failed", error);
            setToastMessage('Kaydetme başarısız oldu.');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } finally {
            setSaving(false);
        }
    };

    // --- NEWS HANDLERS ---
    const handleToggleNewsGlobal = async (isActive: boolean) => {
        setSaving(true);
        try {
            await webHomeService.updateNewsSettings(isActive);
            setNewsSettings({ isNewsActive: isActive });
            setToastMessage(`Haber bandı ${isActive ? 'aktif' : 'pasif'} yapıldı.`);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error(error);
            setToastMessage('İşlem başarısız.');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleNewsItem = async (id: number, isActive: boolean) => {
        try {
            await webHomeService.toggleNewsItem(id, isActive);
            setNewsItems(prev => prev.map(item => item.id === id ? { ...item, isActive } : item));
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteNewsItem = async (id: number) => {
        if (!window.confirm('Bu haberi silmek istediğinizden emin misiniz?')) return;
        try {
            await webHomeService.deleteNewsItem(id);
            setNewsItems(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateManualNews = async () => {
        if (!newNews.title || !newNews.link) return alert('Başlık ve Link zorunludur.');
        setSaving(true);
        try {
            const created = await webHomeService.createManualNews(newNews);
            setNewsItems([created, ...newsItems]);
            setShowAddNews(false);
            setNewNews({ title: '', source: '', link: '', contentSnippet: '' });
            setToastMessage('Haber başarıyla eklendi.');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error(error);
            setToastMessage('Haber eklenemedi.');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } finally {
            setSaving(false);
        }
    };



    if (loading && heroSlides.length === 0) {
        return <div className="p-10 flex justify-center"><Loader className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Ana Ekran (Web) Yönetimi</h1>
                    <p className="text-sm text-gray-500">Web sitesi ana sayfa içeriklerini buradan yönetin.</p>
                </div>
                {saving && <div className="flex items-center gap-2 text-primary font-medium"><Loader size={16} className="animate-spin" /> Kaydediliyor...</div>}
            </div>

            <div className="space-y-6">
                {/* TABS */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl max-w-xl">
                    <button
                        onClick={() => setActiveTab('hero')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'hero'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                    >
                        <Layout size={16} />
                        Hero Slider
                    </button>
                    <button
                        onClick={() => setActiveTab('social')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'social'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                    >
                        <Globe size={16} />
                        Sosyal Bar & İletişim
                    </button>
                    <button
                        onClick={() => setActiveTab('navbar')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'navbar'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                    >
                        <Layout size={16} />
                        Navbar Ayarları
                    </button>
                    <button
                        onClick={() => setActiveTab('news')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'news'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                    >
                        <Newspaper size={16} />
                        Haberler
                    </button>
                </div>

                {/* === HERO TAB === */}
                {activeTab === 'hero' && (
                    <div className="space-y-4 max-w-5xl">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-gray-700">Web Slider Görselleri</h3>
                            <div className="flex gap-2">
                                <button onClick={handleSaveHero} disabled={saving} className="text-sm bg-green-600 text-white font-medium hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50">
                                    <Save size={16} /> Kaydet
                                </button>
                                <button onClick={addHero} disabled={saving} className="text-sm text-primary font-medium hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50">
                                    <Plus size={16} /> Yeni Ekle
                                </button>
                            </div>
                        </div>

                        {heroSlides.map((slide) => (
                            <div key={slide.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4 items-start">
                                <div className="w-56 flex-shrink-0">
                                    <ImageUploadField
                                        label="Slayt Görseli"
                                        value={slide.imageUrl ? getServiceImageUrl(slide.imageUrl) : undefined}
                                        previewUrl={slide.previewUrl}
                                        onFileSelect={(file) => handleFileChange(slide.id, file)}
                                        recommendedSize="1920x600px"
                                    />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Başlık</label>
                                            <input
                                                type="text"
                                                value={slide.title || ''}
                                                onChange={(e) => updateHero(slide.id, 'title', e.target.value)}
                                                className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm font-bold text-gray-800 placeholder-gray-400 focus:outline-primary"
                                                placeholder="Başlık"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Alt Başlık</label>
                                            <input
                                                type="text"
                                                value={slide.subtitle || ''}
                                                onChange={(e) => updateHero(slide.id, 'subtitle', e.target.value)}
                                                className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-primary"
                                                placeholder="Alt Başlık"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Açıklama</label>
                                        <textarea
                                            rows={2}
                                            value={slide.description || ''}
                                            onChange={(e) => updateHero(slide.id, 'description', e.target.value)}
                                            className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-primary resize-none"
                                            placeholder="Detaylı açıklama..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-medium text-gray-400 mb-1 flex justify-between items-center">
                                                <span>Görsel Yolu (Farklı Kaynak ise)</span>
                                                {slide.file && <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1 rounded">Yeni dosya yüklenecek</span>}
                                            </label>
                                            <input
                                                type="text"
                                                value={slide.imageUrl || ''}
                                                onChange={(e) => updateHero(slide.id, 'imageUrl', e.target.value)}
                                                className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs text-gray-500 font-mono placeholder-gray-400 focus:outline-primary bg-gray-50/30"
                                                placeholder="/uploads/hero/..."
                                                disabled={!!slide.file}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1 text-center">Sıra</label>
                                            <input
                                                type="number"
                                                value={slide.order}
                                                onChange={(e) => updateHero(slide.id, 'order', parseInt(e.target.value))}
                                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm text-center focus:outline-primary font-bold"
                                            />
                                        </div>
                                    </div>

                                    {/* COLOR PICKERS */}
                                    <div className="pt-2 border-t border-gray-50 grid grid-cols-4 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Başlık</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={slide.titleColor || '#FFB627'}
                                                    onChange={(e) => updateHero(slide.id, 'titleColor', e.target.value)}
                                                    className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                                                />
                                                <span className="text-[10px] font-mono text-gray-400 uppercase">{slide.titleColor || '#FFB627'}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Alt Başlık</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={slide.subtitleColor || '#FFFFFF'}
                                                    onChange={(e) => updateHero(slide.id, 'subtitleColor', e.target.value)}
                                                    className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                                                />
                                                <span className="text-[10px] font-mono text-gray-400 uppercase">{slide.subtitleColor || '#FFFFFF'}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Açıklama</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={slide.descriptionColor || '#FFFFFF'}
                                                    onChange={(e) => updateHero(slide.id, 'descriptionColor', e.target.value)}
                                                    className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                                                />
                                                <span className="text-[10px] font-mono text-gray-400 uppercase">{slide.descriptionColor || '#FFFFFF'}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Gölge</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={slide.titleShadowColor && slide.titleShadowColor.startsWith('#') ? slide.titleShadowColor : '#000000'}
                                                    onChange={(e) => updateHero(slide.id, 'titleShadowColor', e.target.value)}
                                                    className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                                                />
                                                <span className="text-[10px] font-mono text-gray-400 uppercase truncate max-w-[50px]">{slide.titleShadowColor || 'rgba(0,0,0,0.9)'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteHero(slide.id)} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* === SOCIAL TAB === */}
                {activeTab === 'social' && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-3xl">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800">İletişim & Sosyal Medya</h3>
                            <button onClick={handleSaveSocial} disabled={saving} className="text-sm bg-primary text-white font-medium hover:bg-orange-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                                <Save size={16} /> Değişiklikleri Kaydet
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Contact Info */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Phone size={14} /> İletişim Bilgileri
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Telefon Numarası</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                            <input
                                                value={socialInfo.phone || ''}
                                                onChange={(e) => updateSocial('phone', e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-primary"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">E-Posta Adresi</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                            <input
                                                value={socialInfo.email || ''}
                                                onChange={(e) => updateSocial('email', e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-primary"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Adres</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                            <input
                                                value={socialInfo.address || ''}
                                                onChange={(e) => updateSocial('address', e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-primary"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 my-2"></div>

                            {/* Social Media */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Globe size={14} /> Sosyal Medya Linkleri
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Facebook</label>
                                        <div className="relative">
                                            <Facebook className="absolute left-3 top-2.5 text-blue-600" size={16} />
                                            <input
                                                value={socialInfo.facebook || ''}
                                                onChange={(e) => updateSocial('facebook', e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-primary placeholder-gray-300"
                                                placeholder="https://facebook.com/..."
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Instagram</label>
                                        <div className="relative">
                                            <Instagram className="absolute left-3 top-2.5 text-pink-600" size={16} />
                                            <input
                                                value={socialInfo.instagram || ''}
                                                onChange={(e) => updateSocial('instagram', e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-primary placeholder-gray-300"
                                                placeholder="https://instagram.com/..."
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Twitter / X</label>
                                        <div className="relative">
                                            <Twitter className="absolute left-3 top-2.5 text-blue-400" size={16} />
                                            <input
                                                value={socialInfo.twitter || ''}
                                                onChange={(e) => updateSocial('twitter', e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-primary placeholder-gray-300"
                                                placeholder="https://twitter.com/..."
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Youtube</label>
                                        <div className="relative">
                                            <Youtube className="absolute left-3 top-2.5 text-red-600" size={16} />
                                            <input
                                                value={socialInfo.youtube || ''}
                                                onChange={(e) => updateSocial('youtube', e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-primary placeholder-gray-300"
                                                placeholder="https://youtube.com/..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* === NAVBAR TAB === */}
                {activeTab === 'navbar' && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-4xl">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800">Navbar (Logo & Başlık) Ayarları</h3>
                            <button onClick={handleSaveNavbar} disabled={saving} className="text-sm bg-primary text-white font-medium hover:bg-orange-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                                <Save size={16} /> Değişiklikleri Kaydet
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Logo Upload Section */}
                            <div className="space-y-4">
                                <ImageUploadField
                                    label="Site Logosu"
                                    value={navbarInfo.logoUrl ? getServiceImageUrl(navbarInfo.logoUrl) : undefined}
                                    previewUrl={navbarLogoPreview || undefined}
                                    onFileSelect={(file) => {
                                        setNavbarLogoFile(file);
                                        setNavbarLogoPreview(file ? URL.createObjectURL(file) : null);
                                    }}
                                    recommendedSize="300x100px"
                                />
                            </div>

                            {/* Title & Style Section */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Site Başlığı</label>
                                        <input
                                            type="text"
                                            value={navbarInfo.title || ''}
                                            onChange={(e) => updateNavbar('title', e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-primary font-medium text-lg"
                                            placeholder="Örn: Edirne Rehberi"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Yazı Tipi (Font)</label>
                                            <select
                                                value={navbarInfo.fontFamily || 'Inter'}
                                                onChange={(e) => updateNavbar('fontFamily', e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-primary appearance-none cursor-pointer"
                                            >
                                                <option value="Inter">Inter</option>
                                                <option value="Poppins">Poppins</option>
                                                <option value="Roboto">Roboto</option>
                                                <option value="Montserrat">Montserrat</option>
                                                <option value="Outfit">Outfit</option>
                                                <option value="Playfair Display">Playfair Display (Serif)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Yazı Boyutu (px)</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="range"
                                                    min="16"
                                                    max="48"
                                                    value={navbarInfo.fontSize || 24}
                                                    onChange={(e) => updateNavbar('fontSize', parseInt(e.target.value))}
                                                    className="flex-1 accent-primary"
                                                />
                                                <span className="w-12 text-center font-bold text-primary bg-primary/5 py-1 rounded-lg">{navbarInfo.fontSize}px</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Title Color */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-gray-700">Başlık Rengi</label>
                                            <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm focus-within:border-primary transition-all">
                                                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                                                    <input
                                                        type="color"
                                                        value={(navbarInfo.titleColor?.length === 7 && navbarInfo.titleColor.startsWith('#')) ? navbarInfo.titleColor : '#333333'}
                                                        onChange={(e) => updateNavbar('titleColor', e.target.value)}
                                                        className="absolute -top-2 -left-2 w-[150%] h-[150%] cursor-pointer border-none p-0 m-0"
                                                    />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={navbarInfo.titleColor || ''}
                                                    onChange={(e) => updateNavbar('titleColor', e.target.value)}
                                                    className="flex-1 font-mono text-sm tracking-wider text-gray-700 uppercase bg-transparent border-none focus:ring-0 p-0"
                                                    placeholder="#333333"
                                                    maxLength={7}
                                                />
                                            </div>
                                        </div>

                                        {/* Background Color */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-gray-700">Arka Plan Rengi</label>
                                            <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm focus-within:border-primary transition-all">
                                                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                                                    <input
                                                        type="color"
                                                        value={(navbarInfo.bgColor?.length === 7 && navbarInfo.bgColor.startsWith('#')) ? navbarInfo.bgColor : '#1A1A2E'}
                                                        onChange={(e) => updateNavbar('bgColor', e.target.value)}
                                                        className="absolute -top-2 -left-2 w-[150%] h-[150%] cursor-pointer border-none p-0 m-0"
                                                    />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={navbarInfo.bgColor || ''}
                                                    onChange={(e) => updateNavbar('bgColor', e.target.value)}
                                                    className="flex-1 font-mono text-sm tracking-wider text-gray-700 uppercase bg-transparent border-none focus:ring-0 p-0"
                                                    placeholder="#1A1A2E"
                                                    maxLength={7}
                                                />
                                            </div>
                                        </div>

                                        {/* Icon Color */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-gray-700">İkon Rengi</label>
                                            <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm focus-within:border-primary transition-all">
                                                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                                                    <input
                                                        type="color"
                                                        value={(navbarInfo.iconColor?.length === 7 && navbarInfo.iconColor.startsWith('#')) ? navbarInfo.iconColor : '#FFB627'}
                                                        onChange={(e) => updateNavbar('iconColor', e.target.value)}
                                                        className="absolute -top-2 -left-2 w-[150%] h-[150%] cursor-pointer border-none p-0 m-0"
                                                    />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={navbarInfo.iconColor || ''}
                                                    onChange={(e) => updateNavbar('iconColor', e.target.value)}
                                                    className="flex-1 font-mono text-sm tracking-wider text-gray-700 uppercase bg-transparent border-none focus:ring-0 p-0"
                                                    placeholder="#FFB627"
                                                    maxLength={7}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview Area */}
                                <div className="mt-8">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Canlı Önizleme</label>
                                    <div className="p-8 bg-gray-100 rounded-2xl flex flex-col gap-4 border border-gray-200 shadow-inner">
                                        {/* Social Bar Preview */}
                                        <div
                                            style={{ backgroundColor: navbarInfo.bgColor }}
                                            className="px-6 py-2 rounded-t-xl flex justify-between items-center text-[10px] text-white/80"
                                        >
                                            <div className="flex gap-4">
                                                <span className="flex items-center gap-1"><Phone size={10} style={{ color: navbarInfo.iconColor }} /> +90...</span>
                                                <span className="flex items-center gap-1"><Mail size={10} style={{ color: navbarInfo.iconColor }} /> info@...</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Facebook size={10} /> <Instagram size={10} />
                                            </div>
                                        </div>
                                        {/* Navbar Preview */}
                                        <div style={{ backgroundColor: navbarInfo.bgColor }} className="flex items-center gap-4 px-6 py-4 rounded-b-xl shadow-md">
                                            {(navbarLogoPreview || navbarInfo.logoUrl) && (
                                                <img
                                                    src={navbarLogoPreview || getServiceImageUrl(navbarInfo.logoUrl)}
                                                    className="h-8 w-auto object-contain"
                                                    alt="Logo"
                                                />
                                            )}
                                            <span
                                                style={{
                                                    color: navbarInfo.titleColor,
                                                    fontFamily: navbarInfo.fontFamily,
                                                    fontSize: `${navbarInfo.fontSize}px`,
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {navbarInfo.title || 'Site Başlığı'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* === NEWS TAB === */}
                {activeTab === 'news' && (
                    <div className="space-y-6 max-w-5xl">
                        {/* Settings Panel */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                    <Newspaper className="text-primary" /> Haber Bandı Yönetimi
                                </h3>
                                <p className="text-gray-500 text-sm mt-1">Ana sayfadaki kayan haber bandını buradan açıp kapatabilir veya haberleri yönetebilirsiniz.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${newsSettings?.isNewsActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {newsSettings?.isNewsActive ? 'AKTİF' : 'PASİF'}
                                </span>
                                <button
                                    onClick={() => handleToggleNewsGlobal(!newsSettings?.isNewsActive)}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${newsSettings?.isNewsActive ? 'bg-primary' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${newsSettings?.isNewsActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        {/* News List */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                    <AlertCircle size={18} className="text-primary" /> Son Haberler (Google & Manuel)
                                </h3>
                                <button
                                    onClick={async () => {
                                        setLoading(true);
                                        const nItems = await webHomeService.getAllNewsItems();
                                        setNewsItems(Array.isArray(nItems) ? nItems : []);
                                        setLoading(false);
                                    }}
                                    className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                                >
                                    {loading ? <Loader size={12} className="animate-spin" /> : <Plus size={12} className="rotate-45" />} Listeyi Yenile
                                </button>
                                <button
                                    onClick={() => setShowAddNews(true)}
                                    className="text-sm bg-primary text-white font-bold px-4 py-2 rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2"
                                >
                                    <Plus size={18} /> Manuel Haber Ekle
                                </button>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {(!newsItems || newsItems.length === 0) ? (
                                    <div className="p-10 text-center text-gray-400 italic">Henüz haber bulunmuyor.</div>
                                ) : (
                                    newsItems.map((item) => (
                                        <div key={item?.id} className={`p-5 flex items-center gap-4 hover:bg-gray-50/80 transition-colors ${!item?.isActive ? 'opacity-60 grayscale' : ''}`}>
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${item?.isManual ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                                                {item?.isManual ? <MessageSquare size={20} /> : <Globe size={20} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item?.source || 'Bilinmiyor'}</span>
                                                    <span className="text-[10px] text-gray-300">•</span>
                                                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                        <Calendar size={10} />
                                                        {item?.pubDate ? new Date(item.pubDate).toLocaleDateString('tr-TR') : '-'}
                                                    </span>
                                                    {item?.isManual && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold">MANUEL</span>}
                                                </div>
                                                <h4 className="font-bold text-gray-800 text-sm truncate">{item?.title}</h4>
                                                <p className="text-gray-500 text-xs truncate max-w-xl">{item?.contentSnippet?.replace(/<[^>]*>?/gm, '')}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleNewsItem(item.id, !item.isActive)}
                                                    className={`p-2 rounded-lg transition-colors ${item?.isActive ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'}`}
                                                    title={item?.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                                                >
                                                    {item?.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                                </button>
                                                <a
                                                    href={item?.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-primary bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                                                    title="Habere Git"
                                                >
                                                    <ChevronRight size={18} />
                                                </a>
                                                <button
                                                    onClick={() => handleDeleteNewsItem(item.id)}
                                                    className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                    title="Sil"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ADD NEWS MODAL */}
                {showAddNews && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddNews(false)}></div>
                        <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-6 bg-gray-50 border-b border-gray-100">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2"><Newspaper className="text-primary" /> Manuel Haber Ekle</h3>
                                <p className="text-gray-500 text-xs mt-1">Acil durumlar veya özel duyurular için sisteme haber girişi yapın.</p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Haber Başlığı</label>
                                    <input
                                        type="text"
                                        value={newNews.title}
                                        onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-primary text-sm font-bold"
                                        placeholder="Örn: Edirne'de Önemli Duyuru!"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Haber Kaynağı</label>
                                        <input
                                            type="text"
                                            value={newNews.source}
                                            onChange={(e) => setNewNews({ ...newNews, source: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-primary text-sm"
                                            placeholder="Örn: Belediye Duyurusu"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Yönlendirme Linki</label>
                                        <div className="relative">
                                            <Link2 className="absolute left-3 top-2.5 text-gray-400" size={14} />
                                            <input
                                                type="text"
                                                value={newNews.link}
                                                onChange={(e) => setNewNews({ ...newNews, link: e.target.value })}
                                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-primary text-xs font-mono"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Haber Detayı (HTML destekler)</label>
                                    <textarea
                                        rows={4}
                                        value={newNews.contentSnippet}
                                        onChange={(e) => setNewNews({ ...newNews, contentSnippet: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-primary text-sm resize-none"
                                        placeholder="Haber tıkladığında açılacak modal içeriği..."
                                    />
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowAddNews(false)}
                                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    onClick={handleCreateManualNews}
                                    disabled={saving}
                                    className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                                    Haberi Yayınla
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs text-gray-400">
                <CheckCircle size={14} className="text-green-500" />
                <span>Veriler veritabanı ile senkronize çalışmaktadır.</span>
            </div>

            {/* TOAST NOTIFICATION */}
            {showToast && (
                <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 z-[100] flex items-center gap-3 border ${toastMessage.includes('hata') || toastMessage.includes('başarısız') ? 'bg-red-500 text-white border-red-400' : 'bg-green-500 text-white border-green-400'}`}>
                    {toastMessage.includes('hata') || toastMessage.includes('başarısız') ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                    <span className="font-semibold">{toastMessage}</span>
                </div>
            )}

            {/* CONFIRM DELETE MODAL */}
            <ConfirmDialog
                isOpen={confirmDelete.isOpen}
                title="Slaytı Sil"
                message="Bu slaytı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
                onConfirm={confirmDeleteAction}
                onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
                confirmText="Evet, Sil"
                cancelText="Vazgeç"
                type="danger"
            />
        </div>
    );
};

export default WebHomeScreenManager;
