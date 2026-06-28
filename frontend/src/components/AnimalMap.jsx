import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [4.711, -74.0721];

function MapViewport({ animals }) {
  const map = useMap();

  useEffect(() => {
    const points = animals
      .filter((animal) => Number.isFinite(animal.latitude) && Number.isFinite(animal.longitude))
      .map((animal) => [animal.latitude, animal.longitude]);

    if (points.length === 1) map.setView(points[0], 15);
    if (points.length > 1) map.fitBounds(points, { padding: [24, 24], maxZoom: 15 });
  }, [animals, map]);

  return null;
}

function AnimalMap({ animals }) {
  const markerIcon = useMemo(() => L.divIcon({
    className: "pixel-map-marker",
    html: "<span></span>",
    iconAnchor: [14, 28],
    iconSize: [28, 28],
    popupAnchor: [0, -24],
  }), []);

  const validAnimals = animals.filter((animal) => Number.isFinite(animal.latitude)
    && Number.isFinite(animal.longitude)
    && animal.latitude >= -90 && animal.latitude <= 90
    && animal.longitude >= -180 && animal.longitude <= 180);
  const firstAnimal = validAnimals[0];
  const center = firstAnimal ? [firstAnimal.latitude, firstAnimal.longitude] : DEFAULT_CENTER;

  return (
    <section className="map-panel" aria-label="Mapa de animales">
      <MapContainer center={center} className="animal-map" scrollWheelZoom={false} zoom={13}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewport animals={validAnimals} />
        {validAnimals.map((animal) => (
          <Marker icon={markerIcon} key={animal.id} position={[animal.latitude, animal.longitude]}>
            <Popup>
              <strong>{animal.name}</strong>
              <span>{animal.lastSeen}</span>
              <Link to={`/animals/${animal.id}`}>Ver detalle</Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </section>
  );
}

export default AnimalMap;
