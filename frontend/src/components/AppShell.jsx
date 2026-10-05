import { useTranslation } from "../i18n/useTranslation";
import BottomNav from "./BottomNav";
import AchievementBadge from "./codex/AchievementBadge";
import { usePawTrack } from "../context/usePawTrack";

function AchievementToast({ achievement, onClose }) {
  const { t } = useTranslation();
  if (!achievement) return null;

  return (
    <aside className="achievement-toast" role="status">
      <div className="achievement-toast-icon" aria-hidden="true"><AchievementBadge achievement={achievement} /></div>
      <span>
        <small>{t("Logro desbloqueado")}</small>
        <strong>{t(achievement.label)}</strong>
        <em>+{achievement.points}{" "}{t("Patitas")}</em>
      </span>
      <button aria-label={t("Cerrar logro")} onClick={onClose} type="button">x</button>
    </aside>
  );
}

function AppShell({ children, withNav = true }) {
  const { clearRecentAchievement, recentAchievement } = usePawTrack();

  return (
    <main className={`app-shell ${withNav ? "with-nav" : ""}`}>
      <AchievementToast achievement={recentAchievement} onClose={clearRecentAchievement} />
      {children}
      {withNav && <BottomNav />}
    </main>
  );
}

export default AppShell;
