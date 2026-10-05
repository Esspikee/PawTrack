import { useTranslation } from "../i18n/useTranslation";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import BrandHeader from "../components/BrandHeader";
import AnimalCard from "../components/AnimalCard";
import Icon from "../components/Icon";
import PetAvatar from "../components/PetAvatar";
import { getLevelAvatar } from "../data/levelAvatars";
import PixelButton from "../components/PixelButton";
import StatusPanel from "../components/StatusPanel";
import { usePawTrack } from "../context/usePawTrack";
import { useGeolocation } from "../hooks/useGeolocation";
import { sortNearby, validPosition } from "../utils/nearby";

export default function Dashboard() {
  const { t } = useTranslation();
  const { currentUser, loadCurrentUser, userError, animals, animalsLoading, animalsError, loadAnimals } = usePawTrack();
  const geo = useGeolocation({ auto: false });
  const nearby = validPosition(geo.coordinates);
  const featured = sortNearby(animals, geo.coordinates).slice(0, 2);
  if (!currentUser) return <AppShell><StatusPanel action={() => loadCurrentUser().catch(() => {})} message={userError || t("Cargando tu perfil...")} type={userError ? "error" : "loading"} /></AppShell>;
  const nextLevel = { 1: 10, 2: 50, 3: 150, 4: 500 }[currentUser.level];
  return <AppShell>
    <BrandHeader />
    <section className="welcome-copy"><h1>{t("Hola,")}{" "}{currentUser.username}</h1></section>
    <section className="player-card pixel-panel">
      <PetAvatar size="lg" type={getLevelAvatar(currentUser.level)} />
      <div className="player-copy"><strong>{t("Nivel")}{" "}{currentUser.level} · {t(currentUser.rank)}</strong>
        <div className="progress" role="progressbar" aria-label={t("Progreso de nivel")} aria-valuenow={Math.round(currentUser.xpProgress)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${currentUser.xpProgress}%` }} /></div>
        <b>{currentUser.points}{nextLevel ? ` / ${nextLevel}` : ""} XP</b><small>{nextLevel ? t("Te faltan {0} XP para subir", {0: Math.max(0, nextLevel - currentUser.points)}) : t("¡Alcanzaste el nivel Leyenda!")}</small>
      </div>
    </section>
    <PixelButton className="full-width main-report-action" to="/report" icon={<Icon name="paw" size={26} />}>{t("Registrar avistamiento")}</PixelButton>
    <div className="discovery-heading"><h2>{nearby ? t("Cerca de ti") : t("Últimos avistamientos")}</h2><Link to="/animals">{t("Ver mapa →")}</Link></div>
    {!nearby && <button type="button" className="location-link" onClick={geo.locate} disabled={geo.locating}><Icon name="mapPin" size={16} />{geo.locating ? t("Buscando ubicación...") : t("Usar mi ubicación para ver distancias")}</button>}
    {geo.locationError && <p className="form-message warning">{t(geo.locationError)}</p>}
    {animalsLoading ? <StatusPanel message={t("Buscando avistamientos...")} /> : animalsError ? <StatusPanel type="error" message={t(animalsError)} action={() => loadAnimals().catch(() => {})} /> : featured.length ? <section className="discovery-grid">{featured.map(animal => <AnimalCard key={animal.id} animal={animal} />)}</section> : <section className="pixel-panel empty-discovery"><Icon name="paw" /><h2>{t("La primera historia empieza contigo")}</h2><p>{t("Aún no hay animales registrados. Comparte tu primer avistamiento.")}</p></section>}
    <Link className="next-step pixel-panel" to="/report"><Icon name="paw" size={28} /><span><strong>{t("Tu siguiente paso")}</strong><small>{t("Registra")}{" "}{currentUser.sightings ? t("otro") : t("tu primer")}{" "}{t("avistamiento.")}</small></span><b>+5 XP</b></Link>
  </AppShell>;
}
