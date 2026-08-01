import { Colors, Spacing, Typography } from '@/constants/theme';
import { EmpresaServicio } from '@/src/models/Database';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ServiceSelectorProps {
  tipoServicio: 'LUZ' | 'AGUA';
  empresas: EmpresaServicio[];
  empresaSeleccionada: number | null;
  onEmpresaChange: (idEmpresa: number | null) => void;
  error?: string;
  loading?: boolean;
}

export default function ServiceSelector({
  tipoServicio,
  empresas,
  empresaSeleccionada,
  onEmpresaChange,
  error,
  loading = false,
}: ServiceSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const empresaActual = empresas.find(e => e.id_empresa === empresaSeleccionada);
  const iconName = tipoServicio === 'LUZ' ? 'flash' : 'water';
  const color = tipoServicio === 'LUZ' ? Colors.warning : Colors.info;

  const handleSelectEmpresa = (idEmpresa: number) => {
    onEmpresaChange(idEmpresa);
    setModalVisible(false);
  };

  const handleClearSelection = () => {
    onEmpresaChange(null);
  };

  return (
    <View style={styles.container}>

      <TouchableOpacity
        style={[
          styles.selectorSimple,
          empresaSeleccionada ? styles.selectorActive : null,
          error ? styles.selectorError : null
        ]}
        onPress={() => setModalVisible(true)}
        disabled={loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator size="small" color={color} />
        ) : (
          <>
            <View style={styles.selectorContent}>
              <View style={[styles.iconBadge, { backgroundColor: empresaActual ? color + '15' : Colors.gray200 }]}>
                <Ionicons
                  name="business"
                  size={20}
                  color={empresaActual ? color : Colors.gray500}
                />
              </View>
              <View style={styles.selectorTextContainer}>
                <Text style={[
                  styles.selectorText,
                  !empresaActual && styles.placeholderText
                ]}>
                  {empresaActual ? empresaActual.nombre_empresa : 'Seleccionar empresa'}
                </Text>
                {empresaActual && (
                  <Text style={styles.empresaCodeSmall}>
                    Código: {empresaActual.codigo_empresa}
                  </Text>
                )}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={empresaActual ? color : Colors.gray400} />
          </>
        )}
      </TouchableOpacity>


      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Seleccionar Empresa de {tipoServicio === 'LUZ' ? 'Luz' : 'Agua'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={Colors.gray700} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              {empresas.length} empresas disponibles en tu zona
            </Text>

            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {empresas.map((empresa, index) => (
                <TouchableOpacity
                  key={empresa.id_empresa}
                  style={[
                    styles.empresaItem,
                    empresaSeleccionada === empresa.id_empresa && styles.empresaItemSelected
                  ]}
                  onPress={() => handleSelectEmpresa(empresa.id_empresa)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.empresaIconContainer,
                    { backgroundColor: empresaSeleccionada === empresa.id_empresa ? color + '15' : Colors.gray100 }
                  ]}>
                    <Ionicons
                      name="business"
                      size={20}
                      color={empresaSeleccionada === empresa.id_empresa ? color : Colors.gray600}
                    />
                  </View>
                  <View style={styles.empresaInfo}>
                    <Text style={[
                      styles.empresaName,
                      empresaSeleccionada === empresa.id_empresa && styles.empresaNameSelected
                    ]}>
                      {empresa.nombre_empresa}
                    </Text>
                    <View style={styles.empresaCodeContainer}>
                      <Ionicons name="pricetag" size={12} color={Colors.gray500} />
                      <Text style={styles.empresaCode}>{empresa.codigo_empresa}</Text>
                    </View>
                  </View>
                  {empresaSeleccionada === empresa.id_empresa && (
                    <View style={[styles.checkmarkContainer, { backgroundColor: Colors.success }]}>
                      <Ionicons name="checkmark" size={20} color={Colors.white} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  selectorSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.gray300,
    borderRadius: 12,
    padding: Spacing.md,
    minHeight: 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray800,
  },
  optional: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray500,
    fontStyle: 'italic',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 12,
    padding: Spacing.md,
    minHeight: 56,
  },
  selectorError: {
    borderColor: Colors.error,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  selectorText: {
    fontSize: Typography.sizes.md,
    color: Colors.gray800,
    flex: 1,
  },
  placeholderText: {
    color: Colors.gray500,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.gray800,
  },
  modalList: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  empresaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  empresaItemSelected: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  empresaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  empresaInfo: {
    flex: 1,
  },
  empresaName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray800,
    marginBottom: 4,
  },
  empresaNameSelected: {
    fontWeight: '700',
  },
  empresaCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  empresaCode: {
    fontSize: 12,
    color: Colors.gray600,
    marginLeft: 4,
  },
  checkmarkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.gray600,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.gray800,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.gray600,
  },
  clearButton: {
    padding: 8,
  },
  selectorActive: {
    backgroundColor: Colors.white,
    borderWidth: 2,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectorTextContainer: {
    flex: 1,
  },
  empresaCodeSmall: {
    fontSize: 12,
    color: Colors.gray600,
    marginTop: 2,
  },
});
