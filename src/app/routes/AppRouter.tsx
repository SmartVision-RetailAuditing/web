// src/app/routes/AppRouter.tsx
// Main application router configuration
// Using React Router v6 for route management
// Wraps the application layout around the routed pages
// Redirects root path to /dashboard by default
// Imports necessary components and pages
// for routing and layout structure

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import DashboardPage from '../../pages/dashboard/DashboardPage';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* Other pages will go here  */}
          <Route path="/stores" element={<div>Stores Page</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;