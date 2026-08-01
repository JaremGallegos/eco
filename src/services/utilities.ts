import { supabase } from '../lib/supabase';
import type { EmpresaServicio } from '../models/Database';

export type { EmpresaServicio };

export const obtenerEmpresasPorTipo = async (
  tipoServicio: 'LUZ' | 'AGUA'
): Promise<EmpresaServicio[]> => {
  try {
    const { data, error } = await supabase
      .from('empresas_servicios')
      .select('*')
      .eq('tipo_servicio', tipoServicio)
      .eq('activa', true)
      .order('nombre_empresa', { ascending: true });

    if (error) {
      throw new Error(`Error: ${error.message}`);
    }

    return data || [];
  } catch (error: any) {
    throw error;
  }
};

export const obtenerEmpresasLuz = async (): Promise<EmpresaServicio[]> => {
  return obtenerEmpresasPorTipo('LUZ');
};

export const obtenerEmpresasAgua = async (): Promise<EmpresaServicio[]> => {
  return obtenerEmpresasPorTipo('AGUA');
};

export const obtenerEmpresaPorId = async (
  idEmpresa: number
): Promise<EmpresaServicio | null> => {
  try {
    const { data, error } = await supabase
      .from('empresas_servicios')
      .select('*')
      .eq('id_empresa', idEmpresa)
      .single();

    if (error) {
      console.error('Error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

export const utilitiesService = {
  obtenerEmpresasPorTipo,
  obtenerEmpresasLuz,
  obtenerEmpresasAgua,
  obtenerEmpresaPorId,
};
