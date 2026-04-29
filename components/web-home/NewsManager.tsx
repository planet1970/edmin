import React, { useState, useEffect } from 'react';
import { 
  Newspaper, Plus, Trash2, CheckCircle, Eye, EyeOff, Loader, 
  ExternalLink, Calendar, MessageSquare, Save, X 
} from 'lucide-react';
import { webHomeService } from '../../services/web-home';
import { toast } from 'react-hot-toast';

export const NewsManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newsSettings, setNewsSettings] = useState<{ isNewsActive: boolean }>({ isNewsActive: true });
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNews, setNewNews] = useState({ title: '', source: '', link: '', contentSnippet: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const settings = await webHomeService.getNewsSettings();
      setNewsSettings(settings || { isNewsActive: true });
      const items = await webHomeService.getAllNewsItems();
      setNewsItems(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    setSaving(true);
    try {
      await webHomeService.updateNewsSettings(!newsSettings.isNewsActive);
      setNewsSettings({ isNewsActive: !newsSettings.isNewsActive });
      toast.success(`Haber bandı ${!newsSettings.isNewsActive ? 'aktif' : 'pasif'} edildi.`);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleItem = async (id: number, current: boolean) => {
    try {
      await webHomeService.toggleNewsItem(id, !current);
      setNewsItems(prev => prev.map(item => item.id === id ? { ...item, isActive: !current } : item));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm('Bu haberi silmek istediğinize emin misiniz?')) return;
    try {
      await webHomeService.deleteNewsItem(id);
      setNewsItems(prev => prev.filter(item => item.id !== id));
      toast.success('Haber silindi.');
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateNews = async () => {
    if (!newNews.title || !newNews.link) {
      toast.error('Başlık ve link zorunludur.');
      return;
    }
    setSaving(true);
    try {
      const created = await webHomeService.createManualNews(newNews);
      setNewsItems([created, ...newsItems]);
      setIsModalOpen(false);
      setNewNews({ title: '', source: '', link: '', contentSnippet: '' });
      toast.success('Haber başarıyla eklendi.');
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-8">
      {/* Settings Header */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className={`p-4 rounded-2xl ${newsSettings.isNewsActive ? 'bg-orange-50 text-orange-500' : 'bg-gray-50 text-gray-400'}`}>
            <Newspaper size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Haber Bandı Ayarları</h3>
            <p className="text-sm text-gray-500">Ana sayfadaki kayan haber bandını ve içeriklerini buradan yönetin.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleActive}
            disabled={saving}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
              newsSettings.isNewsActive 
              ? 'bg-orange-500 text-white shadow-orange-100' 
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200 shadow-none'
            }`}
          >
            {newsSettings.isNewsActive ? 'Haber Bandı Açık' : 'Haber Bandı Kapalı'}
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Manuel Haber Ekle
          </button>
        </div>
      </div>

      {/* News List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {newsItems.map((item) => (
          <div key={item.id} className={`bg-white p-6 rounded-3xl border transition-all ${item.isActive ? 'border-gray-100 shadow-sm' : 'border-gray-50 opacity-60 grayscale'}`}>
            <div className="flex gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-wider">{item.source || 'SİSTEM'}</span>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Calendar size={10} />
                    {new Date(item.pubDate || item.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>
                <h4 className="font-bold text-gray-900 line-clamp-2">{item.title}</h4>
                <div className="flex items-center gap-3 pt-2">
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink size={12} /> Kaynağa Git
                  </a>
                  <div className="h-1 w-1 rounded-full bg-gray-300" />
                  <button 
                    onClick={() => handleToggleItem(item.id, item.isActive)}
                    className={`text-xs font-bold flex items-center gap-1 ${item.isActive ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    {item.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                    {item.isActive ? 'Yayında' : 'Gizli'}
                  </button>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteItem(item.id)}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl self-start transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Manual News Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Manuel Haber Ekle</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Haber Başlığı</label>
                <input 
                  type="text" 
                  value={newNews.title}
                  onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  placeholder="Haber başlığını girin..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Kaynak</label>
                  <input 
                    type="text" 
                    value={newNews.source}
                    onChange={(e) => setNewNews({ ...newNews, source: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                    placeholder="Örn: Edirne Haber"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Link (URL)</label>
                  <input 
                    type="text" 
                    value={newNews.link}
                    onChange={(e) => setNewNews({ ...newNews, link: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Kısa Özet (Opsiyonel)</label>
                <textarea 
                  value={newNews.contentSnippet}
                  onChange={(e) => setNewNews({ ...newNews, contentSnippet: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm min-h-[80px]"
                  placeholder="Haber hakkında kısa bir bilgi..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Vazgeç
                </button>
                <button 
                  onClick={handleCreateNews}
                  disabled={saving}
                  className="px-8 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-100 font-bold transition-all disabled:opacity-50"
                >
                  Haberi Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
