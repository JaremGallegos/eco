import { supabase } from '../lib/supabase';

const getEmailFromDni = (dni: string) => `${dni.trim()}@eco.com`;

interface ServiciosPublicos {
  empresaLuz?: number | null;
  empresaAgua?: number | null;
}

export const authService = {
  async signUpWithDni(
    dni: string,
    password: string,
    nombres: string,
    apellidos: string,
    telefono: string,
    servicios?: ServiciosPublicos
  ) {
    const email = getEmailFromDni(dni);
    const fullName = `${nombres} ${apellidos}`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          dni: dni,
          nombres,
          apellidos,
          telefono
        },
      },
    });

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('unique')) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        return signInData;
      }
      throw authError;
    }

    if (!authData.user) throw new Error('No user created');
    const { data: roleData } = await supabase
      .from('roles')
      .select('id_rol')
      .eq('nombre_rol', 'CIUDADANO')
      .single();

    const roleId = roleData?.id_rol || 1;
    const usuarioData: any = {
      dni: dni,
      nombres: nombres,
      apellidos: apellidos,
      email: email,
      telefono: telefono,
      password_hash: 'managed_by_supabase',
      id_rol: roleId,
    };

    if (servicios?.empresaLuz) {
      usuarioData.id_empresa_luz = servicios.empresaLuz;
    }

    if (servicios?.empresaAgua) {
      usuarioData.id_empresa_agua = servicios.empresaAgua;
    }

    const { error: profileError } = await supabase
      .from('usuarios')
      .insert(usuarioData);

    if (profileError) {
      throw new Error(`Error : ${profileError.message}`);
    }

    return authData;
  },

  async signInWithDni(dni: string, password: string) {
    const email = getEmailFromDni(dni);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signInWithIdentifier(identifier: string, password: string) {
    const isDNI = /^\d{8}$/.test(identifier);
    const isPhone = /^9?\d{8,9}$/.test(identifier);

    if (!isDNI && !isPhone) {
      throw new Error('Ingresa un DNI válido (8 dígitos) o teléfono (9 dígitos)');
    }

    if (isDNI) {
      return this.signInWithDni(identifier, password);
    } else {
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('dni, telefono')
        .eq('telefono', identifier)
        .maybeSingle();

      if (userError) {
        throw new Error('Error al buscar usuario: ' + userError.message);
      }

      if (!userData) {
        throw new Error('No se encontró un usuario con ese teléfono. Intenta con tu DNI.');
      }

      return this.signInWithDni(userData.dni, password);
    }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const dni = user.user_metadata.dni;

    if (!dni) return null;

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('dni', dni)
      .maybeSingle();

    if (error) {
      console.warn('Error :', error);
      return null;
    }

    if (!data) {
      const { full_name, dni: metaDni, nombres, apellidos, telefono } = user.user_metadata;

      if (metaDni) {
        let finalNombres = nombres;
        let finalApellidos = apellidos;

        if (!finalNombres || !finalApellidos) {
          const [n, ...rest] = (full_name || '').split(' ');
          finalNombres = n || '';
          finalApellidos = rest.join(' ') || ' ';
        }

        const { data: roleData } = await supabase
          .from('roles')
          .select('id_rol')
          .eq('nombre_rol', 'CIUDADANO')
          .single();
        const roleId = roleData?.id_rol || 1;

        const { data: newUser, error: createError } = await supabase
          .from('usuarios')
          .insert({
            dni: metaDni,
            nombres: finalNombres,
            apellidos: finalApellidos,
            email: user.email,
            telefono: telefono || null,
            password_hash: 'managed_by_supabase',
            id_rol: roleId,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error:', createError);
          return null;
        }

        return {
          id: newUser.id_usuario,
          dni: newUser.dni,
          nombres: newUser.nombres,
          apellidos: newUser.apellidos,
          full_name: `${newUser.nombres} ${newUser.apellidos}`,
          email: newUser.email || '',
          phone: newUser.telefono || '',
          role: 'citizen',
        };
      }
      return null;
    }

    return {
      id: data.id_usuario,
      dni: data.dni,
      nombres: data.nombres,
      apellidos: data.apellidos,
      full_name: `${data.nombres} ${data.apellidos}`,
      email: data.email || '',
      phone: data.telefono || '',
      role: 'citizen',
    };
  },

  async updateProfile(updates: {
    nombres?: string;
    apellidos?: string;
    phone?: string;
    servicios?: ServiciosPublicos;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const dni = user.user_metadata.dni;
    if (!dni) throw new Error('No DNI found in user metadata');

    const dbUpdates: any = {};

    if (updates.nombres) dbUpdates.nombres = updates.nombres;
    if (updates.apellidos) dbUpdates.apellidos = updates.apellidos;
    if (updates.phone !== undefined) dbUpdates.telefono = updates.phone;

    if (updates.servicios) {
      if (updates.servicios.empresaLuz !== undefined) {
        dbUpdates.id_empresa_luz = updates.servicios.empresaLuz;
      }
      if (updates.servicios.empresaAgua !== undefined) {
        dbUpdates.id_empresa_agua = updates.servicios.empresaAgua;
      }
    }

    const { data, error } = await supabase
      .from('usuarios')
      .update(dbUpdates)
      .eq('dni', dni)
      .select()
      .single();

    if (error) throw error;

    await supabase.auth.updateUser({
      data: {
        nombres: data.nombres,
        apellidos: data.apellidos,
        telefono: data.telefono,
        full_name: `${data.nombres} ${data.apellidos}`
      }
    });

    return {
      id: data.id_usuario,
      dni: data.dni,
      nombres: data.nombres,
      apellidos: data.apellidos,
      full_name: `${data.nombres} ${data.apellidos}`,
      email: data.email || '',
      phone: data.telefono || '',
      role: 'citizen',
    };
  },

  async updatePassword(currentPassword: string, newPassword: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) throw new Error('No user authenticated');

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (verifyError) {
      throw new Error('La contraseña actual es incorrecta');
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  },

  async resetPasswordWithDni(dni: string, currentPassword: string, newPassword: string) {
    const email = getEmailFromDni(dni);

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError) {
      throw new Error('DNI o contraseña actual incorrectos');
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) throw updateError;
    await supabase.auth.signOut();
  },

  async sendPasswordResetEmail(dni: string) {
    const email = getEmailFromDni(dni);

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'eco://auth/forgot-password'
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error:', error);
      throw error;
    }
  },

  async resetPasswordDirectly(dni: string, newPassword: string) {
    const email = getEmailFromDni(dni);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      await supabase.auth.signOut();
    } catch (error: any) {
      console.error('Error:', error);
      throw new Error('No se pudo actualizar la contraseña');
    }
  },

  async resetPasswordAfterVerification(dni: string, newPassword: string) {
    const email = getEmailFromDni(dni);

    try {
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('dni')
        .eq('dni', dni)
        .maybeSingle();

      if (userError || !userData) {
        throw new Error('Usuario no encontrado');
      }

      /// Revisar como se creo la API
      const response = await fetch(`https://eeqkkqaelkwasmtqhpms.supabase.co/functions/v1/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          newPassword
        })
      });

      if (!response.ok) {
        throw new Error('No se pudo conectar con el servicio de actualización');
      }

      const result = await response.json();
      if (result.error) throw new Error(result.error);

    } catch (error: any) {
      console.error('Error:', error);
      throw new Error('Para cambiar tu contraseña, necesitas recordar tu contraseña actual');
    }
  }
};