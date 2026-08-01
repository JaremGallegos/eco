import { useCallback, useEffect, useState } from 'react';
import type { AppIncident } from '../models';
import { getUserIncidents } from '../services/api';

export function useHistoryVM() {
  const [incidents, setIncidents] = useState<AppIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserIncidents();
      setIncidents(data);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar historial');
      console.error('error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  return { incidents, loading, error, reload: loadIncidents };
}
