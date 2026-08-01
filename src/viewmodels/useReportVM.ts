
import { useCallback } from 'react';
import { useReportContext } from '../contexts/ReportContext';
import { createIncident } from '../services/api';
import { getCurrentLocation } from '../services/location';
import { captureMediaFromCamera, pickMediaFromLibrary } from '../services/media';

export function useReportVM() {
  const {
    location,
    setLocation,
    media,
    addMedia,
    removeMedia,
    reportType,
    setReportType,
    failureTypeIds,
    setFailureTypeIds,
    loading,
    setLoading,
    error,
    setError,
    reset,
  } = useReportContext();


  const captureLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const coords = await getCurrentLocation();
      setLocation(coords);
    } catch (e: any) {
      setError(e.message ?? 'Error al obtener ubicación');
    } finally {
      setLoading(false);
    }
  }, []);


  const addPhotoFromLibrary = useCallback(async () => {
    setError(null);


    if (media.some(m => m.type === 'video')) {
      setError('No puedes agregar más archivos si ya tienes un video');
      return;
    }
    if (media.length >= 3) {
      setError('Máximo 3 fotos permitidas');
      return;
    }

    try {

      const uris = await pickMediaFromLibrary({ maxCount: 3 - media.length });
      uris.forEach((uri) => addMedia({ uri, type: 'image' }));
    } catch (e: any) {
      setError(e.message ?? 'Error al seleccionar foto');
    }
  }, [media, addMedia, setError]);


  const addPhotoFromCamera = useCallback(async () => {
    setError(null);


    if (media.some(m => m.type === 'video')) {
      setError('No puedes agregar más archivos si ya tienes un video');
      return;
    }
    if (media.length >= 3) {
      setError('Máximo 3 fotos permitidas');
      return;
    }

    try {
      const uri = await captureMediaFromCamera();
      if (uri) {


        const isVideo = uri.endsWith('.mp4') || uri.endsWith('.mov');

        if (isVideo && media.length > 0) {
          setError('Solo puedes subir 1 video y ninguna foto adicional');
          return;
        }

        addMedia({ uri, type: isVideo ? 'video' : 'image' });
      }
    } catch (e: any) {
      setError(e.message ?? 'Error al capturar foto/video');
    }
  }, [media, addMedia, setError]);


  const submitNewReport = useCallback(async (): Promise<any | null> => {
    if (!location) {
      setError('Falta la ubicación');
      return null;
    }
    setLoading(true);
    setError(null);
    try {

      let detailedAddress = '';
      const addressParts: string[] = [];

      if (location.address) {
        addressParts.push(location.address);
      }
      if (location.zone && location.zone !== location.address) {
        addressParts.push(location.zone);
      }
      if (location.district) {
        addressParts.push(location.district);
      }
      if (location.postalCode) {
        addressParts.push(`CP ${location.postalCode}`);
      }

      detailedAddress = addressParts.length > 0
        ? addressParts.join(', ')
        : `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;




      const result = await createIncident({
        serviceType: reportType === 'agua' ? 'Agua' : 'Electricidad',
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: detailedAddress,
        },
        description: `Reporte de ${reportType} desde app móvil`,
        media: media.map(m => m.uri),
        failureTypeId: failureTypeIds.length > 0 ? failureTypeIds[0] : undefined,
      });
      return result;
    } catch (e: any) {
      setError(e.message ?? 'Error al enviar reporte');
      return null;
    } finally {
      setLoading(false);
    }
  }, [location, media, reportType]);

  return {
    location,
    setLocation,
    media,
    reportType,
    setReportType,
    failureTypeIds,
    setFailureTypeIds,
    loading,
    error,
    captureLocation,
    addPhotoFromLibrary,
    addPhotoFromCamera,
    removeMedia,
    submitNewReport,
    reset,
  };
}

