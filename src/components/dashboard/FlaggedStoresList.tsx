import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { dashboardService, RecentIssueDto } from '../../services/dashboard.service';

const SEVERITY_STYLES = {
  CRITICAL: {
    badge:  'text-red-700 bg-red-50 border border-red-200',
    border: 'hover:border-l-red-500',
  },
  MEDIUM: {
    badge:  'text-yellow-700 bg-yellow-50 border border-yellow-200',
    border: 'hover:border-l-yellow-400',
  },
  LOW: {
    badge:  'text-blue-700 bg-blue-50 border border-blue-200',
    border: 'hover:border-l-blue-400',
  },
};

const ISSUE_TYPE_LABELS: Record<string, string> = {
  MISSING_PRODUCT:     'Eksik Ürün',
  WRONG_PRICE:         'Yanlış Fiyat',
  LOW_SHELF_SHARE:     'Düşük Raf Payı',
  WRONG_SHELF_POSITION:'Yanlış Konum',
  PLANOGRAM_MISMATCH:  'Planogram İhlali',
};

const formatTimeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60)   return `${minutes} dakika önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)     return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
};

const FlaggedStoresList = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<RecentIssueDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardService.getRecentIssues()
      .then(data => {
        // LOW severity'yi filtrele
        setIssues(data.filter(i => i.severity !== 'LOW'));
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col min-h-[400px]">
        <div className="mb-4">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse space-y-2 pb-4 border-b border-gray-50">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-100 rounded w-3/4"></div>
              <div className="h-3 bg-gray-100 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
          Liste yüklenemedi: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full max-h-[560px]">

      {/* Başlık */}
      <div className="mb-4 shrink-0">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          Recently Flagged
          {issues.length > 0 && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </h2>
        <p className="text-sm text-gray-500">Attention needed</p>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto space-y-1 -mr-1 pr-1">
        {issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
            <AlertTriangle size={28} className="text-gray-300" />
            <p className="text-sm">Bekleyen kritik hata yok.</p>
          </div>
        ) : (
          issues.map(issue => {
            const styles = SEVERITY_STYLES[issue.severity] ?? SEVERITY_STYLES.LOW;
            return (
              <div
                key={issue.id}
                onClick={() => navigate(`/audits/${issue.auditId}`)}
                className={`
                  group relative pl-3 border-l-2 border-transparent
                  ${styles.border}
                  transition-all cursor-pointer
                  rounded-r-lg hover:bg-gray-50 p-3
                `}
              >
                {/* Üst satır: mağaza adı + severity badge */}
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors pr-2">
                    {issue.storeName}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${styles.badge}`}>
                    {issue.severity}
                  </span>
                </div>

                {/* Lokasyon */}
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-1.5">
                  <MapPin size={11} />
                  <span>{issue.location}</span>
                </div>

                {/* Issue type etiketi */}
                <span className="inline-block text-[10px] font-medium text-gray-500 bg-gray-100 rounded px-1.5 py-0.5 mb-1.5">
                  {ISSUE_TYPE_LABELS[issue.issueType] ?? issue.issueType}
                </span>

                {/* Açıklama */}
                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                  {issue.description}
                </p>

                {/* Alt satır: zaman + ok */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={11} />
                    <span>{formatTimeAgo(issue.captureDate)}</span>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {issues.length > 0 && (
        <div className="pt-3 mt-2 border-t border-gray-100 shrink-0 text-center">
          <button
            onClick={() => navigate('/audits')}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            View All Issues →
          </button>
        </div>
      )}
    </div>
  );
};

export default FlaggedStoresList;