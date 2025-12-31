// src/app/layout/AppLayout.tsx
// This component defines the overall layout of the application,
// including a fixed sidebar, a top navigation bar, and a main content area
// where different pages are rendered based on routing.

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const AppLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Left Sidebar - Fixed */}
      <Sidebar />

      {/* Main Content Area */}
      {/* The ml-64 class leaves space on the left equal to the width of the sidebar. */}
      <div className="flex-1 flex flex-col ml-64 transition-all duration-300">
        
        {/* Top Bar */}
        <TopBar />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 scroll-smooth">
          {/* Outlet: React Router's child routes are rendered here */}
          <div className="container mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;