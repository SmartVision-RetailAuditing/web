import React from 'react';
import { Store, CheckCircle2, AlertTriangle, ClipboardList } from 'lucide-react';

// 1. Type Definitions (for TypeScript)
interface StatCardProps {
  title: string;
  value: string | number;
  trend: string;
  trendUp?: boolean; // To determine the trending color (green/red)
  icon: React.ElementType;
  color: 'blue' | 'green' | 'red' | 'purple'; // Thema colour of the cart
}

// 2. Single Card Component (StatCard)
const StatCard = ({ title, value, trend, trendUp, icon: Icon, color }: StatCardProps) => {
  
  // The object that manages color themes.
  const colors = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
    green: { bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-green-100' },
    red: { bg: 'bg-red-50', text: 'text-red-600', iconBg: 'bg-red-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100' },
  };

  const theme = colors[color];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${theme.iconBg} ${theme.text}`}>
          <Icon size={24} />
        </div>
      </div>
      
      <div className="mt-4 flex items-center text-sm">
        <span className={`font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trend}
        </span>
        {/* A trend description can be added; for now, we are only showing the trend value. */}
      </div>
    </div>
  );
};

// 3. KPI Cards Component
const KpiCards = () => {
  const stats = [
    {
      title: 'Total Stores',
      value: '1,284',
      trend: '+12 this month',
      trendUp: true,
      icon: Store,
      color: 'blue' as const,
    },
    {
      title: 'Overall Compliance Rate',
      value: '87.3%',
      trend: '+2.4% from last week',
      trendUp: true,
      icon: CheckCircle2,
      color: 'green' as const,
    },
    {
      title: 'Non-Compliant Stores',
      value: '163',
      trend: '-8 from yesterday',
      trendUp: false, // Red color for negative trend
      icon: AlertTriangle,
      color: 'red' as const,
    },
    {
      title: "Today's Audits",
      value: '47',
      trend: '12 pending review',
      trendUp: true,
      icon: ClipboardList,
      color: 'purple' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default KpiCards;