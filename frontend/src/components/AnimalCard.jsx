import { Link } from "react-router-dom";
import AnimalPhoto from "./AnimalPhoto";
import { distanceLabel } from "../utils/nearby";
export default function AnimalCard({ animal }) {
  return <Link className="discovery-card pixel-panel" to={`/animals/${animal.id}`}>
    <AnimalPhoto animal={animal} />
    <div className="discovery-copy"><strong>{animal.name}</strong><span>{animal.species} · {animal.color}</span>
      <small>{distanceLabel(animal.distance) || "Último avistamiento"} · {animal.lastSeenAgo}</small></div>
  </Link>;
}
