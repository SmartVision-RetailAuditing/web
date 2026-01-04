import React from 'react';
import KpiCards from '../../components/dashboard/KpiCards';
import RecentAuditsTable from '../../components/dashboard/RecentAuditsTable';
import StoreLocationsMap from '../../components/dashboard/StoreLocationsMap';
import FlaggedStoresList from '../../components/dashboard/FlaggedStoresList'; // Yeni import

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* Başlık Alanı */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Monitor compliance performance across all retail locations</p>
      </div>
      
      {/* 1. KPI Kartları */}
      <KpiCards />

      {/* 2. Orta Bölüm: Harita ve Liste */}
      {/* lg:grid-cols-3 demek; büyük ekranda harita 2 birim, liste 1 birim yer kaplasın */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Taraf: Harita (Geniş) */}
        <div className="lg:col-span-2">
            <StoreLocationsMap />
        </div>
        
        {/* Sağ Taraf: Flagged Stores (Dar) */}
        <div>
            <FlaggedStoresList />
        </div>
      </div>

      {/* 3. Alt Bölüm: Tablo */}
      <RecentAuditsTable />
    </div>
  );
};

export default DashboardPage;