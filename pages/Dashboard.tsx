import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Megaphone,
  BarChart as BarIcon,
  Monitor,
  Smartphone as PhoneIcon,
  Activity,
  Mail,
  Grid,
  ListTree,
  MapPin,
  Utensils,
  Eye,
  ExternalLink,
  PlusCircle,
  Database,
  Calendar,
  X
} from 'lucide-react';
import { api, getImageUrl } from '../services/api';

interface Stats {
  totalUsers: number;
  totalCategories: number;
  totalSubCategories: number;
  totalPlaces: number;
  totalFoodPlaces: number;
  pendingContactMessages: number;
  totalVisitors: number;
  dailyStats: Array<{
    date: string;
    webCount: number;
    mobileCount: number;
    uniqueCount: number;
    searchCount: number;
    totalCount: number;
  }>;
  topPopupAds: Array<{
    id: number;
    title: string;
    viewCount: number;
    imageUrl: string;
  }>;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get<Stats>('/stats/dashboard');
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Bekleyen Mesajlar',
      value: stats?.pendingContactMessages ?? 0,
      icon: Mail,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      path: '/contact',
      description: 'İletişim formundan gelen'
    },
    {
      title: 'Toplam Kullanıcı',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      path: '/users',
      description: 'Kayıtlı sistem kullanıcıları'
    },
    {
      title: 'Toplam Ziyaretçi',
      value: stats?.totalVisitors ?? 0,
      icon: Eye,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      path: '/users',
      description: 'Benzersiz parmak izi kaydı'
    },
    {
      title: 'Mekan & İşletme',
      value: (stats?.totalPlaces ?? 0) + (stats?.totalFoodPlaces ?? 0),
      icon: MapPin,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      path: '/page-content',
      description: 'Sistemdeki toplam içerik'
    },
  ];

  const quickLinks = [
    { title: 'Kategori Yönetimi', path: '/categories', icon: Grid, color: 'blue' },
    { title: 'Alt Kategoriler', path: '/sub-categories', icon: ListTree, color: 'indigo' },
    { title: 'İçerik Ekle', path: '/page-content', icon: PlusCircle, color: 'emerald' },
    { title: 'Reklam Yönetimi', path: '/ads', icon: Megaphone, color: 'orange' },
    { title: 'Database Tanımları', path: '/database-definitions', icon: Database, color: 'gray' },
    { title: 'Web Ana Sayfa', path: '/web-home', icon: ExternalLink, color: 'cyan' },
  ];

  return (
    <div className="p-6 space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Yönetim Paneli Özeti</h1>
          <p className="text-sm text-gray-500 mt-1">Sistemdeki genel durum ve hızlı erişim araçları.</p>
        </div>
        <div className="text-sm text-gray-400 font-medium bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
          {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            onClick={() => navigate(stat.path)}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color} transition-colors group-hover:scale-110 duration-300`}>
                <stat.icon size={24} />
              </div>
              {loading ? (
                <div className="h-8 w-16 bg-gray-100 animate-pulse rounded"></div>
              ) : (
                <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
              )}
            </div>
            <div>
              <p className="text-gray-800 font-bold text-sm mb-1">{stat.title}</p>
              <p className="text-xs text-gray-400 font-medium">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Links */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Activity className="text-primary" size={20} /> Hızlı Bağlantılar
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {quickLinks.map((link, index) => (
              <button
                key={index}
                onClick={() => navigate(link.path)}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group gap-3"
              >
                <div className={`p-4 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-primary group-hover:text-white transition-all duration-300`}>
                  <link.icon size={24} />
                </div>
                <span className="text-sm font-bold text-gray-600 group-hover:text-primary transition-colors text-center">{link.title}</span>
              </button>
            ))}
          </div>
        </div>



        {/* Right Column */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Activity className="text-primary" size={20} /> Site Ziyaret İstatistikleri (Son 5 Gün)
          </h2>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Activity className="text-primary" size={18} /> Günlük Ziyaret Raporu
                </h2>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Son 5 Gün</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tarih</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-blue-500 uppercase tracking-wider text-center">Web (Masaüstü)</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-emerald-500 uppercase tracking-wider text-center">Mobil Tarayıcı</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-purple-500 uppercase tracking-wider text-center">Tekil Ziyaretçi</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-orange-500 uppercase tracking-wider text-center">Arama Motoru</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-amber-500 uppercase tracking-wider text-right">Detay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats?.dailyStats && stats.dailyStats.length > 0 ? (
                    stats.dailyStats.map((s, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-700">
                            {new Date(s.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', timeZone: 'Europe/Istanbul' })}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium">{new Date(s.date).toLocaleDateString('tr-TR', { weekday: 'long', timeZone: 'Europe/Istanbul' })}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[40px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                            {s.webCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[40px] px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
                            {s.mobileCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[40px] px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-100">
                            {s.uniqueCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[40px] px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-bold border border-orange-100">
                            {s.searchCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => { setSelectedDay(s); setIsModalOpen(true); }}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-orange-50 rounded-lg transition-all"
                            title="Detaylı Görünüm"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    )).reverse()
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic text-sm">
                        Henüz veri bulunmuyor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-gray-50/30 border-t border-gray-50 grid grid-cols-4 gap-4">
                <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Masaüstü</p>
                    <p className="text-lg font-black text-blue-600">{stats?.dailyStats?.reduce((acc, curr) => acc + curr.webCount, 0) || 0}</p>
                </div>
                <div className="text-center border-x border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Mobil</p>
                    <p className="text-lg font-black text-emerald-600">{stats?.dailyStats?.reduce((acc, curr) => acc + curr.mobileCount, 0) || 0}</p>
                </div>
                <div className="text-center border-r border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Tekil Ziyaretçi</p>
                    <p className="text-lg font-black text-purple-600">{stats?.dailyStats?.reduce((acc, curr) => acc + curr.uniqueCount, 0) || 0}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Toplam Ziyaret</p>
                    <p className="text-lg font-black text-amber-600">{stats?.dailyStats?.reduce((acc, curr) => acc + curr.totalCount, 0) || 0}</p>
                </div>
            </div>
          </div>

          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mt-8">
            <Database className="text-primary" size={20} /> İçerik Dağılımı
          </h2>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-gray-500 font-medium">
                  <Grid size={16} className="text-blue-500" /> Kategoriler
                </span>
                <span className="font-bold text-gray-800">{stats?.totalCategories ?? 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-gray-500 font-medium">
                  <ListTree size={16} className="text-indigo-500" /> Alt Kategoriler
                </span>
                <span className="font-bold text-gray-800">{stats?.totalSubCategories ?? 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-gray-500 font-medium">
                  <MapPin size={16} className="text-emerald-500" /> Turistik Mekanlar
                </span>
                <span className="font-bold text-gray-800">{stats?.totalPlaces ?? 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-gray-500 font-medium">
                  <Utensils size={16} className="text-orange-500" /> Yeme & İçme
                </span>
                <span className="font-bold text-gray-800">{stats?.totalFoodPlaces ?? 0}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-50">
              <button
                onClick={() => navigate('/page-content')}
                className="w-full py-3 bg-gray-50 text-gray-600 rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-all"
              >
                Tüm İçerikleri Yönet
              </button>
            </div>
          </div>

          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mt-8">
            <Megaphone className="text-primary" size={20} /> Reklam Performansı (Top 5)
          </h2>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            {stats?.topPopupAds && stats.topPopupAds.length > 0 ? (
              <div className="space-y-4">
                {stats.topPopupAds.map((ad) => (
                  <div key={ad.id} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                      <img src={getImageUrl(ad.imageUrl)} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{ad.title || 'Başlıksız Reklam'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${Math.min((ad.viewCount / (stats.topPopupAds[0].viewCount || 1)) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-bold text-primary whitespace-nowrap">{ad.viewCount} İzlenme</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Henüz reklam verisi bulunmuyor.</p>
            )}
            <div className="pt-4 border-t border-gray-50">
              <button
                onClick={() => navigate('/ads')}
                className="w-full py-3 bg-gray-50 text-gray-600 rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-all"
              >
                Tüm Reklamları Yönet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedDay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-8 pb-0 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-gray-900 leading-none">Günlük Detay Raporu</h3>
                <p className="text-gray-400 font-bold mt-3 flex items-center gap-2">
                  <Calendar size={16} /> 
                  {new Date(selectedDay.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long', timeZone: 'Europe/Istanbul' })}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              {/* Total Card */}
              <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-orange-600 uppercase mb-1">Toplam Etkileşim</p>
                  <p className="text-4xl font-black text-gray-900">{selectedDay.totalCount}</p>
                </div>
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                  <Activity size={32} className="text-orange-500" />
                </div>
              </div>

              {/* Grid Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-3xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Monitor size={14} className="text-blue-500" />
                    <span className="text-[10px] font-bold text-blue-600 uppercase">Masaüstü</span>
                  </div>
                  <p className="text-2xl font-black text-gray-900">{selectedDay.webCount}</p>
                </div>
                <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-3xl">
                  <div className="flex items-center gap-2 mb-2">
                    <PhoneIcon size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Mobil Tarayıcı</span>
                  </div>
                  <p className="text-2xl font-black text-gray-900">{selectedDay.mobileCount}</p>
                </div>
                <div className="p-5 bg-purple-50/50 border border-purple-100 rounded-3xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={14} className="text-purple-500" />
                    <span className="text-[10px] font-bold text-purple-600 uppercase">Tekil Ziyaretçi</span>
                  </div>
                  <p className="text-2xl font-black text-gray-900">{selectedDay.uniqueCount}</p>
                </div>
                <div className="p-5 bg-orange-50/50 border border-orange-100 rounded-3xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Megaphone size={14} className="text-orange-500" />
                    <span className="text-[10px] font-bold text-orange-600 uppercase">Arama Motoru</span>
                  </div>
                  <p className="text-2xl font-black text-gray-900">{selectedDay.searchCount}</p>
                </div>
              </div>

              {/* Progress Visualization */}
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                    <span>Masaüstü vs Mobil</span>
                    <span>%{Math.round((selectedDay.webCount / selectedDay.totalCount) * 100) || 0} / %{Math.round((selectedDay.mobileCount / selectedDay.totalCount) * 100) || 0}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full flex overflow-hidden">
                    <div style={{ width: `${(selectedDay.webCount / selectedDay.totalCount) * 100}%` }} className="bg-blue-500 transition-all duration-1000"></div>
                    <div style={{ width: `${(selectedDay.mobileCount / selectedDay.totalCount) * 100}%` }} className="bg-emerald-500 transition-all duration-1000"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 pt-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;