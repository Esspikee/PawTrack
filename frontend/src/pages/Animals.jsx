import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AnimalMap from "../components/AnimalMap";
import AnimalCard from "../components/AnimalCard";
import AnimalPhoto from "../components/AnimalPhoto";
import BrandHeader from "../components/BrandHeader";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import PixelButton from "../components/PixelButton";
import StatusPanel from "../components/StatusPanel";
import { usePawTrack } from "../context/usePawTrack";
import { useGeolocation } from "../hooks/useGeolocation";
import { distanceLabel, sortNearby, validPosition } from "../utils/nearby";

export default function Animals() {
  const { animals, animalsError, animalsLoading, loadAnimals } = usePawTrack();
  const [searchTerm, setSearchTerm] = useState("");
  const [species, setSpecies] = useState("");
  const [view, setView] = useState("map");
  const [selectedId, setSelectedId] = useState(null);
  const geo = useGeolocation({ auto: false });
  const filtered = useMemo(() => sortNearby(animals, geo.coordinates).filter(animal =>
    (!species || animal.species === species) && [animal.name, animal.species, animal.color, animal.lastSeen, animal.description]
      .some(value => value?.toLowerCase().includes(searchTerm.trim().toLowerCase()))), [animals, species, searchTerm, geo.coordinates]);
  const selected = filtered.find(animal => animal.id === selectedId) || filtered[0];
  return <AppShell>
    <BrandHeader />
    <section className="welcome-copy"><h1>Cerca de ti</h1></section>
    <label className="explore-search"><Icon name="search" size={20} /><input aria-label="Buscar animal o zona" onChange={event => setSearchTerm(event.target.value)} placeholder="Buscar nombre, color o coordenadas" type="search" value={searchTerm} /></label>
    <div className="explore-filters" role="group" aria-label="Filtrar por especie">{[["", "Todos"], ["Perro", "Perros"], ["Gato", "Gatos"]].map(([value, label]) => <button key={label} type="button" aria-pressed={species === value} onClick={() => setSpecies(value)}>{value && <Icon name="paw" size={16} />}{label}</button>)}</div>
    <div className="map-toolbar"><button className="location-link" type="button" disabled={geo.locating} onClick={geo.locate}><Icon name="mapPin" size={18} />{geo.locating ? "Localizando..." : "Mi ubicación"}</button><div className="view-switch" role="group" aria-label="Vista de animales"><button type="button" aria-pressed={view === "map"} onClick={() => setView("map")}>Mapa</button><button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>Lista</button></div></div>
    {geo.locationError && <p className="form-message warning">{geo.locationError}</p>}
    {!validPosition(geo.coordinates) && <p className="map-note">Sin GPS: mostrando avistamientos recientes. Activa tu ubicación para ordenarlos por distancia.</p>}
    {validPosition(geo.coordinates) && <p className="map-note">Distancia a la última ubicación reportada; no es seguimiento en vivo.</p>}
    {animalsLoading ? <StatusPanel message="Cargando animales..." /> : animalsError ? <StatusPanel action={() => loadAnimals().catch(() => {})} message={animalsError} type="error" /> : <>
      {view === "map" && <><AnimalMap animals={filtered} position={geo.coordinates} onSelect={setSelectedId} />{selected && <section className="map-selection pixel-panel"><div className="selected-animal"><AnimalPhoto animal={selected} /><div><h2>{selected.name}</h2><p>{selected.species} · {selected.color}</p><small>{selected.lastSeenAgo}{selected.distance != null ? ` · ${distanceLabel(selected.distance)}` : ""}</small><span className="confirmation-label"><Icon name="paw" size={16} />{selected.confirmations} confirmaciones</span></div></div><div className="selection-actions"><PixelButton variant="secondary" to={`/animals/${selected.id}/history`}>Ver historia</PixelButton><PixelButton to={`/report/${selected.id}`} icon={<Icon name="paw" size={18} />}>Lo vi</PixelButton></div></section>}</>}
      {view === "list" && <><p className="map-note">{filtered.length} animales {validPosition(geo.coordinates) ? "por distancia" : "por fecha"}</p><section className="discovery-grid">{filtered.map(animal => <AnimalCard key={animal.id} animal={animal} />)}</section></>}
      {filtered.length === 0 && <section className="pixel-panel empty-discovery"><Icon name="search" /><h2>No encontramos animales</h2><p>Prueba otra búsqueda o registra un nuevo animal.</p><Link className="inline-action" to="/animals/new">Registrar animal →</Link></section>}
    </>}
  </AppShell>;
}
