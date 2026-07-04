import { Link } from "react-router-dom";
import Icon from "../Icon";
import UnknownBreedCard from "./UnknownBreedCard";

function BreedCard({ category, entry }) {
  const to = `/codex/bestiary/${category}/${entry.id}`;

  if (!entry.discovered) {
    return <UnknownBreedCard to={to} />;
  }

  return (
    <Link className="breed-card discovered" to={to}>
      {entry.firstPhotoUrl ? (
        <img alt={entry.breed.displayName} className="breed-photo" src={entry.firstPhotoUrl} />
      ) : (
        <div className="breed-silhouette discovered-icon"><Icon name="paw" size={28} /></div>
      )}
      <span>
        <strong>{entry.breed.displayName}</strong>
        <small>{entry.totalSightings} avistamientos</small>
        <small>Primer registro {entry.firstSightingDate}</small>
      </span>
      <Icon name="chevronRight" />
    </Link>
  );
}

export default BreedCard;
