import { useState, useEffect, useCallback } from 'react';
import { taskService, TaskDto, TaskStatsDto, PagedResult } from '../services/tasks.service';
import { useDebounce } from './useDebounce';

const ITEMS_PER_PAGE = 10;

export const useTasks = () => {
  const [result, setResult]     = useState<PagedResult<TaskDto> | null>(null);
  const [stats, setStats]       = useState<TaskStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError]       = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [searchTerm, setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter]     = useState('');   // '' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'UNASSIGNED'
  const [priorityFilter, setPriorityFilter] = useState('');   // '' | 'LOW' | 'MEDIUM' | 'HIGH'
  const [taskTypeFilter, setTaskTypeFilter] = useState('');   // '' | 'SHELF_AUDIT' | ...

  const debouncedSearch = useDebounce(searchTerm, 400);

  // Herhangi bir filtre/search değişince sayfa 1'e dön
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, priorityFilter, taskTypeFilter]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await taskService.getTaskStats();
      setStats(data);
    } catch {
      // stats hatası ana listeyi engellemesin
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ── Task List ──────────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async (
    page: number,
    search: string,
    status: string,
    priority: string,
    taskType: string,
  ) => {
    try {
      setIsLoading(true);
      setError('');

      // UNASSIGNED frontend-only filtre — backend'e status olarak gönderilmez
      const backendStatus = status === 'UNASSIGNED' ? undefined : status || undefined;

      const data = await taskService.getAllTasks(
        page,
        ITEMS_PER_PAGE,
        search || undefined,
        backendStatus,
        priority || undefined,
        taskType || undefined,
      );

      // UNASSIGNED: client-side filtre — assigneeId === 0 veya assigneeName boş
      if (status === 'UNASSIGNED') {
        const filtered = data.data.filter(
          t => !t.assigneeId || t.assigneeName === '' || t.assigneeName === null
        );
        setResult({ ...data, data: filtered, totalCount: filtered.length });
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message || 'Task listesi yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(currentPage, debouncedSearch, statusFilter, priorityFilter, taskTypeFilter);
  }, [currentPage, debouncedSearch, statusFilter, priorityFilter, taskTypeFilter, fetchTasks]);

  const refresh = useCallback(() => {
    fetchTasks(currentPage, debouncedSearch, statusFilter, priorityFilter, taskTypeFilter);
    fetchStats();
  }, [currentPage, debouncedSearch, statusFilter, priorityFilter, taskTypeFilter, fetchTasks, fetchStats]);

  return {
    // List
    tasks: result?.data ?? [],
    totalCount: result?.totalCount ?? 0,
    totalPages: result?.totalPages ?? 1,
    currentPage,
    isLoading,
    error,
    setCurrentPage,

    // Search & Filters
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    taskTypeFilter,
    setTaskTypeFilter,

    // Stats (KPI cards)
    stats,
    statsLoading,

    // Refresh
    refresh,
  };
};