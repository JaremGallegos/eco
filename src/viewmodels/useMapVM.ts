import { useCallback, useEffect, useState } from 'react';
import type { AppIncident } from '../models';
import { getAllIncidents } from '../services/api';

export function useMapVM() {
  const [incidents, setIncidents] = useState<AppIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllIncidents();
      setIncidents(data);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar incidencias');
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
