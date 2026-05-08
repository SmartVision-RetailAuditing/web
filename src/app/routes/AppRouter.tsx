import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import LoginPage from '../../pages/auth/LoginPage';
import DashboardPage from '../../pages/dashboard/DashboardPage';
import StoresPage from '../../pages/stores/StoresPage';
import StoreDetailPage from '../../pages/stores/StoreDetailPage';
import AuditsPage from '../../pages/audits/AuditsPage';
import AuditDetailPage from '../../pages/audits/AuditDetailPage';
import TasksPage from '../../pages/tasks/TasksPage';
import TaskDetailPage from '../../pages/tasks/TaskDetailPage';
import UsersPage from '../../pages/admin/users/UsersPage';
import UserDetailPage from '../../pages/admin/users/UserDetailPage';
import { RequireAuth, RequireGuest, RequireRole } from '../guards/RequireAuth';
import AnalyticsPage from '../../pages/analytics/AnalyticsPage';
import ProfilePage from '../../pages/profile/ProfilePage';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Misafir rotaları — giriş yapmışsa dashboard/users'a yönlendir ── */}
        <Route element={<RequireGuest />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* ── Korumalı rotalar — giriş zorunlu ── */}
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>

            {/* Kök → dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Genel sayfalar — ADMIN + SUPERVISOR */}
            <Route path="/dashboard"    element={<DashboardPage />} />
            <Route path="/stores"       element={<StoresPage />} />
            <Route path="/stores/:id"   element={<StoreDetailPage />} />
            <Route path="/audits"       element={<AuditsPage />} />
            <Route path="/audits/:id"   element={<AuditDetailPage />} />
            <Route path="/tasks"        element={<TasksPage />} />
            <Route path="/tasks/:id"    element={<TaskDetailPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path='/profile' element={<ProfilePage />} />

            {/* Admin sayfaları — sadece ADMIN */}
            <Route element={<RequireRole roles={['ADMIN']} />}>
              <Route path="/users"      element={<UsersPage />} />
              <Route path="/users/:id"  element={<UserDetailPage />} />
            </Route>

          </Route>
        </Route>

        {/* Tanımsız rota → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;