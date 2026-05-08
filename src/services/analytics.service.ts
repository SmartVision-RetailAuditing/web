const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = `${BASE_URL}/Analytics`;

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('smartvision_token') ?? ''}`,
});

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface AnalyticsKpiDto {
  avgCompliance:   number;
  totalAudits:     number;
  compliantStores: number;
  totalIssues:     number;
}

export interface IssueDistDto {
  issueType: string;
  label:     string;
  count:     number;
}

export interface ChainMetricsDto {
  chainName:     string;
  avgCompliance: number;
  totalAudits:   number;
  trend:         number;
  status:        string;
}

export interface AnalyticsDto {
  kpi:               AnalyticsKpiDto;
  issueDistribution: IssueDistDto[];
  chainMetrics:      ChainMetricsDto[];
}

// ─── Pie chart renkleri ───────────────────────────────────────────────────────
export const ISSUE_COLORS: Record<string, string> = {
  PLANOGRAM_MISMATCH:   '#ef4444', // red
  MISSING_PRODUCT:      '#f97316', // orange
  WRONG_PRICE:          '#eab308', // yellow
  LOW_SHELF_SHARE:      '#8b5cf6', // purple
  WRONG_SHELF_POSITION: '#3b82f6', // blue
};

// ─── Status renk helper ───────────────────────────────────────────────────────
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Excellent':       return 'bg-green-50 text-green-700 border-green-200';
    case 'Good':            return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'Needs Attention': return 'bg-red-50 text-red-700 border-red-200';
    default:                return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

// ─── Service ─────────────────────────────────────────────────────────────────
export const analyticsService = {
  getAnalytics: async (days: number = 30): Promise<AnalyticsDto> => {
    const response = await fetch(`${API_URL}?days=${days}`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Analytics data could not be loaded.');
    return response.json();
  },
};