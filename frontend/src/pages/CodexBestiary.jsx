import AppShell from "../components/AppShell";
import CategoryCard from "../components/codex/CategoryCard";
import StatusPanel from "../components/StatusPanel";
import TopBar from "../components/TopBar";
import { useCodexData } from "../hooks/useCodexData";

function CodexBestiary() {
  const { codex, error, loading } = useCodexData();

  if (loading) return <AppShell><TopBar backTo="/codex" title="Bestiario" /><StatusPanel message="Leyendo notas de campo..." /></AppShell>;
  if (error) return <AppShell><TopBar backTo="/codex" title="Bestiario" /><StatusPanel message={error} type="error" /></AppShell>;

  return (
    <AppShell>
      <TopBar backTo="/codex" title="Bestiario" />

      <section className="codex-card-list">
        <CategoryCard
          description="Descubre cada raza de perro."
          icon="paw"
          progress={codex.progressByType.dog}
          title="Perros"
          to="/codex/bestiary/dogs"
        />
        <CategoryCard
          description="Descubre cada raza de gato."
          icon="paw"
          progress={codex.progressByType.cat}
          title="Gatos"
          to="/codex/bestiary/cats"
        />
      </section>
    </AppShell>
  );
}

export default CodexBestiary;
