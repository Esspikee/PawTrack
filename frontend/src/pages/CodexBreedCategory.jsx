import { Navigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import BreedCard from "../components/codex/BreedCard";
import ProgressBar from "../components/codex/ProgressBar";
import StatusPanel from "../components/StatusPanel";
import TopBar from "../components/TopBar";
import { useCodexData } from "../hooks/useCodexData";
import { getCategoryCopy, getEntriesByCategory, getProgress } from "../utils/codex";

function CodexBreedCategory() {
  const { category } = useParams();
  const { codex, error, loading } = useCodexData();

  if (category !== "dogs" && category !== "cats") return <Navigate to="/codex/bestiary" replace />;
  const copy = getCategoryCopy(category);
  const entries = getEntriesByCategory(codex, category);
  const progress = getProgress(entries);

  if (loading) return <AppShell><TopBar backTo="/codex/bestiary" title={copy.title} /><StatusPanel message="Revisando descubrimientos..." /></AppShell>;
  if (error) return <AppShell><TopBar backTo="/codex/bestiary" title={copy.title} /><StatusPanel message={error} type="error" /></AppShell>;

  return (
    <AppShell>
      <TopBar backTo="/codex/bestiary" title={copy.title} />

      <section className="codex-summary">
        <strong>{copy.title}</strong>
        <small>{progress.discovered} / {progress.total} descubiertas</small>
        <ProgressBar percent={progress.percent} />
      </section>

      <section className="breed-grid">
        {entries.map((entry) => <BreedCard category={category} entry={entry} key={entry.id} />)}
      </section>
    </AppShell>
  );
}

export default CodexBreedCategory;
