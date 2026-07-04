import { useEffect, useMemo } from "react";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import StatusPanel from "../components/StatusPanel";
import TopBar from "../components/TopBar";
import { usePawTrack } from "../context/usePawTrack";

const fallbackCategories = [
  { id: "exploration", label: "Exploracion", icon: "mapPin" },
  { id: "dog_breeds", label: "Razas de perros", icon: "paw" },
  { id: "cat_breeds", label: "Razas de gatos", icon: "paw" },
  { id: "collection", label: "Coleccion", icon: "book" },
  { id: "daily_activity", label: "Actividad diaria", icon: "calendar" },
  { id: "milestones", label: "Hitos", icon: "star" },
  { id: "hidden", label: "Ocultos", icon: "lock" },
  { id: "legendary", label: "Legendarios", icon: "trophy" },
];

function AchievementProgress({ achievement }) {
  if (achievement.hidden && !achievement.completed) {
    return (
      <div className="achievement-progress muted">
        <div className="codex-progress-bar"><span style={{ width: "0%" }} /></div>
        <small>Progreso oculto</small>
      </div>
    );
  }

  return (
    <div className="achievement-progress">
      <div className="codex-progress-bar"><span style={{ width: `${achievement.progress}%` }} /></div>
      <small>{achievement.current} / {achievement.goal}</small>
    </div>
  );
}

function AchievementCard({ achievement }) {
  const lockedHidden = achievement.hidden && !achievement.completed;

  return (
    <article className={`codex-achievement-card rarity-${achievement.rarity} ${achievement.completed ? "completed" : ""} ${lockedHidden ? "locked-hidden" : ""}`}>
      <div className="achievement-card-icon">
        <Icon name={lockedHidden ? "lock" : achievement.icon} />
      </div>
      <span className="achievement-card-copy">
        <strong>{achievement.label}</strong>
        <small>{achievement.detail}</small>
        <AchievementProgress achievement={achievement} />
      </span>
      <span className="achievement-card-meta">
        {achievement.completed ? <em className="completion-badge"><Icon name="check" size={12} />Completado</em> : <em>Pendiente</em>}
        {lockedHidden ? (
          <small>Oculto</small>
        ) : (
          <>
            <small>{achievement.pawPrintReward} Patitas</small>
            <small>{achievement.rarityLabel}</small>
          </>
        )}
      </span>
    </article>
  );
}

function CodexAchievements() {
  const {
    achievementCategories,
    achievementPoints,
    achievements,
    loadAchievements,
    userError,
  } = usePawTrack();

  useEffect(() => {
    loadAchievements().catch(() => {});
  }, [loadAchievements]);

  const categories = achievementCategories.length > 0 ? achievementCategories : fallbackCategories;
  const groupedAchievements = useMemo(() => categories
    .map((category) => ({
      ...category,
      achievements: achievements.filter((achievement) => achievement.category === category.id),
    }))
    .filter((category) => category.achievements.length > 0), [achievements, categories]);

  return (
    <AppShell>
      <TopBar backTo="/codex" title="Logros" />

      <section className="achievements-summary codex-summary">
        <Icon name="paw" size={30} />
        <span>
          <small>Total de Patitas</small>
          <strong>{achievementPoints} Patitas</strong>
        </span>
      </section>

      {userError && <StatusPanel message={userError} type="error" />}

      {groupedAchievements.length === 0 ? (
        <section className="codex-placeholder">
          <Icon name="trophy" size={34} />
          <strong>No hay logros disponibles</strong>
        </section>
      ) : (
        <section className="achievement-category-list">
          {groupedAchievements.map((category) => (
            <article className="achievement-category" key={category.id}>
              <header>
                <Icon name={category.icon || "trophy"} />
                <h2>{category.label}</h2>
              </header>
              <div className="achievement-card-list">
                {category.achievements.map((achievement) => (
                  <AchievementCard achievement={achievement} key={achievement.id} />
                ))}
              </div>
            </article>
          ))}
        </section>
      )}
    </AppShell>
  );
}

export default CodexAchievements;
