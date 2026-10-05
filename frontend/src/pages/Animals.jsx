import { useTranslation } from "../i18n/useTranslation";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AnimalMap from "../components/AnimalMap";
import AnimalCard from "../components/AnimalCard";
import AnimalPhoto from "../components/AnimalPhoto";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import PixelButton from "../components/PixelButton";
import StatusPanel from "../components/StatusPanel";
import { usePawTrack } from "../context/usePawTrack";
import { useGeolocation } from "../hooks/useGeolocation";
import { distanceLabel, sortNearby, validPosition } from "../utils/nearby";

export default function Animals() {
  const { t, relativeTime, animalName } = useTranslation();
  const { animals, animalsError, animalsLoading, loadAnimals } = usePawTrack();
  const [searchTerm, setSearchTerm] = useState("");
  const [species, setSpecies] = useState("");
  const [view, setView] = useState("map");
  const [selectedId, setSelectedId] = useState(null);
  const geo = useGeolocation({ auto: false });
  const filtered = useMemo(() => sortNearby(animals, geo.coordinates).filter(animal =>
    (!species || animal.species === species) && [animal.name, animal.species, t(animal.species), animal.color, animal.lastSeen, animal.description]
      .some(value => value?.toLowerCase().includes(searchTerm.trim().toLowerCase()))), [animals, species, searchTerm, geo.coordinates, t]);
  const selected = filtered.find(animal => animal.id === selectedId) || filtered[0];
  return <AppShell>
    <div className="nearby-page">
    <header className="nearby-heading"><div><h1>{t("Cerca de ti")}</h1><small>{!animalsLoading && !animalsError && t(filtered.length === 1 ? "{0} animal registrado" : "{0} animales registrados", {0: filtered.length})}</small></div><div className="view-switch" role="group" aria-label={t("Vista de animales")}><button type="button" aria-pressed={view === "map"} onClick={() => setView("map")}>{t("Mapa")}</button><button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>{t("Lista")}</button></div></header>
    <label className="explore-search"><Icon name="search" size={20} /><input aria-label={t("Buscar nombre o color")} onChange={event => setSearchTerm(event.target.value)} placeholder={t("Buscar nombre o color")} type="search" value={searchTerm} /></label>
    <div className="explore-filters" role="group" aria-label={t("Filtrar por especie")}>{[["", t("Todos")], ["Perro", t("Perros")], ["Gato", t("Gatos")]].map(([value, label]) => <button key={label} type="button" aria-pressed={species === value} onClick={() => setSpecies(value)}>{value && <Icon name="paw" size={16} />}{t(label)}</button>)}</div>
    {view === "list" && <button className="location-link" type="button" disabled={geo.locating} onClick={geo.locate}><Icon name="mapPin" size={18} />{geo.locating ? t("Localizando...") : t("Mi ubicación")}</button>}
    {geo.locationError && <p className="form-message warning">{t(geo.locationError)}</p>}
    {!validPosition(geo.coordinates) && <p className="map-note">{t("Activa tu ubicación para ver distancias.")}</p>}

    {animalsLoading ? <StatusPanel message={t("Cargando animales...")} /> : animalsError ? <StatusPanel action={() => loadAnimals().catch(() => {})} message={t(animalsError)} type="error" /> : <>
      {view === "map" && <><AnimalMap animals={filtered} position={geo.coordinates} onSelect={setSelectedId} selectedId={selected?.id} onLocate={geo.locate} locating={geo.locating} />{selected && <section className="map-selection nearby-selection"><div className="selected-animal"><AnimalPhoto animal={selected} /><div><h2>{animalName(selected)}</h2><p>{t(selected.species)} · {selected.color}</p><small>{relativeTime(selected.lastSeenAt)}{selected.distance != null ? ` · ${distanceLabel(selected.distance)}` : ""}</small><span className="confirmation-label"><Icon name="check" size={16} />{selected.confirmations}{" "}{t("confirmaciones")}</span></div></div><div className="selection-actions"><PixelButton variant="secondary" to={`/animals/${selected.id}/history`}>{t("Ver historia")}</PixelButton><PixelButton to={`/report/${selected.id}`} icon={<Icon name="paw" size={18} />}>{t("Lo vi")}</PixelButton></div></section>}</>}
      {view === "list" && <><p className="map-note">{filtered.length}{" "}{t("animales")}{" "}{validPosition(geo.coordinates) ? t("por distancia") : t("por fecha")}</p><section className="discovery-grid">{filtered.map(animal => <AnimalCard key={animal.id} animal={animal} />)}</section></>}
      {filtered.length === 0 && <section className="pixel-panel empty-discovery"><Icon name="search" /><h2>{t("No encontramos animales")}</h2><p>{t("Prueba otra búsqueda o registra un nuevo animal.")}</p><Link className="inline-action" to="/animals/new">{t("Registrar animal →")}</Link></section>}
    </>}
    {!animalsLoading && !animalsError && filtered.length > 0 && <p className="nearby-footnote">{t("Última ubicación reportada · no es en vivo")}</p>}
    </div>
  </AppShell>;
}
