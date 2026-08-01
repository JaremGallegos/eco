import { AppConfig } from '../config/app.config';
import { withTimeout } from '../utils/async';
import { isValidCoordinates } from '../utils/validation';

export interface GeocodingResult {
  district?: string;
  zone?: string;
  postalCode?: string;
  address?: string;
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodingResult> {
  if (!isValidCoordinates(latitude, longitude)) {
    return getBasicGeocoding(latitude, longitude);
  }

  try {
    const apiKey = AppConfig.geocoding.googleMapsApiKey;

    if (!apiKey) {
      return getBasicGeocoding(latitude, longitude);
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=es&region=pe`;

    const fetchPromise = fetch(url);
    const response = await withTimeout(
      fetchPromise,
      AppConfig.geocoding.timeout,
      'Geocoding request timed out'
    );

    if (!response.ok) {
      return getBasicGeocoding(latitude, longitude);
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return getBasicGeocoding(latitude, longitude);
    }

    const result = data.results[0];
    const addressComponents = result.address_components || [];

    let district: string | undefined;
    let zone: string | undefined;
    let postalCode: string | undefined;
    let street: string | undefined;
    let locality: string | undefined;
    const address = result.formatted_address;

    for (const component of addressComponents) {
      const types = component.types || [];

      if (!district && (types.includes('sublocality_level_1') || types.includes('administrative_area_level_3'))) {
        district = component.long_name;
      }

      if (!zone && (types.includes('sublocality') || types.includes('neighborhood'))) {
        zone = component.long_name;
      }

      if (!postalCode && types.includes('postal_code')) {
        postalCode = component.long_name;
      }

      if (!street && types.includes('route')) {
        street = component.long_name;
      }

      if (!locality && types.includes('locality')) {
        locality = component.long_name;
      }
    }

    if (!district) {
      const adminLevel2 = addressComponents.find(
        (c: any) => c.types?.includes('administrative_area_level_2')
      );
      if (adminLevel2) {
        district = adminLevel2.long_name;
      }
    }

    if (!zone && locality) {
      zone = locality;
    }

    let enhancedAddress = address;
    if (!address || address.includes('Unnamed')) {
      const parts = [];
      if (street) parts.push(street);
      if (district) parts.push(district);
      if (locality && locality !== district) parts.push(locality);
      enhancedAddress = parts.length > 0 ? parts.join(', ') : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }

    return {
      district: district || locality,
      zone,
      postalCode,
      address: enhancedAddress,
    };
  } catch (error) {
    console.error('Error:', error);
    return getBasicGeocoding(latitude, longitude);
  }
}

function getBasicGeocoding(
  latitude: number,
  longitude: number
): GeocodingResult {
  const limaDistricts: { [key: string]: { lat: number; lng: number; name: string } } = {
    'Miraflores': { lat: -12.1196, lng: -77.0303, name: 'Miraflores' },
    'San Isidro': { lat: -12.0989, lng: -77.0365, name: 'San Isidro' },
    'Surco': { lat: -12.1369, lng: -76.9914, name: 'Santiago de Surco' },
    'La Molina': { lat: -12.0847, lng: -76.9481, name: 'La Molina' },
    'San Borja': { lat: -12.0900, lng: -77.0075, name: 'San Borja' },
  };

  let closestDistrict: string | undefined;
  let minDistance = Infinity;

  for (const [key, value] of Object.entries(limaDistricts)) {
    const distance = Math.sqrt(
      Math.pow(latitude - value.lat, 2) + Math.pow(longitude - value.lng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestDistrict = value.name;
    }
  }

  return {
    district: closestDistrict,
    zone: undefined,
    postalCode: undefined,
    address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
  };
}

