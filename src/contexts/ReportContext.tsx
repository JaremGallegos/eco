
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
  district?: string;
  zone?: string;
  postalCode?: string;
  address?: string;
}

export interface MediaItem {
  uri: string;
  type: 'image' | 'video';
}

interface ReportState {
  location: LocationData | null;
  media: MediaItem[];
  reportType: 'agua' | 'luz';
  failureTypeIds: number[];
  loading: boolean;
  error: string | null;
}

interface ReportContextType extends ReportState {
  setLocation: (location: LocationData | null) => void;
  setMedia: (media: MediaItem[]) => void;
  addMedia: (item: MediaItem) => void;
  removeMedia: (index: number) => void;
  setReportType: (type: 'agua' | 'luz') => void;
  setFailureTypeIds: (ids: number[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [reportType, setReportType] = useState<'agua' | 'luz'>('agua');
  const [failureTypeIds, setFailureTypeIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMedia = useCallback((item: MediaItem) => {
    setMedia((prev) => {

      if (item.type === 'video') {
        if (prev.length > 0) return prev;
        return [item];
      }

      if (prev.some(m => m.type === 'video')) return prev;
      if (prev.length >= 3) return prev;
      return [...prev, item];
    });
  }, []);

  const removeMedia = useCallback((index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const reset = useCallback(() => {
    setLocation(null);
    setMedia([]);
    setReportType('agua');
    setFailureTypeIds([]);
    setLoading(false);
    setError(null);
  }, []);

  return (
    <ReportContext.Provider
      value={{
        location,
        media,
        reportType,
        failureTypeIds,
        loading,
        error,
        setLocation,
        setMedia,
        addMedia,
        removeMedia,
        setReportType,
        setFailureTypeIds,
        setLoading,
        setError,
        reset,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
}

export function useReportContext() {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReportContext must be used within ReportProvider');
  }
  return context;
}

