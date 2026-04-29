import React, { useState, useEffect } from 'react';
import { 
  Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube, Save, Loader, CheckCircle 
} from 'lucide-react';
import { webHomeService, WebSocialInfo } from '../../services/web-home';
import { toast } from 'react-hot-toast';

export const SocialManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await webHomeService.getSocialInfo();
        if (data) setSocialInfo(data);
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
      await webHomeService.updateSocialInfo(socialInfo);
      toast.success('Sosyal bilgiler başarıyla güncellendi.');
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-orange-500" /></div>;

  const socialFields = [
    { id: 'phone', label: 'Telefon', icon: <Phone size={18} />, placeholder: '05XX XXX XX XX' },
    { id: 'email', label: 'E-Posta', icon: <Mail size={18} />, placeholder: 'info@edirnego.com' },
    { id: 'address', label: 'Adres', icon: <MapPin size={18} />, placeholder: 'Edirne, Türkiye' },
    { id: 'facebook', label: 'Facebook', icon: <Facebook size={18} />, placeholder: 'https://facebook.com/...' },
    { id: 'instagram', label: 'Instagram', icon: <Instagram size={18} />, placeholder: 'https://instagram.com/...' },
    { id: 'twitter', label: 'Twitter (X)', icon: <Twitter size={18} />, placeholder: 'https://twitter.com/...' },
    { id: 'youtube', label: 'Youtube', icon: <Youtube size={18} />, placeholder: 'https://youtube.com/...' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-gray-900">İletişim ve Sosyal Medya</h3>
            <p className="text-sm text-gray-500">Web sitesi footer ve iletişim sayfalarındaki bilgileri buradan düzenleyin.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-100 transition-all font-bold disabled:opacity-50"
          >
            {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
            Değişiklikleri Kaydet
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {socialFields.map((field) => (
            <div key={field.id} className="space-y-2 group">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <span className="text-orange-500">{field.icon}</span>
                {field.label}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={(socialInfo as any)[field.id] || ''}
                  onChange={(e) => setSocialInfo({ ...socialInfo, [field.id]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none text-gray-800 font-medium"
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
                  <CheckCircle size={16} className="text-green-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
