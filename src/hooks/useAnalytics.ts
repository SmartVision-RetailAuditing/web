import { useState, useEffect, useCallback } from 'react';
import { analyticsService, AnalyticsDto } from '../services/analytics.service';

export const useAnalytics = () => {
  const [days, setDays]         = useState<7 | 30 | 90>(30);
  const [data, setData]         = useState<AnalyticsDto | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]       = useState('');

  const fetchAnalytics = useCallback(async (d: number) => {
    setLoading(true);
    setError('');
    try {
      const result = await analyticsService.getAnalytics(d);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Analytics verisi yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(days);
  }, [days, fetchAnalytics]);

  return { data, isLoading, error, days, setDays, refresh: () => fetchAnalytics(days) };
};