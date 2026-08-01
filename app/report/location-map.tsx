
import { AnimatedButton, AnimatedCard, FadeInView } from '@/components/ui';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { navigateToEvidence } from '@/src/navigation';
import { geocodingCache } from '@/src/utils/geocodingCache';
import { useReportVM } from '@/src/viewmodels';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LocationMap() {
  const { location, setLocation } = useReportVM();
  const [mapRegion, setMapRegion] = useState({
    latitude: location?.latitude || -12.0464,
    longitude: location?.longitude || -77.0428,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(location);
  const [geocodingData, setGeocodingData] = useState<{
    district?: string;
    zone?: string;
    postalCode?: string;
    address?: string;
  } | null>(
    location
      ? {
        district: location.district,
        zone: location.zone,
        postalCode: location.postalCode,
        address: location.address,
      }
      : null
  );
  const [loadingGeocode, setLoadingGeocode] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastGeocodeRef = useRef<{ lat: number; lng: number } | null>(null);

  React.useEffect(() => {
    if (!location) {
      handleUseCurrentLocation();
    }
  }, []);

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const cached = geocodingCache.get(latitude, longitude);
      if (cached) {
        setGeocodingData(cached);
        return;
      }

      setLoadingGeocode(true);
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (result.length > 0) {
        const address = result[0];
        const data = {
          district: (address.district || address.subregion || address.city) ?? undefined,
          zone: (address.street || address.name) ?? undefined,
          postalCode: address.postalCode ?? undefined,
          address: `${address.street || ''} ${address.streetNumber || ''}`.trim(),
        };

        geocodingCache.set(latitude, longitude, data);
        setGeocodingData(data);
      }
    } catch (error) {
      console.log('Error:', error);
    } finally {
      setLoadingGeocode(false);
    }
  };

  const handleMapPress = async (event: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { latitude, longitude } = event.nativeEvent.coordinate;

    const last = lastGeocodeRef.current;
    if (last) {
      const distance = Math.sqrt(
        Math.pow(latitude - last.lat, 2) + Math.pow(longitude - last.lng, 2)
      );
      if (distance < 0.0001) {
        setSelectedLocation({ latitude, longitude });
        return;
      }
    }

    setSelectedLocation({ latitude, longitude });
    setGeocodingData(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      lastGeocodeRef.current = { lat: latitude, lng: longitude };
      await reverseGeocode(latitude, longitude);
    }, 500);
  };

  const handleUseCurrentLocation = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permisos de ubicación denegados');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setSelectedLocation(coords);
      setMapRegion({
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      await reverseGeocode(coords.latitude, coords.longitude);
    } catch (error) {
      console.error('Error:', error);
      setLoadingGeocode(false);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setLocation({
        ...selectedLocation,
        ...geocodingData,
      });
      navigateToEvidence();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={mapRegion}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={false}
          mapType="standard"
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              title="Ubicación del incidente"
              description="Toca el mapa para cambiar la ubicación"
            >
              <AnimatedMarkerPin />
            </Marker>
          )}
        </MapView>


        <FadeInView delay={0}>
          <View style={styles.overlay}>
            <AnimatedCard containerStyle={styles.instructionCard} delay={0}>
              <View style={styles.instructionHeader}>
                <View style={styles.instructionIconContainer}>
                  <Ionicons name="location" size={24} color={Colors.primary} />
                </View>
                <Text style={styles.instructionText}>
                  Toca el mapa para seleccionar la ubicación del incidente
                </Text>
              </View>
            </AnimatedCard>
          </View>
        </FadeInView>


        <SafeAreaView style={styles.bottomActionsContainer} edges={['bottom']}>
          <View style={styles.bottomActions}>
            {selectedLocation && (
              <FadeInView delay={0}>
                <AnimatedCard containerStyle={styles.coordsCard} delay={0}>
                  <View style={styles.coordsHeader}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.successDark} />
                    <Text style={styles.coordsLabel}>Ubicación seleccionada</Text>
                  </View>
                  {loadingGeocode ? (
                    <ActivityIndicator
                      size="small"
                      color={Colors.primary}
                      style={{ marginVertical: 8 }}
                    />
                  ) : (
                    <>
                      <Text style={styles.coordsText}>
                        {selectedLocation.latitude.toFixed(6)},{' '}
                        {selectedLocation.longitude.toFixed(6)}
                      </Text>
                      {geocodingData && (
                        <View style={styles.geoInfo}>
                          {geocodingData.district && (
                            <View style={styles.geoRow}>
                              <Ionicons name="location" size={14} color={Colors.primary} />
                              <Text style={styles.geoText}>{geocodingData.district}</Text>
                            </View>
                          )}
                          {geocodingData.zone && (
                            <View style={styles.geoRow}>
                              <Ionicons name="navigate" size={14} color={Colors.primary} />
                              <Text style={styles.geoText}>{geocodingData.zone}</Text>
                            </View>
                          )}
                          {geocodingData.postalCode && (
                            <View style={styles.geoRow}>
                              <Ionicons name="pricetag" size={14} color={Colors.primary} />
                              <Text style={styles.geoText}>
                                {geocodingData.postalCode}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}
                    </>
                  )}
                </AnimatedCard>
              </FadeInView>
            )}

            <AnimatedButton
              title="Usar mi ubicación actual"
              icon={<Ionicons name="locate" size={20} color="white" />}
              iconContainerStyle={{ marginRight: 10 }}
              buttonStyle={styles.locationButton}
              onPress={handleUseCurrentLocation}
            />

            <AnimatedButton
              title="Confirmar ubicación"
              icon={<Ionicons name="checkmark" size={20} color="white" />}
              iconContainerStyle={{ marginRight: 10 }}
              buttonStyle={styles.confirmButton}
              onPress={handleConfirm}
              disabled={!selectedLocation}
            />
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}


function AnimatedMarkerPin() {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withSpring(1.2, { damping: 10, stiffness: 200 });
    const timer = setTimeout(() => {
      scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View style={styles.markerContainer}>
        <Ionicons name="location" size={40} color={Colors.secondary} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 1,
  },
  instructionCard: {
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.background,
    padding: Spacing.md,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primaryAlpha,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  instructionText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
    lineHeight: 20,
  },
  bottomActionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  bottomActions: {
    padding: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: 'transparent',
  },
  locationButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
  },
  coordsCard: {
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.background,
    padding: Spacing.md,
  },
  coordsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  coordsLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.success,
    marginLeft: Spacing.sm,
    fontWeight: Typography.weights.bold,
  },
  coordsText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
    fontFamily: 'monospace',
  },
  geoInfo: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray300,
    gap: Spacing.xs,
  },
  geoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  geoText: {
    fontSize: Typography.sizes.xs,
    color: Colors.gray600,
    marginLeft: Spacing.sm,
    fontWeight: Typography.weights.medium,
  },
  confirmButton: {
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    elevation: 6,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
