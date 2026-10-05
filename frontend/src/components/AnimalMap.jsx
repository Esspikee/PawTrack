import { useTranslation } from "../i18n/useTranslation";
import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import Icon from "./Icon";
import { validPosition } from "../utils/nearby";
import "leaflet/dist/leaflet.css";

function MapViewport({ latitude, longitude }) {
  const map = useMap();
  useEffect(() => { map.setView([latitude, longitude], 15); }, [latitude, longitude, map]);
  return null;
}

function MapControls({ onLocate, locating }) {
  const { t } = useTranslation();
  const map = useMap();
  const controls = useRef(null);
  useEffect(() => {
    L.DomEvent.disableClickPropagation(controls.current);
    L.DomEvent.disableScrollPropagation(controls.current);
  }, []);
  const locate = async () => {
    const position = await onLocate?.();
    if (validPosition(position)) map.setView([Number(position.latitude), Number(position.longitude)], 16);
  };
  return <div className="nearby-map-controls" ref={controls}>
    <button className="nearby-recenter" type="button" disabled={locating} onClick={locate} title={t("Mi ubicación")} aria-label={t(locating ? "Localizando..." : "Mi ubicación")}><Icon name="target" size={23} /></button>
    <div className="nearby-zoom">
      <button type="button" onClick={() => map.zoomIn()} aria-label={t("Acercar mapa")}>+</button>
      <button type="button" onClick={() => map.zoomOut()} aria-label={t("Alejar mapa")}>−</button>
    </div>
  </div>;
}

export default function AnimalMap({ animals, position, onSelect, selectedId, onLocate, locating }) {
  const { t, animalName } = useTranslation();
  const markers = useMemo(() => [false, true].map(selected => L.divIcon({
    className: `nearby-map-marker${selected ? " is-selected" : ""}`,
    html: '<span aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor" shape-rendering="crispEdges"><path d="M7 2h3v1h1v5h-1v1H7V8H6V3h1zM14 2h3v1h1v5h-1v1h-3V8h-1V3h1zM2 7h2v1h1v4H4v1H2v-1H1V8h1zM20 7h2v1h1v4h-1v1h-2v-1h-1V8h1zM10 12h4v2h3v2h2v5h-2v1h-3v-1h-4v1H7v-1H5v-5h2v-2h3z"/></svg></span>',
    iconAnchor: [22, 46], iconSize: [44, 48],
  })), []);
  const validAnimals = animals.filter(validPosition);
  const center = validPosition(position) ? position : validAnimals[0] || { latitude: 4.711, longitude: -74.0721 };
  return <section className="map-panel nearby-map" aria-label={t("Mapa de animales")}>
    <MapContainer center={[Number(center.latitude), Number(center.longitude)]} className="animal-map" scrollWheelZoom={false} zoom={15} zoomControl={false}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapViewport latitude={Number(center.latitude)} longitude={Number(center.longitude)} />
      <MapControls onLocate={onLocate} locating={locating} />
      {validPosition(position) && <CircleMarker center={[Number(position.latitude), Number(position.longitude)]} radius={9} pathOptions={{ color: "#ffffff", fillColor: "#238aff", fillOpacity: 1, weight: 3 }}><Popup>{t("Tu ubicación aproximada")}</Popup></CircleMarker>}
      {validAnimals.map(animal => <Marker icon={markers[animal.id === selectedId ? 1 : 0]} key={animal.id} position={[animal.latitude, animal.longitude]} title={animalName(animal)} alt={animalName(animal)} zIndexOffset={animal.id === selectedId ? 1000 : 0} eventHandlers={{ click: () => onSelect?.(animal.id) }} />)}
    </MapContainer>
  </section>;
}
