import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Store, ClipboardCheck,
  CheckSquare, BarChart3, LogOut,
  ShieldCheck, Users, ChevronDown, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// ─── Nav item tipleri ─────────────────────────────────────────────────────────
interface NavItem {
  path:  string;
  label: string;
  icon:  React.ElementType;
}

interface NavGroup {
  label:    string;
  icon:     React.ElementType;
  children: NavItem[];
}

// ─── Menü tanımları ───────────────────────────────────────────────────────────
const MAIN_MENU: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/stores',    label: 'Stores',    icon: Store },
  { path: '/audits',    label: 'Audits',    icon: ClipboardCheck },
  { path: '/tasks',     label: 'Tasks',     icon: CheckSquare },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

// Sadece ADMIN'e görünür
const ADMIN_GROUP: NavGroup = {
  label: 'Admin',
  icon:  ShieldCheck,
  children: [
    { path: '/users', label: 'User Management', icon: Users },
  ],
};

// ─── NavLink item bileşeni ────────────────────────────────────────────────────
const NavItem: React.FC<{ item: NavItem }> = ({ item }) => (
  <NavLink
    to={item.path}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
        isActive
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`
    }
  >
    <item.icon size={20} />
    {item.label}
  </NavLink>
);

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [adminOpen, setAdminOpen] = useState(true); // varsayılan açık

  const handleLogout = () => {
    localStorage.removeItem('smartvision_token');
    localStorage.removeItem('smartvision_role');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-30">

      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-lg">S</span>
          </div>
          <span>Smart Vision</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">

        {/* Ana menü */}
        {MAIN_MENU.map(item => (
          <NavItem key={item.path} item={item} />
        ))}

        {/* Admin grubu — sadece ADMIN rolünde görünür */}
        {isAdmin && (
          <div className="pt-4">
            {/* Grup başlığı */}
            <button
              onClick={() => setAdminOpen(v => !v)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <ADMIN_GROUP.icon size={14} />
                {ADMIN_GROUP.label}
              </div>
              {adminOpen
                ? <ChevronDown size={13} />
                : <ChevronRight size={13} />
              }
            </button>

            {/* Grup içeriği — collapse/expand */}
            {adminOpen && (
              <div className="mt-1 space-y-1 pl-2 border-l-2 border-blue-50 ml-3">
                {ADMIN_GROUP.children.map(item => (
                  <NavItem key={item.path} item={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100 shrink-0">
        <button
          onClick={handleLogout}
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