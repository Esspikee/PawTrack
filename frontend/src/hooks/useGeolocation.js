import { useCallback, useEffect, useState } from "react";

function locationErrorMessage(error) {
  if (error?.code === 1) return "Permiso de ubicacion denegado. Puedes escribir las coordenadas manualmente.";
  if (error?.code === 2) return "No fue posible determinar tu ubicacion.";
  if (error?.code === 3) return "La ubicacion tardo demasiado. Intenta otra vez.";
  return "La geolocalizacion no esta disponible en este dispositivo.";
}

export function useGeolocation({ auto = true } = {}) {
  const [coordinates, setCoordinates] = useState({ latitude: "", longitude: "" });
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("La geolocalizacion no esta disponible en este dispositivo.");
      return;
    }

    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        });
        setLocating(false);
      },
      (error) => {
        setLocationError(locationErrorMessage(error));
        setLocating(false);
      },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 12000 },
    );
  }, []);

  useEffect(() => {
    if (!auto) return undefined;
    const timer = window.setTimeout(locate, 0);
    return () => window.clearTimeout(timer);
  }, [auto, locate]);

  return {
    coordinates,
    locate,
    locating,
    locationError,
    setCoordinates,
  };
}
