import { useTranslation } from "../i18n/useTranslation";
import AppShell from "../components/AppShell";
import HeartOrnament from "../components/HeartOrnament";
import Icon from "../components/Icon";
import StatusPanel from "../components/StatusPanel";
import TopBar from "../components/TopBar";
import { usePawTrack } from "../context/usePawTrack";

function Notifications() {
  const { t, relativeTime, animalName } = useTranslation();
  const { animals, animalsError, animalsLoading, currentUser, loadAnimals } = usePawTrack();

  if (animalsLoading) return <AppShell><StatusPanel message={t("Revisando actividad...")} /></AppShell>;
  if (animalsError) {
    return (
      <AppShell>
        <TopBar backTo="/dashboard" title={t("Actividad")} />
        <StatusPanel action={() => loadAnimals().catch(() => {})} message={t(animalsError)} type="error" />
      </AppShell>
    );
  }

  const recentAnimals = animals.slice(0, 3);

  return (
    <AppShell>
      <TopBar backTo="/dashboard" title={t("Actividad")} />

      <section className="history-summary">
        <HeartOrnament />
        <Icon name="bell" />
        <span>
          <strong>{t("Radar PawTrack")}</strong>
          <small>{currentUser ? t("{0} XP acumulada", {0: currentUser.points}) : t("Actividad comunitaria")}</small>
        </span>
      </section>

      <section className="notification-list">
        {recentAnimals.length === 0 ? (
          <StatusPanel message={t("Aun no hay actividad. Registra el primer animal para encender el radar.")} />
        ) : (
          recentAnimals.map((animal) => (
            <article className="notification-row" key={animal.id}>
              <Icon name={animal.species === "Gato" ? "paw" : "mapPin"} />
              <span>
                <strong>{animalName(animal)}</strong>
                <small>{animal.sightings}{" "}{t("avistamientos ·")}{" "}{animal.confirmations}{" "}{t("confirmaciones")}</small>
                <small>{relativeTime(animal.lastSeenAt)} {t("en")} {animal.lastSeen}</small>
              </span>
            </article>
          ))
        )}
      </section>
    </AppShell>
  );
}

export default Notifications;
