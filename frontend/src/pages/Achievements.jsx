import AppShell from "../components/AppShell";
import HeartOrnament from "../components/HeartOrnament";
import Icon from "../components/Icon";
import PetAvatar from "../components/PetAvatar";
import StatusPanel from "../components/StatusPanel";
import TopBar from "../components/TopBar";
import { usePawTrack } from "../context/usePawTrack";

function Achievements() {
  const { currentUser, loadCurrentUser, userError, userLoading } = usePawTrack();

  if (userLoading) return <AppShell><StatusPanel message="Cargando logros..." /></AppShell>;
  if (!currentUser || userError) {
    return (
      <AppShell>
        <StatusPanel action={() => loadCurrentUser().catch(() => {})} message={userError || "Logros no disponibles."} type="error" />
      </AppShell>
    );
  }

  const achievements = [
    {
      icon: "paw",
      label: "Primer rescate",
      detail: "Registra tu primer animal.",
      progress: Math.min(100, currentUser.animalsDiscovered * 100),
      value: `${currentUser.animalsDiscovered}/1`,
    },
    {
      icon: "mapPin",
      label: "Explorador nocturno",
      detail: "Completa 5 avistamientos.",
      progress: Math.min(100, (currentUser.sightings / 5) * 100),
      value: `${currentUser.sightings}/5`,
    },
    {
      icon: "star",
      label: "Vecino confiable",
      detail: "Confirma 5 reportes de la comunidad.",
      progress: Math.min(100, (currentUser.confirmations / 5) * 100),
      value: `${currentUser.confirmations}/5`,
    },
    {
      icon: "trophy",
      label: "Scout PawTrack",
      detail: "Alcanza 10 puntos.",
      progress: Math.min(100, (currentUser.points / 10) * 100),
      value: `${currentUser.points}/10`,
    },
  ];

  return (
    <AppShell>
      <TopBar backTo="/dashboard" title="Logros" />

      <section className="profile-card achievements-hero">
        <HeartOrnament />
        <PetAvatar size="md" type="husky" />
        <div>
          <strong>Nivel {currentUser.level} - {currentUser.rank}</strong>
          <span>{currentUser.xpLabel}</span>
          <div className="progress"><span style={{ width: `${currentUser.xpProgress}%` }} /></div>
        </div>
      </section>

      <section className="profile-stats achievement-list">
        <h2>Misiones</h2>
        {achievements.map((achievement) => (
          <article className="achievement-row" key={achievement.label}>
            <Icon name={achievement.icon} />
            <span>
              <strong>{achievement.label}</strong>
              <small>{achievement.detail}</small>
              <div className="progress"><span style={{ width: `${achievement.progress}%` }} /></div>
            </span>
            <em>{achievement.value}</em>
          </article>
        ))}
      </section>
    </AppShell>
  );
}

export default Achievements;
