import { useState, useEffect, useCallback } from 'react';
import { storeService, StoreDto, PagedResult } from '../services/stores.service';
import { useDebounce } from './useDebounce';

const ITEMS_PER_PAGE = 10;

export const useStores = () => {
  const [result, setResult] = useState<PagedResult<StoreDto> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Search değişince sayfa 1'e dön
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const fetchStores = useCallback(async (page: number, search: string) => {
    try {
      setIsLoading(true);
      setError('');
      const data = await storeService.getAllStores(page, ITEMS_PER_PAGE, search || undefined);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Mağazalar yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch, fetchStores]);

  const refresh = () => fetchStores(currentPage, debouncedSearch);

  return {
    stores: result?.data ?? [],
    totalCount: result?.totalCount ?? 0,
    totalPages: result?.totalPages ?? 1,
    currentPage,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    setCurrentPage,
    refresh,
  };
};