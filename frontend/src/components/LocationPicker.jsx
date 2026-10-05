import { useTranslation } from "../i18n/useTranslation";
import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { validPosition } from "../utils/nearby";
import Icon from "./Icon";
import "leaflet/dist/leaflet.css";

function MapChoice({ latitude, longitude, onChange }) {
  const map = useMap();
  useEffect(() => { map.setView([latitude, longitude], 16); }, [map, latitude, longitude]);
  useMapEvents({ click: event => onChange({ latitude: event.latlng.lat.toFixed(6), longitude: event.latlng.wrap().lng.toFixed(6) }) });
  return null;
}

export default function LocationPicker({ geo, showManualCoordinates = true }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const ready = validPosition(geo.coordinates);
  const latitude = ready ? Number(geo.coordinates.latitude) : 4.711;
  const longitude = ready ? Number(geo.coordinates.longitude) : -74.0721;
  const update = event => geo.setCoordinates(current => ({ ...current, [event.target.name]: event.target.value }));
  return <section className="location-picker">
    <div className={`location-summary pixel-panel ${ready ? "ready" : ""}`}><Icon name="mapPin" size={26} /><div><strong>{geo.locating ? t("Buscando ubicación...") : ready ? t("Ubicación lista") : t("Elige la ubicación")}</strong><button type="button" className="text-action" onClick={() => setEditing(!editing)}>{editing ? t("Cerrar mapa") : t("Ajustar en el mapa")} →</button></div><button className="mini-pixel-button" disabled={geo.locating} type="button" onClick={geo.locate}>{t("Localizar")}</button></div>
    {geo.locationError && <p className="form-message warning">{t(geo.locationError)}</p>}
    {!geo.locationError && geo.locationHint && !ready && <p className="form-message info">{t(geo.locationHint)}</p>}
    {editing && <><p className="map-note">{t("Toca el punto donde viste al animal.")}</p><div className="location-edit-map"><MapContainer center={[latitude, longitude]} zoom={16} scrollWheelZoom={false} className="animal-map"><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><MapChoice latitude={latitude} longitude={longitude} onChange={geo.setCoordinates} />{ready && <CircleMarker center={[latitude, longitude]} radius={10} pathOptions={{ color: "#ffffff", fillColor: "#26d9eb", fillOpacity: 1 }} />}</MapContainer></div></>}
    {showManualCoordinates && <details className="manual-location-fields"><summary>{t("Ubicacion manual")}</summary><div className="coordinate-grid">
      <label>{t("Latitud")}<input name="latitude" type="number" step="any" min="-90" max="90" value={geo.coordinates.latitude} onChange={update} /></label>
      <label>{t("Longitud")}<input name="longitude" type="number" step="any" min="-180" max="180" value={geo.coordinates.longitude} onChange={update} /></label>
    </div></details>}
  </section>;
}
