import React, { useEffect, useState } from 'react';
import { Store, Activity, ClipboardList, AlertOctagon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { dashboardService, DashboardKpiWithTrends } from '../../services/dashboard.service';

const KpiCards = () => {
  const [kpis, setKpis] = useState<DashboardKpiWithTrends | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const data = await dashboardService.getKpis();
        setKpis(data);
      } catch (err: any) {
        console.error('KPI fetch error:', err.message);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchKpis();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-32 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-3 bg-gray-100 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
        <strong>KPI yüklenemedi:</strong> {error}
      </div>
    );
  }

  if (!kpis) return null;

  const complianceGood = kpis.averageCompliance >= 80;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

      {/* 1. Total Stores */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <p className="text-sm font-medium text-gray-500">Total Stores</p>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Store size={20} />
          </div>
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">{kpis.totalStores}</h3>
        <div className="mt-auto flex items-center text-xs text-gray-500 gap-1.5">
          <Minus size={14} />
          <span>{kpis.trends.storesTrend}</span>
        </div>
      </div>

      {/* 2. Overall Compliance */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <p className="text-sm font-medium text-gray-500">Overall Compliance</p>
          <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
            <Activity size={20} />
          </div>
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">{kpis.averageCompliance}%</h3>
        <div className={`mt-auto flex items-center text-xs font-medium gap-1 ${complianceGood ? 'text-green-600' : 'text-red-500'}`}>
          {complianceGood ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{kpis.trends.complianceTrend}</span>
        </div>
      </div>

      {/* 3. Pending Tasks */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <p className="text-sm font-medium text-gray-500">Pending Tasks</p>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <ClipboardList size={20} />
          </div>
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">{kpis.pendingTasks}</h3>
        <div className={`mt-auto flex items-center text-xs font-medium gap-1 ${kpis.pendingTasks === 0 ? 'text-gray-400' : 'text-purple-600'}`}>
          {kpis.pendingTasks === 0 ? <Minus size={14} /> : <TrendingUp size={14} />}
          <span>{kpis.trends.tasksTrend}</span>
        </div>
      </div>

      {/* 4. Critical Issues */}
      <div className="bg-white p-6 rounded-2xl border border-red-50 shadow-sm flex flex-col hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16"></div>
        <div className="flex justify-between items-start mb-3 relative z-10">
          <p className="text-sm font-medium text-red-600">Critical Issues</p>
          <div className={`p-2.5 bg-red-100 text-red-600 rounded-xl ${kpis.criticalIssues > 0 ? 'animate-pulse' : ''}`}>
            <AlertOctagon size={20} />
          </div>
        </div>
        <h3 className="text-3xl font-bold text-red-700 mb-2 relative z-10">{kpis.criticalIssues}</h3>
        <div className={`mt-auto flex items-center text-xs font-medium gap-1 relative z-10 ${kpis.criticalIssues === 0 ? 'text-gray-400' : 'text-red-600'}`}>
          {kpis.criticalIssues === 0 ? <Minus size={14} /> : <TrendingUp size={14} />}
          <span>{kpis.trends.issuesTrend}</span>
        </div>
      </div>

    </div>
  );
};

export default KpiCards;