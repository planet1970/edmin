import React, { useState, useEffect, useRef } from 'react';
import {
    Layout, Image as ImageIcon, Plus, Trash2, Save,
    Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Globe,
    AlertCircle, Upload, CheckCircle, Loader, ImagePlus
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import { HeroSlide } from '../types';
import { webHomeService, WebHeroSlide, WebSocialInfo, WebNavbar } from '../services/web-home';
import { API_BASE_URL } from '../services/api';

// Extended HeroSlide with optional file for upload
interface ExtendedHeroSlide extends WebHeroSlide {
    file?: File;
    previewUrl?: string;
    isNew?: boolean;
}


const WebHomeScreenManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'hero' | 'social' | 'navbar'>('hero');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

    // --- HERO SLIDER STATE ---
    const [heroSlides, setHeroSlides] = useState<ExtendedHeroSlide[]>([]);
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

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
    const logoInputRef = useRef<HTMLInputElement>(null);

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
            } catch (error) {
                console.error("Failed to load data", error);
                alert("Veriler yüklenirken bir hata oluştu.");
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

    const handleFileChange = (id: string, file: File) => {
        const url = URL.createObjectURL(file);
        setHeroSlides(prev => prev.map(item => item.id === id ? { ...item, file, previewUrl: url } : item));
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

    const getImageUrl = (slide: ExtendedHeroSlide) => {
        if (slide.previewUrl) return slide.previewUrl;
        if (slide.imageUrl) {
            if (slide.imageUrl.startsWith('http')) return slide.imageUrl;
            return `${API_BASE_URL}${slide.imageUrl}`;
        }
        return null;
    }

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
                                <div
                                    className="w-48 h-28 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative group border border-gray-200 cursor-pointer"
                                    onClick={() => fileInputRefs.current[slide.id]?.click()}
                                >
                                    {getImageUrl(slide) ? (
                                        <img src={getImageUrl(slide)!} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                            <ImageIcon size={32} />
                                            <span className="text-[10px]">Görsel Seç</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white font-medium text-xs">
                                        <Upload size={16} className="mr-1" /> Değiştir
                                    </div>
                                    <input
                                        type="file"
                                        ref={el => fileInputRefs.current[slide.id] = el}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) handleFileChange(slide.id, e.target.files[0]);
                                        }}
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
                                                <span>Görsel Yolu (Manuel veya Yükle)</span>
                                                {slide.file && <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1 rounded">Yeni dosya seçildi</span>}
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={slide.imageUrl || ''}
                                                    onChange={(e) => updateHero(slide.id, 'imageUrl', e.target.value)}
                                                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded text-xs text-gray-500 font-mono placeholder-gray-400 focus:outline-primary bg-gray-50/30"
                                                    placeholder="/uploads/hero/..."
                                                    disabled={!!slide.file}
                                                />
                                                <button
                                                    onClick={() => fileInputRefs.current[slide.id]?.click()}
                                                    className="px-3 py-1.5 bg-gray-800 text-white rounded text-xs font-bold hover:bg-gray-900 transition-colors flex items-center gap-1 shrink-0"
                                                >
                                                    <ImagePlus size={14} /> Görsel Seç
                                                </button>
                                            </div>
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
                                <label className="block text-sm font-bold text-gray-700 mb-2">Site Logosu</label>
                                <div
                                    className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative group cursor-pointer overflow-hidden transition-all hover:border-primary/50 hover:bg-primary/5"
                                    onClick={() => logoInputRef.current?.click()}
                                >
                                    {(navbarLogoPreview || navbarInfo.logoUrl) ? (
                                        <img
                                            src={navbarLogoPreview || (navbarInfo.logoUrl?.startsWith('http') ? navbarInfo.logoUrl : `${API_BASE_URL}${navbarInfo.logoUrl}`)}
                                            className="max-w-[80%] max-h-[80%] object-contain"
                                            alt="Logo Preview"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            <ImageIcon size={48} strokeWidth={1.5} />
                                            <span className="text-xs font-medium">Logo Yükle</span>
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <div className="bg-white p-2 rounded-full text-gray-800 shadow-lg">
                                            <Upload size={20} />
                                        </div>
                                    </div>

                                    <input
                                        type="file"
                                        ref={logoInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => e.target.files?.[0] && handleLogoChange(e.target.files[0])}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 text-center italic">Önerilen: Şeffaf (PNG) veya Vektörel (SVG) logo.</p>
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
                                                    src={navbarLogoPreview || (navbarInfo.logoUrl?.startsWith('http') ? navbarInfo.logoUrl : `${API_BASE_URL}${navbarInfo.logoUrl}`)}
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
