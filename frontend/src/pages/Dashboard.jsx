import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import PetAvatar from "../components/PetAvatar";
import { usePawTrack } from "../context/usePawTrack";

function Dashboard() {
  const { currentUser } = usePawTrack();
  const statsCards = [
    { label: "Puntos", value: currentUser.points, icon: "star" },
    { label: "Animales", value: currentUser.animalesDiscovered ?? currentUser.animalsDiscovered, icon: "paw" },
    { label: "Avistamientos", value: currentUser.sightings, icon: "mapPin" },
  ];

  return (
    <AppShell>
      <header className="dashboard-header">
        <button aria-label="Menu" className="icon-button">
          <Icon name="menu" />
        </button>
        <button aria-label="Notificaciones" className="icon-button alert">
          <Icon name="bell" />
        </button>
      </header>

      <section className="player-card">
        <PetAvatar size="md" type="husky" />
        <div>
          <p className="hello">Hola, {currentUser.username}!</p>
          <strong>
            Nivel {currentUser.level} - {currentUser.rank}
          </strong>
          <div className="xp-row">
            <span>XP {currentUser.xp} / {currentUser.nextLevelXp}</span>
            <div className="progress">
              <span style={{ width: `${currentUser.xp}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="stats-grid" aria-label="Resumen">
        {statsCards.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <Icon name={stat.icon} />
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </section>

      <section className="menu-list">
        <Link className="menu-card" to="/animals">
          <Icon name="paw" />
          <span>
            <strong>Animales</strong>
            <small>Ver y explorar</small>
          </span>
          <Icon name="chevronRight" />
        </Link>
        <Link className="menu-card" to="/animals/new">
          <Icon name="plus" />
          <span>
            <strong>Anadir animal</strong>
            <small>Crear nuevo registro</small>
          </span>
          <Icon name="chevronRight" />
        </Link>
        <Link className="menu-card" to="/report">
          <Icon name="mapPin" />
          <span>
            <strong>Avistamientos</strong>
            <small>Mapa y reportes</small>
          </span>
          <Icon name="chevronRight" />
        </Link>
        <Link className="menu-card" to="/profile">
          <Icon name="trophy" />
          <span>
            <strong>Logros</strong>
            <small>Recompensas</small>
          </span>
          <Icon name="chevronRight" />
        </Link>
        <Link className="menu-card" to="/profile">
          <Icon name="user" />
          <span>
            <strong>Mi perfil</strong>
            <small>Ver estadisticas</small>
          </span>
          <Icon name="chevronRight" />
        </Link>
      </section>
    </AppShell>
  );
}

export default Dashboard;
