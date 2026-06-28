import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import HeartOrnament from "../components/HeartOrnament";
import Icon from "../components/Icon";
import PetAvatar from "../components/PetAvatar";
import StatusPanel from "../components/StatusPanel";
import TopBar from "../components/TopBar";
import { usePawTrack } from "../context/usePawTrack";

function Profile() {
  const { currentUser, loadCurrentUser, logout, userError, userLoading } = usePawTrack();
  const navigate = useNavigate();

  if (userLoading) return <AppShell><StatusPanel message="Cargando perfil..." /></AppShell>;
  if (!currentUser || userError) {
    return <AppShell><StatusPanel action={() => loadCurrentUser().catch(() => {})} message={userError || "Perfil no disponible."} type="error" /></AppShell>;
  }

  const rows = [
    ["paw", "Animales reportados", currentUser.animalsDiscovered],
    ["mapPin", "Avistamientos realizados", currentUser.sightings],
    ["trophy", "Confirmaciones", currentUser.confirmations],
    ["star", "Puntos totales", currentUser.points],
  ];

  const closeSession = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <AppShell>
      <TopBar backTo="/dashboard" title="Mi perfil" />

      <section className="profile-card">
        <HeartOrnament />
        <PetAvatar size="md" type="golden" />
        <div>
          <strong>{currentUser.username}</strong>
          <span>Nivel {currentUser.level} - {currentUser.rank}</span>
          <div className="progress"><span style={{ width: `${currentUser.xpProgress}%` }} /></div>
          <small>{currentUser.xpLabel}</small>
        </div>
      </section>

      <section className="profile-stats">
        <h2>Estadisticas</h2>
        {rows.map(([icon, label, value]) => (
          <div className="profile-row" key={label}><Icon name={icon} /><span>{label}</span><strong>{value}</strong></div>
        ))}
      </section>

      <Link className="menu-card settings-row" to="/settings">
        <Icon name="settings" /><span><strong>Configuracion</strong><small>Conexion y cuenta</small></span><Icon name="chevronRight" />
      </Link>

      <button className="menu-card settings-row danger-row" onClick={closeSession} type="button">
        <Icon name="lock" /><span><strong>Cerrar sesion</strong></span><Icon name="chevronRight" />
      </button>
    </AppShell>
  );
}

export default Profile;
