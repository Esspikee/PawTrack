import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import BrandHeader from "../components/BrandHeader";
import AnimalCard from "../components/AnimalCard";
import Icon from "../components/Icon";
import PetAvatar from "../components/PetAvatar";
import PixelButton from "../components/PixelButton";
import StatusPanel from "../components/StatusPanel";
import { usePawTrack } from "../context/usePawTrack";
import { useGeolocation } from "../hooks/useGeolocation";
import { sortNearby, validPosition } from "../utils/nearby";

export default function Dashboard() {
  const { currentUser, loadCurrentUser, userError, animals, animalsLoading, animalsError, loadAnimals } = usePawTrack();
  const geo = useGeolocation({ auto: false });
  const nearby = validPosition(geo.coordinates);
  const featured = sortNearby(animals, geo.coordinates).slice(0, 2);
  if (!currentUser) return <AppShell><StatusPanel action={() => loadCurrentUser().catch(() => {})} message={userError || "Cargando tu perfil..."} type={userError ? "error" : "loading"} /></AppShell>;
  const nextLevel = { 1: 10, 2: 50, 3: 150, 4: 500 }[currentUser.level];
  return <AppShell>
    <BrandHeader />
    <section className="welcome-copy"><h1>Hola, {currentUser.username}</h1></section>
    <section className="player-card pixel-panel">
      <PetAvatar size="lg" type={currentUser.level === 1 ? "puppy" : "husky"} />
      <div className="player-copy"><strong>Nivel {currentUser.level} · {currentUser.rank}</strong>
        <div className="progress" role="progressbar" aria-label="Progreso de nivel" aria-valuenow={Math.round(currentUser.xpProgress)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${currentUser.xpProgress}%` }} /></div>
        <b>{currentUser.points}{nextLevel ? ` / ${nextLevel}` : ""} XP</b><small>{nextLevel ? `Te faltan ${Math.max(0, nextLevel - currentUser.points)} XP para subir` : "¡Alcanzaste el nivel Leyenda!"}</small>
      </div>
    </section>
    <PixelButton className="full-width main-report-action" to="/report" icon={<Icon name="paw" size={26} />}>Registrar avistamiento</PixelButton>
    <div className="discovery-heading"><h2>{nearby ? "Cerca de ti" : "Últimos avistamientos"}</h2><Link to="/animals">Ver mapa →</Link></div>
    {!nearby && <button type="button" className="location-link" onClick={geo.locate} disabled={geo.locating}><Icon name="mapPin" size={16} />{geo.locating ? "Buscando ubicación..." : "Usar mi ubicación para ver distancias"}</button>}
    {geo.locationError && <p className="form-message warning">{geo.locationError}</p>}
    {animalsLoading ? <StatusPanel message="Buscando avistamientos..." /> : animalsError ? <StatusPanel type="error" message={animalsError} action={() => loadAnimals().catch(() => {})} /> : featured.length ? <section className="discovery-grid">{featured.map(animal => <AnimalCard key={animal.id} animal={animal} />)}</section> : <section className="pixel-panel empty-discovery"><Icon name="paw" /><h2>La primera historia empieza contigo</h2><p>Aún no hay animales registrados. Comparte tu primer avistamiento.</p></section>}
    <Link className="next-step pixel-panel" to="/report"><Icon name="paw" size={28} /><span><strong>Tu siguiente paso</strong><small>Registra {currentUser.sightings ? "otro" : "tu primer"} avistamiento.</small></span><b>+5 XP</b></Link>
  </AppShell>;
}
