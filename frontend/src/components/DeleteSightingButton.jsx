import { useTranslation } from "../i18n/useTranslation";
import { useRef, useState } from "react";
import { api } from "../services/api";
import { usePawTrack } from "../context/usePawTrack";
import Icon from "./Icon";

export default function DeleteSightingButton({ sighting, onDeleted, disabled = false }) {
  const { t } = useTranslation();
  const { currentUser, loadAnimals, loadCurrentUser, loadAchievements } = usePawTrack();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  if (!currentUser?.id || (!currentUser.isAdmin && currentUser.id !== sighting.userId)) return null;

  const remove = async () => {
    if (inFlight.current || disabled) return;
    if (!window.confirm(t("¿Eliminar este avistamiento? No se puede deshacer. Si es el último de este animal, también se eliminará su pin del mapa."))) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await api.deleteSighting(sighting.id);
      onDeleted(sighting, result);
      // A successful deletion stays successful if refreshing related data fails.
      await Promise.allSettled([loadAnimals(), loadCurrentUser(), loadAchievements()]);
    } catch (failure) {
      setError(failure.message);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  return <div className="delete-sighting-control">
    <button type="button" className="mini-pixel-button danger delete-sighting-button" disabled={busy || disabled} onClick={remove}><Icon name="trash" size={17} />{busy ? t("Eliminando...") : t("Eliminar avistamiento")}</button>
    {error && <p className="form-message error" role="alert">{t(error)}</p>}
  </div>;
}
