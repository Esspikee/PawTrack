import { useTranslation } from "../i18n/useTranslation";
import { Link } from "react-router-dom";
import AnimalPhoto from "./AnimalPhoto";
import { distanceLabel } from "../utils/nearby";
export default function AnimalCard({ animal }) {
  const { t, relativeTime, animalName } = useTranslation();
  return <Link className="discovery-card pixel-panel" to={`/animals/${animal.id}`}>
    <AnimalPhoto animal={animal} />
    <div className="discovery-copy"><strong>{animalName(animal)}</strong><span>{t(animal.species)} · {animal.color}</span>
      <small>{distanceLabel(animal.distance) || t("Último avistamiento")} · {relativeTime(animal.lastSeenAt)}</small></div>
  </Link>;
}
