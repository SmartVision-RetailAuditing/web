import { useState, useEffect, useCallback } from 'react';
import { auditService } from '../services/audits.service';
import type { AuditDto, PagedResult } from '../services/audits.service'
import { useDebounce } from './useDebounce';

const ITEMS_PER_PAGE = 10;

export const useAudits = () => {
  const [result, setResult] = useState<PagedResult<AuditDto> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' | 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT'
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Search veya status değişince sayfa 1'e dön
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  const fetchAudits = useCallback(async (page: number, search: string, status: string) => {
    try {
      setIsLoading(true);
      setError('');
      const data = await auditService.getAllAudits(
        page,
        ITEMS_PER_PAGE,
        search || undefined,
        status || undefined,
      );
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Denetimler yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAudits(currentPage, debouncedSearch, statusFilter);
  }, [currentPage, debouncedSearch, statusFilter, fetchAudits]);

  const refresh = () => fetchAudits(currentPage, debouncedSearch, statusFilter);

  return {
    audits: result?.data ?? [],
    totalCount: result?.totalCount ?? 0,
    totalPages: result?.totalPages ?? 1,
    currentPage,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    setCurrentPage,
    refresh,
  };
};