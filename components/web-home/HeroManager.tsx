import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Save, Loader, Upload, Image as ImageIcon, 
  GripVertical, Palette, Type, AlignLeft, Eye, Edit2
} from 'lucide-react';
import { webHomeService, WebHeroSlide } from '../../services/web-home';
import { getImageUrl } from '../../services/api';
import { toast } from 'react-hot-toast';
import ImageUploadField from '../ImageUploadField';

interface ExtendedHeroSlide extends WebHeroSlide {
  file?: File;
  previewUrl?: string;
  isNew?: boolean;
}

export const HeroManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slides, setSlides] = useState<ExtendedHeroSlide[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await webHomeService.findAllHero();
        setSlides(data.map(s => ({ ...s, isNew: false })));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAdd = () => {
    setSlides([...slides, {
      id: `new-${Date.now()}`,
      title: '',
      subtitle: '',
      description: '',
      imageUrl: '',
      order: slides.length + 1,
      titleColor: '#FFFFFF',
      subtitleColor: '#FFFFFF',
      descriptionColor: '#FFFFFF',
      createdAt: new Date().toISOString(),
      isNew: true
    }]);
  };

  const handleUpdate = (id: string, field: keyof ExtendedHeroSlide, value: any) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu slaytı silmek istediğinize emin misiniz?')) return;
    try {
      const slide = slides.find(s => s.id === id);
      if (slide && !slide.isNew) {
        await webHomeService.removeHero(id);
      }
      setSlides(prev => prev.filter(s => s.id !== id));
      toast.success('Slayt silindi.');
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const slide of slides) {
        const formData = new FormData();
        if (slide.title) formData.append('title', slide.title);
        if (slide.subtitle) formData.append('subtitle', slide.subtitle);
        if (slide.description) formData.append('description', slide.description);
        if (slide.order) formData.append('order', slide.order.toString());
        if (slide.titleColor) formData.append('titleColor', slide.titleColor);
        if (slide.subtitleColor) formData.append('subtitleColor', slide.subtitleColor);
        if (slide.descriptionColor) formData.append('descriptionColor', slide.descriptionColor);
        
        if (slide.file) {
          formData.append('file', slide.file);
        }

        if (slide.isNew) {
          const created = await webHomeService.createHero(formData);
          setSlides(prev => prev.map(s => s.id === slide.id ? { ...created, isNew: false } : s));
        } else {
          const updated = await webHomeService.updateHero(slide.id, formData);
          setSlides(prev => prev.map(s => s.id === slide.id ? { ...updated, file: undefined, previewUrl: undefined } : s));
        }
      }
      toast.success('Tüm slaytlar başarıyla kaydedildi.');
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Hero Slider Yönetimi</h3>
          <p className="text-gray-500 mt-1">Ana sayfa üst kısmındaki büyük reklam ve tanıtım slaytlarını yönetin.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50 rounded-xl transition-all font-bold text-sm shadow-sm"
          >
            <Plus size={20} />
            Slayt Ekle
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-100 transition-all font-bold disabled:opacity-50"
          >
            {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
            Değişiklikleri Kaydet
          </button>
        </div>
      </div>

      <div className="space-y-12">
        {slides.sort((a, b) => (a.order || 0) - (b.order || 0)).map((slide, index) => (
          <div key={slide.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className="flex flex-col lg:flex-row">
              {/* Image Preview / Upload */}
              <div className="lg:w-1/3 bg-gray-900 relative min-h-[300px]">
                <div className="absolute inset-0">
                  {(slide.previewUrl || slide.imageUrl) && (
                    <img 
                      src={slide.previewUrl || getImageUrl(slide.imageUrl)} 
                      className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                      alt="Slide Preview"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <div className="w-full h-full border-2 border-dashed border-white/20 rounded-3xl flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm transition-colors hover:bg-black/30">
                    <ImageUploadField
                      label=""
                      value={slide.imageUrl ? getImageUrl(slide.imageUrl) : undefined}
                      previewUrl={slide.previewUrl}
                      onFileSelect={(file) => handleUpdate(slide.id, 'file', file)}
                      recommendedSize="1920x1080px"
                    />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 text-white">
                    <span className="bg-orange-500 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">SLAYT #{index + 1}</span>
                </div>
              </div>

              {/* Form Content */}
              <div className="lg:w-2/3 p-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Slayt Başlığı</label>
                        <div className="relative group/input">
                            <input
                            type="text"
                            value={slide.title || ''}
                            onChange={(e) => handleUpdate(slide.id, 'title', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none font-bold text-gray-900"
                            placeholder="Önemli Duyuru..."
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <input 
                                    type="color" 
                                    value={slide.titleColor || '#FFFFFF'} 
                                    onChange={(e) => handleUpdate(slide.id, 'titleColor', e.target.value)}
                                    className="w-6 h-6 rounded-full border-none p-0 cursor-pointer overflow-hidden shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Alt Başlık</label>
                        <div className="relative group/input">
                            <input
                            type="text"
                            value={slide.subtitle || ''}
                            onChange={(e) => handleUpdate(slide.id, 'subtitle', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none font-medium"
                            placeholder="Daha fazla detay için tıklayın"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <input 
                                    type="color" 
                                    value={slide.subtitleColor || '#FFFFFF'} 
                                    onChange={(e) => handleUpdate(slide.id, 'subtitleColor', e.target.value)}
                                    className="w-6 h-6 rounded-full border-none p-0 cursor-pointer overflow-hidden shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(slide.id)}
                    className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all ml-4"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Açıklama Metni</label>
                  <div className="relative">
                    <textarea
                        value={slide.description || ''}
                        onChange={(e) => handleUpdate(slide.id, 'description', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none min-h-[100px] text-sm text-gray-600"
                        placeholder="Slayt üzerinde görünecek detaylı açıklama..."
                    />
                    <div className="absolute right-4 bottom-4">
                         <input 
                            type="color" 
                            value={slide.descriptionColor || '#FFFFFF'} 
                            onChange={(e) => handleUpdate(slide.id, 'descriptionColor', e.target.value)}
                            className="w-6 h-6 rounded-full border-none p-0 cursor-pointer overflow-hidden shadow-sm"
                        />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Sıralama</label>
                        <input 
                            type="number" 
                            value={slide.order} 
                            onChange={(e) => handleUpdate(slide.id, 'order', parseInt(e.target.value))}
                            className="w-16 bg-transparent border-none focus:outline-none font-bold text-orange-600 text-center"
                        />
                    </div>
                    <div className="text-[10px] text-gray-400 flex items-center gap-2">
                        <Edit2 size={12} />
                        Son güncelleme: {new Date(slide.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {slides.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
            <ImageIcon size={64} className="text-gray-200 mb-4" />
            <p className="text-gray-500 font-bold">Henüz slayt eklenmemiş.</p>
            <button 
              onClick={handleAdd}
              className="mt-6 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-xl shadow-orange-100 font-bold transition-all"
            >
              İlk Slaytı Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
