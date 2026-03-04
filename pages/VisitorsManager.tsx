import React, { useState, useEffect } from 'react';
import { Search, Users, Calendar, Clock, RefreshCw, Eye, MapPin, Monitor, Globe } from 'lucide-react';
import { Visitor } from '../types';
import { visitorService } from '../services/visitors';

const VisitorsManager: React.FC = () => {
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadVisitors();
    }, []);

    const loadVisitors = async () => {
        setLoading(true);
        try {
            const data = await visitorService.getAll();
            setVisitors(data);
        } catch (error) {
            console.error('Ziyaretçiler yüklenirken hata oluştu:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredVisitors = visitors.filter(visitor =>
        visitor.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        visitor.fingerprint.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (visitor.lastIp || '').includes(searchQuery)
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-6 space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Ziyaretçiler</h1>
                    <p className="text-sm text-gray-500">Uygulamayı ve web sitesini ziyaret eden tüm kullanıcıların takibi.</p>
                </div>
                <button
                    onClick={loadVisitors}
                    className="p-2 text-gray-400 hover:text-primary transition-colors bg-white rounded-lg border border-gray-100 shadow-sm"
                    title="Yenile"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex-1 flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Kullanıcı adı, fingerprint veya IP ara..."
                        className="bg-transparent border-none outline-none text-sm w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="text-sm text-gray-400 font-medium whitespace-nowrap">
                    Toplam: <span className="text-gray-800">{filteredVisitors.length}</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Kullanıcı (Fingerprint)</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Ziyaret Sayısı</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">İlk Kayıt / Son Görülme</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Ağ Bilgileri</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Platform</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded"></div></td>
                                    </tr>
                                ))
                            ) : filteredVisitors.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">
                                        Ziyaretçi bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                filteredVisitors.map((visitor) => (
                                    <tr key={visitor.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-orange-50 text-primary group-hover:scale-110 transition-transform">
                                                    <Users size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-800">{visitor.username}</div>
                                                    <div className="text-xs text-gray-400 font-mono truncate max-w-[120px]" title={visitor.fingerprint}>
                                                        {visitor.fingerprint}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                                                <Eye size={12} /> {visitor.visitCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    <PlusCircle size={12} className="text-green-500" />
                                                    {formatDate(visitor.createdAt)}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-800 font-medium">
                                                    <Clock size={12} className="text-orange-500" />
                                                    {formatDate(visitor.lastVisitAt)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                                <Globe size={14} className="text-blue-400" />
                                                {visitor.lastIp || 'Bilinmiyor'}
                                            </div>
                                            {visitor.customMessage && (
                                                <div className="text-xs text-primary font-medium mt-1 truncate max-w-[150px]" title={visitor.customMessage}>
                                                    "{visitor.customMessage}"
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs text-gray-400 truncate max-w-[200px]" title={visitor.userAgent}>
                                                <Monitor size={14} />
                                                {visitor.userAgent ?
                                                    (visitor.userAgent.includes('Mobile') ? 'Mobil' : 'Masaüstü') :
                                                    'Bilinmiyor'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const PlusCircle = (props: any) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
    </svg>
);

export default VisitorsManager;
