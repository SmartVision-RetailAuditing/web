import { useState, useEffect, useCallback } from 'react';
import { userService, UserDto, PagedResult } from '../services/users.service';
import { useDebounce } from './useDebounce';

const ITEMS_PER_PAGE = 10;

export const useUsers = () => {
  const [result, setResult]         = useState<PagedResult<UserDto> | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState(''); // '' | 'ADMIN' | 'SUPERVISOR' | 'FIELD_WORKER'

  const debouncedSearch = useDebounce(searchTerm, 400);

  // Filtre/search değişince sayfa 1'e dön
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, roleFilter]);

  const fetchUsers = useCallback(async (
    page: number,
    search: string,
    role: string,
  ) => {
    try {
      setIsLoading(true);
      setError('');
      const data = await userService.getAllUsers(
        page,
        ITEMS_PER_PAGE,
        search || undefined,
        role  || undefined,
      );
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Kullanıcı listesi yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(currentPage, debouncedSearch, roleFilter);
  }, [currentPage, debouncedSearch, roleFilter, fetchUsers]);

  const refresh = useCallback(() => {
    fetchUsers(currentPage, debouncedSearch, roleFilter);
  }, [currentPage, debouncedSearch, roleFilter, fetchUsers]);

  return {
    users:        result?.data ?? [],
    totalCount:   result?.totalCount ?? 0,
    totalPages:   result?.totalPages ?? 1,
    currentPage,
    isLoading,
    error,
    setCurrentPage,

    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,

    refresh,
  };
};