// src/app/layout/Sidebar.tsx
// This component represents the sidebar navigation of the application.
// It includes the logo area, navigation links, and a logout button.
// The sidebar is fixed on the left side of the screen.
// It uses React Router's NavLink for navigation and lucide-react for icons.
// The active link is styled differently to indicate the current page.
// Tailwind CSS is used for styling.
// Note: Replace the logo placeholder with the actual logo image as needed.
// Example: import Logo from '../../assets/smartvision-logo.svg';
// Then use <img src={Logo} alt="Smart Vision Logo" /> in the logo area.
// Ensure that the necessary packages (react-router-dom, lucide-react, tailwindcss) are installed in your project.
// Also, make sure to adjust the paths and imports according to your project structure.
// This component is designed to be used alongside the TopBar component for a complete layout.
// Adjust the height and width as necessary to fit your design requirements.

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // useNavigate eklendi
import { 
  LayoutDashboard, 
  Store, 
  ClipboardCheck, 
  CheckSquare, 
  BarChart3, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate(); // Yönlendirme için hook'u tanımladık

  // Menü elements defined as array, easier to map through
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/stores', label: 'Stores', icon: Store },
    { path: '/audits', label: 'Audits', icon: ClipboardCheck },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  // Logout Fonksiyonu
  const handleLogout = () => {
    // 1. Tarayıcıdaki token ve rol bilgilerini sil
    localStorage.removeItem('smartvision_token');
    localStorage.removeItem('smartvision_role');
    
    // 2. Login sayfasına yönlendir
    navigate('/login');
  };


  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* 1. Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          {/* SmartVision Logo Here (smartvision-logo.svg) come, for now icon added. */}
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-lg">S</span>
          </div>
          <span>Smart Vision</span>
        </div>
      </div>

      {/* 2. Navigation Links */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                isActive
                  ? 'bg-blue-50 text-blue-600' // Active state
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' // Passive state
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* 3. Bottom Section (Logout etc.) */}
      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={handleLogout} // Fonksiyonu butona bağladık
          className="flex items-center gap-3 px-3 py-2 w-full text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;