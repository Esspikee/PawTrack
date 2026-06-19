import { Link, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import PetAvatar from "../components/PetAvatar";
import PixelButton from "../components/PixelButton";
import TopBar from "../components/TopBar";
import { usePawTrack } from "../context/usePawTrack";

function AnimalDetail() {
  const { animalId } = useParams();
  const { animals } = usePawTrack();
  const animal = animals.find((item) => item.id === animalId) ?? animals[0];

  return (
    <AppShell>
      <TopBar backTo="/animals" title={animal.name} />

      <section className="detail-hero">
        <div className="detail-scene">
          <PetAvatar size="xl" type={animal.avatar} />
        </div>
        <div className="detail-title">
          <span>
            <strong>{animal.name}</strong>
            <small>
              {animal.species} - {animal.breed}
            </small>
          </span>
          <span className="sighting-pill">
            <Icon name="mapPin" size={14} />
            {animal.sightings} avistamientos
          </span>
        </div>
      </section>

      <section className="detail-copy">
        <div className="two-col">
          <span>
            <small>Ultimo avistamiento</small>
            <strong>{animal.lastSeen}</strong>
          </span>
          <span>
            <small>Tiempo</small>
            <strong>{animal.lastSeenAgo}</strong>
          </span>
        </div>
        <span>
          <small>Descripcion</small>
          <p>{animal.description}</p>
        </span>
      </section>

      <div className="stack-actions">
        <PixelButton className="full-width" to={`/report/${animal.id}`}>
        Reportar avistamiento
        </PixelButton>
        <PixelButton className="full-width" to={`/animals/${animal.id}/history`} variant="secondary">
          Ver historial
        </PixelButton>
      </div>

      <Link className="inline-action" to="/animals">
        Ver otros animales
      </Link>
    </AppShell>
  );
}

export default AnimalDetail;
