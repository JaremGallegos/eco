
export interface AppIncident {
  id: number;
  trackingCode: string;
  serviceType: 'Agua' | 'Electricidad';
  status: string;
  location: {
    latitude: number;
    longitude: number;
    address: string | null;
    district?: string;
    zone?: string;
    postalCode?: string;
  };
  description: string;
  createdAt: string;
  media: string[];
  failureType?: {
    id: number;
    name: string;
    severity: 'Baja' | 'Media' | 'Alta' | 'Critica';
  };
  sector?: {
    id: number;
    name: string;
    company: string | null;
  };
  timeline?: TimelineEvent[];
}

export interface TimelineEvent {
  id: number;
  previousStatus: string | null;
  newStatus: string;
  timestamp: string;
  responsibleUser: string | null;
  comment: string | null;
  id_log?: number;
  fecha_cambio?: string;
  id_estado_anterior?: number | null;
  id_estado_nuevo?: number;
  usuario_responsable?: number | null;
  comentario_interno?: string | null;
  estado_anterior?: {
    id_estado: number;
    nombre_estado: string;
    descripcion_publica?: string;
  } | null;
  estado_nuevo?: {
    id_estado: number;
    nombre_estado: string;
    descripcion_publica?: string;
  };
  usuario?: {
    id_usuario: number;
    nombres: string;
    apellidos: string;
    id_rol: number;
  } | null;
}
