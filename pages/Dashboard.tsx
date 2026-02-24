import React from 'react';
import { Users, Smartphone, Activity, ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardStat } from '../types';

const data = [
  { name: 'Pzt', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Sal', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Çar', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Per', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Cum', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Cmt', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Paz', uv: 3490, pv: 4300, amt: 2100 },
];

const stats: DashboardStat[] = [
  { title: 'Toplam Kullanıcı', value: '12,543', change: '+%12.5', trend: 'up', icon: Users, color: 'text-blue-500' },
  { title: 'Aktif Oturumlar', value: '854', change: '-%2.4', trend: 'down', icon: Activity, color: 'text-green-500' },
  { title: 'Uygulama İndirme', value: '45,231', change: '+%8.2', trend: 'up', icon: Smartphone, color: 'text-primary' },
  { title: 'Ort. Kullanım', value: '14dk', change: '+%1.8', trend: 'up', icon: Clock, color: 'text-purple-500' },
];

const Dashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Ana Sayfa</h1>
        <div className="text-sm text-gray-500">Son Güncelleme: Bugün, 14:30</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className={`flex items-center text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {stat.trend === 'up' ? <ArrowUp size={16} className="mr-1" /> : <ArrowDown size={16} className="mr-1" />}
              <span className="font-medium">{stat.change}</span>
              <span className="text-gray-400 ml-2 font-normal">Geçen haftaya göre</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Haftalık Aktivite</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6c2f" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ff6c2f" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                  itemStyle={{color: '#374151'}}
                />
                <Area type="monotone" dataKey="uv" stroke="#ff6c2f" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Son İşlemler</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                  US
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Yeni Kullanıcı Kaydı</p>
                  <p className="text-xs text-gray-500">2 dakika önce</p>
                </div>
                <div className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                  Tamamlandı
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm text-primary font-medium border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors">
            Tümünü Gör
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;