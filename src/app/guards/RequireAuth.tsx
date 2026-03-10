import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// ─── Token var mı + expire olmuş mu? ─────────────────────────────────────────
// useAuth içinde expire kontrolü yapılıyor — token bozuk/expire ise isLoggedIn=false döner
export const RequireAuth = () => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// ─── Zaten giriş yapmışsa login'i gösterme ────────────────────────────────────
export const RequireGuest = () => {
  const { isLoggedIn, isAdmin } = useAuth();

  if (isLoggedIn) {
    // Giriş yapılmışsa role'e göre yönlendir
    return <Navigate to={isAdmin ? '/users' : '/dashboard'} replace />;
  }

  return <Outlet />;
};

// ─── Belirli bir role'e göre koru ─────────────────────────────────────────────
// Kullanım: <RequireRole roles={['ADMIN']} />
interface RequireRoleProps {
  roles: string[];
}

export const RequireRole: React.FC<RequireRoleProps> = ({ roles }) => {
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(role)) {
    // Giriş yapmış ama yetkisi yok → dashboard'a at
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};