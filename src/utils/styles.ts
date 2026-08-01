import { Colors } from '@/constants/theme';

export const getStatusColor = (status: string): string => {
  const normalizedStatus = status.toLowerCase();


  if (normalizedStatus.includes('reportado')) return Colors.statusReported;
  if (normalizedStatus.includes('solucionado') || normalizedStatus.includes('resuelto')) return Colors.statusResolved;
  if (normalizedStatus.includes('cerrado')) return Colors.statusClosed;
  if (normalizedStatus.includes('escalado')) return Colors.statusEscalated;
  if (normalizedStatus.includes('camino')) return Colors.statusOnWay;
  if (normalizedStatus.includes('revision') || normalizedStatus.includes('revisión')) return Colors.statusInReview;

  return Colors.gray500;
};

export const getStatusIcon = (status: string): string => {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus.includes('reportado')) return 'alert-circle';
  if (normalizedStatus.includes('solucionado') || normalizedStatus.includes('resuelto')) return 'checkmark-circle';
  if (normalizedStatus.includes('cerrado')) return 'lock-closed';
  if (normalizedStatus.includes('escalado')) return 'trending-up';
  if (normalizedStatus.includes('camino')) return 'car';
  if (normalizedStatus.includes('revision') || normalizedStatus.includes('revisión')) return 'eye';
  if (normalizedStatus.includes('pendiente')) return 'time';
  if (normalizedStatus.includes('cancelado')) return 'close-circle';
  if (normalizedStatus.includes('rechazado')) return 'close-circle-outline';

  return 'help-circle';
};

export const getStatusLabel = (status: string): string => {
  const labelMap: Record<string, string> = {
    'reportado': 'Reportado',
    'pendiente': 'Pendiente',
    'en-revision': 'En Revisión',
    'resuelto': 'Resuelto',
    'cerrado': 'Cerrado',
    'cancelado': 'Cancelado',
    'rechazado': 'Rechazado',
  };

  return labelMap[status.toLowerCase()] || status;
};

export const getSeverityColor = (severity: string): string => {
  const severityMap: Record<string, string> = {
    'baja': Colors.successLight,
    'media': Colors.warning,
    'alta': Colors.secondaryLight,
    'critica': Colors.error,
    'crítica': Colors.error,
  };

  return severityMap[severity.toLowerCase()] || Colors.gray500;
};

export const getSeverityIcon = (severity: string): string => {
  const iconMap: Record<string, string> = {
    'baja': 'checkmark-circle',
    'media': 'warning',
    'alta': 'alert',
    'critica': 'alert-circle',
    'crítica': 'alert-circle',
  };

  return iconMap[severity.toLowerCase()] || 'information-circle';
};

export const getServiceColor = (serviceType: string): string => {
  const serviceMap: Record<string, string> = {
    'agua': Colors.water,
    'water': Colors.water,
    'luz': Colors.electric,
    'electric': Colors.electric,
    'electricidad': Colors.electric,
  };

  return serviceMap[serviceType.toLowerCase()] || Colors.primary;
};

export const getServiceBackgroundColor = (serviceType: string): string => {
  const serviceType_lower = serviceType.toLowerCase();

  if (serviceType_lower === 'agua' || serviceType_lower === 'water') {
    return 'rgba(33, 150, 243, 0.1)';
  }
  if (serviceType_lower === 'luz' || serviceType_lower === 'electric' || serviceType_lower === 'electricidad') {
    return 'rgba(255, 193, 7, 0.1)';
  }

  return 'rgba(39, 82, 88, 0.1)';
};

export const getServiceIcon = (serviceType: string): string => {
  const iconMap: Record<string, string> = {
    'agua': 'water',
    'water': 'water',
    'luz': 'flash',
    'electric': 'flash',
    'electricidad': 'flash',
  };

  return iconMap[serviceType.toLowerCase()] || 'build';
};

export const withOpacity = (color: string, opacity: number): string => {

  if (color.startsWith('rgba')) return color;


  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const coloredShadow = (color: string, elevation: number = 3) => {
  const elevationMap = {
    1: { height: 1, opacity: 0.15, radius: 2 },
    2: { height: 2, opacity: 0.2, radius: 4 },
    3: { height: 4, opacity: 0.25, radius: 8 },
    4: { height: 6, opacity: 0.3, radius: 12 },
    5: { height: 8, opacity: 0.35, radius: 16 },
  };

  const config = elevationMap[elevation as keyof typeof elevationMap] || elevationMap[3];

  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: config.height },
    shadowOpacity: config.opacity,
    shadowRadius: config.radius,
    elevation: elevation * 2,
  };
};

export const statusBadgeStyles = {
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
};

export const severityBadgeStyles = {
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
};

export const cardStyles = {
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
};

export const buttonStyles = {
  primary: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  secondary: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  text: {
    primary: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    outline: {
      color: Colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
  },
};

export const inputStyles = {
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: Colors.light.background,
  },
  inputFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  error: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
};
