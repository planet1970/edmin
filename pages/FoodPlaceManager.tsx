import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Star } from 'lucide-react';
import { foodPlacesService, FoodPlacePayload } from '../services/foodPlaces';
import { FoodPlace } from '../types';

interface Props {
    subCategoryId?: number;
}

const FoodPlaceManager: React.FC<Props> = ({ subCategoryId }) => {
    const [places, setPlaces] = useState<FoodPlace[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Partial<FoodPlacePayload>>({
        title: '',
        subCategoryId: subCategoryId || 1 // Default
    });

    useEffect(() => {
        loadPlaces();
    }, [subCategoryId]);

    const loadPlaces = async () => {
        try {
            const data = await foodPlacesService.list();
            // Filter if subCategoryId provided
            const filtered = subCategoryId ? data.filter(p => p.subCategoryId === subCategoryId) : data;
            setPlaces(filtered);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSave = async () => {
        try {
            if (editingId) {
                await foodPlacesService.update(editingId, formData);
            } else {
                await foodPlacesService.create(formData as FoodPlacePayload);
            }
            setModalVisible(false);
            setEditingId(null);
            setFormData({ title: '', subCategoryId: 1 });
            loadPlaces();
        } catch (e) {
            console.error(e);
            alert('Kaydetme hatası');
        }
    };

    const openEdit = (place: FoodPlace) => {
        setEditingId(place.id);
        setFormData(place);
        setModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Silmek istediğinize emin misiniz?')) {
            await foodPlacesService.remove(id);
            loadPlaces();
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Yeme & İçme Mekanları</h1>
                    <p className="text-sm text-gray-500">Mekan listesi ve detayları.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ title: '', subCategoryId: 1 });
                        setModalVisible(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={18} /> Yeni Ekle
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {places.map(place => (
                    <div key={place.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-800 text-lg">{place.title}</h3>
                                {place.badge && (
                                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded">
                                        {place.badge}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mb-2">{place.subtitle}</p>
                            <div className="flex items-center gap-1 text-sm text-yellow-600 mb-4">
                                <Star size={14} className="fill-yellow-500" />
                                <span>{place.rating}</span>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 border-t pt-3 border-gray-100">
                            <button onClick={() => openEdit(place)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                                <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDelete(place.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {modalVisible && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingId ? 'Mekanı Düzenle' : 'Yeni Mekan Ekle'}
                            </h2>
                            <button onClick={() => setModalVisible(false)} className="text-gray-500 hover:bg-gray-100 p-1 rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-indigo-500"
                                        value={formData.title || ''}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Alt Başlık</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-indigo-500"
                                        value={formData.subtitle || ''}
                                        onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Resim URL</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-indigo-500"
                                        value={formData.imageUrl || ''}
                                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Arka Resim URL</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-indigo-500"
                                        value={formData.backImageUrl || ''}
                                        onChange={e => setFormData({ ...formData, backImageUrl: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                    <input
                                        type="number" step="0.1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-indigo-500"
                                        value={formData.rating || ''}
                                        onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rozet</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-indigo-500"
                                        value={formData.badge || ''}
                                        onChange={e => setFormData({ ...formData, badge: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-indigo-500"
                                        value={formData.phone || ''}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hikaye</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-indigo-500 h-24"
                                    value={formData.frontContent || ''}
                                    onChange={e => setFormData({ ...formData, frontContent: e.target.value })}
                                />
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-bold text-gray-700 mb-3">Menü Öğeleri (Örnek)</h3>
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                                        <input
                                            placeholder={`Menü ${i} Adı`}
                                            className="px-2 py-1 border rounded text-sm"
                                            value={(formData as any)[`menuItem${i}`] || ''}
                                            onChange={e => setFormData({ ...formData, [`menuItem${i}`]: e.target.value })}
                                        />
                                        <input
                                            placeholder="Açıklama"
                                            className="px-2 py-1 border rounded text-sm"
                                            value={(formData as any)[`menuDesc${i}`] || ''}
                                            onChange={e => setFormData({ ...formData, [`menuDesc${i}`]: e.target.value })}
                                        />
                                        <input
                                            placeholder="Fiyat"
                                            className="px-2 py-1 border rounded text-sm"
                                            value={(formData as any)[`menuPrice${i}`] || ''}
                                            onChange={e => setFormData({ ...formData, [`menuPrice${i}`]: e.target.value })}
                                        />
                                    </div>
                                ))}
                                <p className="text-xs text-gray-500">* Sadece ilk 3 gösteriliyor, veritabanında 10 adete kadar desteklenir.</p>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    onClick={() => setModalVisible(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                                >
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

export default FoodPlaceManager;
