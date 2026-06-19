import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import PetAvatar from "../components/PetAvatar";
import TopBar from "../components/TopBar";
import { usePawTrack } from "../context/usePawTrack";

function Profile() {
  const { currentUser } = usePawTrack();
  const rows = [
    ["paw", "Animales reportados", currentUser.animalsDiscovered],
    ["mapPin", "Avistamientos realizados", currentUser.sightings],
    ["trophy", "Confirmaciones", currentUser.confirmations],
    ["star", "Puntos totales", currentUser.points],
  ];

  return (
    <AppShell>
      <TopBar backTo="/dashboard" title="Mi perfil" />

      <section className="profile-card">
        <PetAvatar size="md" type="golden" />
        <div>
          <strong>{currentUser.username}</strong>
          <span>
            Nivel {currentUser.level} - {currentUser.rank}
          </span>
          <div className="progress">
            <span style={{ width: `${currentUser.xp}%` }} />
          </div>
        </div>
      </section>

      <section className="profile-stats">
        <h2>Estadisticas</h2>
        {rows.map(([icon, label, value]) => (
          <div className="profile-row" key={label}>
            <Icon name={icon} />
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      <button className="menu-card settings-row" type="button">
        <Icon name="settings" />
        <span>
          <strong>Configuracion</strong>
        </span>
        <Icon name="chevronRight" />
      </button>
    </AppShell>
  );
}

export default Profile;
