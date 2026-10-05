import { useTranslation } from "../i18n/useTranslation";
import AppShell from "../components/AppShell";
import HeartOrnament from "../components/HeartOrnament";
import Icon from "../components/Icon";
import PetAvatar from "../components/PetAvatar";
import StatusPanel from "../components/StatusPanel";
import TopBar from "../components/TopBar";
import { usePawTrack } from "../context/usePawTrack";

function Achievements() {
  const { t } = useTranslation();
  const {
    achievementPoints,
    achievements,
    currentUser,
    loadAchievements,
    loadCurrentUser,
    userError,
    userLoading,
  } = usePawTrack();

  if (userLoading) return <AppShell><StatusPanel message={t("Cargando logros...")} /></AppShell>;
  if (!currentUser || userError) {
    return (
      <AppShell>
        <StatusPanel action={() => loadCurrentUser().catch(() => {})} message={userError || t("Logros no disponibles.")} type="error" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TopBar backTo="/dashboard" title={t("Logros")} />

      <section className="profile-card achievements-hero">
        <HeartOrnament />
        <PetAvatar size="md" type="husky" />
        <div>
          <strong>{t("Patitas")}</strong>
          <span>{achievementPoints}{" "}{t("Patitas separadas de XP")}</span>
          <div className="progress"><span style={{ width: `${Math.min(100, achievementPoints * 20)}%` }} /></div>
        </div>
      </section>

      <section className="profile-stats achievement-list">
        <h2>{t("Logro activo")}</h2>
        {achievements.map((achievement) => (
          <article className={`achievement-row ${achievement.completed ? "completed" : ""}`} key={achievement.id}>
            <Icon name={achievement.icon} />
            <span>
              <strong>{t(achievement.label)}</strong>
              <small>{t(achievement.detail)}</small>
              <div className="progress"><span style={{ width: `${achievement.progress}%` }} /></div>
            </span>
            <em>{achievement.value}</em>
          </article>
        ))}
        {achievements.length === 0 && (
          <StatusPanel action={() => loadAchievements().catch(() => {})} message={t("Sin logros disponibles.")} />
        )}
      </section>
    </AppShell>
  );
}

export default Achievements;
