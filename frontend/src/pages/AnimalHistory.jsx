import { useTranslation } from "../i18n/useTranslation";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DeleteSightingButton from "../components/DeleteSightingButton";
import AppShell from "../components/AppShell";
import HeartOrnament from "../components/HeartOrnament";
import Icon from "../components/Icon";
import PixelButton from "../components/PixelButton";
import StatusPanel from "../components/StatusPanel";
import TopBar from "../components/TopBar";
import { usePawTrack } from "../context/usePawTrack";
import { api } from "../services/api";

function AnimalHistory() {
  const { t, dateTime, animalName } = useTranslation();
  const { animalId } = useParams();
  const navigate = useNavigate();
  const { currentUser, loadAnimalDetail, loadAnimals, loadCurrentUser, loadHistory } = usePawTrack();
  const [animal, setAnimal] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionId, setActionId] = useState("");

  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(() => {
        if (active) {
          setLoading(true);
          setError("");
          setActionError("");
        }
        return Promise.all([loadAnimalDetail(animalId), loadHistory(animalId)]);
      })
      .then(async ([animalResult, historyResult]) => {
        const confirmations = currentUser
          ? await Promise.all(historyResult.map((event) => api.getSightingConfirmations(event.id).catch(() => null)))
          : [];
        const enriched = historyResult.map((event, index) => ({
          ...event,
          confirmedByMe: Boolean(confirmations[index]?.usuarios?.some((user) => user.id_usuario === currentUser?.id)),
        }));
        if (active) {
          setAnimal(animalResult);
          setHistory(enriched);
        }
      })
      .catch((loadError) => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [animalId, currentUser, loadAnimalDetail, loadHistory]);

  const toggleConfirmation = async (event) => {
    setActionId(event.id);
    setActionError("");
    try {
      if (event.confirmedByMe) await api.unconfirmSighting(event.id);
      else await api.confirmSighting(event.id);
      setHistory((items) => items.map((item) => item.id === event.id ? {
        ...item,
        confirmedByMe: !item.confirmedByMe,
        confirmations: Math.max(0, item.confirmations + (item.confirmedByMe ? -1 : 1)),
      } : item));
      await Promise.allSettled([loadAnimals(), loadCurrentUser()]);
    } catch (actionFailure) {
      setActionError(actionFailure.message);
    } finally {
      setActionId("");
    }
  };

  if (loading) return <AppShell><TopBar backTo={`/animals/${animalId}`} title={t("Historial")} /><StatusPanel message={t("Cargando historial...")} /></AppShell>;
  if (error || !animal) return <AppShell><TopBar backTo="/animals" title={t("Historial")} /><StatusPanel message={error || t("Historial no disponible.")} type="error" /></AppShell>;

  return (
    <AppShell>
      <TopBar backTo={`/animals/${animal.id}`} title={t("Historial")} />

      <section className="history-summary">
        <HeartOrnament />
        <Icon name="mapPin" />
        <span><strong>{animalName(animal)}</strong><small>{history.length}{" "}{t("registros de avistamiento")}</small></span>
      </section>

      {actionError && <p className="form-message error" role="alert">{t(actionError)}</p>}

      <section className="history-list">
        {history.map((event) => {
          const ownSighting = currentUser?.id === event.userId;
          return (
            <article className="history-row" key={event.id}>
              <div className="history-dot" />
              <span>
                <strong>{event.location}</strong>
                <small>{dateTime(event.createdAt).date} · {dateTime(event.createdAt).time}</small>
                <p>{event.description}</p>
                {event.photoUrl && <img alt={t("Avistamiento")} className="history-photo" src={event.photoUrl} />}
                <small>{event.confirmations}{" "}{t("confirmaciones")}</small>
                <div className="history-actions">
                  {currentUser && !ownSighting && (
                    <button className={`mini-pixel-button ${event.confirmedByMe ? "active" : ""}`} disabled={actionId === event.id} onClick={() => toggleConfirmation(event)} type="button">
                      <Icon name="star" size={14} />{event.confirmedByMe ? t("Retirar") : t("Confirmar")}
                    </button>
                  )}
                  <DeleteSightingButton sighting={event} onDeleted={(deleted, result) => {
                    setHistory((items) => items.filter((item) => item.id !== deleted.id));
                    if (result.animal_eliminado) navigate("/animals", { replace: true });
                  }} />
                  {!currentUser && <Link className="tiny-link" to="/login">{t("Inicia sesion para confirmar")}</Link>}
                </div>
              </span>
            </article>
          );
        })}
      </section>

      <PixelButton className="full-width" to={`/report/${animal.id}`}>{t("Nuevo avistamiento")}</PixelButton>
      <Link className="inline-action" to={`/animals/${animal.id}`}>{t("Volver al detalle")}</Link>
    </AppShell>
  );
}

export default AnimalHistory;
