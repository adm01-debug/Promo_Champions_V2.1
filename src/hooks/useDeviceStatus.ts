import { useState, useEffect, useCallback } from 'react';

interface NetworkState {
  online: boolean;
  since?: Date;
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
}

export function useNetwork(): NetworkState {
  const [state, setState] = useState<NetworkState>({
    online: typeof navigator !== 'undefined' ? navigator.onLine : true
  });

  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, online: true, since: new Date() }));
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, online: false, since: new Date() }));
    };

    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection;
      if (connection) {
        setState(prev => ({
          ...prev,
          downlink: connection.downlink,
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
          saveData: connection.saveData
        }));
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
      updateNetworkInfo();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, []);

  return state;
}

export function useOnlineStatus() {
  const { online } = useNetwork();
  return online;
}

interface GeolocationState {
  loading: boolean;
  error: GeolocationPositionError | null;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  timestamp: number | null;
}

export function useGeolocation(options?: PositionOptions) {
  const [state, setState] = useState<GeolocationState>({
    loading: true,
    error: null,
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: { code: 0, message: 'Geolocation not supported' } as GeolocationPositionError
      }));
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setState({
        loading: false,
        error: null,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      setState(prev => ({ ...prev, loading: false, error }));
    };

    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [options]);

  return state;
}

export function useBattery() {
  const [battery, setBattery] = useState<{
    level: number;
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
  } | null>(null);

  useEffect(() => {
    let batteryRef: any = null;

    const updateBattery = (b: any) => {
      setBattery({
        level: b.level,
        charging: b.charging,
        chargingTime: b.chargingTime,
        dischargingTime: b.dischargingTime
      });
    };

    (navigator as any).getBattery?.().then((b: any) => {
      batteryRef = b;
      updateBattery(b);
      b.addEventListener('levelchange', () => updateBattery(b));
      b.addEventListener('chargingchange', () => updateBattery(b));
    });

    return () => {
      if (batteryRef) {
        batteryRef.removeEventListener('levelchange', () => {});
        batteryRef.removeEventListener('chargingchange', () => {});
      }
    };
  }, []);

  return battery;
}
