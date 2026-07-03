import AppShell from "../components/AppShell";
import HeartOrnament from "../components/HeartOrnament";
import Icon from "../components/Icon";
import PetAvatar from "../components/PetAvatar";
import StatusPanel from "../components/StatusPanel";
import TopBar from "../components/TopBar";
import { usePawTrack } from "../context/usePawTrack";

function Achievements() {
  const {
    achievementPoints,
    achievements,
    currentUser,
    loadAchievements,
    loadCurrentUser,
    userError,
    userLoading,
  } = usePawTrack();

  if (userLoading) return <AppShell><StatusPanel message="Cargando logros..." /></AppShell>;
  if (!currentUser || userError) {
    return (
      <AppShell>
        <StatusPanel action={() => loadCurrentUser().catch(() => {})} message={userError || "Logros no disponibles."} type="error" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TopBar backTo="/dashboard" title="Logros" />

      <section className="profile-card achievements-hero">
        <HeartOrnament />
        <PetAvatar size="md" type="husky" />
        <div>
          <strong>Puntos de logro</strong>
          <span>{achievementPoints} puntos separados de XP</span>
          <div className="progress"><span style={{ width: `${Math.min(100, achievementPoints * 20)}%` }} /></div>
        </div>
      </section>

      <section className="profile-stats achievement-list">
        <h2>Logro activo</h2>
        {achievements.map((achievement) => (
          <article className={`achievement-row ${achievement.completed ? "completed" : ""}`} key={achievement.id}>
            <Icon name={achievement.icon} />
            <span>
              <strong>{achievement.label}</strong>
              <small>{achievement.detail}</small>
              <div className="progress"><span style={{ width: `${achievement.progress}%` }} /></div>
            </span>
            <em>{achievement.value}</em>
          </article>
        ))}
        {achievements.length === 0 && (
          <StatusPanel action={() => loadAchievements().catch(() => {})} message="Sin logros disponibles." />
        )}
      </section>
    </AppShell>
  );
}

export default Achievements;
