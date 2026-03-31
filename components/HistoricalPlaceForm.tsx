import React, { useState } from 'react';
import { Save, X, Info, Layout, Layers, Star, Image as ImageIcon } from 'lucide-react';
import { Place } from '../types';
import { getImageUrl } from '../services/api';
import ImageUploadField from './ImageUploadField';
import IconPicker from './IconPicker';

interface Props {
    data: Place;
    onSave: (payload: any, file?: File, backFile?: File) => Promise<void>;
    onCancel: () => void;
    loading: boolean;
}

const HistoricalPlaceForm: React.FC<Props> = ({ data, onSave, onCancel, loading }) => {
    const [formData, setFormData] = useState<Place>(data);
    const [file, setFile] = useState<File | null>(null);
    const [backFile, setBackFile] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, file || undefined, backFile || undefined);
    };

    const renderInfoCard = (index: number) => {
        const i = index;
        return (
            <div key={i} className="p-5 bg-orange-50/50 rounded-xl border border-orange-100 space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-orange-700 uppercase tracking-wider">Bilgi Kartı {i}</h4>
                    <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">DETAY</span>
                </div>
                <div className="space-y-3">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kart Başlığı</label>
                        <input 
                            type="text" 
                            name={`title${i}`} 
                            value={(formData[`title${i}` as keyof Place] as string) || ''} 
                            onChange={handleChange} 
                            placeholder="Örn: Yapım Yılı"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500/20" 
                        />
                    </div>
                    <div>
                        <IconPicker 
                            label="İkon Seçiniz" 
                            selectedIcon={(formData[`icon${i}` as keyof Place] as string) || ''} 
                            onSelect={(name) => setFormData(p => ({ ...p, [`icon${i}`]: name }))} 
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">İçerik Bilgisi</label>
                        <input 
                            type="text" 
                            name={`info${i}`} 
                            value={(formData[`info${i}` as keyof Place] as string) || ''} 
                            onChange={handleChange} 
                            placeholder="Örn: 1575"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500/20" 
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderPanel = (i: number) => {
        return (
            <div key={i} className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <h4 className="text-sm font-bold text-gray-800">Paragraf Bölümü {i}</h4>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-bold uppercase">Metin Bloğu</span>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Bölüm Başlığı</label>
                        <input 
                            type="text" 
                            name={`panel${i}_title`} 
                            value={(formData[`panel${i}_title` as keyof Place] as string) || ''} 
                            onChange={handleChange} 
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Bölüm İçeriği</label>
                        <textarea 
                            name={`panel${i}`} 
                            value={(formData[`panel${i}` as keyof Place] as string) || ''} 
                            onChange={handleChange} 
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 leading-relaxed text-gray-700" 
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
            {/* Header Settings */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                            <Layout size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Historical Place Design (Tarihi Mekan)</h2>
                            <p className="text-xs text-gray-500 italic">Historical Places tasarımı için özelleştirilmiş form.</p>
                        </div>
                    </div>
                    <button type="button" onClick={onCancel} className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Mekan Başlığı</label>
                            <input 
                                required 
                                type="text" 
                                name="title" 
                                value={formData.title} 
                                onChange={handleChange} 
                                className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all font-bold text-gray-800 text-lg" 
                                placeholder="Örn: Selimiye Camii"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Alt Etiket (Badge)</label>
                                <input 
                                    type="text" 
                                    name="source" 
                                    value={formData.source || ''} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-primary/20"
                                    placeholder="Örn: Mimar Sinan" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Puan (Rating)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        step="0.1" 
                                        name="rating" 
                                        value={formData.rating || ''} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-primary/20 font-bold" 
                                    />
                                    <Star className="absolute right-3 top-2.5 text-yellow-400" size={16} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Kısa Tanıtım (Hero Altı)</label>
                            <textarea 
                                name="description" 
                                value={formData.description || ''} 
                                onChange={handleChange} 
                                rows={3} 
                                className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all" 
                                placeholder="Mekan hakkında kısa bir giriş yazısı..."
                            />
                        </div>
                    </div>

                    {/* Image Uploads */}
                    <div className="grid grid-cols-1 gap-4">
                        <ImageUploadField
                            label="Ana Sayfa Kart Görseli"
                            value={formData.pic_url ? getImageUrl(formData.pic_url) : undefined}
                            previewUrl={file ? URL.createObjectURL(file) : undefined}
                            onFileSelect={setFile}
                            recommendedSize="800x600px"
                        />
                        <ImageUploadField
                            label="Detay Sayfası Hero (Geniş) Görsel"
                            value={formData.back_pic_url ? getImageUrl(formData.back_pic_url) : undefined}
                            previewUrl={backFile ? URL.createObjectURL(backFile) : undefined}
                            onFileSelect={setBackFile}
                            recommendedSize="1920x1080px"
                        />
                    </div>
                </div>
            </div>

            {/* Info Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => renderInfoCard(i))}
            </div>

            {/* Highlighted Panels Row (Colored) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Colored Panel 1 */}
                <div className="p-6 bg-orange-50 rounded-2xl border-2 border-orange-100 shadow-md">
                    <div className="flex items-center gap-2 mb-4 text-orange-800">
                        <Info size={20} />
                        <h3 className="font-bold">Vurgulu Bilgi Bloğu 1</h3>
                    </div>
                    <div className="space-y-4">
                        <input 
                            type="text" 
                            name="panel_col_title" 
                            value={formData.panel_col_title || ''} 
                            onChange={handleChange} 
                            placeholder="Vurgulu Başlık"
                            className="w-full px-4 py-2 border border-orange-200 rounded-lg bg-white" 
                        />
                        <textarea 
                            name="panel_col" 
                            value={formData.panel_col || ''} 
                            onChange={handleChange} 
                            rows={3}
                            placeholder="Vurgulu içerik yazısı..."
                            className="w-full px-4 py-2 border border-orange-200 rounded-lg bg-white" 
                        />
                    </div>
                </div>

                {/* Colored Panel 2 */}
                <div className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-100 shadow-md">
                    <div className="flex items-center gap-2 mb-4 text-blue-800">
                        <Layers size={20} />
                        <h3 className="font-bold">Vurgulu Bilgi Bloğu 2</h3>
                    </div>
                    <div className="space-y-4">
                        <input 
                            type="text" 
                            name="panel_col_title2" 
                            value={formData.panel_col_title2 || ''} 
                            onChange={handleChange} 
                            placeholder="Vurgulu Başlık"
                            className="w-full px-4 py-2 border border-blue-200 rounded-lg bg-white" 
                        />
                        <textarea 
                            name="panel_col2" 
                            value={formData.panel_col2 || ''} 
                            onChange={handleChange} 
                            rows={3}
                            placeholder="Vurgulu içerik yazısı..."
                            className="w-full px-4 py-2 border border-blue-200 rounded-lg bg-white" 
                        />
                    </div>
                </div>
            </div>

            {/* Standard Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => renderPanel(i))}
            </div>

            {/* Feature List (Panel 5) */}
            <div className="p-8 bg-gray-900 rounded-2xl shadow-xl text-white">
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                        <ImageIcon size={20} className="text-orange-400" />
                        <h3 className="text-lg font-bold">Özellikler Listesi & Alt Bölümler</h3>
                    </div>
                    <input 
                        type="text" 
                        name="panel5_title" 
                        value={formData.panel5_title || ''} 
                        onChange={handleChange} 
                        placeholder="Bölüm Başlığı"
                        className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:bg-white/20 outline-none" 
                    />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                        <div key={n} className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Madde {n}</label>
                            <input 
                                type="text" 
                                name={`area${n}`} 
                                value={(formData[`area${n}` as keyof Place] as string) || ''} 
                                onChange={handleChange} 
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-orange-500 outline-none transition-colors" 
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-3 pt-10 border-t border-gray-100 pb-20">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-6 h-6 text-primary rounded-lg border-gray-300 focus:ring-primary shadow-sm" />
                    <span className="text-sm font-bold text-gray-700 group-hover:text-primary transition-colors uppercase tracking-widest">AKTİF YAYIN</span>
                </label>
                <div className="flex-1"></div>
                <button type="button" onClick={onCancel} className="px-8 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all uppercase">İPTAL</button>
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-14 py-3 rounded-xl transition-all font-bold shadow-lg shadow-orange-900/40 disabled:opacity-50 text-lg uppercase tracking-widest">
                    <Save size={22} /> {loading ? 'YAYINLANIYOR...' : 'YAYINLA'}
                </button>
            </div>
        </form>
    );
};

export default HistoricalPlaceForm;
