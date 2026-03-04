import React, { useState, useEffect } from 'react';
import { Mail, Search, Clock, CheckCircle, User, MessageSquare } from 'lucide-react';
import { ContactMessage } from '../types';
import { api } from '../services/api';

const ContactMessagesManager: React.FC = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        loadMessages();
    }, []);

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
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error('Error updating status:', error);
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
                        <Mail className="text-primary" /> İletişim Mesajları
                    </h1>
                    <p className="text-sm text-gray-500">Web sitesinden gelen iletişim formu gönderimlerini yönetin.</p>
                </div>
            </div>

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

            {showToast && (
                <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-bottom-5 fade-in duration-300 z-50 flex items-center gap-2">
                    <CheckCircle size={18} />
                    <span>Durum başarıyla güncellendi!</span>
                </div>
            )}
        </div>
    );
};

export default ContactMessagesManager;
