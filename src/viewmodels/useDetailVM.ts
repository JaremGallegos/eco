import { useCallback, useEffect, useState } from 'react';
import type { AppIncident } from '../models';
import { getIncidentDetail, hasIncidentBeenRated } from '../services/api';
import { getIncidentStateHistory } from '../services/traceability';

export function useDetailVM(incidentId: number | null) {
  const [incident, setIncident] = useState<AppIncident | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasBeenRated, setHasBeenRated] = useState(false);

  const loadDetail = useCallback(
    async (silent = false) => {
      if (!incidentId) {
        setLoading(false);
        return;
      }

      if (!silent) setLoading(true);
      setError(null);

      try {
        const data = await getIncidentDetail(incidentId);
        try {
          const history = await getIncidentStateHistory(incidentId);
          data.timeline = history;
        } catch (historyError) {
          console.error('Error:', historyError);
        }

        setIncident(data);


        if (data.status.toLowerCase().includes('solucionado')) {
          const rated = await hasIncidentBeenRated(incidentId);
          setHasBeenRated(rated);
        }


        let calculatedProgress = 0;
        const status = data.status.toLowerCase();

        if (status.includes('cerrado') || status.includes('solucionado')) {
          calculatedProgress = 100;
        } else if (status.includes('camino')) {
          calculatedProgress = 66;
        } else if (status.includes('revisión') || status.includes('revision')) {
          calculatedProgress = 33;
        } else if (status.includes('escalado')) {
          calculatedProgress = 50;
        } else {
          calculatedProgress = 10;
        }

        setProgress(calculatedProgress);
      } catch (e: any) {
        setError(e.message ?? 'Error al cargar detalle');
        console.error('error:', e);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [incidentId]
  );

  useEffect(() => {
    loadDetail();


    const interval = setInterval(() => loadDetail(true), 10000);

    return () => clearInterval(interval);
  }, [loadDetail]);

  return { incident, progress, loading, error, hasBeenRated, reload: loadDetail };
}
