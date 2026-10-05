import { useTranslation } from "../i18n/useTranslation";
import { Navigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import BreedDetails from "../components/codex/BreedDetails";
import StatusPanel from "../components/StatusPanel";
import TopBar from "../components/TopBar";
import { useCodexData } from "../hooks/useCodexData";
import { findBreedEntry, getBreedByCategoryAndId, getCategoryCopy } from "../utils/codex";

function CodexBreedDetails() {
  const { t } = useTranslation();
  const { breedId, category } = useParams();
  const { codex, error, loading } = useCodexData();

  if (category !== "dogs" && category !== "cats") return <Navigate to="/codex/bestiary" replace />;
  const breed = getBreedByCategoryAndId(category, breedId);
  const copy = getCategoryCopy(category);

  if (!breed) return <AppShell><TopBar backTo={`/codex/bestiary/${category}`} title={t("Códice")} /><StatusPanel message={t("Raza no encontrada.")} type="error" /></AppShell>;
  if (loading) return <AppShell><TopBar backTo={`/codex/bestiary/${category}`} title={t("Códice")} /><StatusPanel message={t("Abriendo página del diario...")} /></AppShell>;
  if (error) return <AppShell><TopBar backTo={`/codex/bestiary/${category}`} title={t("Códice")} /><StatusPanel message={t(error)} type="error" /></AppShell>;

  const entry = findBreedEntry(codex, category, breedId) ?? {
    animalType: breed.animalType,
    breed,
    discovered: false,
    id: breed.id,
  };

  return (
    <AppShell>
      <TopBar backTo={`/codex/bestiary/${category}`} title={entry.discovered ? t(entry.breed.displayName) : t("Desconocida")} />
      <BreedDetails categoryLabel={copy.animalTypeLabel} entry={entry} />
    </AppShell>
  );
}

export default CodexBreedDetails;
