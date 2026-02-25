import React, { useState } from 'react';
import {
  Plus, Trash2, List, Layout,
  Image as ImageIcon, GripVertical, Edit2, CheckCircle, XCircle,
  AlertCircle, Heart
} from 'lucide-react';
import { HeroSlide, PopularItem } from '../types';
import { getImageUrl } from '../services/api';

const HomeScreenManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hero' | 'popular'>('hero');

  const [isEditingPopular, setIsEditingPopular] = useState<boolean>(false);
  const [editingPopular, setEditingPopular] = useState<PopularItem | null>(null);

  // --- DATA STATES ---
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([
    {
      id: '1',
      title: 'Edirne\'ye Hoş Geldiniz',
      subtitle: 'Tarihin ve doğanın buluştuğu yer',
      imageUrl: 'https://images.unsplash.com/photo-1572089209589-971933cc5819?auto=format&fit=crop&w=800&q=80',
      order: 1
    },
    {
      id: '2',
      title: 'Kırkpınar Festivali',
      subtitle: 'Tarihi yağlı güreşlere hazır mısınız?',
      imageUrl: 'https://images.unsplash.com/photo-1596720512803-519b78805f6e?auto=format&fit=crop&w=800&q=80',
      order: 2
    }
  ]);

  const [popularItems, setPopularItems] = useState<PopularItem[]>([
    {
      id: '1',
      title: 'Selimiye Camii',
      imageUrl: 'https://images.unsplash.com/photo-1572089209589-971933cc5819?auto=format&fit=crop&w=400&q=80',
      address: 'Meydan Mahallesi, Edirne',
      rating: 5.0,
      description: 'Mimar Sinan\'ın ustalık eseri.',
      order: 1,
      isActive: true
    },
    {
      id: '2',
      title: 'Meşhur Ciğerci Niyazi',
      imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=400&q=80',
      address: 'Ortakapı, Edirne',
      rating: 4.8,
      description: 'Edirne tava ciğerinin adresi.',
      order: 2,
      isActive: true
    }
  ]);

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (e: React.DragEvent, index: number, type: 'popular') => {
    e.dataTransfer.setData('type', type);
    e.dataTransfer.setData('index', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number, type: 'popular') => {
    const dragType = e.dataTransfer.getData('type');
    if (dragType !== type) return;

    const dragIndex = parseInt(e.dataTransfer.getData('index'));
    if (dragIndex === dropIndex) return;

    const newItems = [...popularItems];
    const [draggedItem] = newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);
    const reordered = newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
    setPopularItems(reordered);
  };

  // --- POPULAR ITEM ACTIONS ---
  const handleAddPopular = () => {
    const nextOrder = popularItems.length > 0
      ? Math.max(...popularItems.map(p => p.order)) + 1
      : 1;

    setEditingPopular({
      id: '',
      title: '',
      imageUrl: '',
      address: '',
      rating: 5.0,
      description: '',
      order: nextOrder,
      isActive: true
    });
    setIsEditingPopular(true);
  };

  const handleSavePopular = () => {
    if (!editingPopular) return;

    if (editingPopular.id) {
      setPopularItems(prev => prev.map(p => p.id === editingPopular.id ? editingPopular : p));
    } else {
      const newItem = { ...editingPopular, id: Date.now().toString() };
      setPopularItems([...popularItems, newItem]);
    }
    setIsEditingPopular(false);
    setEditingPopular(null);
  };

  const togglePopularStatus = (id: string) => {
    setPopularItems(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  const handleDeletePopular = (id: string) => {
    if (window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
      setPopularItems(prev => prev.filter(p => p.id !== id));
    }
  };

  // --- HERO ACTIONS ---
  const handleDeleteHero = (id: string) => setHeroSlides(prev => prev.filter(i => i.id !== id));
  const addHero = () => setHeroSlides([...heroSlides, {
    id: Date.now().toString(),
    title: 'Yeni Başlık',
    subtitle: 'Yeni Alt Başlık',
    imageUrl: 'https://via.placeholder.com/800x400',
    order: heroSlides.length + 1
  }]);
  const updateHero = (id: string, field: keyof HeroSlide, value: string | number) => {
    setHeroSlides(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ana Ekran Yönetimi</h1>
          <p className="text-sm text-gray-500">Mobil uygulama ana ekran içeriklerini düzenleyin.</p>
        </div>
      </div>

      <div className="space-y-6">

        {/* TABS */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl max-w-2xl">
          {[
            { id: 'hero', label: 'Üst Slider', icon: Layout },
            { id: 'popular', label: 'Popüler', icon: List }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setIsEditingPopular(false);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === tab.id
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* === HERO SLIDER === */}
        {activeTab === 'hero' && (
          <div className="space-y-4 max-w-4xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-700">Slider Görselleri</h3>
              <button onClick={addHero} className="text-sm text-primary font-medium hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                <Plus size={16} /> Yeni Ekle
              </button>
            </div>

            {heroSlides.map((slide) => (
              <div key={slide.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4">
                <div className="w-32 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative group">
                  <img src={getImageUrl(slide.imageUrl)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
                    <ImageIcon className="text-white opacity-70" />
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => updateHero(slide.id, 'title', e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded text-sm font-bold text-gray-800 placeholder-gray-400 focus:outline-primary"
                      placeholder="Başlık"
                    />
                    <input
                      type="text"
                      value={slide.subtitle}
                      onChange={(e) => updateHero(slide.id, 'subtitle', e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded text-sm text-gray-600 placeholder-gray-400 focus:outline-primary"
                      placeholder="Alt Başlık"
                    />
                  </div>
                  <input
                    type="text"
                    value={slide.imageUrl}
                    onChange={(e) => updateHero(slide.id, 'imageUrl', e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs text-gray-400 font-mono placeholder-gray-400 focus:outline-primary"
                    placeholder="Görsel URL"
                  />
                </div>
                <button onClick={() => handleDeleteHero(slide.id)} className="text-gray-400 hover:text-red-500 self-start">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* === POPULAR ITEMS === */}
        {activeTab === 'popular' && (
          <div className="space-y-4">
            {isEditingPopular && editingPopular ? (
              /* POPULAR FORM */
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h3 className="font-bold text-gray-800">
                    {editingPopular.id ? 'Kaydı Düzenle' : 'Yeni Kayıt'}
                  </h3>
                  <button onClick={() => setIsEditingPopular(false)} className="text-gray-400 hover:text-gray-600">
                    <XCircle size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center relative">
                      {editingPopular.imageUrl ? (
                        <img src={getImageUrl(editingPopular.imageUrl)} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                          <ImageIcon size={24} className="mb-1" />
                          <span className="text-xs">Görsel Önizleme</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Görsel URL</label>
                      <input
                        value={editingPopular.imageUrl}
                        onChange={(e) => setEditingPopular({ ...editingPopular, imageUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-primary text-xs"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Mekan Adı</label>
                        <input
                          value={editingPopular.title}
                          onChange={(e) => setEditingPopular({ ...editingPopular, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Puan</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.1"
                            max="5"
                            value={editingPopular.rating}
                            onChange={(e) => setEditingPopular({ ...editingPopular, rating: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-primary"
                          />
                          <div className="text-yellow-500">
                            <Heart size={20} className="fill-yellow-500" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Adres</label>
                      <input
                        value={editingPopular.address}
                        onChange={(e) => setEditingPopular({ ...editingPopular, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Açıklama</label>
                      <textarea
                        rows={2}
                        value={editingPopular.description}
                        onChange={(e) => setEditingPopular({ ...editingPopular, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-primary resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="block text-xs font-medium text-gray-500 mb-0">Sıra No:</label>
                      <input
                        type="number"
                        value={editingPopular.order}
                        onChange={(e) => setEditingPopular({ ...editingPopular, order: parseInt(e.target.value) })}
                        className="w-16 px-2 py-1 border border-gray-200 rounded-lg focus:outline-primary text-center"
                      />
                      <div className="flex-1"></div>
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editingPopular.isActive}
                          onChange={(e) => setEditingPopular({ ...editingPopular, isActive: e.target.checked })}
                          className="w-4 h-4 text-primary rounded focus:ring-primary"
                        />
                        Aktif Kayıt
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-4">
                  <button onClick={() => setIsEditingPopular(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">İptal</button>
                  <button onClick={handleSavePopular} className="px-4 py-2 text-sm bg-primary text-white hover:bg-orange-600 rounded-lg">Kaydet</button>
                </div>
              </div>
            ) : (
              /* POPULAR LIST */
              <>
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-700">Popüler Mekanlar</h3>
                  <button onClick={handleAddPopular} className="text-sm text-primary font-medium hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                    <Plus size={16} /> Yeni Ekle
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 w-10"></th>
                        <th className="px-4 py-3 w-16">Görsel</th>
                        <th className="px-4 py-3">Mekan Adı</th>
                        <th className="px-4 py-3">Puan</th>
                        <th className="px-4 py-3">Sıra</th>
                        <th className="px-4 py-3">Durum</th>
                        <th className="px-4 py-3 text-right">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {popularItems.map((item, index) => (
                        <tr
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index, 'popular')}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index, 'popular')}
                          className="hover:bg-gray-50 cursor-move"
                        >
                          <td className="px-4 py-3 text-gray-400"><GripVertical size={16} /></td>
                          <td className="px-4 py-3">
                            <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                              <img src={getImageUrl(item.imageUrl)} alt="" className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800">{item.title}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 font-bold text-gray-600">
                              <Heart size={12} className="text-yellow-500 fill-yellow-500" /> {item.rating}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-gray-500">{item.order}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.isActive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                              {item.isActive ? 'AKTİF' : 'PASİF'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => togglePopularStatus(item.id)} className={`p-1.5 rounded transition-colors ${item.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`} title={item.isActive ? 'Pasife Al' : 'Aktife Al'}>
                                {item.isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
                              </button>
                              <button onClick={() => { setEditingPopular(item); setIsEditingPopular(true); }} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDeletePopular(item.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><GripVertical size={12} /> Sıralamayı değiştirmek için satırları sürükleyip bırakabilirsiniz.</p>
              </>
            )}
          </div>
        )}

      </div>
      <div className="mt-8 flex items-center gap-2 text-xs text-gray-400">
        <AlertCircle size={14} />
        <span>Bu sayfadaki veriler tarayıcınızın yerel hafızasında (localStorage) saklanmaktadır.</span>
      </div>
    </div>
  );
};

export default HomeScreenManager;
