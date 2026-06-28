import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import HeartOrnament from "../components/HeartOrnament";
import Icon from "../components/Icon";
import PixelDivider from "../components/PixelDivider";
import PetAvatar from "../components/PetAvatar";
import StatusPanel from "../components/StatusPanel";
import { usePawTrack } from "../context/usePawTrack";

function Dashboard() {
  const { currentUser, loadCurrentUser, userError, userLoading } = usePawTrack();

  if (userLoading) {
    return <AppShell><StatusPanel message="Cargando tu perfil..." /></AppShell>;
  }

  if (!currentUser || userError) {
    return (
      <AppShell>
        <StatusPanel action={() => loadCurrentUser().catch(() => {})} message={userError || "No fue posible cargar tu perfil."} type="error" />
      </AppShell>
    );
  }

  const statsCards = [
    { label: "Puntos", value: currentUser.points, icon: "star" },
    { label: "Animales", value: currentUser.animalsDiscovered, icon: "paw" },
    { label: "Avistamientos", value: currentUser.sightings, icon: "mapPin" },
  ];

  return (
    <AppShell>
      <header className="dashboard-header">
        <Link aria-label="Menu" className="icon-button" to="/profile"><Icon name="menu" /></Link>
        <Link aria-label="Notificaciones" className="icon-button alert" to="/notifications"><Icon name="bell" /></Link>
      </header>

      <PixelDivider compact />

      <section className="player-card">
        <HeartOrnament />
        <PetAvatar size="md" type="husky" />
        <div>
          <p className="hello">Hola, {currentUser.username}!</p>
          <strong>Nivel {currentUser.level} - {currentUser.rank}</strong>
          <div className="xp-row">
            <span>{currentUser.xpLabel}</span>
            <div className="progress"><span style={{ width: `${currentUser.xpProgress}%` }} /></div>
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
        <Link className="menu-card" to="/animals"><Icon name="mapPin" /><span><strong>Mapa</strong><small>Ver animales cercanos</small></span><Icon name="chevronRight" /></Link>
        <Link className="menu-card" to="/animals/new"><Icon name="plus" /><span><strong>Anadir animal</strong><small>Foto y ubicacion</small></span><Icon name="chevronRight" /></Link>
        <Link className="menu-card" to="/animals"><Icon name="paw" /><span><strong>Animales</strong><small>Explorar catalogo</small></span><Icon name="chevronRight" /></Link>
        <Link className="menu-card" to="/achievements"><Icon name="trophy" /><span><strong>Logros</strong><small>Puntos y nivel</small></span><Icon name="chevronRight" /></Link>
        <Link className="menu-card" to="/profile"><Icon name="user" /><span><strong>Mi perfil</strong><small>Ver estadisticas</small></span><Icon name="chevronRight" /></Link>
      </section>
    </AppShell>
  );
}

export default Dashboard;
