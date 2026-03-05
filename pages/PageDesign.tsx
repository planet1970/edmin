import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Upload, Save, GripVertical, Layers, Filter, ArrowRight, ArrowLeft, Megaphone, Star, Check, User, Users, Shield, UserPlus, Info } from 'lucide-react';
import { API_BASE_URL, getImageUrl, api } from '../services/api';
import { Category, SubCategory, Place, PageLink, FoodPlace } from '../types';
import { placesService } from '../services/places';
import { pageLinksService } from '../services/pageLinks';
import { categoriesService } from '../services/categories';
import { subcategoriesService } from '../services/subcategories';
import { foodPlacesService } from '../services/foodPlaces';
import { pageAuthoritiesService, PageAuthority } from '../services/pageAuthorities';
import { webHomeService } from '../services/web-home';
import IconPicker from '../components/IconPicker';
import FoodPlaceForm from '../components/FoodPlaceForm';
import SearchableSelect from '../components/SearchableSelect';
import { toast } from 'react-hot-toast';

const initialState: Place = {
    id: '',
    title: '',
    slug: '',
    pic_url: '',
    back_pic_url: '',
    icon1: '',
    title1: '',
    info1: '',
    icon2: '',
    title2: '',
    info2: '',
    icon3: '',
    title3: '',
    info3: '',
    icon4: '',
    title4: '',
    info4: '',
    description: '',
    rating: 0,
    panel1_title: '',
    panel1: '',
    panel2_title: '',
    panel2: '',
    panel_col_title: '',
    panel_col: '',
    panel3_title: '',
    panel3: '',
    panel4_title: '',
    panel4: '',
    panel_col_title2: '',
    panel_col2: '',
    panel5_title: '',
    area1: '',
    area2: '',
    area3: '',
    area4: '',
    area5: '',
    area6: '',
    area7: '',
    area8: '',
    area9: '',
    area10: '',
    source: '',
    isActive: true,
    createdAt: '',
    updatedAt: '',
};

const PageDesign: React.FC = () => {
    // --- SELECTION STATE ---
    const [categories, setCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>('');

    // --- CONTENT STATE ---
    const [places, setPlaces] = useState<Place[]>([]);
    const [foodPlaces, setFoodPlaces] = useState<FoodPlace[]>([]);
    const [pageLinks, setPageLinks] = useState<PageLink[]>([]);

    // --- ADS STATUS STATE ---
    const [adsStatus, setAdsStatus] = useState<{
        stories: Set<string>;
        featured: Set<string>;
        popular: Set<string>;
    }>({
        stories: new Set(),
        featured: new Set(),
        popular: new Set()
    });

    // --- AUTHORITIES STATE ---
    const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
    const [currentAuthItem, setCurrentAuthItem] = useState<{ id: number, type: 'PLACE' | 'FOOD_PLACE', title: string } | null>(null);
    const [authorities, setAuthorities] = useState<PageAuthority[]>([]);
    const [allCustomers, setAllCustomers] = useState<any[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | number | null>(null);

    // Form Management
    const [activeFormType, setActiveFormType] = useState<'PLACE' | 'FOOD_PLACE'>('PLACE');
    const [placeFormData, setPlaceFormData] = useState<Place>(initialState);
    const [foodFormData, setFoodFormData] = useState<Partial<FoodPlace> | null>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedBackFile, setSelectedBackFile] = useState<File | null>(null);
    const [selectedFoodFile, setSelectedFoodFile] = useState<File | null>(null);
    const [selectedFoodBackFile, setSelectedFoodBackFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | string[] | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isSlugModalVisible, setIsSlugModalVisible] = useState(false);
    const [orderDirty, setOrderDirty] = useState(false);

    // --- INITIAL LOAD ---
    useEffect(() => {
        categoriesService.list().then(setCategories).catch(console.error);
        pageLinksService.list().then(setPageLinks).catch(console.error);
        pageAuthoritiesService.getCustomers().then(setAllCustomers).catch(console.error);
    }, []);

    // --- LOAD ADS STATUS ---
    const loadAdsStatus = async () => {
        try {
            const [stories, featured, popular] = await Promise.all([
                webHomeService.getStories(),
                webHomeService.getFeatured(),
                webHomeService.getPopular()
            ]);

            setAdsStatus({
                stories: new Set(stories.map(s => `${s.sourceType}-${s.sourceId}`)),
                featured: new Set(featured.map(f => `${f.sourceType}-${f.sourceId}`)),
                popular: new Set(popular.map(p => `${p.sourceType}-${p.sourceId}`))
            });
        } catch (error) {
            console.error('Reklam durumları yüklenemedi:', error);
        }
    };

    // --- LOAD SUBCATEGORIES ---
    useEffect(() => {
        if (selectedCategoryId) {
            subcategoriesService.list(selectedCategoryId).then(setSubCategories).catch(console.error);
            setSelectedSubCategoryId('');
            setPlaces([]);
            setFoodPlaces([]);
        } else {
            setSubCategories([]);
        }
    }, [selectedCategoryId]);

    // --- LOAD CONTENT ---
    const loadContent = async () => {
        if (!selectedSubCategoryId) return;
        setLoading(true);
        setError(null);
        try {
            const subId = parseInt(selectedSubCategoryId, 10);
            const [pRes, fRes] = await Promise.all([
                placesService.list(selectedSubCategoryId),
                foodPlacesService.list(subId),
                loadAdsStatus()
            ]);
            setPlaces(pRes);
            setFoodPlaces(fRes);
        } catch (err: any) {
            setError(err?.message || 'İçerikler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedSubCategoryId) {
            loadContent();
            setIsFormVisible(false);
        } else {
            setPlaces([]);
            setFoodPlaces([]);
        }
    }, [selectedSubCategoryId]);

    // --- HANDLERS ---
    const handleAddNew = () => {
        setIsSlugModalVisible(true);
    };

    const handleSelectSlug = (link: PageLink) => {
        setIsSlugModalVisible(false);
        if (link.targetTable === 'FOOD_PLACE') {
            setActiveFormType('FOOD_PLACE');
            setFoodFormData({ slug: link.slug, isActive: true, subCategoryId: parseInt(selectedSubCategoryId) });
        } else {
            setActiveFormType('PLACE');
            setPlaceFormData({ ...initialState, slug: link.slug });
        }
        setIsFormVisible(true);
    };

    const handleEditPlace = (place: Place) => {
        setActiveFormType('PLACE');
        setPlaceFormData(place);
        setIsFormVisible(true);
    };

    const handleEditFood = (food: FoodPlace) => {
        setActiveFormType('FOOD_PLACE');
        setFoodFormData(food);
        setIsFormVisible(true);
    };

    const handleSavePlace = async () => {
        if (!selectedSubCategoryId) return;
        setLoading(true);
        setError(null);
        try {
            const payload: any = {
                ...placeFormData,
                categoryId: parseInt(selectedCategoryId, 10),
                subCategoryId: parseInt(selectedSubCategoryId, 10)
            };
            delete payload.id;
            delete payload.createdAt;
            delete payload.updatedAt;
            delete payload.createdBy;
            delete payload.updatedBy;
            delete payload.createdById;
            delete payload.updatedById;

            if (placeFormData.id) {
                await placesService.update(String(placeFormData.id), payload, selectedFile || undefined, selectedBackFile || undefined);
            } else {
                await placesService.create(payload, selectedFile || undefined, selectedBackFile || undefined);
            }

            setPlaceFormData(initialState);
            setSelectedFile(null);
            setSelectedBackFile(null);
            setIsFormVisible(false);
            loadContent();
        } catch (err: any) {
            console.error(err);
            const errorMessage = err?.response?.data?.message;
            setError(Array.isArray(errorMessage) ? errorMessage : errorMessage || err?.message || 'Kaydedilemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveFood = async (payload: any) => {
        setLoading(true);
        try {
            // Prisma'ya gönderilmemesi gereken alanları temizle
            const { id, createdAt, updatedAt, subCategory, ...cleanPayload } = payload;

            const finalPayload = {
                ...cleanPayload,
                subCategoryId: parseInt(selectedSubCategoryId, 10)
            };

            if (id) {
                await foodPlacesService.update(id, finalPayload, selectedFoodFile || undefined, selectedFoodBackFile || undefined);
            } else {
                await foodPlacesService.create(finalPayload, selectedFoodFile || undefined, selectedFoodBackFile || undefined);
            }
            setIsFormVisible(false);
            setFoodFormData(null);
            setSelectedFoodFile(null);
            setSelectedFoodBackFile(null);
            loadContent();
        } catch (err: any) {
            setError(err?.message || 'Yeme içme mekanı kaydedilemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePlace = async (id: string) => {
        if (!window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
        setLoading(true);
        try {
            await placesService.remove(id);
            loadContent();
        } catch (err: any) {
            setError(err?.message || 'Silinemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFood = async (id: number) => {
        if (!window.confirm('Bu yeme içme mekanını silmek istediğinize emin misiniz?')) return;
        setLoading(true);
        try {
            await foodPlacesService.remove(id);
            loadContent();
        } catch (err: any) {
            setError(err?.message || 'Silinemedi');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean, type: 'PLACE' | 'FOOD_PLACE') => {
        try {
            if (type === 'PLACE') {
                await placesService.update(id, { isActive: !currentStatus });
            } else {
                await foodPlacesService.update(parseInt(id), { isActive: !currentStatus });
            }
            loadContent();
        } catch (err: any) {
            setError(err?.message || 'Durum güncellenemedi');
        }
    };

    const handleAddToAds = async (item: any, type: 'story' | 'featured' | 'popular', sourceType: 'PLACE' | 'FOOD_PLACE') => {
        if (!item.id) {
            toast.error('Öğe kimliği bulunamadı, ekleme yapılamaz.');
            return;
        }
        try {
            setLoading(true);
            const endpoint = `/web-home/ads/${type}`;
            const detailLink = sourceType === 'PLACE'
                ? `/detail/place/${item.id}`
                : `/detail/food_place/${item.id}`;

            const finalCatId = String(item.categoryId || selectedCategoryId || '');
            const finalSubCatId = String(item.subCategoryId || selectedSubCategoryId || '');

            const mainCat = categories.find(c => String(c.id) === finalCatId);
            const subCat = subCategories.find(s => String(s.id) === finalSubCatId);

            const mainCatTitle = mainCat?.title || '';
            const subCatTitle = subCat?.title || '';

            toast.success(`${item.title}: ${mainCatTitle} -> ${subCatTitle} olarak işaretleniyor`);

            const payload = type === 'popular' ? {
                title: item.title,
                description: item.description || (item as any).frontContent || '',
                imageUrl: sourceType === 'PLACE' ? item.pic_url : (item.imageUrl || ''),
                rating: item.rating || 0,
                visitCount: 0,
                link: detailLink,
                badge: sourceType === 'PLACE' ? (item.icon1 || '') : (item.badge || ''),
                hours: sourceType === 'PLACE' ? (item.info1 || '') : (item.hoursEveryday || ''),
                location: sourceType === 'PLACE' ? (item.area1 || 'Merkez') : (item.address || 'Şehir Geneli'),
                icon1: sourceType === 'PLACE' ? (item.icon1 || '') : (item.badge || ''),
                info1: sourceType === 'PLACE' ? (item.info1 || '') : (item.hoursEveryday || ''),
                icon2: sourceType === 'PLACE' ? (item.icon2 || '') : (item.field1 || ''),
                info2: sourceType === 'PLACE' ? (item.info2 || '') : (item.hoursMon || ''),
                mainCategory: mainCatTitle,
                category: subCatTitle,
                sourceType,
                sourceId: Number(item.id)
            } : type === 'story' ? {
                title: item.title,
                imageUrl: sourceType === 'PLACE' ? item.pic_url : item.imageUrl,
                link: detailLink,
                isNew: true,
                sourceType,
                sourceId: Number(item.id)
            } : {
                title: item.title,
                mainCategory: mainCatTitle,
                category: subCatTitle,
                imageUrl: sourceType === 'PLACE' ? item.pic_url : item.imageUrl,
                description: item.description || '',
                rating: item.rating || 0,
                link: detailLink,
                sourceType,
                sourceId: Number(item.id)
            };

            await api.post(endpoint, payload);
            const typeLabel = { 'story': 'Hikayelere', 'featured': 'Öne Çıkanlara', 'popular': 'Popüler Mekanlara' }[type];
            toast.success(`${typeLabel} başarıyla eklendi!`);
            await loadAdsStatus(); // Reload ads statuses
        } catch (err: any) {
            const errorLabel = type === 'popular' ? 'Mekan eklenirken' : 'Reklam eklenirken';
            toast.error(`${errorLabel} hata oluştu: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAuthModal = async (item: any, type: 'PLACE' | 'FOOD_PLACE') => {
        setCurrentAuthItem({ id: Number(item.id), type, title: item.title });
        setIsAuthModalVisible(true);
        setSelectedCustomerId(null);
        try {
            const data = await pageAuthoritiesService.getAuthorities(type, Number(item.id));
            setAuthorities(data);
        } catch (error) {
            console.error('Yetkililer yüklenemedi:', error);
            toast.error('Yetkililer yüklenemedi');
        }
    };

    const handleAddAuthority = async () => {
        if (!currentAuthItem || !selectedCustomerId) {
            toast.error('Lütfen bir müşteri seçin');
            return;
        }

        try {
            await pageAuthoritiesService.addAuthority(currentAuthItem.type, currentAuthItem.id, Number(selectedCustomerId));
            toast.success('Yetkili başarıyla atandı');

            // Reload authorities
            const data = await pageAuthoritiesService.getAuthorities(currentAuthItem.type, currentAuthItem.id);
            setAuthorities(data);
            setSelectedCustomerId(null);
        } catch (error: any) {
            console.error('Yetkili atanamadı:', error);
            toast.error(error.response?.data?.message || 'Yetkili atanamadı');
        }
    };

    const handleRemoveAuthority = async (id: number) => {
        if (!window.confirm('Bu yetkiyi kaldırmak istediğinize emin misiniz?')) return;

        try {
            await pageAuthoritiesService.removeAuthority(id);
            toast.success('Yetki kaldırıldı');
            if (currentAuthItem) {
                const data = await pageAuthoritiesService.getAuthorities(currentAuthItem.type, currentAuthItem.id);
                setAuthorities(data);
            }
        } catch (error) {
            console.error('Yetki kaldırılamadı:', error);
            toast.error('Yetki kaldırılamadı');
        }
    };

    const handlePlaceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setPlaceFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const imageUrlToDisplay = useMemo(() => {
        if (selectedFile) return URL.createObjectURL(selectedFile);
        return getImageUrl(placeFormData.pic_url);
    }, [selectedFile, placeFormData.pic_url]);

    const backImageUrlToDisplay = useMemo(() => {
        if (selectedBackFile) return URL.createObjectURL(selectedBackFile);
        return getImageUrl(placeFormData.back_pic_url);
    }, [selectedBackFile, placeFormData.back_pic_url]);

    // --- RENDER HELPERS ---
    const renderCardGroups = () => {
        const cards = [];
        for (let i = 1; i <= 4; i++) {
            cards.push(
                <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200 col-span-full">
                    <h3 className="text-sm font-bold text-gray-800 mb-4">{`Kart ${i}`}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                            <input type="text" name={`title${i}`} value={(placeFormData[`title${i}` as keyof Place] as string) || ''} onChange={handlePlaceChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-primary bg-white" />
                        </div>
                        <div className="md:col-span-2">
                            <IconPicker label="İkon" selectedIcon={(placeFormData[`icon${i}` as keyof Place] as string) || ''} onSelect={(name) => setPlaceFormData(p => ({ ...p, [`icon${i}`]: name }))} />
                        </div>
                        <div className="col-span-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bilgi</label>
                            <textarea name={`info${i}`} value={(placeFormData[`info${i}` as keyof Place] as string) || ''} onChange={handlePlaceChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-primary bg-white" />
                        </div>
                    </div>
                </div>
            );
        }
        return cards;
    };

    const renderPanelGroups = () => {
        const panels = [];
        for (let i = 1; i <= 5; i++) {
            // Standard Panels (1-4)
            if (i < 5) {
                panels.push(
                    <div key={`panel-${i}`} className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 col-span-full shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-blue-800">{`Panel ${i}`}</h3>
                            <span className="text-[10px] font-bold text-blue-400 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">STANDART PANEL</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                                <input type="text" name={`panel${i}_title`} value={(placeFormData[`panel${i}_title` as keyof Place] as string) || ''} onChange={handlePlaceChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-primary bg-white transition-all focus:shadow-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">İçerik</label>
                                <textarea name={`panel${i}`} value={(placeFormData[`panel${i}` as keyof Place] as string) || ''} onChange={handlePlaceChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-primary bg-white transition-all focus:shadow-md h-24" />
                            </div>
                        </div>
                    </div>
                );

                // Insert Renkli Panel 1 after Panel 2
                if (i === 2) {
                    panels.push(
                        <div key="panel-col-1" className="p-4 bg-orange-50 rounded-lg border border-orange-200 col-span-full shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-orange-800">Renkli Panel 1</h3>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-100 text-orange-700 rounded border border-orange-200 text-[10px] font-bold">
                                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                                    ÖNE ÇIKAN ALAN
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vurgulu Başlık</label>
                                    <input type="text" name="panel_col_title" value={placeFormData.panel_col_title || ''} onChange={handlePlaceChange} className="w-full px-4 py-2.5 border border-orange-200 rounded-lg focus:ring-orange-500 focus:border-orange-500 bg-white" placeholder="Örn: Tarihi Dokusu" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vurgulu İçerik</label>
                                    <textarea name="panel_col" value={placeFormData.panel_col || ''} onChange={handlePlaceChange} className="w-full px-4 py-2.5 border border-orange-200 rounded-lg focus:ring-orange-500 focus:border-orange-500 bg-white h-24" placeholder="Renkli alanda görünecek açıklama..." />
                                </div>
                            </div>
                        </div>
                    );
                }

                // Insert Renkli Panel 2 after Panel 4
                if (i === 4) {
                    panels.push(
                        <div key="panel-col-2" className="p-4 bg-purple-50 rounded-lg border border-purple-200 col-span-full shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-purple-800">Renkli Panel 2</h3>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-purple-100 text-purple-700 rounded border border-purple-200 text-[10px] font-bold">
                                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                                    ÖNE ÇIKAN ALAN
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vurgulu Başlık 2</label>
                                    <input type="text" name="panel_col_title2" value={placeFormData.panel_col_title2 || ''} onChange={handlePlaceChange} className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:ring-purple-500 focus:border-purple-500 bg-white" placeholder="Örn: Mimari Detaylar" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vurgulu İçerik 2</label>
                                    <textarea name="panel_col2" value={placeFormData.panel_col2 || ''} onChange={handlePlaceChange} className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:ring-purple-500 focus:border-purple-500 bg-white h-24" placeholder="Renkli alanda görünecek açıklama..." />
                                </div>
                            </div>
                        </div>
                    );
                }
            } else if (i === 5) {
                // Panel 5 (Areas)
                panels.push(
                    <div key={`panel-${i}`} className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 col-span-full shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-blue-800">{`Panel ${i} (Liste Görünümü)`}</h3>
                            <span className="text-[10px] font-bold text-blue-400 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">ÖZELLİK LİSTESİ</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Liste Başlığı</label>
                                <input type="text" name={`panel${i}_title`} value={(placeFormData[`panel${i}_title` as keyof Place] as string) || ''} onChange={handlePlaceChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-primary bg-white" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                    <div key={n}>
                                        <label className="block text-[10px] font-bold text-gray-400 mb-0.5 uppercase">{`Alan ${n}`}</label>
                                        <input type="text" name={`area${n}`} value={(placeFormData[`area${n}` as keyof Place] as string) || ''} onChange={handlePlaceChange} className="w-full px-2 py-1.5 border border-gray-100 rounded focus:border-blue-300 focus:ring-0 text-xs bg-white" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            }
        }
        return panels;
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Sayfa Tanım ve İçerik</h1>
                    <p className="text-sm text-gray-500">Kategori ve alt kategori bazlı içerik yönetimi.</p>
                </div>
            </div>

            {/* SELECTION BAR */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">1. Kategori Seçin</label>
                    <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-primary bg-white text-gray-700 shadow-sm"
                    >
                        <option value="">Kategori Seçiniz...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">2. Alt Kategori Seçin</label>
                    <select
                        value={selectedSubCategoryId}
                        onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                        disabled={!selectedCategoryId}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-primary bg-white text-gray-700 shadow-sm disabled:bg-gray-50 disabled:text-gray-400"
                    >
                        <option value="">Alt Kategori Seçiniz...</option>
                        {subCategories.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                </div>
            </div>

            {selectedSubCategoryId ? (
                <div className="animate-fadeIn">
                    {isFormVisible ? (
                        activeFormType === 'FOOD_PLACE' ? (
                            <div className="space-y-6">
                                <div className="bg-white p-8 rounded-xl shadow-lg border border-primary/10">
                                    <h3 className="font-bold text-gray-800 mb-6 border-b pb-4">Görsel Yükleme</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-gray-700">Ana Sayfa Görsel</label>
                                            {(selectedFoodFile || foodFormData?.imageUrl) && (
                                                <img
                                                    src={selectedFoodFile ? URL.createObjectURL(selectedFoodFile) : getImageUrl(foodFormData?.imageUrl)}
                                                    className="w-full h-48 object-cover rounded-xl border"
                                                />
                                            )}
                                            <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all text-gray-500">
                                                <Upload size={20} /> <span>{selectedFoodFile ? selectedFoodFile.name : 'Görsel Seç'}</span>
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setSelectedFoodFile(e.target.files[0])} />
                                            </label>
                                            <p className="text-[10px] text-gray-400 mt-1">Önerilen: 800x600px</p>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-gray-700">Devamını Oku Görsel</label>
                                            {(selectedFoodBackFile || foodFormData?.backImageUrl) && (
                                                <img
                                                    src={selectedFoodBackFile ? URL.createObjectURL(selectedFoodBackFile) : getImageUrl(foodFormData?.backImageUrl)}
                                                    className="w-full h-48 object-cover rounded-xl border"
                                                />
                                            )}
                                            <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all text-gray-500">
                                                <Upload size={20} /> <span>{selectedFoodBackFile ? selectedFoodBackFile.name : 'Görsel Seç'}</span>
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setSelectedFoodBackFile(e.target.files[0])} />
                                            </label>
                                            <p className="text-[10px] text-gray-400 mt-1">Önerilen: 800x600px</p>
                                        </div>
                                    </div>

                                    <FoodPlaceForm
                                        data={foodFormData || {}}
                                        onSave={handleSaveFood}
                                        onCancel={() => { setIsFormVisible(false); setSelectedFoodFile(null); setSelectedFoodBackFile(null); }}
                                        loading={loading}
                                    />
                                </div>
                            </div>
                        ) : (
                            /* DEFAULT FORM VIEW (Place) */
                            <div className="bg-white p-8 rounded-xl shadow-lg border border-primary/10">
                                <div className="flex justify-between items-center mb-8 border-b pb-4">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {placeFormData.id ? 'İçeriği Düzenle' : 'Yeni İçerik Ekle'}
                                    </h2>
                                    <button onClick={() => setIsFormVisible(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                        <XCircle size={28} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                                            <input type="text" name="title" value={placeFormData.title} onChange={handlePlaceChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-primary" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (Sayfa Bağlantısı)</label>
                                            <input readOnly type="text" value={placeFormData.slug} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
                                        </div>
                                    </div>

                                    <div className="col-span-full">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ön Sayfa Başlık</label>
                                        <input type="text" name="source" value={placeFormData.source || ''} onChange={handlePlaceChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-primary" />
                                    </div>

                                    <div className="col-span-full">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                                        <textarea name="description" value={placeFormData.description} onChange={handlePlaceChange} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-primary" />
                                    </div>

                                    <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-8 py-4 border-y border-gray-50 my-4">
                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-gray-700">Ana Sayfa Görsel</label>
                                            {imageUrlToDisplay && <img src={imageUrlToDisplay} alt="" className="w-full h-48 object-cover rounded-xl border border-gray-100 shadow-sm" />}
                                            <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all text-gray-500">
                                                <Upload size={20} /> <span>{selectedFile ? selectedFile.name : 'Görsel Seç'}</span>
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])} />
                                            </label>
                                            <p className="text-[10px] text-gray-400 mt-1">Önerilen: 800x600px</p>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-gray-700">Arka Sayfa Görsel</label>
                                            {backImageUrlToDisplay && <img src={backImageUrlToDisplay} alt="" className="w-full h-48 object-cover rounded-xl border border-gray-100 shadow-sm" />}
                                            <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all text-gray-500">
                                                <Upload size={20} /> <span>{selectedBackFile ? selectedBackFile.name : 'Görsel Seç'}</span>
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setSelectedBackFile(e.target.files[0])} />
                                            </label>
                                            <p className="text-[10px] text-gray-400 mt-1">Önerilen: 800x600px</p>
                                        </div>
                                    </div>

                                    {renderCardGroups()}
                                    <div className="col-span-full h-px bg-gray-100 my-4"></div>
                                    {renderPanelGroups()}

                                    <div className="col-span-full flex items-center gap-3 pt-6 border-t border-gray-100">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" name="isActive" checked={placeFormData.isActive} onChange={handlePlaceChange} className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" />
                                            <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">Aktif Yayın</span>
                                        </label>
                                        <div className="flex-1"></div>
                                        <button onClick={() => setIsFormVisible(false)} className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">İptal</button>
                                        <button onClick={handleSavePlace} disabled={loading} className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-10 py-2.5 rounded-lg transition-all font-bold shadow-lg shadow-orange-900/20 disabled:opacity-50">
                                            <Save size={20} /> {loading ? 'Kaydediliyor...' : 'Kaydet'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    ) : (
                        /* LIST VIEW */
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Layers className="text-primary" size={20} />
                                    Mevcut İçerikler
                                    <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-xs font-mono">{places.length + foodPlaces.length}</span>
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button onClick={handleAddNew} className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-all font-medium shadow-md">
                                        <Plus size={18} /> Yeni Ekle
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 w-10"></th>
                                            <th className="px-6 py-4">İçerik Başlığı</th>
                                            <th className="px-6 py-4">Tasarım / Slug</th>
                                            <th className="px-6 py-4">Durum</th>
                                            <th className="px-6 py-4 text-right">İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {loading ? (
                                            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">Yükleniyor...</td></tr>
                                        ) : (places.length === 0 && foodPlaces.length === 0) ? (
                                            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">Henüz içerik eklenmemiş.</td></tr>
                                        ) : (
                                            <>
                                                {/* STANDART PLACES */}
                                                {places.map((place) => (
                                                    <tr key={`p-${place.id}`} className="hover:bg-gray-50/80 transition-colors group">
                                                        <td className="px-6 py-4 text-gray-300"><GripVertical size={18} /></td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                {place.pic_url && <img src={getImageUrl(place.pic_url)} alt="" className="w-10 h-10 object-cover rounded-lg border border-gray-100" />}
                                                                <span className="font-bold text-gray-800">{place.title}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{place.slug}</td>
                                                        <td className="px-6 py-4">
                                                            <button onClick={() => toggleStatus(place.id, place.isActive, 'PLACE')} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${place.isActive ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200'}`}>
                                                                {place.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                                {place.isActive ? 'AKTİF' : 'PASİF'}
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button title="Hikayelere Ekle" onClick={() => handleAddToAds(place, 'story', 'PLACE')} className={`p-2 rounded-lg transition-colors ${adsStatus.stories.has(`PLACE-${place.id}`) ? 'text-orange-600 bg-orange-100' : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'}`}><Megaphone size={18} /></button>
                                                                <button title="Öne Çıkanlara Ekle" onClick={() => handleAddToAds(place, 'featured', 'PLACE')} className={`p-2 rounded-lg transition-colors ${adsStatus.featured.has(`PLACE-${place.id}`) ? 'text-yellow-600 bg-yellow-100' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'}`}><Star size={18} /></button>
                                                                <button title="Popüler Mekanlara Ekle" onClick={() => handleAddToAds(place, 'popular', 'PLACE')} className={`p-2 rounded-lg transition-colors ${adsStatus.popular.has(`PLACE-${place.id}`) ? 'text-purple-600 bg-purple-100' : 'text-gray-400 hover:text-purple-500 hover:bg-purple-50'}`}><Layers size={18} /></button>
                                                                <div className="w-px h-8 bg-gray-100 mx-1"></div>
                                                                <button title="Sayfa Yetkilileri" onClick={() => handleOpenAuthModal(place, 'PLACE')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><User size={18} /></button>
                                                                <button title="Düzenle" onClick={() => handleEditPlace(place)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={18} /></button>
                                                                <button title="Sil" onClick={() => handleDeletePlace(place.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {/* FOOD PLACES */}
                                                {foodPlaces.map((food) => (
                                                    <tr key={`f-${food.id}`} className="hover:bg-gray-50/80 transition-colors group">
                                                        <td className="px-6 py-4 text-gray-300"><GripVertical size={18} /></td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                {food.imageUrl && <img src={getImageUrl(food.imageUrl)} alt="" className="w-10 h-10 object-cover rounded-lg border border-gray-100" />}
                                                                <div>
                                                                    <span className="font-bold text-gray-800">{food.title}</span>
                                                                    <div className="text-[10px] text-orange-600 font-bold">YEME & İÇME</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{food.slug}</td>
                                                        <td className="px-6 py-4">
                                                            <button onClick={() => toggleStatus(food.id.toString(), food.isActive, 'FOOD_PLACE')} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${food.isActive ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200'}`}>
                                                                {food.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                                {food.isActive ? 'AKTİF' : 'PASİF'}
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button title="Hikayelere Ekle" onClick={() => handleAddToAds(food, 'story', 'FOOD_PLACE')} className={`p-2 rounded-lg transition-colors ${adsStatus.stories.has(`FOOD_PLACE-${food.id}`) ? 'text-orange-600 bg-orange-100' : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'}`}><Megaphone size={18} /></button>
                                                                <button title="Öne Çıkanlara Ekle" onClick={() => handleAddToAds(food, 'featured', 'FOOD_PLACE')} className={`p-2 rounded-lg transition-colors ${adsStatus.featured.has(`FOOD_PLACE-${food.id}`) ? 'text-yellow-600 bg-yellow-100' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'}`}><Star size={18} /></button>
                                                                <button title="Popüler Mekanlara Ekle" onClick={() => handleAddToAds(food, 'popular', 'FOOD_PLACE')} className={`p-2 rounded-lg transition-colors ${adsStatus.popular.has(`FOOD_PLACE-${food.id}`) ? 'text-purple-600 bg-purple-100' : 'text-gray-400 hover:text-purple-500 hover:bg-purple-50'}`}><Layers size={18} /></button>
                                                                <div className="w-px h-8 bg-gray-100 mx-1"></div>
                                                                <button title="Sayfa Yetkilileri" onClick={() => handleOpenAuthModal(food, 'FOOD_PLACE')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><User size={18} /></button>
                                                                <button title="Düzenle" onClick={() => handleEditFood(food)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={18} /></button>
                                                                <button title="Sil" onClick={() => handleDeleteFood(food.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* AUTHORITY MODAL */}
                    {isAuthModalVisible && currentAuthItem && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-xl shadow-lg w-full max-w-xl p-6">
                                <div className="flex justify-between items-center mb-6 border-b pb-4">
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <Shield className="text-primary" /> Sayfa Yetkilileri
                                    </h3>
                                    <button onClick={() => setIsAuthModalVisible(false)}><XCircle size={24} className="text-gray-400 hover:text-gray-600" /></button>
                                </div>

                                <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    <div className="text-sm font-medium text-blue-800 flex items-center gap-2 mb-1">
                                        <Info size={16} /> Seçili Mekan
                                    </div>
                                    <div className="text-sm text-blue-600 font-bold ml-6">
                                        {currentAuthItem.title} <span className="text-[10px] font-normal opacity-70 ml-2 border border-blue-200 px-1.5 py-0.5 rounded-md">{currentAuthItem.type}</span>
                                    </div>
                                </div>

                                <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4 shadow-sm">
                                    <h4 className="font-bold text-gray-700 text-sm border-b border-gray-200 pb-2">Yetkilendirilmiş Kullanıcılar</h4>
                                    {authorities.length === 0 ? (
                                        <div className="text-center py-4 text-gray-400 text-sm">Bu sayfa için henüz bir yetkili atanmamış.</div>
                                    ) : (
                                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                            {authorities.map(auth => (
                                                <div key={auth.id} className="flex justify-between items-center bg-white p-3 rounded border border-gray-200 shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold relative overflow-hidden">
                                                            {auth.user.imageUrl ? <img src={auth.user.imageUrl} className="w-full h-full object-cover" /> : auth.user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-xs text-gray-800">{auth.user.name || 'İsimsiz'}</div>
                                                            <div className="text-[10px] text-gray-500">{auth.user.email}</div>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleRemoveAuthority(auth.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Yetkiyi Kaldır">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-700 text-sm mb-3">Yeni Yetkili Ekle</h4>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <SearchableSelect
                                                options={allCustomers.map(c => ({ id: c.id, label: c.name || 'İsimsiz', subLabel: c.email }))}
                                                value={selectedCustomerId}
                                                onChange={(id) => setSelectedCustomerId(id)}
                                                placeholder="Müşteri (Customer) seçin..."
                                            />
                                        </div>
                                        <button
                                            onClick={handleAddAuthority}
                                            disabled={!selectedCustomerId}
                                            className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <UserPlus size={18} /> Ekle
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2">Sadece CUSTOMER rolüne sahip kullanıcılar listelenmektedir.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SLUG SELECTION MODAL */}
                    {isSlugModalVisible && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
                                <div className="flex justify-between items-center mb-4 border-b pb-4">
                                    <h3 className="text-xl font-bold text-gray-800">Sayfa Tasarımı Seçin</h3>
                                    <button onClick={() => setIsSlugModalVisible(false)}><XCircle size={24} className="text-gray-400 hover:text-gray-600" /></button>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">Ekleyeceğiniz mekanın sayfa yapısını seçin. Her tasarım farklı veri alanları sunar.</p>
                                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                                    {pageLinks.map(link => (
                                        <button
                                            key={link.id}
                                            onClick={() => handleSelectSlug(link)}
                                            className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="font-bold text-gray-800 group-hover:text-primary">{link.title}</div>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${link.targetTable === 'FOOD_PLACE' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {link.targetTable || 'PLACE'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-400 font-mono mt-1">{link.slug}</div>
                                            {link.description && <div className="text-sm text-gray-600 mt-2 line-clamp-2">{link.description}</div>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-20 text-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Filter size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-600 mb-2">İçerik Yönetimi İçin Seçim Yapın</h3>
                    <p className="text-gray-400 max-w-sm mx-auto">Lütfen yukarıdaki menüden yönetmek istediğiniz kategori ve alt kategoriyi seçin.</p>
                </div>
            )}
        </div>
    );
};

export default PageDesign;
