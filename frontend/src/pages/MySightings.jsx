import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import DeleteSightingButton from "../components/DeleteSightingButton";
import StatusPanel from "../components/StatusPanel";
import TopBar from "../components/TopBar";
import { usePawTrack } from "../context/usePawTrack";
import { api } from "../services/api";
import { mapSighting } from "../utils/dataMappers";

export default function MySightings() {
  const { currentUser, animals = [] } = usePawTrack();
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) { setLoading(true); setError(""); }
      return api.getMySightings();
    }).then((rows) => {
      if (active) setSightings(rows.map(mapSighting).filter((row) => row.userId === currentUser?.id));
    }).catch((failure) => { if (active) setError(failure.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [currentUser?.id, attempt]);

  return <AppShell>
    <TopBar backTo="/profile" title="Mis avistamientos" />
    {notice && <p role="status">{notice}</p>}
    {loading ? <StatusPanel message="Cargando tus avistamientos..." /> : error ?
      <StatusPanel message={error} type="error" action={() => setAttempt((value) => value + 1)} /> :
      sightings.length === 0 ? <StatusPanel message="Aún no tienes avistamientos. Tus próximos registros aparecerán aquí." /> :
      <section className="my-sightings-list" aria-label="Tus avistamientos">
        {sightings.map((sighting) => <article className="my-sighting-card" key={sighting.id}>
          <Link className="inline-action" to={`/animals/${sighting.animalId}`}>
            {animals.find((animal) => animal.id === sighting.animalId)?.name || "Ver animal"}
          </Link>
          <small>{sighting.date} · {sighting.time}</small>
          <p>{sighting.description}</p>
          <small>{sighting.location}</small>
          {sighting.photoUrl && <img className="history-photo" src={sighting.photoUrl} alt="Tu avistamiento" />}
          <DeleteSightingButton sighting={sighting} onDeleted={(deleted) => {
            setSightings((items) => items.filter((item) => item.id !== deleted.id));
            setNotice("Avistamiento eliminado.");
          }} />
        </article>)}
      </section>}
  </AppShell>;
}
