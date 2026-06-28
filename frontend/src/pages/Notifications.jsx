import AppShell from "../components/AppShell";
import HeartOrnament from "../components/HeartOrnament";
import Icon from "../components/Icon";
import StatusPanel from "../components/StatusPanel";
import TopBar from "../components/TopBar";
import { usePawTrack } from "../context/usePawTrack";

function Notifications() {
  const { animals, animalsError, animalsLoading, currentUser, loadAnimals } = usePawTrack();

  if (animalsLoading) return <AppShell><StatusPanel message="Revisando actividad..." /></AppShell>;
  if (animalsError) {
    return (
      <AppShell>
        <TopBar backTo="/dashboard" title="Actividad" />
        <StatusPanel action={() => loadAnimals().catch(() => {})} message={animalsError} type="error" />
      </AppShell>
    );
  }

  const recentAnimals = animals.slice(0, 3);

  return (
    <AppShell>
      <TopBar backTo="/dashboard" title="Actividad" />

      <section className="history-summary">
        <HeartOrnament />
        <Icon name="bell" />
        <span>
          <strong>Radar PawTrack</strong>
          <small>{currentUser ? `${currentUser.points} puntos acumulados` : "Actividad comunitaria"}</small>
        </span>
      </section>

      <section className="notification-list">
        {recentAnimals.length === 0 ? (
          <StatusPanel message="Aun no hay actividad. Registra el primer animal para encender el radar." />
        ) : (
          recentAnimals.map((animal) => (
            <article className="notification-row" key={animal.id}>
              <Icon name={animal.species === "Gato" ? "paw" : "mapPin"} />
              <span>
                <strong>{animal.name}</strong>
                <small>{animal.sightings} avistamientos · {animal.confirmations} confirmaciones</small>
                <small>{animal.lastSeenAgo} en {animal.lastSeen}</small>
              </span>
            </article>
          ))
        )}
      </section>
    </AppShell>
  );
}

export default Notifications;
