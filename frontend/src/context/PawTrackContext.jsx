import { useCallback, useEffect, useMemo, useState } from "react";
import { AUTH_TOKEN_CLEARED_EVENT, api, clearToken, hasToken, setToken } from "../services/api";
import { mapAnimal, mapSighting, mapUser } from "../utils/dataMappers";
import { PawTrackContext } from "./usePawTrack";

export function PawTrackProvider({ children }) {
  const [animals, setAnimals] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [authenticated, setAuthenticated] = useState(hasToken());
  const [animalsLoading, setAnimalsLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(hasToken());
  const [animalsError, setAnimalsError] = useState("");
  const [userError, setUserError] = useState("");
  const [locale, setLocale] = useState(() => {
    if (typeof window === "undefined") {
      return "es";
    }
    return window.localStorage.getItem("pawtrack-locale") || window.navigator.language?.slice(0, 2) || "es";
  });

  const loadAnimals = useCallback(async () => {
    setAnimalsLoading(true);
    setAnimalsError("");
    try {
      const data = await api.listAnimals();
      const mapped = data
        .map(mapAnimal)
        .sort((a, b) => new Date(b.lastSeenAt) - new Date(a.lastSeenAt));
      setAnimals(mapped);
      return mapped;
    } catch (error) {
      setAnimalsError(error.message);
      throw error;
    } finally {
      setAnimalsLoading(false);
    }
  }, []);

  const loadCurrentUser = useCallback(async () => {
    if (!hasToken()) {
      setAuthenticated(false);
      setCurrentUser(null);
      setUserLoading(false);
      return null;
    }

    setUserLoading(true);
    setUserError("");
    try {
      const user = mapUser(await api.getMe());
      setCurrentUser(user);
      setAuthenticated(true);
      return user;
    } catch (error) {
      if (error.status === 401) {
        clearToken();
        setAuthenticated(false);
        setCurrentUser(null);
        setUserError("");
        return null;
      }
      setUserError(error.message);
      throw error;
    } finally {
      setUserLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => loadAnimals().catch(() => {}), 0);
    return () => window.clearTimeout(timer);
  }, [loadAnimals]);

  useEffect(() => {
    if (authenticated) {
      const timer = window.setTimeout(() => loadCurrentUser().catch(() => {}), 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [authenticated, loadCurrentUser]);

  useEffect(() => {
    const handleTokenCleared = () => {
      setAuthenticated(false);
      setCurrentUser(null);
      setUserLoading(false);
      setUserError("");
    };

    window.addEventListener(AUTH_TOKEN_CLEARED_EVENT, handleTokenCleared);
    return () => window.removeEventListener(AUTH_TOKEN_CLEARED_EVENT, handleTokenCleared);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("pawtrack-locale", locale);
    }
  }, [locale]);

  const login = useCallback(async (email, password) => {
    const result = await api.login(email, password);
    setToken(result.access_token);
    setAuthenticated(true);
    return loadCurrentUser();
  }, [loadCurrentUser]);

  const register = useCallback((data) => api.register(data), []);

  const logout = useCallback(() => {
    clearToken();
    setAuthenticated(false);
    setCurrentUser(null);
  }, []);

  const createAnimal = useCallback(async (payload) => {
    const animal = mapAnimal(await api.createAnimal(payload));
    setAnimals((items) => [animal, ...items.filter((item) => item.id !== animal.id)]);
    await loadCurrentUser();
    return animal;
  }, [loadCurrentUser]);

  const addSighting = useCallback(async (animalId, payload) => {
    const sighting = mapSighting(await api.addSighting(animalId, payload));
    await Promise.all([loadAnimals(), loadCurrentUser()]);
    return sighting;
  }, [loadAnimals, loadCurrentUser]);

  const loadAnimalDetail = useCallback(async (animalId) => mapAnimal(await api.getAnimal(animalId)), []);

  const loadHistory = useCallback(async (animalId) => {
    const data = await api.getAnimalHistory(animalId);
    return data.map(mapSighting);
  }, []);

  const value = useMemo(() => ({
    addSighting,
    animals,
    animalsError,
    animalsLoading,
    authenticated,
    createAnimal,
    currentUser,
    loadAnimalDetail,
    loadAnimals,
    loadCurrentUser,
    loadHistory,
    login,
    logout,
    register,
    locale,
    setLocale,
    userError,
    userLoading,
  }), [
    addSighting,
    animals,
    animalsError,
    animalsLoading,
    authenticated,
    createAnimal,
    currentUser,
    loadAnimalDetail,
    loadAnimals,
    loadCurrentUser,
    loadHistory,
    login,
    logout,
    register,
    locale,
    setLocale,
    userError,
    userLoading,
  ]);

  return <PawTrackContext.Provider value={value}>{children}</PawTrackContext.Provider>;
}
