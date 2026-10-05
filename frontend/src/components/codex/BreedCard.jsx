import { useTranslation } from "../../i18n/useTranslation";
import { Link } from "react-router-dom";
import Icon from "../Icon";
import UnknownBreedCard from "./UnknownBreedCard";

function BreedCard({ category, entry }) {
  const { t, dateTime } = useTranslation();
  const to = `/codex/bestiary/${category}/${entry.id}`;

  if (!entry.discovered) {
    return <UnknownBreedCard to={to} />;
  }

  return (
    <Link className="breed-card discovered" to={to}>
      {entry.firstPhotoUrl ? (
        <img alt={t(entry.breed.displayName)} className="breed-photo" src={entry.firstPhotoUrl} />
      ) : (
        <div className="breed-silhouette discovered-icon"><Icon name="paw" size={28} /></div>
      )}
      <span>
        <strong>{t(entry.breed.displayName)}</strong>
        <small>{entry.totalSightings}{" "}{t("avistamientos")}</small>
        <small>{t("Primer registro")}{" "}{dateTime(entry.firstSightingAt).date}</small>
      </span>
      <Icon name="chevronRight" />
    </Link>
  );
}

export default BreedCard;
