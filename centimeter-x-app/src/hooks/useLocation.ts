import { useCallback, useState } from 'react';
import * as Location from 'expo-location';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

interface UseLocationResult {
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
  getCurrentPosition: () => Promise<Coordinates | null>;
}

export function useLocation(): UseLocationResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const getCurrentPosition = useCallback(async (): Promise<Coordinates | null> => {
    setLoading(true);
    setError(null);
    setPermissionDenied(false);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        setError('Permissão de localização negada.');
        return null;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    } catch {
      setError('Não foi possível obter a localização.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, permissionDenied, getCurrentPosition };
}
