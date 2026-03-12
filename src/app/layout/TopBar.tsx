import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, ChevronDown, User, LogOut, CheckCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useNotification, NOTIFICATION_META } from '../../hooks/useNotification';
import { authService } from '../../services/auth.service';
import { getRoleLabel } from '../../services/users.service';

// ─── Relative time helper ─────────────────────────────────────────────────────
const relativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min  = Math.floor(diff / 60_000);
  const hr   = Math.floor(diff / 3_600_000);
  const day  = Math.floor(diff / 86_400_000);
  if (min < 1)  return 'Just now';
  if (min < 60) return `${min}m ago`;
  if (hr  < 24) return `${hr}h ago`;
  return `${day}d ago`;
};

// ─── Click outside hook ───────────────────────────────────────────────────────
const useClickOutside = (ref: React.RefObject<HTMLElement>, cb: () => void) => {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, cb]);
};

// ─── TopBar ───────────────────────────────────────────────────────────────────
const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const { fullName, initials, role } = useAuth();
  const { isDark, toggleTheme }      = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  const [notifOpen,      setNotifOpen]      = useState(false);
  const [profileOpen,    setProfileOpen]    = useState(false);


  const notifRef   = useRef<HTMLDivElement>(null!);
  const profileRef = useRef<HTMLDivElement>(null!);

  useClickOutside(notifRef,   () => setNotifOpen(false));
  useClickOutside(profileRef, () => setProfileOpen(false));

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleNotifClick = (id: string, navigateTo?: string) => {
    markAsRead(id);
    setNotifOpen(false);
    if (navigateTo) navigate(navigateTo);
  };

  return (
    <>
      <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-end px-6 gap-3 sticky top-0 z-30 shadow-sm">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}
            className="relative p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-50">

              {/* Notif header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-xs font-bold rounded-full">{unreadCount}</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                    <CheckCheck size={13} /> Mark all read
                  </button>
                )}
              </div>

              {/* Notif list */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center text-gray-400 text-sm">No notifications</div>
                ) : (
                  notifications.map(n => {
                    const meta = NOTIFICATION_META[n.type] ?? { color: 'text-gray-500', bg: 'bg-gray-50' };
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotifClick(n.id, n.navigateTo)}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800 cursor-pointer transition-colors last:border-0
                          ${n.isRead
                            ? 'hover:bg-gray-50 dark:hover:bg-gray-800'
                            : 'bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                          }`}
                      >
                        {/* Tip ikonu */}
                        <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${meta.bg}`}>
                          <Bell size={13} className={meta.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold mb-0.5 ${n.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{n.message}</p>
                          <p className="text-[11px] text-gray-400 mt-1">{relativeTime(n.createdAt)}</p>
                        </div>
                        {!n.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400 select-none">
              {initials || '?'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{fullName || 'User'}</p>
              <p className="text-xs text-gray-400 leading-tight">{getRoleLabel(role)}</p>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-52 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-50">

              {/* Mini profil */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{fullName}</p>
                <p className="text-xs text-gray-400 truncate">{getRoleLabel(role)}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <User size={15} className="text-gray-400" />
                  View Profile
                </button>

                <div className="border-t border-gray-100 dark:border-gray-800 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

      </header>
    </>
  );
};

export default TopBar;