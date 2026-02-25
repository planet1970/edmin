import React, { useState, useEffect, useRef } from 'react';
import { Save, Image as ImageIcon } from 'lucide-react';
import { SplashConfig } from '../types';
import { splashService } from '../services/splash';
import { API_BASE_URL, getImageUrl } from '../services/api';

const SplashManager: React.FC = () => {
  const [config, setConfig] = useState<SplashConfig>({
    backgroundColor: '#ff6c2f',
    logoUrl: '',
    duration: 3000,
    tagline: 'Edirne Şehir Rehberi',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await splashService.get();
      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error loading splash config:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('backgroundColor', config.backgroundColor);
      formData.append('duration', config.duration.toString());
      formData.append('tagline', config.tagline);
      if (selectedFile) {
        formData.append('file', selectedFile);
      } else {
        formData.append('logoUrl', config.logoUrl || '');
      }

      await splashService.update(formData);
      alert('Kaydedildi');
      loadConfig();
    } catch (error) {
      console.error('Error updating splash config:', error);
      alert('Hata oluştu');
    }
  };

  const displayImageUrl = previewUrl || getImageUrl(config.logoUrl);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Splash Screen Yönetimi</h1>
          <p className="text-sm text-gray-500">Uygulama açılış ekranını özelleştirin.</p>
        </div>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Save size={20} /> Kaydet
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-4xl">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Görünüm Ayarları</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Arkaplan Rengi (Hex)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="backgroundColor"
                value={config.backgroundColor || '#ffffff'}
                onChange={handleChange}
                className="h-10 w-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                name="backgroundColor"
                value={config.backgroundColor || ''}
                onChange={handleChange}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Süre (ms)</label>
            <input
              type="number"
              name="duration"
              value={config.duration || 3000}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Slogan (Tagline)</label>
            <input
              type="text"
              name="tagline"
              value={config.tagline || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Logo</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-primary transition-colors h-48"
            >
              {displayImageUrl ? (
                <img src={displayImageUrl} alt="Logo Preview" className="h-full object-contain" />
              ) : (
                <div className="text-center text-gray-400">
                  <ImageIcon size={32} className="mx-auto mb-2" />
                  <span className="text-sm">Logo yüklemek için tıklayın</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashManager;
