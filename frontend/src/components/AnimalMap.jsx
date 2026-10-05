import { useEffect, useMemo } from "react";
import L from "leaflet";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import { validPosition } from "../utils/nearby";
import "leaflet/dist/leaflet.css";

function MapViewport({ latitude, longitude }) {
  const map = useMap();
  useEffect(() => { map.setView([latitude, longitude], 15); }, [latitude, longitude, map]);
  return null;
}
export default function AnimalMap({ animals, position, onSelect }) {
  const markerIcon = useMemo(() => L.divIcon({
    className: "pixel-map-marker", html: '<span aria-hidden="true"><svg viewBox="0 0 16 16" fill="currentColor" shape-rendering="crispEdges"><path d="M2 1h3v4H2zM11 1h3v4h-3zM0 6h4v4H0zM12 6h4v4h-4zM5 10h2V8h2v2h2v2h2v4H3v-4h2z"/></svg></span>',
    iconAnchor: [16, 32], iconSize: [32, 32], popupAnchor: [0, -28],
  }), []);
  const validAnimals = animals.filter(validPosition);
  const center = validPosition(position) ? position : validAnimals[0] || { latitude: 4.711, longitude: -74.0721 };
  return <section className="map-panel" aria-label="Mapa de animales">
    <MapContainer center={[Number(center.latitude), Number(center.longitude)]} className="animal-map" scrollWheelZoom={false} zoom={15}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapViewport latitude={Number(center.latitude)} longitude={Number(center.longitude)} />
      {validPosition(position) && <CircleMarker center={[Number(position.latitude), Number(position.longitude)]} radius={8} pathOptions={{ color: "#ffffff", fillColor: "#238aff", fillOpacity: 1 }}><Popup>Tu ubicación aproximada</Popup></CircleMarker>}
      {validAnimals.map(animal => <Marker icon={markerIcon} key={animal.id} position={[animal.latitude, animal.longitude]} title={animal.name} eventHandlers={{ click: () => onSelect?.(animal.id) }}>
        <Popup><strong>{animal.name}</strong><span>{animal.lastSeenAgo}</span><Link to={`/animals/${animal.id}`}>Ver historia</Link></Popup>
      </Marker>)}
    </MapContainer>
  </section>;
}
