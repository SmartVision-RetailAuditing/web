import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const RequireAuth = () => {
  const token = localStorage.getItem('smartvision_token');

  // Eğer token YOKSA (kullanıcı giriş yapmamışsa), login'e zorla
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Eğer token VARSA, gitmek istediği sayfayı (Outlet) render et
  return <Outlet />;
};

export const RequireGuest = () => {
  const token = localStorage.getItem('smartvision_token');

  // Eğer token VARSA (zaten giriş yapmışsa), login sayfasını gösterme, dashboard'a at
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  // Token yoksa login sayfasını (Outlet) göster
  return <Outlet />;
};