import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import HeartOrnament from "../components/HeartOrnament";
import Icon from "../components/Icon";
import PixelButton from "../components/PixelButton";
import StatusPanel from "../components/StatusPanel";
import TopBar from "../components/TopBar";
import { usePawTrack } from "../context/usePawTrack";
import { api } from "../services/api";

function AnimalHistory() {
  const { animalId } = useParams();
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
        if (active) setLoading(true);
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
      await loadCurrentUser();
    } catch (actionFailure) {
      setActionError(actionFailure.message);
    } finally {
      setActionId("");
    }
  };

  const removeSighting = async (event) => {
    if (!window.confirm("Eliminar este avistamiento? Esta accion no se puede deshacer.")) return;
    setActionId(event.id);
    setActionError("");
    try {
      await api.deleteSighting(event.id);
      setHistory((items) => items.filter((item) => item.id !== event.id));
      await Promise.all([loadAnimals(), loadCurrentUser()]);
    } catch (actionFailure) {
      setActionError(actionFailure.message);
    } finally {
      setActionId("");
    }
  };

  if (loading) return <AppShell><TopBar backTo={`/animals/${animalId}`} title="Historial" /><StatusPanel message="Cargando historial..." /></AppShell>;
  if (error || !animal) return <AppShell><TopBar backTo="/animals" title="Historial" /><StatusPanel message={error || "Historial no disponible."} type="error" /></AppShell>;

  return (
    <AppShell>
      <TopBar backTo={`/animals/${animal.id}`} title="Historial" />

      <section className="history-summary">
        <HeartOrnament />
        <Icon name="mapPin" />
        <span><strong>{animal.name}</strong><small>{history.length} registros de avistamiento</small></span>
      </section>

      {actionError && <p className="form-message error" role="alert">{actionError}</p>}

      <section className="history-list">
        {history.map((event) => {
          const ownSighting = currentUser?.id === event.userId;
          return (
            <article className="history-row" key={event.id}>
              <div className="history-dot" />
              <span>
                <strong>{event.location}</strong>
                <small>{event.date} · {event.time}</small>
                <p>{event.description}</p>
                {event.photoUrl && <img alt="Avistamiento" className="history-photo" src={event.photoUrl} />}
                <small>{event.confirmations} confirmaciones</small>
                <div className="history-actions">
                  {currentUser && !ownSighting && (
                    <button className={`mini-pixel-button ${event.confirmedByMe ? "active" : ""}`} disabled={actionId === event.id} onClick={() => toggleConfirmation(event)} type="button">
                      <Icon name="star" size={14} />{event.confirmedByMe ? "Retirar" : "Confirmar"}
                    </button>
                  )}
                  {ownSighting && (
                    <button className="mini-pixel-button danger" disabled={actionId === event.id || history.length === 1} onClick={() => removeSighting(event)} title={history.length === 1 ? "No se puede borrar el unico avistamiento" : "Eliminar"} type="button">
                      Eliminar
                    </button>
                  )}
                  {!currentUser && <Link className="tiny-link" to="/login">Inicia sesion para confirmar</Link>}
                </div>
              </span>
            </article>
          );
        })}
      </section>

      <PixelButton className="full-width" to={`/report/${animal.id}`}>Nuevo avistamiento</PixelButton>
      <Link className="inline-action" to={`/animals/${animal.id}`}>Volver al detalle</Link>
    </AppShell>
  );
}

export default AnimalHistory;
