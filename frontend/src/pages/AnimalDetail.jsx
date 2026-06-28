import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import HeartOrnament from "../components/HeartOrnament";
import Icon from "../components/Icon";
import PetAvatar from "../components/PetAvatar";
import PixelButton from "../components/PixelButton";
import StatusPanel from "../components/StatusPanel";
import TopBar from "../components/TopBar";
import { usePawTrack } from "../context/usePawTrack";

function AnimalDetail() {
  const { animalId } = useParams();
  const { loadAnimalDetail } = usePawTrack();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(() => {
        if (active) {
          setLoading(true);
          setError("");
        }
        return loadAnimalDetail(animalId);
      })
      .then((result) => { if (active) setAnimal(result); })
      .catch((loadError) => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [animalId, loadAnimalDetail]);

  if (loading) return <AppShell><TopBar backTo="/animals" title="Animal" /><StatusPanel message="Cargando detalle..." /></AppShell>;
  if (error || !animal) return <AppShell><TopBar backTo="/animals" title="Animal" /><StatusPanel message={error || "Animal no encontrado."} type="error" /></AppShell>;

  return (
    <AppShell>
      <TopBar backTo="/animals" title={animal.name} />

      <section className="detail-hero">
        <HeartOrnament />
        <div className="detail-scene">
          {animal.photoUrl ? <img alt={animal.name} className="detail-photo" src={animal.photoUrl} /> : <PetAvatar size="xl" type={animal.avatar} />}
        </div>
        <div className="detail-title">
          <span><strong>{animal.name}</strong><small>ID {animal.id.slice(0, 8)}</small></span>
          <span className="sighting-pill"><Icon name="mapPin" size={14} />{animal.sightings} avistamientos</span>
        </div>
      </section>

      <section className="detail-copy">
        <div className="two-col">
          <span><small>Ultima ubicacion</small><strong>{animal.lastSeen}</strong></span>
          <span><small>Actualizado</small><strong>{animal.lastSeenAgo}</strong></span>
        </div>
        <span><small>Descripcion reciente</small><p>{animal.description}</p></span>
        <span><small>Confirmaciones</small><p>{animal.confirmations}</p></span>
      </section>

      <div className="stack-actions">
        <PixelButton className="full-width" to={`/report/${animal.id}`}>Reportar avistamiento</PixelButton>
        <PixelButton className="full-width" to={`/animals/${animal.id}/history`} variant="secondary">Ver historial</PixelButton>
      </div>

      <Link className="inline-action" to="/animals">Ver otros animales</Link>
    </AppShell>
  );
}

export default AnimalDetail;
