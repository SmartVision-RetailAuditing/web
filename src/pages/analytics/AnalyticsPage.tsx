import React from 'react';
import { TrendingUp, ClipboardList, Store, AlertTriangle, TrendingDown, AlertCircle } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useAnalytics } from '../../hooks/useAnalytics';
import { ISSUE_COLORS, getStatusColor } from '../../services/analytics.service';

const KpiCard: React.FC<{
  icon: React.ReactNode; label: string; value: string | number; color: string; darkColor: string; loading: boolean;
}> = ({ icon, label, value, color, darkColor, loading }) => (
  <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color} ${darkColor}`}>{icon}</div>
    <div>
      <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
        {loading ? <span className="text-gray-200 dark:text-gray-700 animate-pulse">—</span> : value}
      </p>
    </div>
  </div>
);

const complianceBarColor = (score: number) =>
  score >= 90 ? '#22c55e' : score >= 75 ? '#eab308' : '#ef4444';

const AnalyticsPage = () => {
  const { data, isLoading, error, days, setDays, refresh } = useAnalytics();
  const DAY_OPTIONS: (7 | 30 | 90)[] = [7, 30, 90];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Comprehensive insights into compliance performance and trends</p>
        </div>
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-1 shadow-sm">
          {DAY_OPTIONS.map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${days === d ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
          <AlertCircle size={18} className="shrink-0" />{error}
          <button onClick={refresh} className="ml-auto text-red-600 underline hover:no-underline">Retry</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard icon={<TrendingUp size={20} className="text-green-600" />} label="Avg Compliance" value={data ? `${data.kpi.avgCompliance}%` : '—'} color="bg-green-50" darkColor="dark:bg-green-900/30" loading={isLoading} />
        <KpiCard icon={<ClipboardList size={20} className="text-blue-600" />} label="Total Audits" value={data?.kpi.totalAudits ?? '—'} color="bg-blue-50" darkColor="dark:bg-blue-900/30" loading={isLoading} />
        <KpiCard icon={<Store size={20} className="text-purple-600" />} label="Compliant Stores" value={data?.kpi.compliantStores ?? '—'} color="bg-purple-50" darkColor="dark:bg-purple-900/30" loading={isLoading} />
        <KpiCard icon={<AlertTriangle size={20} className="text-red-600" />} label="Total Issues" value={data?.kpi.totalIssues ?? '—'} color="bg-red-50" darkColor="dark:bg-red-900/30" loading={isLoading} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Issue Distribution</h3>
          <p className="text-xs text-gray-400 mb-4">Breakdown by issue type</p>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-gray-300 text-sm">Loading...</div>
          ) : !data?.issueDistribution.length ? (
            <div className="h-64 flex items-center justify-center text-gray-300 text-sm">No issues in this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data.issueDistribution} dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3}>
                  {data.issueDistribution.map((entry) => (
                    <Cell key={entry.issueType} fill={ISSUE_COLORS[entry.issueType] ?? '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}/>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Store Chain Performance</h3>
          <p className="text-xs text-gray-400 mb-4">Average compliance score by chain</p>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-gray-300 text-sm">Loading...</div>
          ) : !data?.chainMetrics.length ? (
            <div className="h-64 flex items-center justify-center text-gray-300 text-sm">No data in this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.chainMetrics} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="chainName" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value}%`, 'Compliance']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}/>
                <Bar dataKey="avgCompliance" name="Compliance %" radius={[4, 4, 0, 0]}>
                  {data.chainMetrics.map((entry) => (
                    <Cell key={entry.chainName} fill={complianceBarColor(entry.avgCompliance)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">Detailed Store Chain Metrics</h3>
        </div>
        {isLoading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Loading...</div>
        ) : !data?.chainMetrics.length ? (
          <div className="p-10 text-center text-gray-400 text-sm">No data available for this period.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4">Store Chain</th>
                  <th className="px-6 py-4">Avg Compliance</th>
                  <th className="px-6 py-4">Total Audits</th>
                  <th className="px-6 py-4">Trend</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {data.chainMetrics.map((chain) => (
                  <tr key={chain.chainName} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{chain.chainName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white w-10 shrink-0">{chain.avgCompliance}%</span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 max-w-[160px]">
                          <div className="h-2 rounded-full transition-all" style={{ width: `${chain.avgCompliance}%`, backgroundColor: complianceBarColor(chain.avgCompliance) }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{chain.totalAudits}</td>
                    <td className="px-6 py-4">
                      {chain.trend === 0 ? (
                        <span className="text-gray-400 text-sm">—</span>
                      ) : chain.trend > 0 ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium"><TrendingUp size={14} />+{chain.trend}%</span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500 text-sm font-medium"><TrendingDown size={14} />{chain.trend}%</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(chain.status)}`}>{chain.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;