import AppShell from "../components/AppShell";
import CategoryCard from "../components/codex/CategoryCard";
import HeartOrnament from "../components/HeartOrnament";
import Icon from "../components/Icon";
import StatusPanel from "../components/StatusPanel";
import TopBar from "../components/TopBar";
import { useCodexData } from "../hooks/useCodexData";

function Codex() {
  const { codex, error, loading } = useCodexData();

  if (loading) return <AppShell><TopBar backTo="/dashboard" title="Códice" /><StatusPanel message="Abriendo códice..." /></AppShell>;
  if (error) return <AppShell><TopBar backTo="/dashboard" title="Códice" /><StatusPanel message={error} type="error" /></AppShell>;

  return (
    <AppShell>
      <TopBar backTo="/dashboard" title="Códice" />

      <section className="codex-home">
        <article className="codex-hero">
          <HeartOrnament />
          <span className="codex-overall-progress codex-track">
            <strong>Códice</strong>
            <small>{codex.overallProgress.discovered} / {codex.overallProgress.total} razas descubiertas</small>
            <div className="codex-progress-bar"><span style={{ width: `${codex.overallProgress.percent}%` }} /></div>
          </span>
          <div className="codex-species-progress">
            <div className="codex-species-row">
              <Icon name="paw" size={22} />
              <span>
                <strong>Perros</strong>
                <small>{codex.progressByType.dog.discovered} / {codex.progressByType.dog.total}</small>
                <div className="codex-progress-bar"><span style={{ width: `${codex.progressByType.dog.percent}%` }} /></div>
              </span>
            </div>
            <div className="codex-species-row">
              <Icon name="paw" size={22} />
              <span>
                <strong>Gatos</strong>
                <small>{codex.progressByType.cat.discovered} / {codex.progressByType.cat.total}</small>
                <div className="codex-progress-bar"><span style={{ width: `${codex.progressByType.cat.percent}%` }} /></div>
              </span>
            </div>
          </div>
        </article>

        <div className="codex-card-list codex-home-actions">
          <CategoryCard description="Descubre cada raza disponible." icon="book" title="Bestiario" to="/codex/bestiary" />
          <CategoryCard description="Revisa tus Patitas y progreso." icon="trophy" title="Logros" to="/codex/achievements" />
        </div>
      </section>
    </AppShell>
  );
}

export default Codex;
