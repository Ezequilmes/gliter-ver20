'use client';

import { useState, useCallback } from 'react';

export interface LocationState {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export interface UseGeolocationReturn {
  location: LocationState | null;
  error: GeolocationError | null;
  loading: boolean;
  getCurrentLocation: () => Promise<LocationState | null>;
  watchPosition: () => number | null;
  clearWatch: (watchId: number) => void;
  isSupported: boolean;
}

const useGeolocation = (options?: PositionOptions): UseGeolocationReturn => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [loading, setLoading] = useState(false);

  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const newLocation: LocationState = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp
    };
    setLocation(newLocation);
    setError(null);
    setLoading(false);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    let errorMessage = 'Error desconocido obteniendo ubicación';
    
    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = 'Permiso de ubicación denegado por el usuario';
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = 'Información de ubicación no disponible';
        break;
      case err.TIMEOUT:
        errorMessage = 'Tiempo de espera agotado para obtener ubicación';
        break;
    }

    const geolocationError: GeolocationError = {
      code: err.code,
      message: errorMessage
    };
    
    setError(geolocationError);
    setLoading(false);
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<LocationState | null> => {
    if (!isSupported) {
      setError({
        code: -1,
        message: 'Geolocalización no soportada por este navegador'
      });
      return null;
    }

    return new Promise((resolve) => {
      setLoading(true);
      setError(null);

      const defaultOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutos
        ...options
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleSuccess(position);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (err) => {
          handleError(err);
          resolve(null);
        },
        defaultOptions
      );
    });
  }, [isSupported, options, handleSuccess, handleError]);

  const watchPosition = useCallback((): number | null => {
    if (!isSupported) {
      setError({
        code: -1,
        message: 'Geolocalización no soportada por este navegador'
      });
      return null;
    }

    setLoading(true);
    setError(null);

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minuto para watch
      ...options
    };

    return navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      defaultOptions
    );
  }, [isSupported, options, handleSuccess, handleError]);

  const clearWatch = useCallback((watchId: number) => {
    if (isSupported) {
      navigator.geolocation.clearWatch(watchId);
    }
  }, [isSupported]);

  return {
    location,
    error,
    loading,
    getCurrentLocation,
    watchPosition,
    clearWatch,
    isSupported
  };
};

export default useGeolocation;

// Utilidad para calcular distancia entre dos puntos
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Utilidad para formatear distancia
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${Math.round(distance * 10) / 10}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
};

// Utilidad para verificar si una ubicación está dentro de un radio
export const isWithinRadius = (
  centerLat: number,
  centerLon: number,
  targetLat: number,
  targetLon: number,
  radiusKm: number
): boolean => {
  const distance = calculateDistance(centerLat, centerLon, targetLat, targetLon);
  return distance <= radiusKm;
};