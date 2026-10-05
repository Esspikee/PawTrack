import { useTranslation } from "../../i18n/useTranslation";
import BreedSprite from "./BreedSprite";

function BreedDetails({ categoryLabel, entry }) {
  const { t, dateTime } = useTranslation();
  if (!entry.discovered) {
    return (
      <section className="codex-journal unknown-detail">
        <div className="breed-portrait"><BreedSprite breed={entry.breed} locked /></div>
        <span>
          <strong>{t("Raza desconocida")}</strong>
          <p>{t("Esta raza aún no ha sido descubierta.")}</p>
        </span>
      </section>
    );
  }

  return (
    <section className="codex-journal">
      <div className="breed-portrait"><BreedSprite breed={entry.breed} /></div>
      <span className="journal-title">
        <small>{t(categoryLabel)}</small>
        <strong>{t(entry.breed.displayName)}</strong>
      </span>
      <div className="journal-grid">
        <span><small>{t("Tipo de animal")}</small><strong>{t(categoryLabel)}</strong></span>
        <span><small>{t("Primer avistamiento")}</small><strong>{dateTime(entry.firstSightingAt).date}</strong></span>
        <span><small>{t("Avistamientos totales")}</small><strong>{entry.totalSightings}</strong></span>
        {entry.recentLocation && <span><small>{t("Ubicación reciente")}</small><strong>{entry.recentLocation}</strong></span>}
      </div>
      {entry.firstPhotoUrl && <figure className="breed-sighting-photo"><img alt={t("Foto de tu primer avistamiento: {0}", {0: entry.breed.displayName})} className="journal-photo" src={entry.firstPhotoUrl} loading="lazy" /><figcaption>{t("Tu primer avistamiento")}</figcaption></figure>}
      {entry.recentDescription && (
        <span className="journal-note">
          <small>{t("Descripción reciente")}</small>
          <p>{entry.recentDescription}</p>
        </span>
      )}
    </section>
  );
}

export default BreedDetails;
