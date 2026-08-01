export interface Rol {
  id_rol: number;
  nombre_rol: string;
}

export interface TipoServicio {
  id_tipo_servicio: number;
  nombre_servicio: string;
}

export interface EstadoIncidencia {
  id_estado: number;
  nombre_estado: string;
  descripcion_publica: string | null;
  es_final: boolean;
}

export interface TipoFalla {
  id_tipo_falla: number;
  id_tipo_servicio: number;
  nombre_falla: string;
  gravedad_defecto: 'Baja' | 'Media' | 'Alta' | 'Critica';
}

export interface TipoEvidencia {
  id_tipo_evidencia: number;
  nombre_tipo: 'FOTO' | 'VIDEO';
}

export interface EstadoNotificacion {
  id_estado_notificacion: number;
  nombre_estado: 'PENDIENTE' | 'ENVIADO' | 'ENTREGADO' | 'LEIDO';
}

export interface Usuario {
  id_usuario: number;
  dni: string;
  nombres: string;
  apellidos: string;
  email: string | null;
  telefono: string | null;
  password_hash: string;
  id_rol: number;
  fecha_registro: string;
  push_token?: string | null;
  id_empresa_luz?: number | null;
  id_empresa_agua?: number | null;
}

export interface EmpresaServicio {
  id_empresa: number;
  nombre_empresa: string;
  tipo_servicio: 'LUZ' | 'AGUA';
  codigo_empresa: string;
  activa: boolean;
  created_at: string;
}

export interface SectorGeografico {
  id_sector: number;
  nombre_sector: string;
  eps_asociada: string | null;


  poligono?: Coordinate[];
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Incidencia {
  id_incidencia: number;
  codigo_seguimiento: string;
  id_usuario_reportante: number;
  id_tipo_servicio: number;
  latitud: number;
  longitud: number;
  direccion_detallada: string | null;
  id_estado_actual: number;
  fecha_reporte: string;
  tiempo_estimado_resolucion: string | null;
  descripcion_falla: string;
  id_tipo_falla_detalle: number | null;
  id_tecnico_asignado: number | null;
  id_sector: number | null;
}

export interface EvidenciaMultimedia {
  id_evidencia: number;
  id_incidencia: number;
  id_tipo_archivo: number;
  url_archivo: string;
  fecha_captura: string;
  latitud_meta: number | null;
  longitud_meta: number | null;
}

export interface TrazabilidadLog {
  id_log: number;
  id_incidencia: number;
  id_estado_anterior: number | null;
  id_estado_nuevo: number;
  fecha_cambio: string;
  usuario_responsable: number | null;
  comentario_interno: string | null;
}

export interface Calificacion {
  id_calificacion: number;
  id_incidencia: number;
  puntuacion: number;
  comentarios_usuario: string | null;
  fecha_calificacion: string;
}

export interface NotificacionPush {
  id_notificacion: number;
  id_usuario: number;
  id_incidencia: number | null;
  mensaje: string;
  id_estado_envio: number;
  fecha_envio: string;
}

export interface IncidenciaDetallada extends Incidencia {
  estado: EstadoIncidencia;
  tipo_servicio: TipoServicio;
  evidencias?: EvidenciaMultimedia[];
  usuario_reportante?: {
    nombres: string;
    apellidos: string;
  };
}