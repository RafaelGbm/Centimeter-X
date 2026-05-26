import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

interface UseCameraResult {
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
  takePhoto: () => Promise<string | null>;
}

export function useCamera(): UseCameraResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const takePhoto = useCallback(async (): Promise<string | null> => {
    setLoading(true);
    setError(null);
    setPermissionDenied(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        setError('Permissão de câmera negada.');
        return null;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.6,
        allowsEditing: false,
      });
      if (result.canceled || !result.assets?.length) return null;
      return result.assets[0].uri;
    } catch {
      setError('Não foi possível capturar a foto.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, permissionDenied, takePhoto };
}
