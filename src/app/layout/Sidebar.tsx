import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Store, ClipboardList, CheckSquare,
  Users, BarChart2, ChevronDown, ChevronRight, Menu, X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/icons/smartvision-avatar-512.png';

interface NavItem {
  label: string;
  path:  string;
  icon:  React.ReactNode;
}

const MAIN_MENU: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Stores',    path: '/stores',    icon: <Store size={18} />            },
  { label: 'Audits',    path: '/audits',    icon: <ClipboardList size={18} />    },
  { label: 'Tasks',     path: '/tasks',     icon: <CheckSquare size={18} />      },
  { label: 'Analytics', path: '/analytics', icon: <BarChart2 size={18} />        },
];

const ADMIN_GROUP: NavItem[] = [
  { label: 'Users', path: '/users', icon: <Users size={18} /> },
];

const linkClass = (isActive: boolean) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
  }`;

const Sidebar: React.FC = () => {
  const { isAdmin }               = useAuth();
  const location                  = useLocation();
  const [adminOpen, setAdminOpen] = useState(
    ADMIN_GROUP.some(item => location.pathname.startsWith(item.path))
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="SmartVision" className="w-8 h-8 rounded-lg" />
          <span className="font-bold text-gray-900 dark:text-white text-lg">SmartVision</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {MAIN_MENU.map(item => (
          <NavLink key={item.path} to={item.path} end={item.path === '/dashboard'}
            className={({ isActive }) => linkClass(isActive)}
            onClick={() => setMobileOpen(false)}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        {isAdmin && (
          <div className="pt-2">
            <button
              onClick={() => setAdminOpen(v => !v)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <span>Administration</span>
              {adminOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {adminOpen && (
              <div className="space-y-1 mt-1">
                {ADMIN_GROUP.map(item => (
                  <NavLink key={item.path} to={item.path}
                    className={({ isActive }) => linkClass(isActive)}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
        <p className="text-xs text-gray-400">SmartVision v1.0</p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-60 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </aside>

      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md text-gray-700 dark:text-gray-300"
      >
        <Menu size={20} />
      </button>

      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)} />
          <aside className="lg:hidden fixed left-0 top-0 h-full w-60 z-50 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 shadow-xl">
            <button onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;