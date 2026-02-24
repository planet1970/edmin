import React from 'react';
import { Bell, Search, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TopBar: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-40 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-primary lg:hidden">
          <Menu size={24} />
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Ara..."
            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-primary w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-700">{user?.name || user?.email || 'Admin'}</p>
            <p className="text-xs text-gray-500">{user?.role || 'Yönetici'}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-primary rounded-lg transition-colors"
          >
            <LogOut size={16} /> Çıkış
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;