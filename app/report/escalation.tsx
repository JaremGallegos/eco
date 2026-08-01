import { AnimatedButton, AnimatedCard, FadeInView } from '@/components/ui';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useDetailVM } from '@/src/viewmodels';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EscalationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { incident, loading } = useDetailVM(id ? parseInt(id, 10) : null);
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (incident) {
      const reportDate = new Date(incident.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - reportDate.getTime());
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

      if (diffHours < 24) {
        Alert.alert(
          "Plazo no cumplido",
          "Debes esperar 24 horas desde el reporte para poder escalar el caso.",
          [{ text: "Entendido", onPress: () => router.back() }]
        );
      }
    }
  }, [incident]);

  if (loading || !incident) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const regulatorName = incident.serviceType === 'Agua' ? 'SUNASS' : 'OSINERGMIN';
  const companyName = incident.serviceType === 'Agua' ? 'SEDAPAL' : 'ENEL/LUZ DEL SUR';

  const generateComplaintText = () => {
    const reportDate = new Date(incident.createdAt).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const now = new Date().toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });


    const reportDateTime = new Date(incident.createdAt);
    const nowDateTime = new Date();
    const diffTime = Math.abs(nowDateTime.getTime() - reportDateTime.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    const serviceType = incident.serviceType === 'Agua' ? 'Agua Potable' : 'Energía Eléctrica';
    const companyName = incident.serviceType === 'Agua' ? 'SEDAPAL' : 'Enel Distribución Perú / Luz del Sur';


    const ubicacionDetalle = [];
    if (incident.location.district) ubicacionDetalle.push(`Distrito: ${incident.location.district}`);
    if (incident.location.zone) ubicacionDetalle.push(`Zona: ${incident.location.zone}`);
    if (incident.location.postalCode) ubicacionDetalle.push(`Código Postal: ${incident.location.postalCode}`);
    if (incident.location.address) ubicacionDetalle.push(`Dirección: ${incident.location.address}`);


    const tipoFalla = incident.failureType ? `
Tipo de Falla: ${incident.failureType.name}
Gravedad: ${incident.failureType.severity}` : '';


    let historialEstados = '';
    if (incident.timeline && incident.timeline.length > 0) {
      historialEstados = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VI. HISTORIAL DE ESTADOS DEL REPORTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;
      incident.timeline.forEach((event, index) => {
        const eventTimestamp = event.timestamp || event.fecha_cambio || new Date().toISOString();
        const eventDate = new Date(eventTimestamp).toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const newStatus = event.estado_nuevo?.nombre_estado || event.newStatus || 'Estado no disponible';

        historialEstados += `${index + 1}. ${newStatus}\n`;
        historialEstados += `   Fecha: ${eventDate}\n`;

        const responsibleUser = event.usuario
          ? `${event.usuario.nombres} ${event.usuario.apellidos}`
          : event.responsibleUser;

        if (responsibleUser) {
          historialEstados += `   Responsable: ${responsibleUser}\n`;
        }

        const comment = event.comentario_interno || event.comment;
        if (comment) {
          historialEstados += `   Comentario: ${comment}\n`;
        }
        historialEstados += '\n';
      });
    }

    return `FORMATO DE RECLAMO - ${regulatorName}
RECLAMO POR DEFICIENCIA EN SERVICIO PÚBLICO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
I. DATOS DEL REPORTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Código de Seguimiento: ${incident.trackingCode}
Servicio Afectado: ${serviceType}
Empresa Prestadora: ${companyName}
Estado Actual: ${incident.status}
Fecha del Reporte Original: ${reportDate}
Fecha de Escalamiento: ${now}
Tiempo Transcurrido: ${diffHours} horas y ${diffMinutes} minutos
${tipoFalla}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
II. DESCRIPCIÓN DEL PROBLEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reporté una deficiencia en el servicio de ${serviceType} el día ${reportDate}, habiendo transcurrido ${diffHours} horas sin recibir atención efectiva por parte de ${companyName}.

En virtud del Artículo 18 del marco regulatorio de servicios públicos (Ley T-SAP), solicito formalmente la activación del mecanismo de Atención Prioritaria al Usuario para resolver la situación de manera urgente.

DETALLE DEL PROBLEMA:
${incident.description || 'Sin descripción adicional.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
III. UBICACIÓN EXACTA DEL INCIDENTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${ubicacionDetalle.length > 0 ? ubicacionDetalle.join('\n') : 'Dirección: No disponible'}

Coordenadas GPS: 
Latitud: ${incident.location.latitude.toFixed(6)}
Longitud: ${incident.location.longitude.toFixed(6)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IV. EVIDENCIA MULTIMEDIA Y DOCUMENTACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cantidad de Archivos Adjuntos: ${incident.media.length} archivo(s)
${incident.media.length > 0 ? `

Las evidencias fotográficas están disponibles en el sistema ECO.
Para acceso a las mismas, utilizar el código de seguimiento: ${incident.trackingCode}

Lista de evidencias:
${incident.media.map((_, index) => `${index + 1}. Archivo de evidencia #${index + 1}`).join('\n')}` : 'Sin evidencia multimedia registrada.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
V. FUNDAMENTO LEGAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Base legal para el reclamo:
• Ley Marco de los Servicios de Saneamiento
• Reglamento de Calidad de la Prestación de Servicios
• Artículo 18 - Ley T-SAP (Atención Prioritaria al Usuario)
• Plazo máximo de atención: 24 horas
• Tiempo transcurrido: ${diffHours} horas

El incumplimiento del plazo establecido constituye una infracción a las
normas de calidad del servicio público.
${historialEstados}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${incident.timeline && incident.timeline.length > 0 ? 'VII' : 'VI'}. SOLICITUD Y PETICIONES ESPECÍFICAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Solicito formalmente a ${regulatorName} que:

1. INVESTIGUE el incumplimiento del plazo legal de atención establecido en 
   el marco normativo vigente.

2. DISPONGA las medidas correctivas urgentes para solucionar el problema 
   reportado con código ${incident.trackingCode}.

3. SANCIONE administrativamente a ${companyName} por el incumplimiento 
   de los estándares de calidad del servicio.

4. INFORME sobre las acciones correctivas implementadas y el cronograma 
   de solución definitiva.

5. GARANTICE que situaciones similares no se repitan en la zona afectada.

6. NOTIFIQUE formalmente la resolución del presente reclamo.

Solicito respuesta en un plazo no mayor a 15 días hábiles conforme a la 
normativa de transparencia y atención al usuario.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DECLARACIÓN JURADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Declaro bajo juramento que la información consignada en el presente 
documento es veraz y puede ser verificada en el sistema ECO mediante 
el código de seguimiento proporcionado.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Documento generado automáticamente por Sistema ECO
Plataforma de Reporte Ciudadano de Servicios Públicos
Fecha de generación: ${now}
Código de verificación: ${incident.trackingCode}

NOTA IMPORTANTE: Este documento puede ser presentado en la mesa de partes
virtual de ${regulatorName} o enviado por correo electrónico certificado.
`;
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(generateComplaintText());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert('Copiado', 'El texto del reclamo ha sido copiado al portapapeles.');
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Asistencia Legal</Text>
        </View>

        <FadeInView delay={100}>
          <View style={styles.warningCard}>
            <Ionicons name="warning" size={32} color={Colors.secondary} />
            <View style={styles.warningTextContainer}>
              <Text style={styles.warningTitle}>Plazo Legal Vencido</Text>
              <Text style={styles.warningText}>
                Han pasado más de 24h sin solución. Tienes derecho a elevar este reclamo a {regulatorName}.
              </Text>
            </View>
          </View>
        </FadeInView>

        <FadeInView delay={200}>
          <Text style={styles.sectionTitle}>Documento Generado</Text>
          <AnimatedCard containerStyle={styles.documentCard} delay={200}>
            <View style={styles.documentHeader}>
              <Ionicons name="document-text" size={24} color={Colors.primary} />
              <Text style={styles.documentTitle}>Solicitud para {regulatorName}</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.documentBody}>{generateComplaintText()}</Text>
          </AnimatedCard>
        </FadeInView>

        <FadeInView delay={300} style={styles.footer}>
          <AnimatedButton
            title={copied ? "¡Texto Copiado!" : "Copiar Texto del Reclamo"}
            onPress={handleCopy}
            buttonStyle={[styles.copyButton, copied && styles.copyButtonSuccess]}
            icon={<Ionicons name={copied ? "checkmark" : "copy"} size={20} color="white" />}
            iconContainerStyle={{ marginRight: 8 }}
          />
          <Text style={styles.footerNote}>
            Copia este texto y envíalo a través de la mesa de partes virtual de {regulatorName} o por correo electrónico.
          </Text>
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundAlt,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningBg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.warningBorder,
  },
  warningTextContainer: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  warningTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.warningDark,
    marginBottom: 4,
  },
  warningText: {
    fontSize: Typography.sizes.sm,
    color: Colors.warningDarker,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginBottom: Spacing.md,
    marginLeft: 4,
  },
  documentCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  documentTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginLeft: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray300,
    marginBottom: Spacing.md,
  },
  documentBody: {
    fontSize: Typography.sizes.sm,
    color: Colors.light.text,
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  footer: {
    marginTop: Spacing.sm,
  },
  copyButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
  },
  copyButtonSuccess: {
    backgroundColor: Colors.success,
  },
  footerNote: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.sm,
    color: Colors.gray600,
    textAlign: 'center',
    lineHeight: 18,
  },
});
