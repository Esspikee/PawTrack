import BottomNav from "./BottomNav";
import Icon from "./Icon";
import { usePawTrack } from "../context/usePawTrack";

function AchievementToast({ achievement, onClose }) {
  if (!achievement) return null;

  return (
    <aside className="achievement-toast" role="status">
      <div className="achievement-toast-icon"><Icon name={achievement.icon} /></div>
      <span>
        <small>Logro desbloqueado</small>
        <strong>{achievement.label}</strong>
        <em>+{achievement.points} puntos de logro</em>
      </span>
      <button aria-label="Cerrar logro" onClick={onClose} type="button">x</button>
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
