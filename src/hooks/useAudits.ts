import { useState, useEffect, useCallback } from 'react';
import { auditService } from '../services/audits.service';
import type { AuditDto, PagedResult } from '../services/audits.service';
import { useDebounce } from './useDebounce';

const ITEMS_PER_PAGE = 10;

export const useAudits = (initialStoreId?: number) => {  // ← sadece bu satır değişti
  const [result, setResult] = useState<PagedResult<AuditDto> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);

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
        initialStoreId,        // ← sadece bu satır eklendi
      );
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Denetimler yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, [initialStoreId]);          // ← dependency'e eklendi

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