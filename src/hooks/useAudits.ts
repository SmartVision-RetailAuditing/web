import { useState, useEffect, useCallback, useRef } from 'react';
import { auditService } from '../services/audits.service';
import type { AuditDto, PagedResult } from '../services/audits.service';
import { useDebounce } from './useDebounce';
import signalRService from '../services/signalRService.ts';

const ITEMS_PER_PAGE = 10;

export const useAudits = (initialStoreId?: number) => {
  const [result, setResult] = useState<PagedResult<AuditDto> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);

  // 1. GÜNCELLEME: fetchAudits içindeki state'lere erişimi garantilemek için useRef kullanabiliriz
  // veya fetchAudits bağımlılıklarını izlemeye devam edebiliriz. Biz en temiz yolu seçeceğiz.

  // Güncel değerleri SignalR callback'inde yakalamak için ref kullanıyoruz
  const fetchParams = useRef({ currentPage, debouncedSearch, statusFilter });

  useEffect(() => {
    fetchParams.current = { currentPage, debouncedSearch, statusFilter };
  }, [currentPage, debouncedSearch, statusFilter]);

  const fetchAudits = useCallback(async (page: number, search: string, status: string) => {
    try {
      setIsLoading(true);
      setError('');
      const data = await auditService.getAllAudits(
          page,
          ITEMS_PER_PAGE,
          search || undefined,
          status || undefined,
          initialStoreId
      );
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Denetimler yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, [initialStoreId]);

  // Sayfa, arama veya filtre değiştiğinde normal veri çekme işlemi
  useEffect(() => {
    fetchAudits(currentPage, debouncedSearch, statusFilter);
  }, [currentPage, debouncedSearch, statusFilter, fetchAudits]);

  // ── 2. GÜNCELLEME: SIGNALR ENTEGRASYONU SADECE BİR KERE ÇALIŞMALI ──
  useEffect(() => {
    // Component Mount (Sayfaya girildiğinde)
    const setupSignalR = async () => {
      await signalRService.startConnection();
      await signalRService.joinGroup("AuditsList");

      // Dikkat: Burada closure (kapsama) tuzağına düşmemek için useRef'ten gelen güncel değerleri kullanıyoruz
      const handleUpdate = () => {
        console.log("Canlı güncelleme alındı, liste yenileniyor...");
        const currentParams = fetchParams.current;
        fetchAudits(currentParams.currentPage, currentParams.debouncedSearch, currentParams.statusFilter);
      };

      // Eğer daha önceden dinleyiciler varsa temizle (garantiye alalım)
      signalRService.off("AuditCreated");
      signalRService.off("AuditUpdated");
      signalRService.off("AuditDeleted");
      signalRService.off("AuditTaskSubmitted");

      signalRService.on("AuditCreated", handleUpdate);
      signalRService.on("AuditUpdated", handleUpdate);
      signalRService.on("AuditDeleted", handleUpdate);
      signalRService.on("AuditTaskSubmitted", handleUpdate);
    };

    setupSignalR();

    // Component Unmount (Sayfadan başka bir rotaya geçildiğinde)
    return () => {
      signalRService.off("AuditCreated");
      signalRService.off("AuditUpdated");
      signalRService.off("AuditDeleted");
      signalRService.off("AuditTaskSubmitted");
      signalRService.leaveGroup("AuditsList");
    };
  }, [fetchAudits]); // SADECE fetchAudits referansı değiştiğinde (ki o da sadece initialStoreId değişirse değişir) tetiklenecek.

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