import { useCallback, useEffect, useRef, useState } from "react";

const IOS_LOCATION_HINT = "En iPhone toca Localizar para permitir el GPS. Si no aparece, escribe las coordenadas manualmente.";

function locationErrorMessage(error) {
  if (error?.reason === "insecure") {
    return "Para usar GPS en iPhone, abre PawTrack con HTTPS o desde localhost. Tambien puedes escribir las coordenadas.";
  }
  if (error?.code === 1) {
    return "Permiso de ubicacion denegado. En iPhone revisa Ajustes > Privacidad y seguridad > Localizacion > Safari o PawTrack. Tambien puedes escribir las coordenadas.";
  }
  if (error?.code === 2) return "No fue posible determinar tu ubicacion. Intenta moverte a un lugar con mejor senal o escribe las coordenadas.";
  if (error?.code === 3) return "La ubicacion tardo demasiado. Intenta otra vez o escribe las coordenadas manualmente.";
  return "La geolocalizacion no esta disponible en este dispositivo.";
}

function isAppleMobileDevice() {
  if (typeof navigator === "undefined") return false;
  const userAgent = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const hasTouch = navigator.maxTouchPoints > 1;
  return /iPad|iPhone|iPod/.test(userAgent) || (platform === "MacIntel" && hasTouch);
}

function canUseGeolocation() {
  if (typeof window !== "undefined" && window.isSecureContext === false) {
    return { ok: false, error: { reason: "insecure" } };
  }

  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return { ok: false, error: { reason: "unavailable" } };
  }

  return { ok: true, error: null };
}

function getCurrentPosition(options) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

function normalizeCoordinates(position) {
  return {
    latitude: position.coords.latitude.toFixed(6),
    longitude: position.coords.longitude.toFixed(6),
  };
}

export function useGeolocation({ auto = true } = {}) {
  const [coordinates, setCoordinates] = useState({ latitude: "", longitude: "" });
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [locationHint, setLocationHint] = useState(() => (isAppleMobileDevice() ? IOS_LOCATION_HINT : ""));
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);
  const isAppleMobile = isAppleMobileDevice();

  const locate = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const isActiveRequest = () => mountedRef.current && requestIdRef.current === requestId;
    const support = canUseGeolocation();

    if (!support.ok) {
      setLocationError(locationErrorMessage(support.error));
      setLocationHint("Puedes escribir latitud y longitud manualmente.");
      return null;
    }

    setLocating(true);
    setLocationError("");
    setLocationHint("");

    const balancedOptions = { enableHighAccuracy: false, maximumAge: 60000, timeout: isAppleMobile ? 9000 : 6000 };
    const preciseOptions = { enableHighAccuracy: true, maximumAge: 30000, timeout: isAppleMobile ? 20000 : 12000 };
    const attempts = isAppleMobile ? [balancedOptions, preciseOptions] : [preciseOptions, balancedOptions];
    let lastError = null;

    try {
      for (const options of attempts) {
        try {
          const position = await getCurrentPosition(options);
          const nextCoordinates = normalizeCoordinates(position);
          if (isActiveRequest()) {
            setCoordinates(nextCoordinates);
            setLocationHint("");
          }
          return nextCoordinates;
        } catch (error) {
          lastError = error;
        }
      }

      if (isActiveRequest()) {
        setLocationError(locationErrorMessage(lastError));
        setLocationHint("Puedes continuar escribiendo latitud y longitud manualmente.");
      }
      return null;
    } finally {
      if (isActiveRequest()) {
        setLocating(false);
      }
    }
  }, [isAppleMobile]);

  useEffect(() => () => {
    mountedRef.current = false;
    requestIdRef.current += 1;
  }, []);

  useEffect(() => {
    if (!auto) return undefined;
    if (isAppleMobile) {
      return undefined;
    }
    const timer = window.setTimeout(locate, 0);
    return () => window.clearTimeout(timer);
  }, [auto, isAppleMobile, locate]);

  return {
    coordinates,
    locate,
    locating,
    locationError,
    locationHint,
    setCoordinates,
  };
}
