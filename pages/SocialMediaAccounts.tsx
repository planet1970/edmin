import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Key, ToggleLeft, ToggleRight, CheckCircle2, AlertCircle, RefreshCw, Instagram, Facebook, Video, PlusCircle, X, Shield, Settings, Wifi } from 'lucide-react';

interface Account {
  id: number;
  platform: string;
  username: string;
  isActive: boolean;
  isSimulated: boolean;
  credentials: any;
}

const SocialMediaAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [testingId, setTestingId] = useState<number | null>(null);

  const handleTestConnection = async (account: Account) => {
    setTestingId(account.id);
    const toastId = toast.loading(`${account.username} bağlantısı test ediliyor...`);
    try {
      const result = await api.post<{ success: boolean; message: string }>(`/social-media/accounts/${account.id}/test`, {});
      toast.dismiss(toastId);
      if (result.success) {
        toast.success(result.message, { duration: 4500 });
      } else {
        toast.error(result.message, { duration: 6000 });
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Bağlantı test edilirken sunucu hatası oluştu.');
      console.error('Bağlantı test hatası:', error);
    } finally {
      setTestingId(null);
    }
  };

  // Form states
  const [platform, setPlatform] = useState<string>('INSTAGRAM');
  const [username, setUsername] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSimulated, setIsSimulated] = useState<boolean>(true);
  const [appId, setAppId] = useState<string>('');
  const [pageId, setPageId] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string>('');

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const data = await api.get<Account[]>('/social-media/accounts');
      setAccounts(data);
    } catch (error) {
      console.error('Hesaplar yüklenirken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedAccount(null);
    setPlatform('INSTAGRAM');
    setUsername('');
    setIsActive(true);
    setIsSimulated(true);
    setAppId('');
    setPageId('');
    setAccessToken('');
    setIsModalOpen(true);
  };

  const openEditModal = (account: Account) => {
    setModalMode('edit');
    setSelectedAccount(account);
    setPlatform(account.platform);
    setUsername(account.username);
    setIsActive(account.isActive);
    setIsSimulated(account.isSimulated);
    setAppId(account.credentials?.appId || '');
    setPageId(account.credentials?.pageId || '');
    setAccessToken(account.credentials?.accessToken || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Lütfen bir hesap adı/kullanıcı adı girin.');
      return;
    }

    const payload = {
      platform,
      username,
      isActive,
      isSimulated,
      credentials: {
        appId,
        pageId,
        accessToken,
      },
    };

    try {
      if (modalMode === 'create') {
        await api.post('/social-media/accounts', payload);
        toast.success('Sosyal medya hesabı başarıyla eklendi.');
      } else if (modalMode === 'edit' && selectedAccount) {
        await api.put(`/social-media/accounts/${selectedAccount.id}`, payload);
        toast.success('Hesap ayarları güncellendi.');
      }
      setIsModalOpen(false);
      fetchAccounts();
    } catch (error) {
      console.error('Hesap kaydedilirken hata:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu hesabı silmek istediğinize emin misiniz?')) {
      try {
        await api.delete(`/social-media/accounts/${id}`);
        toast.success('Hesap başarıyla silindi.');
        fetchAccounts();
      } catch (error) {
        console.error('Hesap silinirken hata:', error);
      }
    }
  };

  const toggleAccountStatus = async (account: Account) => {
    try {
      const updated = { ...account, isActive: !account.isActive };
      await api.put(`/social-media/accounts/${account.id}`, updated);
      toast.success(`${account.username} hesabı ${!account.isActive ? 'aktif' : 'pasif'} hale getirildi.`);
      fetchAccounts();
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
    }
  };

  const getPlatformIcon = (plat: string) => {
    switch (plat) {
      case 'INSTAGRAM':
        return <Instagram className="text-pink-500 w-6 h-6" />;
      case 'FACEBOOK':
        return <Facebook className="text-blue-600 w-6 h-6" />;
      case 'TIKTOK':
        return <Video className="text-black dark:text-white w-6 h-6" />;
      default:
        return <Shield className="text-gray-500 w-6 h-6" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sosyal Medya Hesapları</h1>
          <p className="text-sm text-gray-500">Paylaşım yapılacak sosyal medya platformlarının bağlantılarını yönetin.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white font-medium px-4 py-2.5 rounded-lg shadow-md shadow-orange-500/10 transition-all active:scale-95 duration-200"
        >
          <Plus size={18} />
          Yeni Hesap Bağla
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="animate-spin text-primary w-8 h-8" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 bg-orange-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Settings size={28} className="animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Hesap Bulunmamaktadır</h3>
          <p className="text-gray-500 text-sm mb-6">
            Yapay zeka ile ürettiğiniz gönderileri sosyal medyada paylaşabilmek veya simüle edebilmek için ilk hesabınızı ekleyin.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-primary hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={18} />
            İlk Hesabı Bağla
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
            >
              {/* Top Accent Strip */}
              <div
                className={`absolute top-0 left-0 w-full h-1.5 ${
                  account.platform === 'INSTAGRAM'
                    ? 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500'
                    : account.platform === 'FACEBOOK'
                    ? 'bg-blue-600'
                    : 'bg-black'
                }`}
              />

              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
                    {getPlatformIcon(account.platform)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-base">{account.username}</h3>
                    <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">
                      {account.platform}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleTestConnection(account)}
                    disabled={testingId === account.id}
                    className="p-1.5 hover:bg-orange-50 text-gray-500 hover:text-primary rounded-lg transition-colors disabled:opacity-50"
                    title="Bağlantıyı Test Et"
                  >
                    {testingId === account.id ? (
                      <RefreshCw size={16} className="animate-spin text-primary" />
                    ) : (
                      <Wifi size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(account)}
                    className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-gray-800 rounded-lg transition-colors"
                    title="Düzenle"
                  >
                    <Key size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                    title="Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-gray-50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Mod:</span>
                  {account.isSimulated ? (
                    <span className="inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      <AlertCircle size={12} />
                      Simülasyon Modu
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      <CheckCircle2 size={12} />
                      Canlı Bağlantı
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Durum:</span>
                  <button
                    onClick={() => toggleAccountStatus(account)}
                    className="flex items-center gap-1 transition-transform active:scale-95"
                  >
                    {account.isActive ? (
                      <span className="inline-flex items-center gap-1 text-green-600 font-semibold text-xs bg-green-50 px-2 py-0.5 rounded-md">
                        Aktif
                        <ToggleRight className="text-green-600" size={20} />
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-400 font-semibold text-xs bg-gray-50 px-2 py-0.5 rounded-md">
                        Pasif
                        <ToggleLeft className="text-gray-300" size={20} />
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Create/Edit Account */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">
                {modalMode === 'create' ? 'Yeni Sosyal Medya Hesabı Bağla' : 'Hesap Ayarlarını Güncelle'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">Platform</label>
                <div className="grid grid-cols-3 gap-3">
                  {['INSTAGRAM', 'FACEBOOK', 'TIKTOK'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(p)}
                      className={`flex flex-col items-center justify-center py-3 px-4 rounded-xl border text-sm font-bold transition-all duration-200 ${
                        platform === p
                          ? 'border-primary bg-orange-50/50 text-primary shadow-[0_0_0_1px_#ff6c2f]'
                          : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {getPlatformIcon(p)}
                      <span className="mt-1.5 text-xs">{p}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                  Hesap/Kullanıcı Adı
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="@kullaniciadi veya Sayfa Adı"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary transition-colors text-sm"
                  required
                />
              </div>

              <div className="flex gap-6 py-2 border-y border-gray-50">
                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={isSimulated}
                    onChange={(e) => setIsSimulated(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                  />
                  <span>Simülasyon Modu (API Key gerektirmez)</span>
                </label>
              </div>

              {!isSimulated && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                    <Shield size={14} className="text-primary" />
                    Platform API Kimlik Bilgileri (Credentials)
                  </h4>
                  
                  <div className="space-y-1">
                    <label htmlFor="appId" className="block text-xs font-semibold text-gray-500">App ID (Uygulama Kimliği)</label>
                    <input
                      id="appId"
                      type="text"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      placeholder="İsteğe bağlı"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 focus:outline-none focus:border-primary text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="pageId" className="block text-xs font-semibold text-gray-500">Page ID / Channel ID</label>
                    <input
                      id="pageId"
                      type="text"
                      value={pageId}
                      onChange={(e) => setPageId(e.target.value)}
                      placeholder="Sayfa Kimliği"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 focus:outline-none focus:border-primary text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="accessToken" className="block text-xs font-semibold text-gray-500">Access Token (Erişim Anahtarı)</label>
                    <input
                      id="accessToken"
                      type="password"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      placeholder="API Access Token"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-lg text-sm transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-orange-600 text-white font-medium rounded-lg text-sm transition-colors shadow-md shadow-orange-500/10"
                >
                  {modalMode === 'create' ? 'Hesabı Kaydet' : 'Değişiklikleri Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaAccounts;
