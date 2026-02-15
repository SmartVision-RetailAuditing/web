import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import DashboardPage from '../../pages/dashboard/DashboardPage';
import LoginPage from '../../pages/auth/LoginPage';
import { RequireAuth, RequireGuest } from '../guards/RequireRole'; // Guard'ları ekledik

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* SADECE GİRİŞ YAPMAMIŞ KULLANICILAR (Misafirler) İÇİN */}
        <Route element={<RequireGuest />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* SADECE GİRİŞ YAPMIŞ KULLANICILAR İÇİN (Korumalı Alan) */}
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            {/* Kök dizine (/) geleni direkt dashboard'a at */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* İleride yapacağımız diğer sayfalar da bu bloğun içine eklenecek */}
            {/* <Route path="/stores" element={<StoresPage />} /> */}
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;