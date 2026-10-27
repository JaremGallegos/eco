import { AnimatedMarker, FilterButton, MapControlButton, MapLegend } from '@/components/map';
import { FadeInView } from '@/components/ui';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { withOpacity } from '@/src/utils/styles';
import { useMapVM } from '@/src/viewmodels';
import * as Location from 'expo-location';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, View } from 'react-native';
import MapView, { Heatmap, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Map() {
  const { incidents, loading } = useMapVM();
  const [filterType, setFilterType] = useState<'all' | 'agua' | 'luz'>('all');
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mapRegion, setMapRegion] = useState<any>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        setMapRegion(region);
      } else {
        const defaultRegion = {
          latitude: -12.0464,
          longitude: -77.0428,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        };
        setMapRegion(defaultRegion);
        setLocationError('Permisos de ubicación denegados');
      }
    } catch (error) {
      console.error('Error location:', error);
      const defaultRegion = {
        latitude: -12.0464,
        longitude: -77.0428,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
      setMapRegion(defaultRegion);
      setLocationError('Error al obtener ubicación');
    }
  };

  const handleRecenter = () => {
    if (userLocation) {
      setMapRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  const filteredIncidents = useMemo(() => {
    return incidents.filter((r) =>
      filterType === 'all' ||
      (filterType === 'agua' && r.serviceType === 'AGUA') ||
      (filterType === 'luz' && r.serviceType === 'LUZ')
    );
  }, [incidents, filterType]);

  const heatmapPoints = useMemo(() => {
    return filteredIncidents.map((r) => ({
      latitude: r.location.latitude,
      longitude: r.location.longitude,
      weight: 1,
    }));
  }, [filteredIncidents]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {heatmapPoints.length > 0 && (
          <Heatmap
            points={heatmapPoints}
            opacity={0.6}
            radius={50}
            gradient={{
              colors: [Colors.heatmapStart, Colors.heatmapCool, Colors.heatmapMid, Colors.heatmapWarm, Colors.heatmapHot],
              startPoints: [0.01, 0.2, 0.5, 0.8, 1],
              colorMapSize: 256,
            }}
          />
        )}
        {filteredIncidents.map((incident) => (
          <Marker
            key={incident.id}
            coordinate={{
              latitude: incident.location.latitude,
              longitude: incident.location.longitude,
            }}
            title={incident.serviceType === 'AGUA' ? 'Problema de Agua' : 'Problema de Electricidad'}
            description={incident.status}
          >
            <AnimatedMarker type={incident.serviceType.toLowerCase()} />
          </Marker>
        ))}
      </MapView>


      <SafeAreaView style={styles.topOverlay} edges={['top']}>
        <FadeInView delay={100}>
          <View style={styles.glassHeader}>
            <Text style={styles.headerTitle}>Mapa de Incidencias</Text>
            <View style={styles.filterRow}>
              <FilterButton
                title="Todos"
                active={filterType === 'all'}
                onPress={() => setFilterType('all')}
              />
              <FilterButton
                title="Agua"
                active={filterType === 'agua'}
                onPress={() => setFilterType('agua')}
                icon="water"
                color={Colors.waterAccent}
              />
              <FilterButton
                title="Luz"
                active={filterType === 'luz'}
                onPress={() => setFilterType('luz')}
                icon="flash"
                color={Colors.electricAccent}
              />
            </View>
          </View>
        </FadeInView>
      </SafeAreaView>


      <SafeAreaView style={styles.bottomOverlay} edges={['bottom']}>
        <View style={styles.bottomRow}>
          <FadeInView delay={300} style={styles.legendContainer}>
            <MapLegend />
          </FadeInView>

          <FadeInView delay={400}>
            <MapControlButton
              icon="locate"
              onPress={handleRecenter}
            />
          </FadeInView>
        </View>
      </SafeAreaView>
    </View>
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
    backgroundColor: Colors.light.backgroundAlt,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
  },
  glassHeader: {
    backgroundColor: withOpacity(Colors.light.card, 0.9),
    borderRadius: BorderRadius.xxl,
    padding: Spacing.md,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: withOpacity(Colors.light.card, 0.5),
  },
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },

  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    pointerEvents: 'box-none',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  legendContainer: {
    flex: 1,
    marginRight: Spacing.lg,
  },
});
