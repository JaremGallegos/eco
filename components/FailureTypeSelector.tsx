
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { getFailureTypes } from '@/src/services/api';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface FailureType {
  id_tipo_falla: number;
  nombre_falla: string;
  gravedad_defecto: 'Baja' | 'Media' | 'Alta' | 'Critica';
}

interface FailureTypeSelectorProps {
  serviceType: 'AGUA' | 'LUZ' | null;
  selectedIds: number[];
  onSelect: (ids: number[], names: string[]) => void;
  maxSelections?: number;
}

export function FailureTypeSelector({
  serviceType,
  selectedIds,
  onSelect,
  maxSelections = 3,
}: FailureTypeSelectorProps) {
  const [failureTypes, setFailureTypes] = useState<FailureType[]>([]);
  const [loading, setLoading] = useState(false);

  const handleToggleSelection = (typeId: number, typeName: string) => {
    const isSelected = selectedIds.includes(typeId);

    if (isSelected) {

      const newIds = selectedIds.filter(id => id !== typeId);
      const newNames = newIds.map(id => {
        const type = failureTypes.find(t => t.id_tipo_falla === id);
        return type?.nombre_falla || '';
      });
      onSelect(newIds, newNames);
    } else {

      if (selectedIds.length < maxSelections) {
        const newIds = [...selectedIds, typeId];
        const newNames = newIds.map(id => {
          const type = failureTypes.find(t => t.id_tipo_falla === id);
          return type?.nombre_falla || '';
        });
        onSelect(newIds, newNames);
      }
    }
  };

  useEffect(() => {
    if (serviceType) {
      loadFailureTypes();
    } else {
      setFailureTypes([]);
    }
  }, [serviceType]);

  const loadFailureTypes = async () => {
    if (!serviceType) return;

    setLoading(true);
    try {
      const data = await getFailureTypes(serviceType);
      setFailureTypes(data);
    } catch (error) {
      console.error('error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critica':
        return Colors.severityCritical;
      case 'Alta':
        return Colors.severityHigh;
      case 'Media':
        return Colors.severityMedium;
      case 'Baja':
        return Colors.severityLow;
      default:
        return Colors.textGray;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critica':
        return 'alert-circle';
      case 'Alta':
        return 'warning';
      case 'Media':
        return 'information-circle';
      case 'Baja':
        return 'checkmark-circle';
      default:
        return 'help-circle';
    }
  };

  if (!serviceType) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={40} color={Colors.mediumGray} />
        <Text style={styles.emptyText}>
          Primero selecciona el tipo de servicio (Agua o Luz)
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando tipos de falla...</Text>
      </View>
    );
  }

  if (failureTypes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={40} color={Colors.mediumGray} />
        <Text style={styles.emptyText}>
          No hay tipos de falla disponibles para {serviceType}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.cardContainer}>
        <View style={styles.header}>
          <Ionicons name="alert-circle" size={24} color={Colors.primary} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Tipo de falla</Text>
            <Text style={styles.headerSubtitle}>
              Selecciona hasta {maxSelections} {maxSelections === 1 ? 'opción' : 'opciones'}
              {selectedIds.length > 0 && ` (${selectedIds.length}/${maxSelections})`}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {failureTypes.map((type) => {
            const severityColor = getSeverityColor(type.gravedad_defecto);
            const severityIcon = getSeverityIcon(type.gravedad_defecto);
            const isSelected = selectedIds.includes(type.id_tipo_falla);
            const isDisabled = !isSelected && selectedIds.length >= maxSelections;

            return (
              <TouchableOpacity
                key={type.id_tipo_falla}
                style={[
                  styles.typeCard,
                  isSelected && styles.typeCardSelected,
                  isDisabled && styles.typeCardDisabled,
                ]}
                onPress={() => handleToggleSelection(type.id_tipo_falla, type.nombre_falla)}
                activeOpacity={0.7}
                disabled={isDisabled}
              >
                <View style={styles.typeContent}>
                  <View style={styles.typeInfo}>
                    <Text style={[styles.typeName, isSelected && styles.typeNameSelected]}>
                      {type.nombre_falla}
                    </Text>
                    <View style={styles.severityBadge}>
                      <Ionicons
                        name={severityIcon}
                        size={14}
                        color={severityColor}
                      />
                      <Text style={[styles.severityText, { color: severityColor }]}>
                        {type.gravedad_defecto}
                      </Text>
                    </View>
                  </View>

                  {isSelected && (
                    <View style={styles.checkIcon}>
                      <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  cardContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  headerTitle: {
    color: Colors.primary,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  headerSubtitle: {
    color: Colors.gray600,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray300,
    marginBottom: Spacing.md,
  },
  container: {
    maxHeight: 450,
  },
  content: {
    paddingVertical: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.darkGray,
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.sizes.md,
    color: Colors.textGray,
    fontWeight: Typography.weights.medium,
  },
  typeCard: {
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.gray300,
  },
  typeCardSelected: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
  },
  typeCardDisabled: {
    opacity: 0.5,
  },
  typeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeInfo: {
    flex: 1,
  },
  typeName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textDark,
    marginBottom: Spacing.sm,
  },
  typeNameSelected: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryAlpha,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  severityText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    textTransform: 'uppercase',
  },
  checkIcon: {
    marginLeft: Spacing.md,
  },
});
