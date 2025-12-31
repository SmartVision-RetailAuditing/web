// src/pages/dashboard/DashboardPage.tsx
// Basic Dashboard page for testing the navbar and sidebar layout 
import React from 'react';

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <p className="text-gray-600">
          The layout has been successfully installed! The left menu and top bar are working. 
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;