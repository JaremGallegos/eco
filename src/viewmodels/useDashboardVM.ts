import { useCallback, useEffect, useState } from 'react';
import type { DashboardStats } from '../models';
import { getDashboardStats } from '../services/api';

export function useDashboardVM() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (e: any) {
      setError(e.message ?? 'Error inesperado');
      console.error('error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, error, reload: loadStats };
}
