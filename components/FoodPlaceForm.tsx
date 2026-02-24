import React, { useState } from 'react';
import { Save, X, Upload, CheckCircle, XCircle, UtensilsCrossed } from 'lucide-react';
import { FoodPlace } from '../types';

interface Props {
    data: Partial<FoodPlace>;
    onSave: (payload: any) => Promise<void>;
    onCancel: () => void;
    loading: boolean;
}

const FoodPlaceForm: React.FC<Props> = ({ data, onSave, onCancel, loading }) => {
    const [formData, setFormData] = useState<Partial<FoodPlace>>(data);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const [isEveryday, setIsEveryday] = useState(!!formData.hoursEveryday);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-primary/10">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <h2 className="text-xl font-bold text-gray-800">
                    {formData.id ? 'Yeme & İçme Mekanı Düzenle' : 'Yeni Yeme & İçme Mekanı'}
                </h2>
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={28} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mekan Adı</label>
                        <input required type="text" name="title" value={formData.title || ''} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug (Tasarım)</label>
                        <input readOnly type="text" name="slug" value={formData.slug || ''} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
                    </div>
                    <div className="col-span-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alt Başlık</label>
                        <input type="text" name="subtitle" value={formData.subtitle || ''} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-primary" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                        <input type="number" step="0.1" name="rating" value={formData.rating || ''} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rozet (Meşhur vb.)</label>
                        <input type="text" name="badge" value={formData.badge || ''} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                        <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-primary" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Konu Başlığı</label>
                    <input type="text" name="storyTitle" value={formData.storyTitle || ''} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-primary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ön Sayfa İçerik</label>
                    <textarea name="frontContent" rows={3} value={formData.frontContent || ''} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-primary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Arka Sayfa İçerik (Modal)</label>
                    <textarea name="backContent" rows={6} value={formData.backContent || ''} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-primary" />
                </div>

                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-700">Çalışma Saatleri</h3>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <span className="text-xs font-bold text-gray-500">HER GÜN AYNI</span>
                            <div
                                onClick={() => {
                                    const next = !isEveryday;
                                    setIsEveryday(next);
                                    if (!next) setFormData({ ...formData, hoursEveryday: '' });
                                }}
                                className={`w-10 h-5 rounded-full transition-colors relative ${isEveryday ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isEveryday ? 'left-6' : 'left-1'}`} />
                            </div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={`p-4 rounded-lg border ${isEveryday ? 'bg-white border-green-200 shadow-sm' : 'bg-gray-100 border-gray-200 opacity-50'}`}>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Her Gün İçin Ortak Saat</label>
                            <input
                                type="text"
                                name="hoursEveryday"
                                disabled={!isEveryday}
                                value={formData.hoursEveryday || ''}
                                onChange={handleChange}
                                placeholder="09:00 - 23:00"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-primary disabled:cursor-not-allowed"
                            />
                        </div>

                        <div className={`grid grid-cols-2 gap-3 transition-opacity ${isEveryday ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                            {[
                                { label: 'Pzt', key: 'hoursMon' }, { label: 'Sal', key: 'hoursTue' },
                                { label: 'Çar', key: 'hoursWed' }, { label: 'Per', key: 'hoursThu' },
                                { label: 'Cum', key: 'hoursFri' }, { label: 'Cmt', key: 'hoursSat' },
                                { label: 'Paz', key: 'hoursSun' },
                            ].map(day => (
                                <div key={day.key}>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">{day.label}</label>
                                    <input
                                        type="text"
                                        name={day.key}
                                        disabled={isEveryday}
                                        value={(formData as any)[day.key] || ''}
                                        onChange={handleChange}
                                        placeholder="09:00"
                                        className="w-full px-2 py-1.5 border border-gray-200 rounded bg-white text-xs"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <UtensilsCrossed size={18} className="text-orange-500" />
                            Mekan Menüsü
                        </h3>
                        <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">İLK 5 ÖĞE ÖNE ÇIKARILIR</span>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                            <div key={i} className={`flex flex-col md:flex-row gap-3 p-3 rounded-lg border ${i <= 5 ? 'bg-orange-50/30 border-orange-100' : 'bg-gray-50/50 border-gray-100'}`}>
                                <div className="flex items-center gap-2 w-8">
                                    <span className={`text-xs font-bold ${i <= 5 ? 'text-orange-500' : 'text-gray-400'}`}>{i}.</span>
                                </div>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input placeholder="Ürün Adı" name={`menuItem${i}`} value={(formData as any)[`menuItem${i}`] || ''} onChange={handleChange} className="px-3 py-2 border rounded bg-white text-sm focus:outline-primary" />
                                    <input placeholder="Açıklama / İçerik" name={`menuDesc${i}`} value={(formData as any)[`menuDesc${i}`] || ''} onChange={handleChange} className="px-3 py-2 border rounded bg-white text-sm focus:outline-primary" />
                                    <div className="flex items-center gap-2">
                                        <input placeholder="Fiyat" name={`menuPrice${i}`} value={(formData as any)[`menuPrice${i}`] || ''} onChange={handleChange} className="flex-1 px-3 py-2 border rounded bg-white text-sm focus:outline-primary font-bold" />
                                        <span className="text-gray-400 font-bold">₺</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">İmkanlar (Virgül ile ayırın)</label>
                    <input type="text" name="features" value={formData.features || ''} onChange={handleChange} placeholder="WiFi, Otopark, Bahçe..." className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-primary" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                    <textarea name="address" rows={2} value={formData.address || ''} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-primary" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Web Sitesi</label>
                    <input type="text" name="website" value={formData.website || ''} onChange={handleChange} placeholder="www.example.com" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-primary" />
                </div>

                <div className="p-4 bg-blue-50/30 rounded-xl border border-blue-100">
                    <h3 className="text-xs font-bold text-blue-800 mb-3 uppercase tracking-wider">Yedek Alanlar (Opsiyonel)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i}>
                                <label className="block text-[10px] text-blue-400 font-bold mb-1">{`FIELD ${i}`}</label>
                                <input type="text" name={`field${i}`} value={(formData as any)[`field${i}`] || ''} onChange={handleChange} className="w-full px-3 py-1.5 border border-blue-100 rounded bg-white text-xs" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" name="isActive" checked={formData.isActive} onChange={(e: any) => handleChange(e)} className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">Aktif Yayın</span>
                    </label>
                    <div className="flex-1"></div>
                    <button type="button" onClick={onCancel} className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">İptal</button>
                    <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-10 py-2.5 rounded-lg transition-all font-bold shadow-lg shadow-orange-900/20 disabled:opacity-50">
                        <Save size={20} /> {loading ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FoodPlaceForm;
