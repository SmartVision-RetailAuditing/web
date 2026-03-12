import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const AppLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">

      {/* Sidebar — sticky, normal flow */}
      <Sidebar />

      {/* Main Content — flex-1 sidebar'ın yanına oturur, ml gerekmez */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 scroll-smooth">
          <Outlet />
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
            fontSize: '14px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </div>
  );
};

export default AppLayout;