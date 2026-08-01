import * as ImagePicker from 'expo-image-picker';

export async function requestMediaLibraryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === ImagePicker.PermissionStatus.GRANTED;
}

export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === ImagePicker.PermissionStatus.GRANTED;
}

export async function pickMediaFromLibrary(options?: {
  maxCount?: number;
  allowsEditing?: boolean;
}): Promise<string[]> {
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) {
    throw new Error('Permiso de galería denegado');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images', 'videos'],
    allowsEditing: options?.allowsEditing ?? false,
    quality: 1,
    allowsMultipleSelection: (options?.maxCount ?? 1) > 1,
    selectionLimit: options?.maxCount ?? 1,
  });

  if (result.canceled) {
    return [];
  }

  return result.assets.map((asset) => asset.uri);
}

export async function captureMediaFromCamera(options?: {
  allowsEditing?: boolean;
}): Promise<string | null> {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    throw new Error('Permiso de cámara denegado');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images', 'videos'],
    allowsEditing: options?.allowsEditing ?? false,
    quality: 1,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0]?.uri ?? null;
}

