// src/app/layout/TopBar.tsx
// This component represents the top navigation bar of the application.
// It includes system status, action icons, and user profile information.

import React from 'react';
import { Bell, Search, Moon } from 'lucide-react';

const TopBar = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Sol: Sistem Durumu */}
      <div className="flex items-center gap-4">
        {/* Screenshot'taki System Operational Badge */}
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-green-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          System Operational
        </div>
      </div>

      {/* Sağ: Aksiyonlar ve Profil */}
      <div className="flex items-center gap-6">
        {/* Arama ve İkonlar */}
        <div className="flex items-center gap-4 text-gray-400">
            <button className="hover:text-gray-600 transition-colors">
                <Search size={20} />
            </button>
            <button className="hover:text-gray-600 transition-colors">
                <Moon size={20} />
            </button>
            <button className="relative hover:text-gray-600 transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1 -right-0.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
        </div>
        
        <div className="h-6 w-px bg-gray-200"></div>

        {/* Profil Alanı */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">Selcuk Sayin</p>
            <p className="text-xs text-gray-500">Supervisor</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
            SJ
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;