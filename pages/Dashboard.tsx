import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Smartphone,
  Activity,
  ArrowUp,
  Clock,
  Mail,
  Grid,
  ListTree,
  MapPin,
  Utensils,
  Eye,
  ExternalLink,
  PlusCircle,
  Database,
  Megaphone
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

        {/* Content Breakdown */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
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
    </div>
  );
};

export default Dashboard;