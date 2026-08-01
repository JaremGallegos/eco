import { supabase } from '../lib/supabase';
import type { AppIncident, DashboardStats } from '../models';
import { authService } from './auth';

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const user = await authService.getProfile();
    if (!user) {
      return {
        totalIncidents: 0,
        pendingIncidents: 0,
        incidentsByType: { agua: 0, electricidad: 0 },
      };
    }

    const { data: incidents, error } = await supabase
      .from('incidencias')
      .select(`
        *,
        tipos_servicio!inner(nombre_servicio),
        estados_incidencia!inner(nombre_estado, es_final)
      `)
      .eq('id_usuario_reportante', user.id)
      .eq('estados_incidencia.es_final', false);

    if (error) {
      throw error;
    }

    const incidentsList = incidents || [];
    const totalIncidents = incidentsList.length;
    const pendingIncidents = incidentsList.filter(
      (inc: any) => !inc.estados_incidencia?.es_final
    ).length;

    const incidentsByType = {
      agua: incidentsList.filter(
        (inc: any) => inc.tipos_servicio?.nombre_servicio === 'Agua'
      ).length,
      electricidad: incidentsList.filter(
        (inc: any) => inc.tipos_servicio?.nombre_servicio === 'Electricidad'
      ).length,
    };

    return {
      totalIncidents,
      pendingIncidents,
      incidentsByType,
    };
  } catch (error) {
    return {
      totalIncidents: 0,
      pendingIncidents: 0,
      incidentsByType: { agua: 0, electricidad: 0 },
    };
  }
}

export async function getUserIncidents(): Promise<AppIncident[]> {
  try {
    const user = await authService.getProfile();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('incidencias')
      .select(`
        *,
        tipos_servicio!inner(nombre_servicio),
        estados_incidencia!inner(nombre_estado),
        evidencia_multimedia(url_archivo),
        tipos_falla(id_tipo_falla, nombre_falla, gravedad_defecto)
      `)
      .eq('id_usuario_reportante', user.id)
      .order('fecha_reporte', { ascending: false });

    if (error) {
      return [];
    }

    const mapped = mapIncidentsToAppFormat(data || []);
    return mapped;
  } catch (error) {
    return [];
  }
}

export async function getAllIncidents(): Promise<AppIncident[]> {
  try {
    const { data, error } = await supabase
      .from('incidencias')
      .select(`
        *,
        tipos_servicio!inner(nombre_servicio),
        estados_incidencia!inner(nombre_estado, es_final),
        tipos_falla(id_tipo_falla, nombre_falla, gravedad_defecto)
      `)
      .eq('estados_incidencia.es_final', false)
      .order('fecha_reporte', { ascending: false })
      .limit(500);

    if (error) {
      return [];
    }

    const mapped = mapIncidentsToAppFormat(data || []);
    return mapped;
  } catch (error) {
    return [];
  }
}

export async function getIncidentDetail(incidentId: number): Promise<AppIncident> {
  try {
    const { data, error } = await supabase
      .from('incidencias')
      .select(`
        *,
        tipos_servicio!inner(nombre_servicio),
        estados_incidencia!inner(nombre_estado),
        evidencia_multimedia(url_archivo),
        tipos_falla(id_tipo_falla, nombre_falla, gravedad_defecto)
      `)
      .eq('id_incidencia', incidentId)
      .single();

    if (error) {
      throw new Error('Incidencia no encontrada');
    }

    const mapped = mapIncidentsToAppFormat([data]);


    const timeline = await getIncidentTimeline(incidentId);
    mapped[0].timeline = timeline;

    return mapped[0];
  } catch (error: any) {
    throw new Error(error.message || 'Error al obtener el detalle');
  }
}

export async function createIncident(incidentData: {
  serviceType: 'Agua' | 'Electricidad';
  location: { latitude: number; longitude: number; address?: string };
  description: string;
  media?: string[];
  failureTypeId?: number;
}): Promise<AppIncident> {
  try {
    const user = await authService.getProfile();
    if (!user) throw new Error('Usuario no autenticado');


    const trackingCode = `ECO-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;


    const { data: serviceData } = await supabase
      .from('tipos_servicio')
      .select('id_tipo_servicio')
      .eq('nombre_servicio', incidentData.serviceType)
      .single();

    if (!serviceData) throw new Error('Tipo de servicio no válido');


    const { data: statusData } = await supabase
      .from('estados_incidencia')
      .select('id_estado')
      .eq('nombre_estado', 'Reportado')
      .single();

    if (!statusData) throw new Error('Estado inicial no encontrado');

    const { data: newIncident, error: incidentError } = await supabase
      .from('incidencias')
      .insert({
        codigo_seguimiento: trackingCode,
        id_usuario_reportante: user.id,
        id_tipo_servicio: serviceData.id_tipo_servicio,
        latitud: incidentData.location.latitude,
        longitud: incidentData.location.longitude,
        direccion_detallada: incidentData.location.address || null,
        id_estado_actual: statusData.id_estado,
        descripcion_falla: incidentData.description,
        id_tipo_falla_detalle: incidentData.failureTypeId || null,
      })
      .select()
      .single();

    if (incidentError) throw incidentError;


    try {
      const { logStateChange } = await import('./traceability');
      await logStateChange({
        incidentId: newIncident.id_incidencia,
        previousStateId: null,
        newStateId: statusData.id_estado,
        userId: user.id,
        internalComment: 'Incidencia creada por el usuario',
      });
    } catch (logError) {
      console.error('Error:', logError);
    }


    if (incidentData.media && incidentData.media.length > 0) {
      const { data: photoType } = await supabase
        .from('tipos_evidencia')
        .select('id_tipo_evidencia')
        .eq('nombre_tipo', 'FOTO')
        .single();

      if (photoType) {
        const mediaInserts = incidentData.media.map((url) => ({
          id_incidencia: newIncident.id_incidencia,
          id_tipo_archivo: photoType.id_tipo_evidencia,
          url_archivo: url,

          latitud_meta: incidentData.location.latitude,
          longitud_meta: incidentData.location.longitude,
        }));

        await supabase.from('evidencia_multimedia').insert(mediaInserts);
      }
    }

    return await getIncidentDetail(newIncident.id_incidencia);
  } catch (error: any) {
    throw new Error(error.message || 'Error al crear la incidencia');
  }
}

function mapIncidentsToAppFormat(dbIncidents: any[]): AppIncident[] {
  return dbIncidents.map((inc) => {
    const serviceName = inc.tipos_servicio?.nombre_servicio || inc.nombre_servicio;
    const statusName = inc.estados_incidencia?.nombre_estado || inc.nombre_estado || 'Reportado';
    const direccion = inc.direccion_detallada || '';
    const parts = direccion.split(',').map((p: string) => p.trim());

    let district: string | undefined;
    let zone: string | undefined;
    let postalCode: string | undefined;
    let address = direccion;


    const cpMatch = direccion.match(/CP\s*(\d+)/i);
    if (cpMatch) {
      postalCode = cpMatch[1];
      address = direccion.replace(/,?\s*CP\s*\d+/i, '').trim();
    }


    if (parts.length >= 2) {
      zone = parts[0];
      district = parts[1];

      if (parts.length >= 3) {
        address = parts.slice(0, -1).join(', ');
        district = parts[parts.length - 1].replace(/CP\s*\d+/i, '').trim();
      }
    }


    let failureType: any = undefined;
    if (inc.id_tipo_falla_detalle && inc.tipos_falla) {
      failureType = {
        id: inc.tipos_falla.id_tipo_falla,
        name: inc.tipos_falla.nombre_falla,
        severity: inc.tipos_falla.gravedad_defecto,
      };
    }

    return {
      id: inc.id_incidencia,
      trackingCode: inc.codigo_seguimiento,
      serviceType: serviceName === 'Agua' ? 'Agua' : 'Electricidad',
      status: statusName,
      location: {
        latitude: inc.latitud,
        longitude: inc.longitud,
        address: direccion,
        district,
        zone,
        postalCode,
      },
      description: inc.descripcion_falla || 'Sin descripción',
      createdAt: inc.fecha_reporte,
      media: Array.isArray(inc.evidencia_multimedia)
        ? inc.evidencia_multimedia.map((m: any) => m.url_archivo)
        : [],
      failureType,
    };
  });
}

export async function getFailureTypes(serviceType: 'Agua' | 'Electricidad'): Promise<any[]> {
  try {
    const { data: serviceData } = await supabase
      .from('tipos_servicio')
      .select('id_tipo_servicio')
      .eq('nombre_servicio', serviceType)
      .single();

    if (!serviceData) return [];

    const { data, error } = await supabase
      .from('tipos_falla')
      .select('*')
      .eq('id_tipo_servicio', serviceData.id_tipo_servicio)
      .order('gravedad_defecto', { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  } catch (error: any) {
    return [];
  }
}

export async function getIncidentTimeline(incidentId: number): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('trazabilidad_log')
      .select(`
        *,
        estado_anterior:estados_incidencia!trazabilidad_log_id_estado_anterior_fkey(nombre_estado),
        estado_nuevo:estados_incidencia!trazabilidad_log_id_estado_nuevo_fkey(nombre_estado),
        usuario:usuarios!trazabilidad_log_usuario_responsable_fkey(nombres, apellidos)
      `)
      .eq('id_incidencia', incidentId)
      .order('fecha_cambio', { ascending: true });

    if (error) {
      return [];
    }

    return data || [];
  } catch (error: any) {
    return [];
  }
}

export async function hasIncidentBeenRated(incidentId: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('calificaciones')
      .select('id_calificacion')
      .eq('id_incidencia', incidentId)
      .maybeSingle();

    if (error) {
      return false;
    }

    return data !== null;
  } catch (error: any) {
    return false;
  }
}

export async function submitFeedback(feedback: {
  incidentId: number;
  rating: number;
  comment?: string;
}): Promise<void> {
  try {
    const alreadyRated = await hasIncidentBeenRated(feedback.incidentId);
    if (alreadyRated) {
      throw new Error('Esta incidencia ya ha sido calificada previamente');
    }

    const { error } = await supabase.from('calificaciones').insert({
      id_incidencia: feedback.incidentId,
      puntuacion: feedback.rating,
      comentarios_usuario: feedback.comment || null,
    });

    if (error) throw error;
  } catch (error: any) {
    throw new Error(error.message || 'Error al enviar calificación');
  }
}
