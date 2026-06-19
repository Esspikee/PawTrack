import { Link, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import PixelButton from "../components/PixelButton";
import TopBar from "../components/TopBar";
import { usePawTrack } from "../context/usePawTrack";

function AnimalHistory() {
  const { animalId } = useParams();
  const { animals } = usePawTrack();
  const animal = animals.find((item) => item.id === animalId) ?? animals[0];
  const history = animal.history ?? [];

  return (
    <AppShell>
      <TopBar backTo={`/animals/${animal.id}`} title="Historial" />

      <section className="history-summary">
        <Icon name="mapPin" />
        <span>
          <strong>{animal.name}</strong>
          <small>{history.length} registros de avistamiento</small>
        </span>
      </section>

      <section className="history-list">
        {history.map((event) => (
          <article className="history-row" key={event.id}>
            <div className="history-dot" />
            <span>
              <strong>{event.location}</strong>
              <small>
                {event.date} - {event.time}
              </small>
              <p>{event.description}</p>
            </span>
          </article>
        ))}
      </section>

      <PixelButton className="full-width" to={`/report/${animal.id}`}>
        Nuevo avistamiento
      </PixelButton>

      <Link className="inline-action" to={`/animals/${animal.id}`}>
        Volver al detalle
      </Link>
    </AppShell>
  );
}

export default AnimalHistory;
