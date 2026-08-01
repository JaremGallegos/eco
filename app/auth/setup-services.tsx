import ServiceSelector from '@/components/ServiceSelector';
import { AnimatedButton } from '@/components/ui';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { supabase } from '@/src/lib/supabase';
import { EmpresaServicio } from '@/src/models/Database';
import { utilitiesService } from '@/src/services/utilities';
import { geocodingCache } from '@/src/utils/geocodingCache';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ServicioGuardado {
  id: string;
  tipo: 'LUZ' | 'AGUA';
  empresaId: number;
}

export default function SetupServicesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(true);

  const [empresasLuz, setEmpresasLuz] = useState<EmpresaServicio[]>([]);
  const [empresasAgua, setEmpresasAgua] = useState<EmpresaServicio[]>([]);


  const [serviciosLuz, setServiciosLuz] = useState<ServicioGuardado[]>([]);
  const [serviciosAgua, setServiciosAgua] = useState<ServicioGuardado[]>([]);


  const [agregandoLuz, setAgregandoLuz] = useState(false);
  const [nuevaEmpresaLuz, setNuevaEmpresaLuz] = useState<number | null>(null);

  const [agregandoAgua, setAgregandoAgua] = useState(false);
  const [nuevaEmpresaAgua, setNuevaEmpresaAgua] = useState<number | null>(null);

  const [ubicacion, setUbicacion] = useState<{ latitude: number; longitude: number } | null>(null);
  const [direccion, setDireccion] = useState<string>('');
  const [distrito, setDistrito] = useState<string>('');
  const [ciudad, setCiudad] = useState<string>('');
  const [empresasRecomendadas, setEmpresasRecomendadas] = useState<{ luz: number[], agua: number[] }>({ luz: [], agua: [] });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (nuevaEmpresaLuz && agregandoLuz) {
      handleAgregarServicioLuz();
    }
  }, [nuevaEmpresaLuz]);

  useEffect(() => {
    if (nuevaEmpresaAgua && agregandoAgua) {
      handleAgregarServicioAgua();
    }
  }, [nuevaEmpresaAgua]);

  useEffect(() => {
    if (!loadingEmpresas && !loadingLocation && empresasLuz.length > 0 && empresasAgua.length > 0 && distrito) {
      recomendarEmpresasPorUbicacion(distrito, ciudad);
    }
  }, [loadingEmpresas, loadingLocation, empresasLuz, empresasAgua, distrito, ciudad]);

  const cargarDatos = async () => {
    await Promise.all([
      cargarEmpresas(),
      obtenerUbicacion(),
      cargarServiciosExistentes(),
    ]);
  };

  const cargarEmpresas = async () => {
    try {
      setLoadingEmpresas(true);
      const [luz, agua] = await Promise.all([
        utilitiesService.obtenerEmpresasLuz(),
        utilitiesService.obtenerEmpresasAgua(),
      ]);
      setEmpresasLuz(luz);
      setEmpresasAgua(agua);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las empresas de servicios');
    } finally {
      setLoadingEmpresas(false);
    }
  };

  const cargarServiciosExistentes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dni = user.user_metadata.dni;
      if (!dni) return;

      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('id_empresa_luz, id_empresa_agua')
        .eq('dni', dni)
        .single();

      if (error) {
        console.error('Error :', error);
        return;
      }

      if (usuario) {
        const serviciosExistentes: ServicioGuardado[] = [];

        if (usuario.id_empresa_luz) {
          serviciosExistentes.push({
            id: 'luz-' + usuario.id_empresa_luz,
            tipo: 'LUZ',
            empresaId: usuario.id_empresa_luz
          });
        }

        if (usuario.id_empresa_agua) {
          serviciosExistentes.push({
            id: 'agua-' + usuario.id_empresa_agua,
            tipo: 'AGUA',
            empresaId: usuario.id_empresa_agua
          });
        }

        const serviciosLuzExistentes = serviciosExistentes.filter(s => s.tipo === 'LUZ');
        const serviciosAguaExistentes = serviciosExistentes.filter(s => s.tipo === 'AGUA');

        setServiciosLuz(serviciosLuzExistentes);
        setServiciosAgua(serviciosAguaExistentes);
      }
    } catch (error) {
      console.error('Error al cargar servicios:', error);
    }
  };

  const handleAgregarServicioLuz = () => {
    if (!nuevaEmpresaLuz) {
      Alert.alert('Error', 'Selecciona una empresa');
      return;
    }

    const nuevoServicio: ServicioGuardado = {
      id: Date.now().toString(),
      tipo: 'LUZ',
      empresaId: nuevaEmpresaLuz,
    };

    setServiciosLuz([...serviciosLuz, nuevoServicio]);
    setAgregandoLuz(false);
    setNuevaEmpresaLuz(null);
  };

  const handleAgregarServicioAgua = () => {
    if (!nuevaEmpresaAgua) {
      Alert.alert('Error', 'Selecciona una empresa');
      return;
    }

    const nuevoServicio: ServicioGuardado = {
      id: Date.now().toString(),
      tipo: 'AGUA',
      empresaId: nuevaEmpresaAgua,
    };

    setServiciosAgua([...serviciosAgua, nuevoServicio]);
    setAgregandoAgua(false);
    setNuevaEmpresaAgua(null);
  };

  const handleEliminarServicio = (id: string, tipo: 'LUZ' | 'AGUA') => {
    if (tipo === 'LUZ') {
      setServiciosLuz(serviciosLuz.filter(s => s.id !== id));
    } else {
      setServiciosAgua(serviciosAgua.filter(s => s.id !== id));
    }
  };

  const handleAgregarRecomendado = (empresaId: number, tipo: 'LUZ' | 'AGUA') => {
    const nuevoServicio: ServicioGuardado = {
      id: Date.now().toString(),
      tipo: tipo,
      empresaId: empresaId,
    };

    if (tipo === 'LUZ') {
      setServiciosLuz([...serviciosLuz, nuevoServicio]);
    } else {
      setServiciosAgua([...serviciosAgua, nuevoServicio]);
    }
  };

  const obtenerNombreEmpresa = (empresaId: number, tipo: 'LUZ' | 'AGUA') => {
    const empresas = tipo === 'LUZ' ? empresasLuz : empresasAgua;
    return empresas.find(e => e.id_empresa === empresaId)?.nombre_empresa || 'Desconocida';
  };

  const ordenarEmpresasPorRecomendacion = (empresas: EmpresaServicio[], recomendadas: number[]): EmpresaServicio[] => {
    if (recomendadas.length === 0) return empresas;

    const recomendadasList = empresas.filter(e => recomendadas.includes(e.id_empresa));
    const otrasEmpresas = empresas.filter(e => !recomendadas.includes(e.id_empresa));

    return [...recomendadasList, ...otrasEmpresas];
  };

  const obtenerUbicacion = async () => {
    try {
      setLoadingLocation(true);


      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLoadingLocation(false);
        setDireccion('');
        return;
      }


      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUbicacion(coords);

      const cached = geocodingCache.get(coords.latitude, coords.longitude);
      if (cached) {
        const direccionTexto = [
          cached.zone,
          cached.district,
        ].filter(Boolean).join(', ');
        setDireccion(direccionTexto);
        setDistrito(cached.district?.toLowerCase() || '');
        setCiudad(cached.district?.toLowerCase() || '');
      } else {
        const [geocode] = await Location.reverseGeocodeAsync(coords);

        if (geocode) {
          const direccionTexto = [
            geocode.street,
            geocode.district,
            geocode.city,
          ].filter(Boolean).join(', ');
          setDireccion(direccionTexto);
          const distritoVal = geocode.district?.toLowerCase() || '';
          const ciudadVal = geocode.city?.toLowerCase() || '';
          setDistrito(distritoVal);
          setCiudad(ciudadVal);

          geocodingCache.set(coords.latitude, coords.longitude, {
            district: geocode.district,
            zone: geocode.street,
            city: geocode.city,
          });
        }
      }

    } catch (error: any) {
      if (error.message?.includes('location services are disabled') ||
        error.message?.includes('unavailable')) {
      } else if (error.message?.includes('timed out')) {
        console.log('Tiempo de espera agotado al obtener ubicación');
      } else {
        console.log('Error al obtener ubicación');
      }


      setDireccion('');
      setUbicacion(null);
    } finally {
      setLoadingLocation(false);
    }
  };

  const recomendarEmpresasPorUbicacion = (distrito: string, ciudad: string) => {
    const recomendaciones = { luz: [] as number[], agua: [] as number[] };

    const esLima = ciudad.includes('lima') || ciudad.includes('callao');

    if (esLima) {
      const enelLima = empresasLuz.find(e => e.nombre_empresa.toLowerCase().includes('enel'));
      const luzSur = empresasLuz.find(e => e.nombre_empresa.toLowerCase().includes('luz del sur'));

      const sedapal = empresasAgua.find(e => e.nombre_empresa.toLowerCase().includes('sedapal'));
      const sedapalCallao = empresasAgua.find(e => e.nombre_empresa.toLowerCase().includes('sedapal') && e.nombre_empresa.toLowerCase().includes('callao'));

      if (['comas', 'independencia', 'los olivos', 'san martin de porres', 'carabayllo',
        'puente piedra', 'santa rosa', 'ancon', 'rimac'].includes(distrito)) {
        if (enelLima) recomendaciones.luz.push(enelLima.id_empresa);
        if (sedapal) recomendaciones.agua.push(sedapal.id_empresa);
      }
      else if (['san juan de miraflores', 'villa el salvador', 'villa maria del triunfo',
        'chorrillos', 'san juan de lurigancho', 'ate', 'el agustino', 'santa anita',
        'lurin', 'pachacamac', 'punta hermosa', 'punta negra', 'san bartolo',
        'santa maria del mar', 'pucusana'].includes(distrito)) {
        if (luzSur) recomendaciones.luz.push(luzSur.id_empresa);
        if (sedapal) recomendaciones.agua.push(sedapal.id_empresa);
      }
      else if (['lima', 'cercado de lima', 'breña', 'la victoria', 'san luis', 'pueblo libre',
        'jesus maria', 'magdalena', 'san miguel'].includes(distrito)) {
        if (luzSur) recomendaciones.luz.push(luzSur.id_empresa);
        if (sedapal) recomendaciones.agua.push(sedapal.id_empresa);
      }
      else if (['miraflores', 'san isidro', 'surco', 'santiago de surco', 'san borja',
        'la molina', 'barranco', 'lince', 'surquillo'].includes(distrito)) {
        if (luzSur) recomendaciones.luz.push(luzSur.id_empresa);
        if (sedapal) recomendaciones.agua.push(sedapal.id_empresa);
      }
      else if (ciudad.includes('callao') || ['callao', 'bellavista', 'carmen de la legua',
        'la perla', 'la punta', 'ventanilla', 'mi peru'].includes(distrito)) {
        if (luzSur) recomendaciones.luz.push(luzSur.id_empresa);
        if (sedapalCallao) {
          recomendaciones.agua.push(sedapalCallao.id_empresa);
        } else if (sedapal) {
          recomendaciones.agua.push(sedapal.id_empresa);
        }
      }
      else {
        if (luzSur) recomendaciones.luz.push(luzSur.id_empresa);
        if (sedapal) recomendaciones.agua.push(sedapal.id_empresa);
      }
    } else {
      if (empresasLuz.length > 0) recomendaciones.luz.push(empresasLuz[0].id_empresa);
      if (empresasAgua.length > 0) recomendaciones.agua.push(empresasAgua[0].id_empresa);
    }

    setEmpresasRecomendadas(recomendaciones);
  };

  const handleContinuar = async () => {
    try {

      if (serviciosLuz.length === 0 && serviciosAgua.length === 0) {
        Alert.alert(
          'Servicios no agregados',
          '¿Deseas continuar sin agregar servicios? Puedes hacerlo más tarde desde tu perfil.',
          [
            { text: 'Agregar servicios', style: 'cancel' },
            { text: 'Omitir', onPress: () => router.replace('/') }
          ]
        );
        return;
      }

      await continuarGuardado();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudieron guardar los servicios');
    }
  };

  const continuarGuardado = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }

      const dni = user.user_metadata.dni;
      if (!dni) {
        throw new Error('No se encontró el DNI del usuario');
      }

      const updates: any = {};
      updates.id_empresa_luz = serviciosLuz.length > 0 ? serviciosLuz[0].empresaId : null;
      updates.id_empresa_agua = serviciosAgua.length > 0 ? serviciosAgua[0].empresaId : null;

      const { error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('dni', dni);

      if (error) {
        throw new Error('No se pudieron guardar los servicios: ' + error.message);
      }

      Alert.alert(
        'Configuración completa',
        'Tus servicios han sido guardados correctamente.',
        [{ text: 'Continuar', onPress: () => router.replace('/') }]
      );

    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudieron guardar los servicios');
    } finally {
      setLoading(false);
    }
  };

  const handleOmitir = () => {
    Alert.alert(
      'Omitir configuración',
      'Podrás agregar tus servicios más tarde desde tu perfil.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Omitir', onPress: () => router.replace('/') }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="settings-outline" size={48} color={Colors.primary} />
          <Text style={styles.title}>Configura tus Servicios</Text>
          <Text style={styles.subtitle}>
            Agrega tus empresas de luz y agua para reportar incidencias más rápido
          </Text>
        </View>


        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Agrega tus servicios</Text>
          <Text style={styles.sectionSubtitle}>
            Puedes agregar múltiples servicios de luz y agua
          </Text>

          {loadingEmpresas ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Cargando empresas...</Text>
            </View>
          ) : (
            <>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <Ionicons name="flash" size={24} color={Colors.warning} />
                    <Text style={styles.sectionTitleSmall}>Servicios de Luz</Text>
                  </View>
                </View>

                {empresasRecomendadas.luz.length > 0 && serviciosLuz.length === 0 && !agregandoLuz && (
                  <View style={styles.recomendacionCard}>
                    <View style={styles.recomendacionHeader}>
                      <Ionicons name="star" size={20} color={Colors.warning} />
                      <Text style={styles.recomendacionTitle}>Recomendada para tu zona</Text>
                    </View>
                    {empresasRecomendadas.luz.map((empresaId) => {
                      const empresa = empresasLuz.find(e => e.id_empresa === empresaId);
                      if (!empresa) return null;
                      return (
                        <View key={empresaId} style={styles.recomendacionItem}>
                          <View style={styles.recomendacionInfo}>
                            <Text style={styles.recomendacionEmpresa}>{empresa.nombre_empresa}</Text>
                          </View>
                          <View style={styles.recomendacionActions}>
                            <TouchableOpacity
                              onPress={() => handleAgregarRecomendado(empresaId, 'LUZ')}
                              style={styles.quickAddButton}
                            >
                              <Ionicons name="flash" size={18} color={Colors.white} />
                              <Text style={styles.quickAddText}>Agregar</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {serviciosLuz.length > 0 && (
                  <View style={styles.serviciosList}>
                    {serviciosLuz.map((servicio) => (
                      <View key={servicio.id} style={styles.servicioCard}>
                        <View style={styles.servicioInfo}>
                          <Text style={styles.servicioEmpresa}>
                            {obtenerNombreEmpresa(servicio.empresaId, 'LUZ')}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleEliminarServicio(servicio.id, 'LUZ')}
                          style={styles.deleteButton}
                        >
                          <Ionicons name="trash-outline" size={20} color={Colors.error} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {agregandoLuz ? (
                  <View style={styles.agregarContainerSimple}>
                    <ServiceSelector
                      tipoServicio="LUZ"
                      empresas={ordenarEmpresasPorRecomendacion(empresasLuz, empresasRecomendadas.luz)}
                      empresaSeleccionada={nuevaEmpresaLuz}
                      onEmpresaChange={setNuevaEmpresaLuz}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        setAgregandoLuz(false);
                        setNuevaEmpresaLuz(null);
                      }}
                      style={styles.cancelButtonSimple}
                    >
                      <Ionicons name="close-circle-outline" size={20} color={Colors.gray600} />
                      <Text style={styles.cancelButtonTextSimple}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => setAgregandoLuz(true)}
                    style={styles.agregarNuevoButton}
                  >
                    <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
                    <Text style={styles.agregarNuevoText}>Agregar servicio de luz</Text>
                  </TouchableOpacity>
                )}
              </View>


              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <Ionicons name="water" size={24} color={Colors.info} />
                    <Text style={styles.sectionTitleSmall}>Servicios de Agua</Text>
                  </View>
                </View>

                {empresasRecomendadas.agua.length > 0 && serviciosAgua.length === 0 && !agregandoAgua && (
                  <View style={styles.recomendacionCard}>
                    <View style={styles.recomendacionHeader}>
                      <Ionicons name="star" size={20} color={Colors.info} />
                      <Text style={styles.recomendacionTitle}>Recomendada para tu zona</Text>
                    </View>
                    {empresasRecomendadas.agua.map((empresaId) => {
                      const empresa = empresasAgua.find(e => e.id_empresa === empresaId);
                      if (!empresa) return null;
                      return (
                        <View key={empresaId} style={styles.recomendacionItem}>
                          <View style={styles.recomendacionInfo}>
                            <Text style={styles.recomendacionEmpresa}>{empresa.nombre_empresa}</Text>
                          </View>
                          <View style={styles.recomendacionActions}>
                            <TouchableOpacity
                              onPress={() => handleAgregarRecomendado(empresaId, 'AGUA')}
                              style={styles.quickAddButton}
                            >
                              <Ionicons name="water" size={18} color={Colors.white} />
                              <Text style={styles.quickAddText}>Agregar</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {serviciosAgua.length > 0 && (
                  <View style={styles.serviciosList}>
                    {serviciosAgua.map((servicio) => (
                      <View key={servicio.id} style={styles.servicioCard}>
                        <View style={styles.servicioInfo}>
                          <Text style={styles.servicioEmpresa}>
                            {obtenerNombreEmpresa(servicio.empresaId, 'AGUA')}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleEliminarServicio(servicio.id, 'AGUA')}
                          style={styles.deleteButton}
                        >
                          <Ionicons name="trash-outline" size={20} color={Colors.error} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {agregandoAgua ? (
                  <View style={styles.agregarContainerSimple}>
                    <ServiceSelector
                      tipoServicio="AGUA"
                      empresas={ordenarEmpresasPorRecomendacion(empresasAgua, empresasRecomendadas.agua)}
                      empresaSeleccionada={nuevaEmpresaAgua}
                      onEmpresaChange={setNuevaEmpresaAgua}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        setAgregandoAgua(false);
                        setNuevaEmpresaAgua(null);
                      }}
                      style={styles.cancelButtonSimple}
                    >
                      <Ionicons name="close-circle-outline" size={20} color={Colors.gray600} />
                      <Text style={styles.cancelButtonTextSimple}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => setAgregandoAgua(true)}
                    style={styles.agregarNuevoButton}
                  >
                    <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
                    <Text style={styles.agregarNuevoText}>Agregar servicio de agua</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>


        <View style={styles.buttonContainer}>
          <AnimatedButton
            title="Guardar y Continuar"
            variant="secondary"
            onPress={handleContinuar}
            loading={loading}
            disabled={loading || loadingEmpresas}
          />

          <AnimatedButton
            title="Omitir por ahora"
            variant="ghost"
            onPress={handleOmitir}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.gray600,
    marginTop: Spacing.xs,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  locationCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  locationTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray800,
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  locationLoadingText: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray600,
  },
  locationInfo: {
    gap: Spacing.xs,
  },
  locationText: {
    fontSize: Typography.sizes.md,
    color: Colors.gray800,
    fontWeight: Typography.weights.medium,
  },
  locationCoords: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray500,
    fontFamily: 'monospace',
  },
  locationError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    backgroundColor: Colors.warning + '15',
    borderRadius: 8,
  },
  locationErrorText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.gray700,
    lineHeight: 18,
  },
  recomendacionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.success + '15',
    borderRadius: 8,
  },
  recomendacionText: {
    fontSize: Typography.sizes.sm,
    color: Colors.success,
    fontWeight: Typography.weights.medium,
  },
  recomendacionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    backgroundColor: Colors.warning + '15',
    borderRadius: 20,
    marginBottom: Spacing.md,
  },
  recomendacionChipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.warning,
    fontWeight: Typography.weights.semibold,
  },
  servicesSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.gray800,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray600,
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.gray600,
  },
  buttonContainer: {
    gap: Spacing.md,
    marginTop: 'auto',
    paddingTop: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitleSmall: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.gray800,
  },
  serviciosList: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  servicioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  servicioInfo: {
    flex: 1,
  },
  servicioEmpresa: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray800,
    marginBottom: 4,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
  agregarNuevoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    backgroundColor: Colors.primary + '05',
  },
  agregarNuevoText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
  agregarContainer: {
    backgroundColor: Colors.gray50,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  agregarContainerSimple: {
    marginBottom: Spacing.md,
  },
  cancelButtonSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: 8,
  },
  cancelButtonTextSimple: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.gray600,
  },
  agregarButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray400,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray700,
  },
  addButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.white,
  },

  recomendacionCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary + '40',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recomendacionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  recomendacionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.gray800,
  },
  recomendacionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  recomendacionInfo: {
    flex: 1,
  },
  recomendacionEmpresa: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray800,
    marginBottom: 4,
  },
  recomendacionActions: {
    marginLeft: Spacing.sm,
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickAddText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.white,
  },
  manualAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    borderRadius: 8,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  manualAddText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.primary,
  },
});
