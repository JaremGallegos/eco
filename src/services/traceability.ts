import { supabase } from '../lib/supabase';
import { authService } from './auth';
import { sendPushNotification } from './notifications';

export interface StateChangeLog {
  incidentId: number;
  previousStateId: number | null;
  newStateId: number;
  userId?: number;
  internalComment?: string;
}

export async function logStateChange(log: StateChangeLog): Promise<boolean> {
  try {
    const user = await authService.getProfile();
    const userId = log.userId || user?.id || null;

    const { error } = await supabase
      .from('trazabilidad_log')
      .insert({
        id_incidencia: log.incidentId,
        id_estado_anterior: log.previousStateId,
        id_estado_nuevo: log.newStateId,
        usuario_responsable: userId,
        comentario_interno: log.internalComment || null,
      });

    if (error) {
      return false;
    }

    await notifyStateChange(log.incidentId, log.newStateId);

    return true;
  } catch (error) {
    return false;
  }
}

export async function getIncidentStateHistory(incidentId: number): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('trazabilidad_log')
      .select(`
        *,
        estado_anterior:estados_incidencia!trazabilidad_log_id_estado_anterior_fkey(
          id_estado,
          nombre_estado,
          descripcion_publica
        ),
        estado_nuevo:estados_incidencia!trazabilidad_log_id_estado_nuevo_fkey(
          id_estado,
          nombre_estado,
          descripcion_publica
        ),
        usuario:usuarios!trazabilidad_log_usuario_responsable_fkey(
          id_usuario,
          nombres,
          apellidos,
          id_rol
        )
      `)
      .eq('id_incidencia', incidentId)
      .order('fecha_cambio', { ascending: true });

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
}

export async function updateIncidentState(
  incidentId: number,
  newStateId: number,
  internalComment?: string
): Promise<boolean> {
  try {
    const { data: currentIncident } = await supabase
      .from('incidencias')
      .select('id_estado_actual')
      .eq('id_incidencia', incidentId)
      .single();

    if (!currentIncident) {
      console.error('Incidencia no encontrada');
      return false;
    }

    const previousStateId = currentIncident.id_estado_actual;


    const { error: updateError } = await supabase
      .from('incidencias')
      .update({ id_estado_actual: newStateId })
      .eq('id_incidencia', incidentId);

    if (updateError) {
      console.error('Error:', updateError);
      return false;
    }


    await logStateChange({
      incidentId,
      previousStateId,
      newStateId,
      internalComment,
    });

    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

export async function getUserStateChanges(userId: number): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('trazabilidad_log')
      .select(`
        *,
        incidencia:incidencias(
          codigo_seguimiento,
          descripcion_falla
        ),
        estado_nuevo:estados_incidencia!trazabilidad_log_id_estado_nuevo_fkey(
          nombre_estado
        )
      `)
      .eq('usuario_responsable', userId)
      .order('fecha_cambio', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

export async function getStateChangeStats(incidentId: number): Promise<any> {
  try {
    const history = await getIncidentStateHistory(incidentId);

    if (history.length === 0) {
      return {
        totalChanges: 0,
        averageTimePerState: null,
        statesDuration: [],
      };
    }

    const statesDuration: any[] = [];

    for (let i = 0; i < history.length; i++) {
      const currentChange = history[i];
      const nextChange = history[i + 1];

      if (nextChange) {
        const duration = new Date(nextChange.fecha_cambio).getTime() -
          new Date(currentChange.fecha_cambio).getTime();

        statesDuration.push({
          state: currentChange.estado_nuevo?.nombre_estado,
          durationMs: duration,
          durationHours: duration / (1000 * 60 * 60),
        });
      }
    }

    const totalDuration = statesDuration.reduce((sum, s) => sum + s.durationMs, 0);
    const averageTimePerState = statesDuration.length > 0
      ? totalDuration / statesDuration.length
      : null;

    return {
      totalChanges: history.length,
      averageTimePerState: averageTimePerState
        ? averageTimePerState / (1000 * 60 * 60)
        : null,
      statesDuration,
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      totalChanges: 0,
      averageTimePerState: null,
      statesDuration: [],
    };
  }
}

async function notifyStateChange(incidentId: number, newStateId: number): Promise<void> {
  try {
    const { data: incident } = await supabase
      .from('incidencias')
      .select('id_usuario_reportante, codigo_seguimiento')
      .eq('id_incidencia', incidentId)
      .single();

    if (!incident) return;

    const { data: state } = await supabase
      .from('estados_incidencia')
      .select('nombre_estado, descripcion_publica')
      .eq('id_estado', newStateId)
      .single();

    if (!state) return;


    await sendPushNotification(
      incident.id_usuario_reportante,
      `Actualización de incidencia ${incident.codigo_seguimiento}`,
      state.descripcion_publica || `Estado: ${state.nombre_estado}`,
      incidentId
    );
  } catch (error) {
    console.error('Error:', error);
  }
}

export async function bulkUpdateIncidentStates(
  incidentIds: number[],
  newStateId: number,
  internalComment?: string
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const incidentId of incidentIds) {
    const result = await updateIncidentState(incidentId, newStateId, internalComment);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
}
