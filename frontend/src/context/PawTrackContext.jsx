import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AUTH_TOKEN_CLEARED_EVENT, api, clearToken, getToken, hasToken, setToken } from "../services/api";
import { mapAchievementsResponse, mapAnimal, mapSighting, mapUser } from "../utils/dataMappers";
import { PawTrackContext } from "./usePawTrack";

export function PawTrackProvider({ children }) {
  const [animals, setAnimals] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [achievementCategories, setAchievementCategories] = useState([]);
  const [achievementPoints, setAchievementPoints] = useState(0);
  const [achievementRarities, setAchievementRarities] = useState([]);
  const [recentAchievement, setRecentAchievement] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authenticated, setAuthenticated] = useState(hasToken());
  const [animalsLoading, setAnimalsLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(hasToken());
  const [animalsError, setAnimalsError] = useState("");
  const [userError, setUserError] = useState("");
  const achievementsRef = useRef([]);
  const achievementToastTimer = useRef(null);
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
    const sessionToken = getToken();
    if (!sessionToken) {
      setAuthenticated(false);
      setCurrentUser(null);
      setUserLoading(false);
      return null;
    }

    setUserLoading(true);
    setUserError("");
    try {
      const user = mapUser(await api.getMe());
      if (getToken() !== sessionToken) return null;
      setCurrentUser(user);
      setAuthenticated(true);
      return user;
    } catch (error) {
      if (getToken() !== sessionToken) return null;
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
      if (getToken() === sessionToken) setUserLoading(false);
    }
  }, []);

  const clearRecentAchievement = useCallback(() => {
    if (achievementToastTimer.current) {
      window.clearTimeout(achievementToastTimer.current);
      achievementToastTimer.current = null;
    }
    setRecentAchievement(null);
  }, []);

  const showAchievementToast = useCallback((achievement) => {
    if (achievementToastTimer.current) {
      window.clearTimeout(achievementToastTimer.current);
    }
    setRecentAchievement(achievement);
    achievementToastTimer.current = window.setTimeout(() => {
      setRecentAchievement(null);
      achievementToastTimer.current = null;
    }, 6500);
  }, []);

  const loadAchievements = useCallback(async ({ notify = false } = {}) => {
    const sessionToken = getToken();
    if (!sessionToken) {
      achievementsRef.current = [];
      setAchievements([]);
      setAchievementCategories([]);
      setAchievementPoints(0);
      setAchievementRarities([]);
      return { achievementPoints: 0, achievements: [] };
    }

    const mapped = mapAchievementsResponse(await api.listAchievements());
    if (getToken() !== sessionToken) return null;
    const previous = achievementsRef.current;
    if (notify && previous.length > 0) {
      const unlocked = mapped.achievements.find((achievement) => {
        const previousAchievement = previous.find((item) => item.id === achievement.id);
        return achievement.completed && previousAchievement && !previousAchievement.completed;
      });
      if (unlocked) {
        showAchievementToast(unlocked);
      }
    }

    achievementsRef.current = mapped.achievements;
    setAchievementCategories(mapped.categories);
    setAchievementPoints(mapped.achievementPoints);
    setAchievementRarities(mapped.rarities);
    setAchievements(mapped.achievements);
    return mapped;
  }, [showAchievementToast]);

  useEffect(() => {
    const timer = window.setTimeout(() => loadAnimals().catch(() => {}), 0);
    return () => window.clearTimeout(timer);
  }, [loadAnimals]);

  useEffect(() => {
    if (authenticated) {
      const timer = window.setTimeout(() => {
        loadCurrentUser().catch(() => {});
        loadAchievements().catch(() => {});
      }, 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [authenticated, loadAchievements, loadCurrentUser]);

  useEffect(() => {
    const handleTokenCleared = () => {
      setAuthenticated(false);
      achievementsRef.current = [];
      setAchievements([]);
      setAchievementCategories([]);
      setAchievementPoints(0);
      setAchievementRarities([]);
      setCurrentUser(null);
      clearRecentAchievement();
      setUserLoading(false);
      setUserError("");
    };

    window.addEventListener(AUTH_TOKEN_CLEARED_EVENT, handleTokenCleared);
    return () => window.removeEventListener(AUTH_TOKEN_CLEARED_EVENT, handleTokenCleared);
  }, [clearRecentAchievement]);

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
    achievementsRef.current = [];
    setAchievements([]);
    setAchievementCategories([]);
    setAchievementPoints(0);
    setAchievementRarities([]);
    setCurrentUser(null);
    clearRecentAchievement();
  }, [clearRecentAchievement]);

  const createAnimal = useCallback(async (payload) => {
    const animal = mapAnimal(await api.createAnimal(payload));
    setAnimals((items) => [animal, ...items.filter((item) => item.id !== animal.id)]);
    // The write already succeeded. A failed refresh must not invite a duplicate retry.
    await Promise.allSettled([loadCurrentUser(), loadAchievements({ notify: true })]);
    return animal;
  }, [loadAchievements, loadCurrentUser]);

  const addSighting = useCallback(async (animalId, payload) => {
    const sighting = mapSighting(await api.addSighting(animalId, payload));
    await Promise.allSettled([loadAnimals(), loadCurrentUser(), loadAchievements({ notify: true })]);
    return sighting;
  }, [loadAchievements, loadAnimals, loadCurrentUser]);

  const loadAnimalDetail = useCallback(async (animalId) => mapAnimal(await api.getAnimal(animalId)), []);

  const loadHistory = useCallback(async (animalId) => {
    const data = await api.getAnimalHistory(animalId);
    return data.map(mapSighting);
  }, []);

  const value = useMemo(() => ({
    addSighting,
    achievementCategories,
    achievementPoints,
    achievementRarities,
    achievements,
    animals,
    animalsError,
    animalsLoading,
    authenticated,
    clearRecentAchievement,
    createAnimal,
    currentUser,
    loadAchievements,
    loadAnimalDetail,
    loadAnimals,
    loadCurrentUser,
    loadHistory,
    login,
    logout,
    recentAchievement,
    register,
    locale,
    setLocale,
    userError,
    userLoading,
  }), [
    addSighting,
    achievementCategories,
    achievementPoints,
    achievementRarities,
    achievements,
    animals,
    animalsError,
    animalsLoading,
    authenticated,
    clearRecentAchievement,
    createAnimal,
    currentUser,
    loadAchievements,
    loadAnimalDetail,
    loadAnimals,
    loadCurrentUser,
    loadHistory,
    login,
    logout,
    recentAchievement,
    register,
    locale,
    setLocale,
    userError,
    userLoading,
  ]);

  return <PawTrackContext.Provider value={value}>{children}</PawTrackContext.Provider>;
}
