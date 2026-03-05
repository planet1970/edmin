import React, { useState, useEffect } from 'react';
import { Mail, Search, Clock, CheckCircle, User, MessageSquare, Settings, Save } from 'lucide-react';
import { ContactMessage } from '../types';
import { api } from '../services/api';
import { webHomeService, WebSocialInfo } from '../services/web-home';
import { toast } from 'react-hot-toast';

const ContactMessagesManager: React.FC = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'messages' | 'settings'>('messages');

    // Settings State
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [contactSettings, setContactSettings] = useState<Partial<WebSocialInfo>>({
        phone: '',
        email: '',
        address: '',
        workingHours: ''
    });

    useEffect(() => {
        if (activeTab === 'messages') {
            loadMessages();
        } else {
            loadSettings();
        }
    }, [activeTab]);

    const loadMessages = async () => {
        setLoading(true);
        try {
            const response = await api.get<ContactMessage[]>('/contact-messages');
            setMessages(response || []);
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'Bekliyor' ? 'Tamamlandı' : 'Bekliyor';
        try {
            await api.patch(`/contact-messages/${id}/status`, { status: newStatus });
            loadMessages();
            toast.success('Durum başarıyla güncellendi!');

        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Durum güncellenemedi.');
        }
    };

    const loadSettings = async () => {
        setSettingsLoading(true);
        try {
            const data = await webHomeService.getSocialInfo();
            setContactSettings(data || { phone: '', email: '', address: '', workingHours: '' });
        } catch (error) {
            console.error('Error loading settings:', error);
            toast.error('Ayarlar yüklenemedi.');
        } finally {
            setSettingsLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setSettingsLoading(true);
        try {
            await webHomeService.updateSocialInfo(contactSettings);
            toast.success('Ayarlar başarıyla kaydedildi!');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Ayarlar kaydedilemedi.');
        } finally {
            setSettingsLoading(false);
        }
    };

    const filteredMessages = messages.filter(msg =>
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Mail className="text-primary" /> İletişim Yönetimi
                    </h1>
                    <p className="text-sm text-gray-500">Gelen mesajları ve iletişim bilgilerini yönetin.</p>
                </div>
            </div>

            <div className="flex gap-4 mb-6 border-b border-gray-100">
                <button
                    onClick={() => setActiveTab('messages')}
                    className={`pb-3 px-4 font-medium transition-all flex items-center gap-2 relative ${activeTab === 'messages' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <MessageSquare size={18} /> Gelen Mesajlar
                    {activeTab === 'messages' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`pb-3 px-4 font-medium transition-all flex items-center gap-2 relative ${activeTab === 'settings' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Settings size={18} /> İletişim Ayarları
                    {activeTab === 'settings' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                    )}
                </button>
            </div>

            {activeTab === 'messages' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Mesajlarda ara..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider font-bold">
                                    <th className="px-6 py-4">Gönderen</th>
                                    <th className="px-6 py-4">Konu</th>
                                    <th className="px-6 py-4">Mesaj</th>
                                    <th className="px-6 py-4">Durum</th>
                                    <th className="px-6 py-4">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-gray-400">Yükleniyor...</td>
                                    </tr>
                                ) : filteredMessages.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-gray-400">Mesaj bulunamadı.</td>
                                    </tr>
                                ) : (
                                    filteredMessages.map((msg) => (
                                        <tr key={msg.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-800">{msg.name}</div>
                                                <div className="text-xs text-gray-500">{msg.email}</div>
                                                <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                                                    <Clock size={10} /> {new Date(msg.createdAt).toLocaleString('tr-TR')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-700 font-medium">{msg.subject || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs text-gray-600 max-w-md line-clamp-2" title={msg.message}>
                                                    {msg.message}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${msg.status === 'Bekliyor'
                                                    ? 'bg-orange-100 text-orange-600'
                                                    : 'bg-green-100 text-green-600'
                                                    }`}>
                                                    {msg.status === 'Bekliyor' ? <Clock size={12} /> : <CheckCircle size={12} />}
                                                    {msg.status}
                                                </div>
                                                {msg.status === 'Tamamlandı' && msg.completedBy && (
                                                    <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                        <User size={10} /> {msg.completedBy.name} tarafından
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleStatusUpdate(msg.id, msg.status)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${msg.status === 'Bekliyor'
                                                        ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm shadow-green-200'
                                                        : 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm shadow-orange-200'
                                                        }`}
                                                >
                                                    {msg.status === 'Bekliyor' ? 'Tamamla' : 'Geri Al'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-50 pb-4">İletişim Bilgileri</h2>
                    {settingsLoading && !contactSettings.id ? (
                        <span className="text-gray-400">Yükleniyor...</span>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta Adresi</label>
                                <input
                                    type="email"
                                    value={contactSettings.email || ''}
                                    onChange={(e) => setContactSettings({ ...contactSettings, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Numarası</label>
                                <input
                                    type="text"
                                    value={contactSettings.phone || ''}
                                    onChange={(e) => setContactSettings({ ...contactSettings, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Adres Bilgisi</label>
                                <textarea
                                    value={contactSettings.address || ''}
                                    rows={3}
                                    onChange={(e) => setContactSettings({ ...contactSettings, address: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Çalışma Saatleri</label>
                                <input
                                    type="text"
                                    value={contactSettings.workingHours || ''}
                                    onChange={(e) => setContactSettings({ ...contactSettings, workingHours: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-primary"
                                    placeholder="Örn: Hafta İçi 09:00 - 18:00"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={handleSaveSettings}
                                    disabled={settingsLoading}
                                    className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-8 py-2.5 rounded-lg transition-all font-bold shadow-md disabled:opacity-50"
                                >
                                    <Save size={18} /> {settingsLoading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ContactMessagesManager;
