import React, { useState, useEffect } from 'react';
import { 
  Type, Palette, FontSize, Image as ImageIcon, Save, Loader, Upload 
} from 'lucide-react';
import { webHomeService, WebNavbar } from '../../services/web-home';
import { getImageUrl } from '../../services/api';
import { toast } from 'react-hot-toast';
import ImageUploadField from '../ImageUploadField';

export const NavbarManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [navbarInfo, setNavbarInfo] = useState<WebNavbar>({
    id: 0,
    title: '',
    titleColor: '#333333',
    fontFamily: 'Inter',
    fontSize: 24,
    logoUrl: '',
    bgColor: '#FFFFFF',
    iconColor: '#333333'
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await webHomeService.getNavbar();
        if (data) setNavbarInfo(prev => ({ ...prev, ...data }));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      if (navbarInfo.title) formData.append('title', navbarInfo.title);
      if (navbarInfo.titleColor) formData.append('titleColor', navbarInfo.titleColor);
      if (navbarInfo.bgColor) formData.append('bgColor', navbarInfo.bgColor);
      if (navbarInfo.fontSize) formData.append('fontSize', navbarInfo.fontSize.toString());
      if (navbarInfo.fontFamily) formData.append('fontFamily', navbarInfo.fontFamily);
      if (navbarInfo.iconColor) formData.append('iconColor', navbarInfo.iconColor);
      
      if (logoFile) {
        formData.append('file', logoFile);
      }

      await webHomeService.updateNavbar(formData);
      toast.success('Navbar ayarları başarıyla kaydedildi.');
      setLogoFile(null);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-gray-900">Header ve Logo Ayarları</h3>
            <p className="text-sm text-gray-500">Web sitesinin üst menü görünümünü ve logosunu buradan özelleştirin.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-100 transition-all font-bold disabled:opacity-50"
          >
            {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
            Ayarları Uygula
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Logo & Preview */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
               <ImageUploadField
                label="Site Logosu"
                value={navbarInfo.logoUrl ? getImageUrl(navbarInfo.logoUrl) : undefined}
                previewUrl={logoFile ? URL.createObjectURL(logoFile) : undefined}
                onFileSelect={setLogoFile}
                recommendedSize="200x60px"
              />
            </div>
            
            <div className="p-6 bg-gray-900 rounded-3xl shadow-xl space-y-3">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Canlı Önizleme</label>
              <div 
                className="h-16 rounded-xl flex items-center px-4 gap-3 border border-white/5"
                style={{ backgroundColor: navbarInfo.bgColor }}
              >
                {logoFile || navbarInfo.logoUrl ? (
                  <img 
                    src={logoFile ? URL.createObjectURL(logoFile) : getImageUrl(navbarInfo.logoUrl)} 
                    alt="Logo" 
                    className="h-8 object-contain"
                  />
                ) : (
                  <div className="text-gray-400 font-bold">LOGO</div>
                )}
                <span 
                  style={{ 
                    color: navbarInfo.titleColor, 
                    fontFamily: navbarInfo.fontFamily,
                    fontSize: `${(navbarInfo.fontSize || 24) * 0.7}px` 
                  }}
                  className="font-bold truncate"
                >
                  {navbarInfo.title || 'Site Başlığı'}
                </span>
              </div>
            </div>
          </div>

          {/* Form Settings */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Type size={16} className="text-orange-500" /> Site Başlığı
              </label>
              <input
                type="text"
                value={navbarInfo.title || ''}
                onChange={(e) => setNavbarInfo({ ...navbarInfo, title: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Palette size={16} className="text-orange-500" /> Arkaplan Rengi
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={navbarInfo.bgColor || '#FFFFFF'}
                  onChange={(e) => setNavbarInfo({ ...navbarInfo, bgColor: e.target.value })}
                  className="w-12 h-12 rounded-xl border-none p-0 cursor-pointer overflow-hidden shadow-sm"
                />
                <input
                  type="text"
                  value={navbarInfo.bgColor || '#FFFFFF'}
                  onChange={(e) => setNavbarInfo({ ...navbarInfo, bgColor: e.target.value })}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none uppercase font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <span className="text-orange-500">A</span> Başlık Rengi
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={navbarInfo.titleColor || '#333333'}
                  onChange={(e) => setNavbarInfo({ ...navbarInfo, titleColor: e.target.value })}
                  className="w-12 h-12 rounded-xl border-none p-0 cursor-pointer overflow-hidden shadow-sm"
                />
                <input
                  type="text"
                  value={navbarInfo.titleColor || '#333333'}
                  onChange={(e) => setNavbarInfo({ ...navbarInfo, titleColor: e.target.value })}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none uppercase font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Type size={16} className="text-orange-500" /> Yazı Tipi (Font)
              </label>
              <select
                value={navbarInfo.fontFamily || 'Inter'}
                onChange={(e) => setNavbarInfo({ ...navbarInfo, fontFamily: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Outfit">Outfit</option>
                <option value="Poppins">Poppins</option>
                <option value="Montserrat">Montserrat</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
