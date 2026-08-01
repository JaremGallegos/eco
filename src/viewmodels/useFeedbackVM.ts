
import { useCallback, useState } from 'react';
import { submitFeedback } from '../services/api';

export function useFeedbackVM(reportId: string) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(async () => {
    if (rating === 0) {
      setError('Debe seleccionar una calificación');
      return false;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const incidentId = parseInt(reportId, 10);
      if (isNaN(incidentId)) {
        throw new Error('ID de reporte inválido');
      }
      await submitFeedback({ incidentId, rating, comment });
      setSuccess(true);
      return true;
    } catch (e: any) {
      setError(e.message ?? 'Error al enviar feedback');
      return false;
    } finally {
      setLoading(false);
    }
  }, [reportId, rating, comment]);

  return {
    rating,
    setRating,
    comment,
    setComment,
    loading,
    error,
    success,
    submit,
  };
}

