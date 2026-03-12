import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService, RecentAuditDto } from '../../services/dashboard.service';

const STATUS_STYLES: Record<string, string> = {
  COMPLIANT:     'text-green-700 bg-green-50 border border-green-200',
  WARNING:       'text-yellow-700 bg-yellow-50 border border-yellow-200',
  NON_COMPLIANT: 'text-red-700 bg-red-50 border border-red-200',
};
const STATUS_LABELS: Record<string, string> = {
  COMPLIANT: 'Compliant', WARNING: 'Warning', NON_COMPLIANT: 'Non-Compliant',
};
const TASK_TYPE_LABELS: Record<string, string> = {
  SHELF_AUDIT: 'Shelf Audit', PRICE_CHECK: 'Price Check',
  PANORAMA: 'Panorama', PLANOGRAM_COMPLIANCE: 'Planogram',
};

const getScoreColor = (score: number) => {
  if (score >= 80) return { bar: 'bg-green-500', text: 'text-green-700 dark:text-green-400' };
  if (score >= 60) return { bar: 'bg-yellow-400', text: 'text-yellow-700 dark:text-yellow-400' };
  return { bar: 'bg-red-500', text: 'text-red-700 dark:text-red-400' };
};

const formatTimeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const RecentAuditsTable = () => {
  const navigate = useNavigate();
  const [audits, setAudits] = useState<RecentAuditDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardService.getRecentAudits()
      .then(setAudits)
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Son Denetimler</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Son saha etkinlikleri</p>
        </div>
        <button onClick={() => navigate('/audits')} className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
          View All →
        </button>
      </div>

      {isLoading && (
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {[1,2,3,4].map(i => (
            <div key={i} className="px-6 py-4 animate-pulse flex gap-4 items-center">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/4"></div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="px-6 py-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-900/30">
          Tablo yüklenemedi: {error}
        </div>
      )}

      {!isLoading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide bg-gray-50 dark:bg-gray-800/50">
                <th className="px-6 py-3">Store</th>
                <th className="px-6 py-3">Auditor / Task</th>
                <th className="px-6 py-3">Score</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {audits.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">Henüz tamamlanmış audit yok.</td></tr>
              ) : (
                audits.map(audit => {
                  const scoreColor = getScoreColor(audit.complianceScore);
                  return (
                    <tr key={audit.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{audit.storeName}</p>
                        <p className="text-xs text-gray-400">{audit.location}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{audit.auditorName}</p>
                        <span className="text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5">
                          {TASK_TYPE_LABELS[audit.taskType] ?? audit.taskType}
                        </span>
                      </td>
                      <td className="px-6 py-4 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${scoreColor.bar}`} style={{ width: `${audit.complianceScore}%` }} />
                          </div>
                          <span className={`text-xs font-bold ${scoreColor.text} w-10 text-right`}>{audit.complianceScore}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[audit.status] ?? ''}`}>
                          {STATUS_LABELS[audit.status] ?? audit.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">{formatTimeAgo(audit.captureDate)}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => navigate(`/audits/${audit.id}`)} className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors whitespace-nowrap">
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentAuditsTable;