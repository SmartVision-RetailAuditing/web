import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ClipboardList,
  ChevronLeft, ChevronRight,
  AlertCircle, TrendingUp, TrendingDown, Filter
} from 'lucide-react';
import { useAudits } from '../../hooks/useAudits';

const STATUS_OPTIONS = [
  { value: '',              label: 'All Statuses' },
  { value: 'COMPLIANT',    label: 'Compliant' },
  { value: 'WARNING',      label: 'Warning' },
  { value: 'NON_COMPLIANT',label: 'Non-Compliant' },
];

const STATUS_STYLES: Record<string, string> = {
  COMPLIANT:     'bg-green-50 text-green-700 border-green-200',
  WARNING:       'bg-yellow-50 text-yellow-700 border-yellow-200',
  NON_COMPLIANT: 'bg-red-50 text-red-700 border-red-200',
};

const STATUS_LABELS: Record<string, string> = {
  COMPLIANT:     'Compliant',
  WARNING:       'Warning',
  NON_COMPLIANT: 'Non-Compliant',
};

const TASK_TYPE_LABELS: Record<string, string> = {
  SHELF_AUDIT:          'Shelf Audit',
  PRICE_CHECK:          'Price Check',
  PLANOGRAM_COMPLIANCE: 'Planogram',
  PANORAMA:             'Panorama',
};

const getComplianceColor = (score: number) => {
  if (score >= 80) return { bar: 'bg-green-500', text: 'text-green-700' };
  if (score >= 60) return { bar: 'bg-yellow-400', text: 'text-yellow-700' };
  return { bar: 'bg-red-500', text: 'text-red-700' };
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const AuditsPage = () => {
  const navigate = useNavigate();
  const {
    audits, totalCount, totalPages,
    currentPage, setCurrentPage,
    isLoading, error,
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    refresh,
  } = useAudits();

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audits</h1>
          <p className="text-gray-500 text-sm">
            {totalCount > 0
              ? `${totalCount} audit record${totalCount > 1 ? 's' : ''}`
              : 'Field audit records'}
          </p>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by store or auditor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer min-w-[160px]"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" size={14} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
          <button onClick={refresh} className="ml-auto text-red-600 underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading audits...</div>
        ) : audits.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            {searchTerm || statusFilter
              ? 'No audits match your filters.'
              : 'No audit records found.'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wide border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Store</th>
                    <th className="px-6 py-4">Auditor / Task</th>
                    <th className="px-6 py-4">Compliance</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Issues</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {audits.map((audit) => {
                    const color = getComplianceColor(audit.complianceScore);
                    const criticalCount = audit.issues.filter(i => i.severity === 'CRITICAL').length;
                    return (
                      <tr key={audit.id} className="hover:bg-gray-50 transition-colors">

                        {/* Store */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                              <ClipboardList size={16} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{audit.storeName}</div>
                              <div className="text-xs text-gray-400">#{audit.id}</div>
                            </div>
                          </div>
                        </td>

                        {/* Auditor / Task */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">{audit.auditorName}</div>
                          <span className="inline-block mt-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">
                            {TASK_TYPE_LABELS[audit.taskType] ?? audit.taskType}
                          </span>
                        </td>

                        {/* Compliance Score */}
                        <td className="px-6 py-4">
                          <div className="w-32">
                            <div className="flex justify-between items-center text-xs mb-1">
                              <div className="flex-1 bg-gray-100 rounded-full h-1.5 mr-2">
                                <div
                                  className={`h-1.5 rounded-full ${color.bar}`}
                                  style={{ width: `${Math.min(audit.complianceScore, 100)}%` }}
                                />
                              </div>
                              <span className={`font-bold ${color.text} shrink-0`}>
                                {audit.complianceScore}%
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[audit.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                            {STATUS_LABELS[audit.status] ?? audit.status}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(audit.captureDate)}
                        </td>

                        {/* Issues */}
                        <td className="px-6 py-4">
                          {audit.issues.length === 0 ? (
                            <span className="text-xs text-gray-400">—</span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium text-gray-600">
                                {audit.issues.length}
                              </span>
                              {criticalCount > 0 && (
                                <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                                  {criticalCount} critical
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => navigate(`/audits/${audit.id}`)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-xs whitespace-nowrap"
                          >
                            View Details →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="text-sm text-gray-500">
                Page{' '}
                <span className="font-medium text-gray-900">{currentPage}</span>
                {' '}of{' '}
                <span className="font-medium text-gray-900">{totalPages}</span>
                <span className="text-gray-400 ml-2">({totalCount} total)</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={15} />
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage >= totalPages || isLoading}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuditsPage;